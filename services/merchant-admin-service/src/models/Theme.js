import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
    themeName: {
        type: String,
        required: true,
        trim: true
    },
    folder: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['free', 'paid'],
        default: 'free',
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    industry: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail: {
        type: String,
        default: ''
    },
    previewImages: [{
        type: String
    }],
    shortDescription: {
        type: String,
        default: ''
    },
    longDescription: {
        type: String,
        default: ''
    },
    features: [{
        type: String
    }],
    category: {
        type: String,
        default: '',
        trim: true
    },
    supportedSections: [{
        type: String
    }],
    capabilities: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'review', 'deprecated'],
        default: 'draft',
        required: true
    },
    visibility: {
        type: String,
        enum: ['visible', 'hidden'],
        default: 'visible',
        required: true
    },
    version: {
        type: String,
        required: true,
        trim: true
    },
    // Wave 7 — marketplace author / vendor foundation (no revenue share yet)
    authorId: { type: String, default: '', trim: true },
    authorName: { type: String, default: '', trim: true },
    license: { type: String, default: 'proprietary', trim: true },
    versionHistory: [{
        version: String,
        changelog: String,
        releasedAt: { type: Date, default: Date.now },
    }],
    submissionStatus: {
        type: String,
        enum: ['', 'draft', 'review', 'published', 'deprecated'],
        default: '',
    },
}, {
    timestamps: true
});

const Theme = mongoose.model('Theme', themeSchema);
export default Theme;
