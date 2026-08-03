import mongoose from 'mongoose';
import { SUPPORTED_GATEWAYS } from '../constants/gateways.js';

// Read PlatformSetting from the shared MongoDB (same collection as store-service)
const platformSettingSchema = new mongoose.Schema({
    availablePaymentGateways: {
        type: [String],
        default: [...SUPPORTED_GATEWAYS]
    }
}, {
    timestamps: true,
    strict: false,
    collection: 'platformsettings'
});

const PlatformSetting = mongoose.models.PlatformSetting
    || mongoose.model('PlatformSetting', platformSettingSchema);

/**
 * Super Admin controlled list of gateways available on the platform.
 * Falls back to all SUPPORTED_GATEWAYS if settings are missing.
 */
export async function getPlatformAvailableGateways() {
    try {
        const settings = await PlatformSetting.findOne().lean();
        const list = settings?.availablePaymentGateways;
        if (Array.isArray(list) && list.length > 0) {
            return list
                .map((g) => String(g).toLowerCase())
                .filter((g) => SUPPORTED_GATEWAYS.includes(g));
        }
    } catch (err) {
        console.error('getPlatformAvailableGateways:', err.message);
    }
    return [...SUPPORTED_GATEWAYS];
}

export default PlatformSetting;
