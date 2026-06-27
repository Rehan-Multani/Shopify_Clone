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
    }
}, {
    timestamps: true
});

const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);
export default PlatformSetting;
