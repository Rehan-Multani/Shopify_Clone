import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        default: null,
        index: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        default: ''
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        productName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        price: {
            type: Number,
            required: true
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    gstAmount: {
        type: Number,
        default: 0
    },
    platformCommissionAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    customerPhone: {
        type: String,
        default: ''
    },
    paymentMethod: {
        type: String,
        default: 'COD'
    },
    paymentOwnerType: {
        type: String,
        enum: ['merchant', 'vendor', 'store', null],
        default: null
    },
    isFallbackPayment: {
        type: Boolean,
        default: false
    },
    gatewayPaymentId: {
        type: String,
        default: ''
    },
    checkoutPaymentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    shippingAddress: {
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' }
    },
    trackingStatus: [{
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
        description: { type: String, default: '' }
    }]
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
