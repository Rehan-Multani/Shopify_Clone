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
    themeId: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    isHomePage: {
        type: Boolean,
        default: false
    },
    seo: {
        metaTitle: { type: String, default: '' },
        metaDescription: { type: String, default: '' },
        ogImage: { type: String, default: '' },
        canonical: { type: String, default: '' }
    },
    visibility: {
        type: String,
        enum: ['published', 'draft', 'scheduled'],
        default: 'published'
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        default: ''
    },
    sections: [{
        sectionId: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString()
        },
        type: {
            type: String,
            required: true
        },
        order: {
            type: Number,
            default: 0
        },
        enabled: {
            type: Boolean,
            default: true
        },
        locked: {
            type: Boolean,
            default: false
        },
        settings: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        blocks: [{
            blockId: {
                type: String,
                default: () => new mongoose.Types.ObjectId().toString()
            },
            type: {
                type: String,
                required: true
            },
            settings: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            }
        }]
    }]
}, {
    timestamps: true
});

storePageSchema.index({ storeId: 1, slug: 1, themeId: 1 }, { unique: true });

const StorePage = mongoose.model('StorePage', storePageSchema);
export default StorePage;
