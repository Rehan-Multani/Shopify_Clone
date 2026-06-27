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
    domainPublished: {
        type: Boolean,
        default: false
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
    },
    paymentSettings: {
        codEnabled: {
            type: Boolean,
            default: true
        },
        onlineEnabled: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

storeSchema.pre('save', function () {
    if (this.isModified('storeName') || !this.storeSlug) {
        this.storeSlug = slugify(this.storeName, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    }
});

const Store = mongoose.model('Store', storeSchema);
export default Store;
