/**
 * Email config models — MUST be registered with each service's mongoose instance.
 * Shared folder resolves a different mongoose copy than per-service node_modules,
 * so never call mongoose.model() at module top-level with a bare import.
 */

const EMAIL_PROVIDERS = ['brevo', 'smtp'];

export function registerEmailConfigModels(mongoose) {
    if (!mongoose) throw new Error('registerEmailConfigModels(mongoose) requires mongoose');

    if (!mongoose.models.MerchantEmailConfig) {
        const merchantEmailConfigSchema = new mongoose.Schema({
            merchantId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Merchant',
                required: true,
                unique: true,
                index: true
            },
            provider: { type: String, enum: EMAIL_PROVIDERS, default: 'brevo' },
            senderName: { type: String, default: '' },
            senderEmail: { type: String, default: '' },
            replyToEmail: { type: String, default: '' },
            smtpHost: { type: String, default: 'smtp-relay.brevo.com' },
            smtpPort: { type: Number, default: 587 },
            smtpSecure: { type: Boolean, default: false },
            smtpUsername: { type: String, default: '' },
            smtpPasswordEncrypted: { type: String, default: '' },
            apiKeyEncrypted: { type: String, default: '' },
            authMode: { type: String, enum: ['smtp', 'api'], default: 'smtp' },
            status: {
                type: String,
                enum: ['disabled', 'configured', 'verified', 'error'],
                default: 'disabled'
            },
            verified: { type: Boolean, default: false },
            enabled: { type: Boolean, default: false },
            lastTestedAt: { type: Date, default: null },
            lastTestResult: {
                success: { type: Boolean, default: false },
                message: { type: String, default: '' }
            }
        }, { timestamps: true, collection: 'merchant_email_configs' });

        mongoose.model('MerchantEmailConfig', merchantEmailConfigSchema);
    }

    if (!mongoose.models.VendorEmailConfig) {
        const vendorEmailConfigSchema = new mongoose.Schema({
            vendorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vendor',
                required: true,
                unique: true,
                index: true
            },
            merchantId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Merchant',
                default: null,
                index: true
            },
            provider: { type: String, enum: EMAIL_PROVIDERS, default: 'brevo' },
            senderName: { type: String, default: '' },
            senderEmail: { type: String, default: '' },
            replyToEmail: { type: String, default: '' },
            smtpHost: { type: String, default: 'smtp-relay.brevo.com' },
            smtpPort: { type: Number, default: 587 },
            smtpSecure: { type: Boolean, default: false },
            smtpUsername: { type: String, default: '' },
            smtpPasswordEncrypted: { type: String, default: '' },
            apiKeyEncrypted: { type: String, default: '' },
            authMode: { type: String, enum: ['smtp', 'api'], default: 'smtp' },
            status: {
                type: String,
                enum: ['disabled', 'configured', 'verified', 'error'],
                default: 'disabled'
            },
            verified: { type: Boolean, default: false },
            enabled: { type: Boolean, default: false },
            lastTestedAt: { type: Date, default: null },
            lastTestResult: {
                success: { type: Boolean, default: false },
                message: { type: String, default: '' }
            }
        }, { timestamps: true, collection: 'vendor_email_configs' });

        mongoose.model('VendorEmailConfig', vendorEmailConfigSchema);
    }

    if (!mongoose.models.EmailDeliveryLog) {
        const emailDeliveryLogSchema = new mongoose.Schema({
            ownerType: { type: String, enum: ['vendor', 'merchant', 'platform'], default: 'platform' },
            ownerId: { type: mongoose.Schema.Types.ObjectId, default: null },
            merchantId: { type: mongoose.Schema.Types.ObjectId, default: null },
            vendorId: { type: mongoose.Schema.Types.ObjectId, default: null },
            to: { type: String, required: true },
            subject: { type: String, default: '' },
            event: { type: String, default: '' },
            fromEmail: { type: String, default: '' },
            status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
            error: { type: String, default: '' },
            fallbackUsed: { type: Boolean, default: false },
            fallbackChain: { type: [String], default: [] }
        }, { timestamps: true, collection: 'email_delivery_logs' });

        emailDeliveryLogSchema.index({ createdAt: -1 });
        mongoose.model('EmailDeliveryLog', emailDeliveryLogSchema);
    }

    return {
        MerchantEmailConfig: mongoose.models.MerchantEmailConfig,
        VendorEmailConfig: mongoose.models.VendorEmailConfig,
        EmailDeliveryLog: mongoose.models.EmailDeliveryLog
    };
}

export const EMAIL_PROVIDERS_LIST = EMAIL_PROVIDERS;
