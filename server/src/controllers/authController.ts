import { Request, Response } from 'express';
import pool from '../db/pool';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

const authController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      const user = result.rows[0];

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, role',
        [email, hashedPassword]
      );

      const user = result.rows[0];

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async verifyToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT id, email, role FROM users WHERE id = $1',
        [req.userId]
      );

      const user = result.rows[0];

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default authController;
