import mongoose from 'mongoose';
import slugify from 'slugify';

const storeSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: [true, 'Store must belong to a merchant']
    },
    planType: {
        type: String,
        enum: ['Single Vendor', 'Multi Vendor'],
        required: [true, 'Store plan type is required']
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: [true, 'Store must be linked to a plan']
    },
    storeName: {
        type: String,
        required: [true, 'Please add a store name'],
        trim: true
    },
    storeSlug: {
        type: String,
        unique: true,
        lowercase: true
    },
    storeLogo: {
        type: String,
        default: ''
    },
    storeBanner: {
        type: String,
        default: ''
    },
    storeDescription: {
        type: String,
        default: ''
    },
    contactEmail: {
        type: String,
        default: ''
    },
    contactPhone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    pincode: {
        type: String,
        default: ''
    },
    socialLinks: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' }
    },
    customDomain: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    revenue: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Auto-generate slug from storeName before save
storeSchema.pre('save', function (next) {
    if (this.isModified('storeName') || !this.storeSlug) {
        this.storeSlug = slugify(this.storeName, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    }
    next();
});

const Store = mongoose.model('Store', storeSchema);

export default Store;
