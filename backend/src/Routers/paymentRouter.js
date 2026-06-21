import express from 'express';
import { createOrder, verifyPayment, getPaymentHistory, getActiveSubscription, verifyStorePayment } from '../Controllers/paymentController.js';
import { protectMerchant } from '../Helpers/merchantAuthMiddleware.js';

const router = express.Router();

router.post('/create-order', protectMerchant, createOrder);
router.post('/verify', protectMerchant, verifyPayment);
router.post('/verify-store-payment', protectMerchant, verifyStorePayment);
router.get('/history', protectMerchant, getPaymentHistory);
router.get('/active-subscription', protectMerchant, getActiveSubscription);

export default router;
