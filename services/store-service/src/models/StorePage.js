import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
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
}, { _id: false });

const sectionSchema = new mongoose.Schema({
    sectionId: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    type: {
        type: String,
        required: true
    },
    component: {
        type: String,
        default: ''
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
    blocks: [blockSchema]
}, { _id: false });

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
    // Legacy alias — kept in sync with publishedSections for backward compatibility
    sections: [sectionSchema],
    // Merchant builder edits
    draftSections: [sectionSchema],
    // Customer-facing storefront
    publishedSections: [sectionSchema]
}, {
    timestamps: true
});

storePageSchema.index({ storeId: 1, slug: 1, themeId: 1 }, { unique: true });

/**
 * Resolve which sections array to expose.
 * Migrates legacy `sections` into draft/published when needed.
 */
storePageSchema.methods.resolveSections = function resolveSections({ preferDraft = false } = {}) {
    const legacy = Array.isArray(this.sections) ? this.sections : [];
    let draft = Array.isArray(this.draftSections) ? this.draftSections : [];
    let published = Array.isArray(this.publishedSections) ? this.publishedSections : [];

    if (draft.length === 0 && legacy.length > 0) {
        draft = legacy;
    }
    if (published.length === 0 && legacy.length > 0) {
        published = legacy;
    }
    if (draft.length === 0 && published.length > 0) {
        draft = published;
    }

    return preferDraft ? draft : published;
};

const StorePage = mongoose.model('StorePage', storePageSchema);
export default StorePage;
