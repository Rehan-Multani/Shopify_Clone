import mongoose from 'mongoose';

// Shared `orders` collection (same as store-service)
const orderSchema = new mongoose.Schema({
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    products: [{
        productId: mongoose.Schema.Types.ObjectId,
        productName: String,
        quantity: Number,
        price: Number,
        vendorId: { type: mongoose.Schema.Types.ObjectId, default: null }
    }],
    totalAmount: { type: Number, required: true, default: 0 },
    subtotal: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    platformCommissionAmount: { type: Number, default: 0 },
    status: { type: String, default: 'pending' },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: { type: String, default: 'COD' },
    paymentOwnerType: {
        type: String,
        enum: ['merchant', 'vendor', 'store', null],
        default: null
    },
    isFallbackPayment: { type: Boolean, default: false },
    gatewayPaymentId: { type: String, default: '' },
    checkoutPaymentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    shippingAddress: {
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    trackingStatus: [{
        status: String,
        updatedAt: { type: Date, default: Date.now },
        description: String
    }]
}, {
    timestamps: true,
    strict: false,
    collection: 'orders'
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
