import express from 'express';
import { getMerchants, createMerchant, updateMerchant, deleteMerchant, uploadMerchantProfile, merchantLogin, merchantForgotPassword } from '../Controllers/merchantController.js';
import { protectAdmin } from '../Helpers/authMiddleware.js';
import { uploadMerchantProfileMiddleware } from '../Helpers/uploadMiddleware.js';

const router = express.Router();

router.post('/login', merchantLogin);
router.post('/forgot-password', merchantForgotPassword);
router.post('/upload', protectAdmin, uploadMerchantProfileMiddleware, uploadMerchantProfile);

router.route('/')
    .get(protectAdmin, getMerchants)
    .post(protectAdmin, createMerchant);

router.route('/:id')
    .put(protectAdmin, updateMerchant)
    .delete(protectAdmin, deleteMerchant);

export default router;
