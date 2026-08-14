import express from 'express';
import {
    getMerchantShipping,
    upsertMerchantShipping,
    testMerchantShipping,
    getVendorShipping,
    upsertVendorShipping,
    testVendorShipping,
    shiprocketWebhook,
} from '../controllers/shippingConfigController.js';

const router = express.Router();

router.get('/merchant/shipping', getMerchantShipping);
router.put('/merchant/shipping', upsertMerchantShipping);
router.post('/merchant/shipping', upsertMerchantShipping);
router.post('/merchant/shipping/test', testMerchantShipping);

router.get('/vendor/shipping', getVendorShipping);
router.put('/vendor/shipping', upsertVendorShipping);
router.post('/vendor/shipping', upsertVendorShipping);
router.post('/vendor/shipping/test', testVendorShipping);

router.post('/shipping/webhooks/shiprocket', shiprocketWebhook);

export default router;
