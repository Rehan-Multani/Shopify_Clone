import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true
    },
    planType: {
        type: String,
        enum: ['Single Vendor', 'Multi Vendor'],
        default: 'Single Vendor'
    },
    storeName: {
        type: String,
        required: true
    },
    storeSlug: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    paymentSettings: {
        codEnabled: { type: Boolean, default: true },
        onlineEnabled: { type: Boolean, default: true }
    },
    gstPercent: { type: Number, default: 0 },
    platformCommission: { type: Number, default: 0 }
}, {
    timestamps: true,
    strict: false
});

const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);
export default Store;
