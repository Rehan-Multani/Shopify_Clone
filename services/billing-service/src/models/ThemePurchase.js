import mongoose from 'mongoose';

const themePurchaseSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true,
        index: true,
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        default: null,
    },
    themeId: {
        type: String,
        required: true,
        index: true,
    },
    themeFolder: {
        type: String,
        default: '',
    },
    themeName: {
        type: String,
        default: '',
    },
    orderId: {
        type: String,
        default: '',
    },
    paymentId: {
        type: String,
        default: '',
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    purchasedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

themePurchaseSchema.index({ merchantId: 1, themeId: 1 }, { unique: true });

const ThemePurchase = mongoose.model('ThemePurchase', themePurchaseSchema);
export default ThemePurchase;
