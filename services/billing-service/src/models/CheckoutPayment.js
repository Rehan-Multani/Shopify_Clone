import mongoose from 'mongoose';
import { SUPPORTED_GATEWAYS } from '../constants/gateways.js';

const checkoutPaymentSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true
    },
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true,
        index: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        default: null
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    gateway: {
        type: String,
        enum: [...SUPPORTED_GATEWAYS, 'cod'],
        required: true
    },
    ownerType: {
        type: String,
        enum: ['merchant', 'vendor', 'store'],
        default: 'merchant'
    },
    isFallback: {
        type: Boolean,
        default: false
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'pending', 'paid', 'failed', 'refunded', 'cancelled'],
        default: 'created'
    },
    gatewayOrderId: {
        type: String,
        default: '',
        index: true
    },
    gatewayPaymentId: {
        type: String,
        default: ''
    },
    clientSecret: {
        type: String,
        default: ''
    },
    idempotencyKey: {
        type: String,
        default: '',
        index: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    rawResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

checkoutPaymentSchema.index(
    { idempotencyKey: 1 },
    { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string', $gt: '' } } }
);

const CheckoutPayment = mongoose.models.CheckoutPayment
    || mongoose.model('CheckoutPayment', checkoutPaymentSchema);

export default CheckoutPayment;
