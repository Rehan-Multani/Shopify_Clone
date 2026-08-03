import express from 'express';
import { getMerchants, createMerchant, publicMerchantSignup, updateMerchant, deleteMerchant, uploadMerchantProfile, getAllStores } from '../controllers/merchantController.js';
import { getMasterAdminProfile } from '../controllers/adminProfileController.js';
import { uploadMerchantProfileMiddleware } from '../../../shared/uploadMiddleware.js';

const router = express.Router();

// Master Admin profile route
router.get('/profile', getMasterAdminProfile);

// Merchant profile image upload route
router.post('/merchants/upload', uploadMerchantProfileMiddleware, uploadMerchantProfile);

// Public signup (must be before /merchants/:id)
router.post('/merchants/signup', publicMerchantSignup);

// Admin view all stores
router.get('/stores/all', getAllStores);

// Merchant admin CRUD routes
router.route('/merchants')
    .get(getMerchants)
    .post(createMerchant);

router.route('/merchants/:id')
    .put(updateMerchant)
    .delete(deleteMerchant);

export default router;
