import mongoose from 'mongoose';

const vendorShiprocketConfigSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        unique: true,
        index: true,
    },
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        default: null,
        index: true,
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        default: null,
        index: true,
    },
    credentials: { type: String, default: '' },
    pickupLocation: { type: String, default: 'Primary', trim: true },
    channelId: { type: String, default: '', trim: true },
    pickupPincode: { type: String, default: '', trim: true },
    enabled: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['not_configured', 'configured', 'verified', 'error'],
        default: 'not_configured',
    },
    lastTestedAt: { type: Date, default: null },
    lastTestResult: {
        success: { type: Boolean, default: false },
        message: { type: String, default: '' },
    },
    tokenEncrypted: { type: String, default: '' },
    tokenExpiresAt: { type: Date, default: null },
}, { timestamps: true });

const VendorShiprocketConfig = mongoose.model('VendorShiprocketConfig', vendorShiprocketConfigSchema);
export default VendorShiprocketConfig;
