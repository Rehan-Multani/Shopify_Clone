import mongoose from 'mongoose';
import { PAYMENT_MODES } from '../constants/gateways.js';

const marketplaceSettingsSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true,
        unique: true,
        index: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        default: null
    },
    // When true, vendors may configure their own independent payment gateways
    allowVendorGateway: {
        type: Boolean,
        default: false
    },
    // Gateways merchants allow vendors to use (subset of platform-available)
    allowedVendorGateways: {
        type: [String],
        default: ['razorpay', 'stripe', 'payu', 'cashfree']
    },
    // When vendor has no gateway configured:
    // true  → fall back to merchant gateway
    // false → checkout error: "Vendor payment gateway is not configured."
    allowVendorGatewayFallback: {
        type: Boolean,
        default: true
    },
    // Who receives payment: merchant | vendor | split (future)
    paymentMode: {
        type: String,
        enum: PAYMENT_MODES,
        default: 'merchant'
    },
    defaultGateway: {
        type: String,
        default: null
    },
    splitPaymentEnabled: {
        type: Boolean,
        default: false
    },
    commissionPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

const MarketplaceSettings = mongoose.model('MarketplaceSettings', marketplaceSettingsSchema);
export default MarketplaceSettings;
