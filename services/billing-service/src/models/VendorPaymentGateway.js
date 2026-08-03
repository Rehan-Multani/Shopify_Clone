import mongoose from 'mongoose';
import { SUPPORTED_GATEWAYS, ENVIRONMENTS } from '../constants/gateways.js';

const vendorPaymentGatewaySchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        index: true
    },
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

vendorPaymentGatewaySchema.index({ vendorId: 1, gateway: 1 }, { unique: true });

const VendorPaymentGateway = mongoose.model('VendorPaymentGateway', vendorPaymentGatewaySchema);
export default VendorPaymentGateway;
