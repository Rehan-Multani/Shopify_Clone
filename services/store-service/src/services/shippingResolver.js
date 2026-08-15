/**
 * Resolve Shiprocket credentials — owner-only (email-parity).
 *
 * Superadmin flag off → manual / COD.
 * vendorId set → that vendor's verified Shiprocket only (no merchant fallback).
 * else merchantId → that merchant's verified Shiprocket only.
 * Missing / not verified → manual / COD.
 */
import PlatformSetting from '../models/PlatformSetting.js';
import Store from '../models/Store.js';
import MerchantShiprocketConfig from '../models/MerchantShiprocketConfig.js';
import VendorShiprocketConfig from '../models/VendorShiprocketConfig.js';

export const isShiprocketEnabledOnPlatform = async () => {
    try {
        const settings = await PlatformSetting.findOne().lean();
        if (!settings) return true;
        return settings.shiprocketEnabled !== false;
    } catch {
        return true;
    }
};

const isLive = (doc) =>
    doc
    && doc.enabled
    && doc.status === 'verified'
    && doc.credentials;

/**
 * @returns {{ ok: boolean, mode: 'shiprocket'|'manual', reason?: string, ownerType?: string, doc?: object }}
 */
export async function resolveShippingConfig({
    merchantId,
    storeId,
    vendorId,
    planType,
} = {}) {
    if (!(await isShiprocketEnabledOnPlatform())) {
        return { ok: false, mode: 'manual', reason: 'PLATFORM_DISABLED' };
    }

    if (!merchantId && storeId) {
        const store = await Store.findById(storeId).select('merchantId').lean();
        if (store?.merchantId) merchantId = store.merchantId;
    }

    // Vendor-owned order — never use merchant Shiprocket
    if (vendorId) {
        const vendorDoc = await VendorShiprocketConfig.findOne({
            vendorId,
            enabled: true,
            status: 'verified',
        });
        if (isLive(vendorDoc)) {
            return { ok: true, mode: 'shiprocket', ownerType: 'vendor', doc: vendorDoc };
        }
        return { ok: false, mode: 'manual', reason: 'VENDOR_NOT_CONFIGURED' };
    }

    // Merchant / single-vendor store order
    if (merchantId) {
        const merchantDoc = await MerchantShiprocketConfig.findOne({
            merchantId,
            enabled: true,
            status: 'verified',
            ...(storeId
                ? { $or: [{ storeId }, { storeId: null }] }
                : {}),
        }).sort({ storeId: -1 });
        if (isLive(merchantDoc)) {
            return { ok: true, mode: 'shiprocket', ownerType: 'merchant', doc: merchantDoc };
        }
        return { ok: false, mode: 'manual', reason: 'MERCHANT_NOT_CONFIGURED' };
    }

    return { ok: false, mode: 'manual', reason: 'NO_KEYS' };
}

/**
 * Mark tenant Shiprocket broken after runtime auth failure (email-parity).
 */
export async function markShippingConfigBroken(doc, message) {
    if (!doc) return;
    try {
        doc.status = 'error';
        doc.enabled = false;
        doc.lastTestedAt = new Date();
        doc.lastTestResult = {
            success: false,
            message: String(message || 'Shiprocket authentication failed').slice(0, 300),
        };
        doc.tokenEncrypted = '';
        doc.tokenExpiresAt = null;
        await doc.save();
    } catch (err) {
        console.error('[shipping] mark broken failed:', err.message);
    }
}

export default {
    isShiprocketEnabledOnPlatform,
    resolveShippingConfig,
    markShippingConfigBroken,
};
