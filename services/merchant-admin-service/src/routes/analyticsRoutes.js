import express from 'express';
import { getSuperadminAnalytics, getSuperadminOverview } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/analytics', getSuperadminAnalytics);
router.get('/overview', getSuperadminOverview);

export default router;
