import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import {
  listPlans, getPlan, createPlan, updatePlan, deletePlan, subscribe,
} from '../controllers/plan.controller.js';

const router = Router();

router.get('/', listPlans);
router.get('/:slug', getPlan);

router.post('/', protect, requireRole('master_admin'), createPlan);
router.patch('/:id', protect, requireRole('master_admin'), updatePlan);
router.delete('/:id', protect, requireRole('master_admin'), deletePlan);

router.post('/subscribe', protect, subscribe);

export default router;
