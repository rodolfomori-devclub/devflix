import { Request, Response } from 'express';
import pool from '../db/pool';

interface ScheduleData {
  day: number;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  isActive?: boolean;
}

const schedulesController = {
  // Get schedules for an instance
  async getByInstance(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId } = req.params;

      const result = await pool.query(
        'SELECT * FROM schedules WHERE instance_id = $1 ORDER BY day_number',
        [instanceId]
      );

      const schedules = result.rows.map(s => ({
        id: s.id,
        day: s.day_number,
        title: s.title,
        description: s.description,
        date: s.date,
        time: s.time,
        isActive: s.is_active,
      }));

      res.json(schedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update schedules for an instance (bulk update)
  async updateByInstance(req: Request, res: Response): Promise<void> {
    const client = await pool.connect();
    try {
      const { instanceId } = req.params;
      const { schedules } = req.body as { schedules: ScheduleData[] };

      await client.query('BEGIN');

      // Delete existing schedules for this instance
      await client.query('DELETE FROM schedules WHERE instance_id = $1', [instanceId]);

      // Insert new schedules
      for (const s of schedules) {
        await client.query(
          `INSERT INTO schedules (instance_id, day_number, title, description, date, time, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            instanceId,
            s.day,
            s.title,
            s.description || null,
            s.date || null,
            s.time || null,
            s.isActive || false,
          ]
        );
      }

      await client.query('COMMIT');

      res.json({ message: 'Schedules updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating schedules:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  },

  // Add single schedule
  async addSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { day, title, description, date, time, isActive } = req.body;

      const result = await pool.query(
        `INSERT INTO schedules (instance_id, day_number, title, description, date, time, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [instanceId, day, title, description || null, date || null, time || null, isActive || false]
      );

      res.status(201).json({
        id: result.rows[0].id,
        day: result.rows[0].day_number,
        title: result.rows[0].title,
        description: result.rows[0].description,
        date: result.rows[0].date,
        time: result.rows[0].time,
        isActive: result.rows[0].is_active,
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update single schedule
  async updateSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId, scheduleId } = req.params;
      const { day, title, description, date, time, isActive } = req.body;

      const result = await pool.query(
        `UPDATE schedules
         SET day_number = COALESCE($1, day_number),
             title = COALESCE($2, title),
             description = COALESCE($3, description),
             date = COALESCE($4, date),
             time = COALESCE($5, time),
             is_active = COALESCE($6, is_active),
             updated_at = CURRENT_TIMESTAMP
         WHERE instance_id = $7 AND id = $8
         RETURNING *`,
        [day, title, description, date, time, isActive, instanceId, scheduleId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }

      res.json({
        id: result.rows[0].id,
        day: result.rows[0].day_number,
        title: result.rows[0].title,
        description: result.rows[0].description,
        date: result.rows[0].date,
        time: result.rows[0].time,
        isActive: result.rows[0].is_active,
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete single schedule
  async deleteSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { instanceId, scheduleId } = req.params;

      const result = await pool.query(
        'DELETE FROM schedules WHERE instance_id = $1 AND id = $2 RETURNING id',
        [instanceId, scheduleId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Schedule not found' });
        return;
      }

      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default schedulesController;
