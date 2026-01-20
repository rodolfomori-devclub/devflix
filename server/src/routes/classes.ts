import { Router } from 'express';
import classesController from '../controllers/classesController';
import authMiddleware from '../middleware/auth';

const router = Router();

// Get classes (public for viewing)
router.get('/:instanceId', classesController.getByInstance);

// Protected routes (require authentication)
router.put('/:instanceId', authMiddleware, classesController.updateByInstance);
router.post('/:instanceId', authMiddleware, classesController.addClass);
router.put('/:instanceId/:classId', authMiddleware, classesController.updateClass);
router.delete('/:instanceId/:classId', authMiddleware, classesController.deleteClass);
router.post('/:instanceId/:classId/release', authMiddleware, classesController.releaseClass);

export default router;
