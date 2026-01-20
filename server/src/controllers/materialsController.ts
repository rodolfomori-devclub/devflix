import { Request, Response } from 'express';
import pool from '../db/pool';
import { MaterialGroup } from '../types';

const materialsController = {
  // Get materials for an instance
  async getByInstance(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId } = req.params;

      const result = await pool.query(
        'SELECT * FROM materials WHERE instance_id = $1 ORDER BY class_id, order_index',
        [instanceId]
      );

      // Group materials by class
      const materialsByClass = result.rows.reduce((acc: Record<string, unknown[]>, material) => {
        if (!acc[material.class_id]) {
          acc[material.class_id] = [];
        }
        acc[material.class_id].push({
          id: material.item_id,
          title: material.title,
          url: material.url,
          type: material.type,
          locked: material.locked,
          scheduledUnlock: material.scheduled_unlock,
          unlockedAt: material.unlocked_at,
        });
        return acc;
      }, {});

      const materials = Object.entries(materialsByClass).map(([classId, items]) => ({
        classId,
        items,
      }));

      res.json(materials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update materials for an instance (bulk update)
  async updateByInstance(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      const { instanceId } = req.params;
      const { materials } = req.body as { materials: MaterialGroup[] };

      await client.query('BEGIN');

      // Delete existing materials for this instance
      await client.query('DELETE FROM materials WHERE instance_id = $1', [instanceId]);

      // Insert new materials
      for (const classGroup of materials) {
        for (let i = 0; i < classGroup.items.length; i++) {
          const item = classGroup.items[i];
          await client.query(
            `INSERT INTO materials (instance_id, class_id, item_id, title, url, type, locked, scheduled_unlock, unlocked_at, order_index)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              instanceId,
              classGroup.classId,
              item.id,
              item.title,
              item.url,
              item.type || 'link',
              item.locked !== false,
              item.scheduledUnlock || null,
              item.unlockedAt || null,
              i,
            ]
          );
        }
      }

      await client.query('COMMIT');

      res.json({ message: 'Materials updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating materials:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  },

  // Unlock a specific material
  async unlockMaterial(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId, classId, itemId } = req.params;

      const result = await pool.query(
        `UPDATE materials
         SET locked = false, unlocked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE instance_id = $1 AND class_id = $2 AND item_id = $3
         RETURNING *`,
        [instanceId, classId, itemId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Material not found' });
        return;
      }

      res.json({
        id: result.rows[0].item_id,
        title: result.rows[0].title,
        url: result.rows[0].url,
        type: result.rows[0].type,
        locked: result.rows[0].locked,
        scheduledUnlock: result.rows[0].scheduled_unlock,
        unlockedAt: result.rows[0].unlocked_at,
      });
    } catch (error) {
      console.error('Error unlocking material:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Lock a specific material
  async lockMaterial(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId, classId, itemId } = req.params;

      const result = await pool.query(
        `UPDATE materials
         SET locked = true, unlocked_at = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE instance_id = $1 AND class_id = $2 AND item_id = $3
         RETURNING *`,
        [instanceId, classId, itemId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Material not found' });
        return;
      }

      res.json({
        id: result.rows[0].item_id,
        title: result.rows[0].title,
        url: result.rows[0].url,
        type: result.rows[0].type,
        locked: result.rows[0].locked,
        scheduledUnlock: result.rows[0].scheduled_unlock,
        unlockedAt: result.rows[0].unlocked_at,
      });
    } catch (error) {
      console.error('Error locking material:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Check and process scheduled unlocks (called by scheduler)
  async processScheduledUnlocks(_req: Request, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Find and unlock materials that should be unlocked
      const result = await client.query(
        `UPDATE materials
         SET locked = false, unlocked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE locked = true
           AND scheduled_unlock IS NOT NULL
           AND scheduled_unlock <= CURRENT_TIMESTAMP
           AND unlocked_at IS NULL
         RETURNING instance_id, class_id, item_id, title`
      );

      await client.query('COMMIT');

      res.json({
        unlockedCount: result.rows.length,
        unlockedMaterials: result.rows,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing scheduled unlocks:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  },

  // Add single material
  async addMaterial(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId, classId } = req.params;
      const { id, title, url, type, locked, scheduledUnlock } = req.body;

      const result = await pool.query(
        `INSERT INTO materials (instance_id, class_id, item_id, title, url, type, locked, scheduled_unlock, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM materials WHERE instance_id = $1 AND class_id = $2))
         RETURNING *`,
        [instanceId, classId, id, title, url, type || 'link', locked !== false, scheduledUnlock || null]
      );

      res.status(201).json({
        id: result.rows[0].item_id,
        title: result.rows[0].title,
        url: result.rows[0].url,
        type: result.rows[0].type,
        locked: result.rows[0].locked,
        scheduledUnlock: result.rows[0].scheduled_unlock,
        unlockedAt: result.rows[0].unlocked_at,
      });
    } catch (error) {
      console.error('Error adding material:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete single material
  async deleteMaterial(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId, classId, itemId } = req.params;

      const result = await pool.query(
        'DELETE FROM materials WHERE instance_id = $1 AND class_id = $2 AND item_id = $3 RETURNING item_id',
        [instanceId, classId, itemId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Material not found' });
        return;
      }

      res.json({ message: 'Material deleted successfully' });
    } catch (error) {
      console.error('Error deleting material:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default materialsController;
