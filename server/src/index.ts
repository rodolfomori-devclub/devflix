import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import instancesRoutes from './routes/instances';
import materialsRoutes from './routes/materials';
import classesRoutes from './routes/classes';
import schedulesRoutes from './routes/schedules';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/instances', instancesRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/schedules', schedulesRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
