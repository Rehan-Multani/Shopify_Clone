import express from 'express';
import { createStore, getMyStores, getStoreById, updateStore, deleteStore, getAllStores } from '../Controllers/storeController.js';
import { protectMerchant } from '../Helpers/merchantAuthMiddleware.js';
import { protectAdmin } from '../Helpers/authMiddleware.js';

const router = express.Router();

// Master Admin route (MUST be before /:id to avoid conflicts)
router.get('/admin/all', protectAdmin, getAllStores);

// Merchant routes (protected by merchant auth)
router.get('/my-stores', protectMerchant, getMyStores);
router.post('/', protectMerchant, createStore);
router.get('/:id', protectMerchant, getStoreById);
router.put('/:id', protectMerchant, updateStore);
router.delete('/:id', protectMerchant, deleteStore);

export default router;
