import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    },
    resetPasswordOTP: {
        type: String,
        default: undefined
    },
    resetPasswordExpire: {
        type: Date,
        default: undefined
    }
}, {
    timestamps: true,
    collection: 'vendors' // ensure it queries the same collection as catalog-service
});

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
