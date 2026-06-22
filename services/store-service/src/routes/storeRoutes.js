import express from 'express';
import { createStore, getMyStores, getStoreById, updateStore, deleteStore, getAllStores, getDashboardStats, getAnalyticsStats, createStoreInternal } from '../controllers/storeController.js';

const router = express.Router();

// Admin routes
router.get('/admin/all', getAllStores);

// Internal routes (e.g. for billing-service store creation)
router.post('/internal/create', createStoreInternal);

// Merchant routes
router.get('/dashboard-stats', getDashboardStats);
router.get('/analytics-stats', getAnalyticsStats);
router.get('/my-stores', getMyStores);
router.post('/', createStore);

router.route('/:id')
    .get(getStoreById)
    .put(updateStore)
    .delete(deleteStore);

export default router;
