import express from 'express';
import { getVendors, createVendor, getVendor, updateVendor, deleteVendor, uploadVendorLogo } from '../controllers/vendorController.js';
import { uploadCategoryImageMiddleware } from '../../../shared/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', uploadCategoryImageMiddleware, uploadVendorLogo);

router.route('/')
    .get(getVendors)
    .post(createVendor);

router.route('/:id')
    .get(getVendor)
    .put(updateVendor)
    .delete(deleteVendor);

export default router;
