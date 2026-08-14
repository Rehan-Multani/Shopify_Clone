/**
 * Resolve which Shiprocket credentials to use for an order.
 *
 * Superadmin flag off → manual.
 * Multi Vendor + vendorId → vendor keys, then merchant keys.
 * Otherwise → merchant keys.
 * No keys → manual / COD shipping.
 */
import PlatformSetting from '../models/PlatformSetting.js';
import Store from '../models/Store.js';
import MerchantShiprocketConfig from '../models/MerchantShiprocketConfig.js';
import VendorShiprocketConfig from '../models/VendorShiprocketConfig.js';

const READY = ['configured', 'verified'];

export const isShiprocketEnabledOnPlatform = async () => {
    try {
        const settings = await PlatformSetting.findOne().lean();
        if (!settings) return true;
        return settings.shiprocketEnabled !== false;
    } catch {
        return true;
    }
};

const isReady = (doc) => doc && doc.enabled && READY.includes(doc.status) && doc.credentials;

export async function resolveShippingConfig({
    merchantId,
    storeId,
    vendorId,
    planType,
} = {}) {
    if (!(await isShiprocketEnabledOnPlatform())) {
        return { ok: false, mode: 'manual', reason: 'PLATFORM_DISABLED' };
    }

    let isMultiVendor = planType === 'Multi Vendor';
    if (!isMultiVendor && storeId) {
        const store = await Store.findById(storeId).select('planType merchantId').lean();
        if (store?.planType === 'Multi Vendor') isMultiVendor = true;
        if (!merchantId && store?.merchantId) merchantId = store.merchantId;
    }

    if (isMultiVendor && vendorId) {
        const vendorDoc = await VendorShiprocketConfig.findOne({
            vendorId,
            enabled: true,
            status: { $in: READY },
        });
        if (isReady(vendorDoc)) {
            return { ok: true, mode: 'shiprocket', ownerType: 'vendor', doc: vendorDoc };
        }
    }

    if (merchantId) {
        const merchantDoc = await MerchantShiprocketConfig.findOne({
            merchantId,
            enabled: true,
            status: { $in: READY },
            ...(storeId
                ? { $or: [{ storeId }, { storeId: null }] }
                : {}),
        }).sort({ storeId: -1 });
        if (isReady(merchantDoc)) {
            return { ok: true, mode: 'shiprocket', ownerType: 'merchant', doc: merchantDoc };
        }
    }

    return { ok: false, mode: 'manual', reason: 'NO_KEYS' };
}

export default {
    isShiprocketEnabledOnPlatform,
    resolveShippingConfig,
};
