import express from 'express';
import { createOrder, verifyPayment, getPaymentHistory, getActiveSubscription, verifyStorePayment, getAdminPaymentHistory } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/verify-store-payment', verifyStorePayment);
router.get('/history', getPaymentHistory);
router.get('/active-subscription', getActiveSubscription);
router.get('/admin/history', getAdminPaymentHistory);

export default router;
