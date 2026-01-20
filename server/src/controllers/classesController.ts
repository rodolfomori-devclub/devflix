import { Request, Response } from 'express';
import pool from '../db/pool';

interface ClassData {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: string;
  available?: boolean;
  scheduledRelease?: string;
  releasedAt?: string;
}

const classesController = {
  // Get classes for an instance
  async getByInstance(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId } = req.params;

      const result = await pool.query(
        'SELECT * FROM classes WHERE instance_id = $1 ORDER BY order_index',
        [instanceId]
      );

      const classes = result.rows.map(c => ({
        id: c.class_id,
        title: c.title,
        description: c.description,
        videoUrl: c.video_url,
        thumbnail: c.thumbnail_url,
        duration: c.duration,
        available: c.is_available,
        scheduledRelease: c.scheduled_release,
        releasedAt: c.released_at,
      }));

      res.json(classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update classes for an instance (bulk update)
  async updateByInstance(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      const { instanceId } = req.params;
      const { classes } = req.body as { classes: ClassData[] };

      await client.query('BEGIN');

      // Delete existing classes for this instance
      await client.query('DELETE FROM classes WHERE instance_id = $1', [instanceId]);

      // Insert new classes
      for (let i = 0; i < classes.length; i++) {
        const c = classes[i];
        await client.query(
          `INSERT INTO classes (instance_id, class_id, title, description, video_url, thumbnail_url, duration, is_available, scheduled_release, released_at, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            instanceId,
            c.id,
            c.title,
            c.description || null,
            c.videoUrl || null,
            c.thumbnail || null,
            c.duration || null,
            c.available || false,
            c.scheduledRelease || null,
            c.releasedAt || null,
            i,
          ]
        );
      }

      await client.query('COMMIT');

      res.json({ message: 'Classes updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating classes:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  },

  // Add single class
  async addClass(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { id, title, description, videoUrl, thumbnail, duration, available, scheduledRelease } = req.body;

      const result = await pool.query(
        `INSERT INTO classes (instance_id, class_id, title, description, video_url, thumbnail_url, duration, is_available, scheduled_release, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM classes WHERE instance_id = $1))
         RETURNING *`,
        [instanceId, id, title, description || null, videoUrl || null, thumbnail || null, duration || null, available || false, scheduledRelease || null]
      );

      res.status(201).json({
        id: result.rows[0].class_id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        videoUrl: result.rows[0].video_url,
        thumbnail: result.rows[0].thumbnail_url,
        duration: result.rows[0].duration,
        available: result.rows[0].is_available,
        scheduledRelease: result.rows[0].scheduled_release,
        releasedAt: result.rows[0].released_at,
      });
    } catch (error) {
      console.error('Error adding class:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update single class
  async updateClass(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId, classId } = req.params;
      const { title, description, videoUrl, thumbnail, duration, available, scheduledRelease } = req.body;

      const result = await pool.query(
        `UPDATE classes
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             video_url = COALESCE($3, video_url),
             thumbnail_url = COALESCE($4, thumbnail_url),
             duration = COALESCE($5, duration),
             is_available = COALESCE($6, is_available),
             scheduled_release = COALESCE($7, scheduled_release),
             updated_at = CURRENT_TIMESTAMP
         WHERE instance_id = $8 AND class_id = $9
         RETURNING *`,
        [title, description, videoUrl, thumbnail, duration, available, scheduledRelease, instanceId, classId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Class not found' });
        return;
      }

      res.json({
        id: result.rows[0].class_id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        videoUrl: result.rows[0].video_url,
        thumbnail: result.rows[0].thumbnail_url,
        duration: result.rows[0].duration,
        available: result.rows[0].is_available,
        scheduledRelease: result.rows[0].scheduled_release,
        releasedAt: result.rows[0].released_at,
      });
    } catch (error) {
      console.error('Error updating class:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete single class
  async deleteClass(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId, classId } = req.params;

      const result = await pool.query(
        'DELETE FROM classes WHERE instance_id = $1 AND class_id = $2 RETURNING class_id',
        [instanceId, classId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Class not found' });
        return;
      }

      res.json({ message: 'Class deleted successfully' });
    } catch (error) {
      console.error('Error deleting class:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Release a class (make available)
  async releaseClass(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId, classId } = req.params;

      const result = await pool.query(
        `UPDATE classes
         SET is_available = true, released_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE instance_id = $1 AND class_id = $2
         RETURNING *`,
        [instanceId, classId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Class not found' });
        return;
      }

      res.json({
        id: result.rows[0].class_id,
        title: result.rows[0].title,
        available: result.rows[0].is_available,
        releasedAt: result.rows[0].released_at,
      });
    } catch (error) {
      console.error('Error releasing class:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default classesController;
