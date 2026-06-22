import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: true,
        trim: true,
    },
    planPrice: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    features: [{
        type: String,
    }],
    isPopular: {
        type: Boolean,
        default: false
    },
    isRecommended: {
        type: Boolean,
        default: false
    },
    planType: {
        type: String,
        enum: ['Single Vendor', 'Multi Vendor'],
        default: 'Single Vendor',
        required: true
    }
}, {
    timestamps: true
});

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
