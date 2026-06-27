import express from 'express';
import { 
    createStore, 
    getMyStores, 
    getStoreById, 
    updateStore, 
    deleteStore, 
    getAllStores, 
    getDashboardStats, 
    getAnalyticsStats, 
    createStoreInternal,
    updateStoreDomain,
    publishStoreDomain,
    unpublishStoreDomain,
    checkDomainDNS,
    getPlatformSettings,
    updatePlatformSettings,
    getExpectedIP,
    resolveDomain
} from '../controllers/storeController.js';

const router = express.Router();

// Admin routes
router.get('/admin/all', getAllStores);
router.get('/admin/settings', getPlatformSettings);
router.put('/admin/settings', updatePlatformSettings);

// Internal routes (e.g. for billing-service store creation)
router.post('/internal/create', createStoreInternal);

// Merchant routes
router.get('/domain/resolve', resolveDomain);
router.get('/domain/expected-ip', getExpectedIP);
router.get('/domain/dns-check', checkDomainDNS);
router.put('/:id/domain', updateStoreDomain);
router.put('/:id/domain/publish', publishStoreDomain);
router.put('/:id/domain/unpublish', unpublishStoreDomain);

router.get('/dashboard-stats', getDashboardStats);
router.get('/analytics-stats', getAnalyticsStats);
router.get('/my-stores', getMyStores);
router.post('/', createStore);

router.route('/:id')
    .get(getStoreById)
    .put(updateStore)
    .delete(deleteStore);

export default router;
