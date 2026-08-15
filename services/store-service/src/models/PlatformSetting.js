import mongoose from 'mongoose';

const platformSettingSchema = new mongoose.Schema({
    expectedStoreIP: {
        type: String,
        default: '76.76.21.21'
    },
    sshUser: {
        type: String,
        default: 'root'
    },
    sshPassword: {
        type: String,
        default: ''
    },
    platformName: {
        type: String,
        default: 'Storify'
    },
    supportEmail: {
        type: String,
        default: 'support@storify.com'
    },
    adminEmail: {
        type: String,
        default: 'admin@storify.com'
    },
    maxStoresPerMerchant: {
        type: Number,
        default: 10
    },
    trialDays: {
        type: Number,
        default: 14
    },
    defaultCurrency: {
        type: String,
        default: 'INR'
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    // Super Admin: which gateways exist on the platform
    availablePaymentGateways: {
        type: [String],
        default: ['razorpay', 'stripe', 'payu', 'cashfree']
    },
    // Super Admin: allow merchants/vendors to use Shiprocket (they own the keys)
    shiprocketEnabled: {
        type: Boolean,
        default: true
    },
    // Platform SaaS mail (forgot OTP, merchant signup) — optional DB override of env SMTP
    platformSmtpEnabled: {
        type: Boolean,
        default: true
    },
    platformSmtpHost: {
        type: String,
        default: 'smtp-relay.brevo.com'
    },
    platformSmtpPort: {
        type: Number,
        default: 587
    },
    platformSmtpUser: {
        type: String,
        default: ''
    },
    platformSmtpPassEncrypted: {
        type: String,
        default: ''
    },
    platformSmtpFrom: {
        type: String,
        default: '"Storify" <noreply@storify.com>'
    }
}, {
    timestamps: true
});

const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);
export default PlatformSetting;
