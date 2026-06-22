import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true
    },
    planType: {
        type: String,
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
    }
}, {
    timestamps: true
});

const Store = mongoose.model('Store', storeSchema);
export default Store;
