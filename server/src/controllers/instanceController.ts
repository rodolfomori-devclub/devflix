import { Request, Response } from 'express';
import pool from '../db/pool';

const instanceController = {
  // Get all instances
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT * FROM devflix_instances ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching instances:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get instance by slug
  async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const instanceResult = await pool.query(
        'SELECT * FROM devflix_instances WHERE slug = $1',
        [slug]
      );

      if (instanceResult.rows.length === 0) {
        res.status(404).json({ error: 'Instance not found' });
        return;
      }

      const instance = instanceResult.rows[0];

      // Fetch related data
      const [classesResult, materialsResult, schedulesResult, bannersResult] = await Promise.all([
        pool.query('SELECT * FROM classes WHERE instance_id = $1 ORDER BY order_index', [instance.id]),
        pool.query('SELECT * FROM materials WHERE instance_id = $1 ORDER BY class_id, order_index', [instance.id]),
        pool.query('SELECT * FROM schedules WHERE instance_id = $1 ORDER BY day_number', [instance.id]),
        pool.query('SELECT * FROM banners WHERE instance_id = $1', [instance.id]),
      ]);

      // Group materials by class
      const materialsByClass = materialsResult.rows.reduce((acc: Record<string, unknown[]>, material) => {
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

      // Format materials for frontend compatibility
      const materials = Object.entries(materialsByClass).map(([classId, items]) => ({
        classId,
        items,
      }));

      res.json({
        ...instance,
        classes: classesResult.rows.map(c => ({
          id: c.class_id,
          title: c.title,
          description: c.description,
          videoUrl: c.video_url,
          thumbnail: c.thumbnail_url,
          duration: c.duration,
          available: c.is_available,
          scheduledRelease: c.scheduled_release,
          releasedAt: c.released_at,
        })),
        materials,
        schedule: schedulesResult.rows.map(s => ({
          day: s.day_number,
          title: s.title,
          description: s.description,
          date: s.date,
          time: s.time,
          isActive: s.is_active,
        })),
        banners: bannersResult.rows,
      });
    } catch (error) {
      console.error('Error fetching instance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get instance by ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const instanceResult = await pool.query(
        'SELECT * FROM devflix_instances WHERE id = $1',
        [id]
      );

      if (instanceResult.rows.length === 0) {
        res.status(404).json({ error: 'Instance not found' });
        return;
      }

      const instance = instanceResult.rows[0];

      // Fetch related data
      const [classesResult, materialsResult, schedulesResult, bannersResult] = await Promise.all([
        pool.query('SELECT * FROM classes WHERE instance_id = $1 ORDER BY order_index', [instance.id]),
        pool.query('SELECT * FROM materials WHERE instance_id = $1 ORDER BY class_id, order_index', [instance.id]),
        pool.query('SELECT * FROM schedules WHERE instance_id = $1 ORDER BY day_number', [instance.id]),
        pool.query('SELECT * FROM banners WHERE instance_id = $1', [instance.id]),
      ]);

      // Group materials by class
      const materialsByClass = materialsResult.rows.reduce((acc: Record<string, unknown[]>, material) => {
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

      res.json({
        ...instance,
        classes: classesResult.rows.map(c => ({
          id: c.class_id,
          title: c.title,
          description: c.description,
          videoUrl: c.video_url,
          thumbnail: c.thumbnail_url,
          duration: c.duration,
          available: c.is_available,
          scheduledRelease: c.scheduled_release,
          releasedAt: c.released_at,
        })),
        materials,
        schedule: schedulesResult.rows.map(s => ({
          day: s.day_number,
          title: s.title,
          description: s.description,
          date: s.date,
          time: s.time,
          isActive: s.is_active,
        })),
        banners: bannersResult.rows,
      });
    } catch (error) {
      console.error('Error fetching instance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create new instance
  async create(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      const { name, slug, settings, headerLinks, initialBanner, countdownBanner } = req.body;

      if (!name || !slug) {
        res.status(400).json({ error: 'Name and slug are required' });
        return;
      }

      await client.query('BEGIN');

      const id = `instance_${Date.now()}`;

      const result = await client.query(
        `INSERT INTO devflix_instances (id, name, slug, settings, header_links, initial_banner, countdown_banner)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [id, name, slug, settings || {}, headerLinks || [], initialBanner || {}, countdownBanner || {}]
      );

      await client.query('COMMIT');

      res.status(201).json(result.rows[0]);
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      console.error('Error creating instance:', error);
      if ((error as { code?: string }).code === '23505') {
        res.status(400).json({ error: 'Slug already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  },

  // Update instance
  async update(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const { name, slug, settings, headerLinks, initialBanner, countdownBanner } = req.body;

      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE devflix_instances
         SET name = COALESCE($1, name),
             slug = COALESCE($2, slug),
             settings = COALESCE($3, settings),
             header_links = COALESCE($4, header_links),
             initial_banner = COALESCE($5, initial_banner),
             countdown_banner = COALESCE($6, countdown_banner),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING *`,
        [name, slug, settings, headerLinks, initialBanner, countdownBanner, id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Instance not found' });
        return;
      }

      await client.query('COMMIT');

      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating instance:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  },

  // Delete instance
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM devflix_instances WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Instance not found' });
        return;
      }

      res.json({ message: 'Instance deleted successfully' });
    } catch (error) {
      console.error('Error deleting instance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Duplicate instance
  async duplicate(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const { newName, newSlug } = req.body;

      if (!newName || !newSlug) {
        res.status(400).json({ error: 'New name and slug are required' });
        return;
      }

      await client.query('BEGIN');

      // Get original instance
      const originalResult = await client.query(
        'SELECT * FROM devflix_instances WHERE id = $1',
        [id]
      );

      if (originalResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Instance not found' });
        return;
      }

      const original = originalResult.rows[0];
      const newId = `instance_${Date.now()}`;

      // Create new instance
      const newInstanceResult = await client.query(
        `INSERT INTO devflix_instances (id, name, slug, settings, header_links, initial_banner, countdown_banner)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [newId, newName, newSlug, original.settings, original.header_links, original.initial_banner, original.countdown_banner]
      );

      // Copy classes
      await client.query(
        `INSERT INTO classes (instance_id, class_id, title, description, video_url, thumbnail_url, duration, is_available, scheduled_release, order_index)
         SELECT $1, class_id, title, description, video_url, thumbnail_url, duration, is_available, scheduled_release, order_index
         FROM classes WHERE instance_id = $2`,
        [newId, id]
      );

      // Copy materials
      await client.query(
        `INSERT INTO materials (instance_id, class_id, item_id, title, url, type, locked, scheduled_unlock, order_index)
         SELECT $1, class_id, item_id, title, url, type, locked, scheduled_unlock, order_index
         FROM materials WHERE instance_id = $2`,
        [newId, id]
      );

      // Copy schedules
      await client.query(
        `INSERT INTO schedules (instance_id, day_number, title, description, date, time, is_active)
         SELECT $1, day_number, title, description, date, time, is_active
         FROM schedules WHERE instance_id = $2`,
        [newId, id]
      );

      await client.query('COMMIT');

      res.status(201).json(newInstanceResult.rows[0]);
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      console.error('Error duplicating instance:', error);
      if ((error as { code?: string }).code === '23505') {
        res.status(400).json({ error: 'Slug already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  },
};

export default instanceController;
