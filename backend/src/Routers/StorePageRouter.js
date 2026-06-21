import express from 'express';
import { getPages, getPageBySlug, updatePage } from '../Controllers/StorePageController.js';
import { protectMerchant } from '../Helpers/merchantAuthMiddleware.js';

const router = express.Router();

// Apply merchant auth middleware to all routes
router.use(protectMerchant);

router.route('/')
    .get(getPages);

router.route('/:slug')
    .get(getPageBySlug)
    .put(updatePage);

export default router;
