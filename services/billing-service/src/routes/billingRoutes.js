import express from 'express';
import { createOrder, verifyPayment, getPaymentHistory, getActiveSubscription, verifyStorePayment, getAdminPaymentHistory } from '../controllers/paymentController.js';
import {
    createThemeOrder,
    verifyThemePayment,
    checkThemePurchase,
    getThemePurchases,
} from '../controllers/themePaymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/verify-store-payment', verifyStorePayment);
router.get('/history', getPaymentHistory);
router.get('/active-subscription', getActiveSubscription);
router.get('/admin/history', getAdminPaymentHistory);

// Premium theme purchases
router.post('/themes/create-order', createThemeOrder);
router.post('/themes/verify', verifyThemePayment);
router.get('/themes/check/:themeId', checkThemePurchase);
router.get('/themes/purchases', getThemePurchases);

export default router;
