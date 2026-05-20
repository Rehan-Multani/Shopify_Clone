import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { resolveStore } from '../middleware/storeContext.js';
import {
  createCustomer, listCustomers, getCustomer, updateCustomer, deleteCustomer,
} from '../controllers/customer.controller.js';

const router = Router({ mergeParams: true });
router.use(protect, resolveStore);

router.route('/').get(listCustomers).post(createCustomer);
router.route('/:id').get(getCustomer).patch(updateCustomer).delete(deleteCustomer);

export default router;
