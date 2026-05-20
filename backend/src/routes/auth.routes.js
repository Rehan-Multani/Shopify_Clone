import { Router } from 'express';
import { signup, login, logout, refresh, me } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.get('/me', protect, me);

export default router;
