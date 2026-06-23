import express from 'express';
import { getMyOrders, createOrder, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.route('/')
    .get(getMyOrders)
    .post(createOrder);

router.route('/:id')
    .put(updateOrderStatus);

export default router;
