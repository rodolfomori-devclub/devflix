import { Router } from 'express';
import schedulesController from '../controllers/schedulesController';
import authMiddleware from '../middleware/auth';

const router = Router();

// Get schedules (public for viewing)
router.get('/:instanceId', schedulesController.getByInstance);

// Protected routes (require authentication)
router.put('/:instanceId', authMiddleware, schedulesController.updateByInstance);
router.post('/:instanceId', authMiddleware, schedulesController.addSchedule);
router.put('/:instanceId/:scheduleId', authMiddleware, schedulesController.updateSchedule);
router.delete('/:instanceId/:scheduleId', authMiddleware, schedulesController.deleteSchedule);

export default router;
