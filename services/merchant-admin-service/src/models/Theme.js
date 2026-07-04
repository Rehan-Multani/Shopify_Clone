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
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
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
    }
}, {
    timestamps: true
});

const Theme = mongoose.model('Theme', themeSchema);
export default Theme;
