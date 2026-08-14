import mongoose from 'mongoose';

const merchantShiprocketConfigSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true,
        index: true,
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        default: null,
        index: true,
    },
    // AES-GCM encrypted JSON: { email, password }
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

merchantShiprocketConfigSchema.index({ merchantId: 1, storeId: 1 }, { unique: true });

const MerchantShiprocketConfig = mongoose.model('MerchantShiprocketConfig', merchantShiprocketConfigSchema);
export default MerchantShiprocketConfig;
