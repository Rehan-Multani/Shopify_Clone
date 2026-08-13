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
    },
    gstPercent: {
        type: Number,
        default: 0
    },
    platformCommission: {
        type: Number,
        default: 0
    },
    activeTheme: {
        themeId: { type: String, default: '' },
        folder: { type: String, default: '' },
        version: { type: String, default: '' },
        installedAt: { type: Date }
    },
    /** Draft theme switch / upgrade target — not live until publish */
    pendingTheme: {
        themeId: { type: String, default: '' },
        folder: { type: String, default: '' },
        version: { type: String, default: '' },
        mode: { type: String, enum: ['switch', 'upgrade', ''], default: '' },
        preparedAt: { type: Date }
    },
    /** Lightweight rollback snapshot of last published theme */
    previousPublishedTheme: {
        themeId: { type: String, default: '' },
        folder: { type: String, default: '' },
        version: { type: String, default: '' },
        snapshotAt: { type: Date }
    },
    previousPublishedConfig: {
        themeSettings: { type: mongoose.Schema.Types.Mixed, default: null },
        homeSections: { type: mongoose.Schema.Types.Mixed, default: null },
        themeId: { type: String, default: '' }
    },
    installedThemes: [{
        themeId: { type: String },
        folder: { type: String },
        version: { type: String },
        installedAt: { type: Date, default: Date.now },
        draftThemeSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
        publishedThemeSettings: { type: mongoose.Schema.Types.Mixed, default: {} }
    }]
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
