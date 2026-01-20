import { Router } from 'express';
import instanceController from '../controllers/instanceController';
import authMiddleware from '../middleware/auth';

const router = Router();

// Public routes
router.get('/slug/:slug', instanceController.getBySlug);

// Protected routes (require authentication)
router.get('/', authMiddleware, instanceController.getAll);
router.get('/:id', authMiddleware, instanceController.getById);
router.post('/', authMiddleware, instanceController.create);
router.put('/:id', authMiddleware, instanceController.update);
router.delete('/:id', authMiddleware, instanceController.delete);
router.post('/:id/duplicate', authMiddleware, instanceController.duplicate);

export default router;
