import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
    key: { type: String, required: true }, // A | B | control
    themeId: { type: String, default: '' },
    themeFolder: { type: String, default: '' },
    themeVersion: { type: String, default: '' },
    weight: { type: Number, default: 50, min: 0, max: 100 },
    label: { type: String, default: '' },
}, { _id: false });

const themeExperimentSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true,
    },
    name: { type: String, required: true, trim: true },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled', 'ended'],
        default: 'draft',
        index: true,
    },
    variants: {
        type: [variantSchema],
        validate: {
            validator: (v) => Array.isArray(v) && v.length >= 2 && v.length <= 4,
            message: 'Experiments require 2–4 variants',
        },
    },
    startAt: { type: Date },
    endAt: { type: Date },
}, { timestamps: true });

// Map legacy "ended" → treat as completed in app logic
themeExperimentSchema.index({ storeId: 1, status: 1 });
// Auto-complete job query: status + endAt
themeExperimentSchema.index({ status: 1, endAt: 1 });

const ThemeExperiment = mongoose.model('ThemeExperiment', themeExperimentSchema);
export default ThemeExperiment;
