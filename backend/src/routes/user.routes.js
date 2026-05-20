import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { updateProfile, changePassword, uploadAvatar } from '../controllers/user.controller.js';

const router = Router();
router.use(protect);

router.patch('/me', updateProfile);
router.patch('/me/password', changePassword);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);

export default router;
