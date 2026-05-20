import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { resolveStore } from '../middleware/storeContext.js';
import {
  createOrder, listOrders, getOrder, updateOrder, cancelOrder,
} from '../controllers/order.controller.js';

const router = Router({ mergeParams: true });
router.use(protect, resolveStore);

router.route('/').get(listOrders).post(createOrder);
router.route('/:id').get(getOrder).patch(updateOrder);
router.post('/:id/cancel', cancelOrder);

export default router;
