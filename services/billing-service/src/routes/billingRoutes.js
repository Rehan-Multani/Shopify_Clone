import express from 'express';
import { createOrder, verifyPayment, getPaymentHistory, getActiveSubscription, verifyStorePayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/verify-store-payment', verifyStorePayment);
router.get('/history', getPaymentHistory);
router.get('/active-subscription', getActiveSubscription);

export default router;
