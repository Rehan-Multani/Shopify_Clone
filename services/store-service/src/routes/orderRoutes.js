import express from 'express';
import { 
    getMyOrders, 
    createOrder, 
    updateOrderStatus, 
    getCustomerOrders, 
    getOrderDetails,
    cancelOrder,
    fulfillShippingInternal,
} from '../controllers/orderController.js';

const router = express.Router();

router.route('/')
    .get(getMyOrders)
    .post(createOrder);

router.route('/customer/:customerId')
    .get(getCustomerOrders);

// Internal routes before /:id
router.post('/internal/:id/fulfill-shipping', fulfillShippingInternal);

router.route('/:id')
    .get(getOrderDetails)
    .put(updateOrderStatus);

router.route('/:id/cancel')
    .put(cancelOrder);

export default router;
