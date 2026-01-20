import { Router } from 'express';
import materialsController from '../controllers/materialsController';
import authMiddleware from '../middleware/auth';

const router = Router();

// Public route for scheduled unlocks (called by frontend scheduler)
router.post('/process-scheduled', materialsController.processScheduledUnlocks);

// Get materials (public for viewing)
router.get('/:instanceId', materialsController.getByInstance);

// Protected routes (require authentication)
router.put('/:instanceId', authMiddleware, materialsController.updateByInstance);
router.post('/:instanceId/:classId', authMiddleware, materialsController.addMaterial);
router.delete('/:instanceId/:classId/:itemId', authMiddleware, materialsController.deleteMaterial);
router.post('/:instanceId/:classId/:itemId/unlock', authMiddleware, materialsController.unlockMaterial);
router.post('/:instanceId/:classId/:itemId/lock', authMiddleware, materialsController.lockMaterial);

export default router;
