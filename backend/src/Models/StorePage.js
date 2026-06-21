import mongoose from 'mongoose';

const storePageSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true
    },
    slug: {
        type: String,
        required: true,
        enum: ['privacy-policy', 'terms-and-conditions', 'about-us', 'contact-us', 'refund-policy']
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

// Ensure a merchant can only have one page per slug
storePageSchema.index({ merchantId: 1, slug: 1 }, { unique: true });

const StorePage = mongoose.model('StorePage', storePageSchema);

export default StorePage;
