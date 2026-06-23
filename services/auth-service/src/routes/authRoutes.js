import express from 'express';
import { authMasterAdmin, logoutAdmin, changeAdminPassword } from '../controllers/adminAuthController.js';
import { merchantLogin, merchantForgotPassword, merchantVerifyOtp, merchantResetPassword, changeMerchantPassword } from '../controllers/merchantAuthController.js';
import { verifyToken, activateMerchantInternal, getMerchantInternal } from '../controllers/verifyController.js';

const router = express.Router();

// Admin Auth Routes
router.post('/admin/login', authMasterAdmin);
router.post('/admin/logout', logoutAdmin);
router.put('/admin/change-password', changeAdminPassword);

// Merchant Auth Routes
router.post('/merchant/login', merchantLogin);
router.post('/merchant/forgot-password', merchantForgotPassword);
router.post('/merchant/verify-otp', merchantVerifyOtp);
router.post('/merchant/reset-password', merchantResetPassword);
router.put('/merchant/change-password', changeMerchantPassword);

// Internal Token Validation (used by gateway)
router.post('/verify', verifyToken);

// Internal service communications
router.post('/internal/merchants/:id/activate', activateMerchantInternal);
router.get('/internal/merchants/:id', getMerchantInternal);

export default router;
