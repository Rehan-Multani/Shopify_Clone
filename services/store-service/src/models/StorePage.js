import mongoose from 'mongoose';

const storePageSchema = new mongoose.Schema({
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
    slug: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

storePageSchema.index({ storeId: 1, slug: 1 }, { unique: true });

const StorePage = mongoose.model('StorePage', storePageSchema);
export default StorePage;
