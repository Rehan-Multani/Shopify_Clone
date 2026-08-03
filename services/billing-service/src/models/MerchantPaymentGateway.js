import mongoose from 'mongoose';
import { SUPPORTED_GATEWAYS, ENVIRONMENTS } from '../constants/gateways.js';

const merchantPaymentGatewaySchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true,
        index: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        default: null,
        index: true
    },
    gateway: {
        type: String,
        enum: SUPPORTED_GATEWAYS,
        required: true
    },
    environment: {
        type: String,
        enum: ENVIRONMENTS,
        default: 'sandbox'
    },
    // AES-GCM encrypted JSON blob of API credentials
    credentials: {
        type: String,
        default: ''
    },
    webhookSecret: {
        type: String,
        default: ''
    },
    currency: {
        type: String,
        default: 'INR',
        uppercase: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['not_configured', 'configured', 'verified', 'error'],
        default: 'not_configured'
    },
    lastTestedAt: {
        type: Date,
        default: null
    },
    lastTestResult: {
        success: { type: Boolean, default: false },
        message: { type: String, default: '' }
    }
}, {
    timestamps: true
});

merchantPaymentGatewaySchema.index({ merchantId: 1, gateway: 1, storeId: 1 }, { unique: true });

const MerchantPaymentGateway = mongoose.model('MerchantPaymentGateway', merchantPaymentGatewaySchema);
export default MerchantPaymentGateway;
