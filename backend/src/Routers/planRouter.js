import express from 'express';
import { getPlans, createPlan, updatePlan, deletePlan } from '../Controllers/planController.js';
import { protectAdmin } from '../Helpers/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getPlans) // For this test, making get plans public or open to all could be useful if merchants need to see plans. For now, we will leave without protectAdmin on GET
    .post(protectAdmin, createPlan);

router.route('/:id')
    .put(protectAdmin, updatePlan)
    .delete(protectAdmin, deletePlan);

export default router;
