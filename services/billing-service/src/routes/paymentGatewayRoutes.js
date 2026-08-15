import express from 'express';
import {
    listMerchantGateways,
    upsertMerchantGateway,
    deleteMerchantGateway,
    testMerchantGateway,
    disableMerchantGateway,
} from '../controllers/merchantGatewayController.js';
import {
    listVendorGateways,
    upsertVendorGateway,
    deleteVendorGateway,
    testVendorGateway,
    disableVendorGateway,
} from '../controllers/vendorGatewayController.js';
import {
    getMarketplacePaymentSettings,
    updateMarketplacePaymentSettings
} from '../controllers/marketplaceSettingsController.js';
import {
    getPaymentOptions,
    createCheckoutPayment,
    verifyCheckoutPayment,
    payuReturn,
    getPaymentStatus,
    refundCheckoutPayment,
} from '../controllers/checkoutPaymentController.js';
import {
    razorpayWebhook,
    stripeWebhook,
    payuWebhook,
    cashfreeWebhook
} from '../controllers/webhookController.js';
import {
    getMerchantEmailConfig,
    upsertMerchantEmailConfig,
    disableMerchantEmailConfig,
    testMerchantEmailConfig,
    listMerchantEmailLogs,
    getVendorEmailConfig,
    upsertVendorEmailConfig,
    disableVendorEmailConfig,
    testVendorEmailConfig,
    listVendorEmailLogs
} from '../controllers/emailConfigController.js';

const router = express.Router();

// ---- Merchant Email Configuration ----
router.get('/merchant/email-config', getMerchantEmailConfig);
router.put('/merchant/email-config', upsertMerchantEmailConfig);
router.post('/merchant/email-config', upsertMerchantEmailConfig);
router.post('/merchant/email-config/test', testMerchantEmailConfig);
router.post('/merchant/email-config/disable', disableMerchantEmailConfig);
router.get('/merchant/email-config/logs', listMerchantEmailLogs);

// ---- Vendor Email Configuration ----
router.get('/vendor/email-config', getVendorEmailConfig);
router.put('/vendor/email-config', upsertVendorEmailConfig);
router.post('/vendor/email-config', upsertVendorEmailConfig);
router.post('/vendor/email-config/test', testVendorEmailConfig);
router.post('/vendor/email-config/disable', disableVendorEmailConfig);
router.get('/vendor/email-config/logs', listVendorEmailLogs);

// ---- Merchant Payment Gateways ----
router.get('/merchant/payment-gateways', listMerchantGateways);
router.post('/merchant/payment-gateways', upsertMerchantGateway);
router.put('/merchant/payment-gateways/:gateway', upsertMerchantGateway);
router.delete('/merchant/payment-gateways/:gateway', deleteMerchantGateway);
router.post('/merchant/payment-gateways/:gateway/test', testMerchantGateway);
router.post('/merchant/payment-gateways/:gateway/disable', disableMerchantGateway);

// ---- Vendor Payment Gateways ----
router.get('/vendor/payment-gateways', listVendorGateways);
router.post('/vendor/payment-gateways', upsertVendorGateway);
router.put('/vendor/payment-gateways/:gateway', upsertVendorGateway);
router.delete('/vendor/payment-gateways/:gateway', deleteVendorGateway);
router.post('/vendor/payment-gateways/:gateway/test', testVendorGateway);
router.post('/vendor/payment-gateways/:gateway/disable', disableVendorGateway);

// ---- Marketplace Settings ----
router.get('/marketplace/payment-settings', getMarketplacePaymentSettings);
router.put('/marketplace/payment-settings', updateMarketplacePaymentSettings);

// ---- Checkout ----
router.get('/checkout/payment-options', getPaymentOptions);
router.post('/checkout/create-payment', createCheckoutPayment);
router.post('/checkout/verify-payment', verifyCheckoutPayment);
router.post('/checkout/refund-payment', refundCheckoutPayment);
router.get('/checkout/payment-status', getPaymentStatus);
router.post('/checkout/payu-return', payuReturn);
router.get('/checkout/payu-return', payuReturn);

// ---- Webhooks ----
router.post('/webhooks/razorpay', razorpayWebhook);
router.post('/webhooks/stripe', stripeWebhook);
router.post('/webhooks/payu', payuWebhook);
router.post('/webhooks/cashfree', cashfreeWebhook);

export default router;
