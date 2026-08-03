import mongoose from 'mongoose';

/**
 * When vendor has no gateway and payment falls back to merchant,
 * record what merchant owes the vendor for later settlement.
 */
const vendorSettlementSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true,
        index: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        index: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },
    checkoutPaymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CheckoutPayment',
        default: null
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
        enum: ['pending', 'settled', 'cancelled'],
        default: 'pending',
        index: true
    },
    note: {
        type: String,
        default: 'Fallback payment collected on merchant gateway — owed to vendor'
    }
}, {
    timestamps: true
});

const VendorSettlement = mongoose.models.VendorSettlement
    || mongoose.model('VendorSettlement', vendorSettlementSchema);

export default VendorSettlement;
