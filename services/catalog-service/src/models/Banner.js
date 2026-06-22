import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: [true, 'Banner must belong to a merchant']
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Banner must belong to a store']
    },
    title: {
        type: String,
        required: [true, 'Please add a banner title'],
        trim: true
    },
        image: {
        type: String,
        required: [true, 'Please upload a banner image']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
