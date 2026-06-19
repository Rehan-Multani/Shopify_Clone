import express from 'express';
import { authMasterAdmin, getMasterAdminProfile, logoutAdmin } from '../Controllers/masterAdminController.js';
import { protectAdmin } from '../Helpers/authMiddleware.js';

const router = express.Router();

router.post('/login', authMasterAdmin);
router.post('/logout', logoutAdmin);
router.get('/profile', protectAdmin, getMasterAdminProfile);

export default router;
