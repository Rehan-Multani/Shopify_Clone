/**
 * Resolve which payment gateway processes a checkout.
 * Email / Shiprocket parity:
 *   - Owner-only: vendorId → that vendor's verified GW only (no merchant fallback)
 *   - No vendorId → merchant verified GW only
 *   - Live = enabled && status === 'verified'
 *   - Missing → online unavailable (COD still listed separately)
 */
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import MerchantPaymentGateway from '../models/MerchantPaymentGateway.js';
import VendorPaymentGateway from '../models/VendorPaymentGateway.js';
import MarketplaceSettings from '../models/MarketplaceSettings.js';
import Store from '../models/Store.js';
import Vendor from '../models/Vendor.js';
import { getPlatformAvailableGateways } from '../models/PlatformSetting.js';
import { createGatewayInstance } from '../gateways/index.js';
import { GATEWAY_META, SUPPORTED_GATEWAYS, CHECKOUT_READY_GATEWAYS } from '../constants/gateways.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIVE_STATUS = 'verified';

async function loadEncryption() {
    const sharedPath = path.resolve(__dirname, '../../../shared/encryption.js');
    return import(pathToFileURL(sharedPath).href);
}

export async function getOrCreateMarketplaceSettings(merchantId, storeId = null) {
    let settings = await MarketplaceSettings.findOne({ merchantId });
    if (!settings) {
        settings = await MarketplaceSettings.create({
            merchantId,
            storeId,
            allowVendorGateway: true,
            // Owner-only: never collect on merchant keys for vendor orders
            allowVendorGatewayFallback: false,
            allowedVendorGateways: [...SUPPORTED_GATEWAYS],
            paymentMode: 'vendor',
            defaultGateway: null
        });
    }
    let dirty = false;
    if (settings.allowVendorGateway !== true) {
        settings.allowVendorGateway = true;
        dirty = true;
    }
    if (settings.allowVendorGatewayFallback !== false) {
        settings.allowVendorGatewayFallback = false;
        dirty = true;
    }
    if (settings.paymentMode === 'merchant') {
        settings.paymentMode = 'vendor';
        dirty = true;
    }
    if (dirty) await settings.save();
    return settings;
}

export function serializeGatewayDoc(doc, credentialsMasked, meta) {
    return {
        id: doc._id,
        gateway: doc.gateway,
        name: meta?.name || doc.gateway,
        description: meta?.description || '',
        environment: doc.environment,
        currency: 'INR',
        enabled: doc.enabled,
        isDefault: !!doc.isDefault,
        status: doc.status,
        verified: doc.status === 'verified' && !!doc.enabled,
        credentials: credentialsMasked,
        webhookSecretConfigured: Boolean(doc.webhookSecret),
        lastTestedAt: doc.lastTestedAt,
        lastTestResult: doc.lastTestResult,
        updatedAt: doc.updatedAt,
        createdAt: doc.createdAt
    };
}

export async function decryptGatewayConfig(doc) {
    const { decryptCredentials, decrypt } = await loadEncryption();
    const credentials = decryptCredentials(doc.credentials);
    const webhookSecret = doc.webhookSecret ? decrypt(doc.webhookSecret) : (credentials.webhookSecret || '');
    return {
        credentials: { ...credentials, webhookSecret: webhookSecret || credentials.webhookSecret },
        webhookSecret,
        environment: doc.environment,
        currency: doc.currency
    };
}

export async function buildGatewayClient(doc) {
    const config = await decryptGatewayConfig(doc);
    return createGatewayInstance(doc.gateway, {
        credentials: config.credentials,
        webhookSecret: config.webhookSecret,
        environment: doc.environment,
        currency: doc.currency
    });
}

/**
 * Mark tenant gateway broken after runtime auth failure (email/shipping parity).
 */
export async function markPaymentGatewayBroken(doc, message) {
    if (!doc) return;
    try {
        doc.status = 'error';
        doc.enabled = false;
        doc.lastTestedAt = new Date();
        doc.lastTestResult = {
            success: false,
            message: String(message || 'Payment gateway authentication failed').slice(0, 300),
        };
        await doc.save();
    } catch (err) {
        console.error('[payment] mark broken failed:', err.message);
    }
}

/**
 * One-time: previously enabled + configured (pre verify-to-activate) → verified
 * so existing live keys keep working without forcing every merchant to re-test.
 */
export async function promoteLegacyLiveGateways(Model, filter = {}) {
    try {
        const result = await Model.updateMany(
            {
                ...filter,
                enabled: true,
                status: 'configured',
                credentials: { $exists: true, $nin: [null, ''] },
            },
            {
                $set: {
                    status: 'verified',
                    lastTestResult: {
                        success: true,
                        message: 'Legacy enabled gateway auto-activated. Re-run Test & activate after rotating keys.',
                    },
                },
            }
        );
        return result?.modifiedCount || 0;
    } catch (err) {
        console.error('[payment] legacy promote failed:', err.message);
        return 0;
    }
}

export function isGatewayAuthFailure(err) {
    if (!err) return false;
    const status = Number(err.statusCode || err.status || err.code || 0);
    if (status === 401 || status === 403) return true;
    const msg = String(err.message || err.error?.description || '').toLowerCase();
    const code = String(err.code || '').toUpperCase();
    if (code === 'INVALID_KEYS' || code === 'MISSING_CREDENTIALS') return true;
    return msg.includes('unauthorized')
        || msg.includes('unauthenticated')
        || msg.includes('authentication failed')
        || msg.includes('invalid key')
        || msg.includes('invalid api')
        || msg.includes('access denied')
        || msg.includes('authentication failure')
        || msg.includes('bad credentials')
        || msg.includes('auth failed');
}

function filterByPlatform(gateways, platformAvailable) {
    const set = new Set(platformAvailable);
    return (gateways || []).filter((g) => set.has(g.gateway));
}

const liveQuery = {
    enabled: true,
    status: LIVE_STATUS,
};

/**
 * Resolve which gateway config should process a checkout payment.
 */
export async function resolveCheckoutGateway({ merchantId, storeId, vendorId, preferredGateway }) {
    const store = storeId ? await Store.findById(storeId).lean() : null;
    const isMultiVendor = store?.planType === 'Multi Vendor';
    const settings = await getOrCreateMarketplaceSettings(merchantId, storeId);
    const platformAvailable = await getPlatformAvailableGateways();

    const useVendorFlow = isMultiVendor && vendorId;

    // Vendor-owned order — never use merchant payment keys
    if (useVendorFlow) {
        const vendor = await Vendor.findById(vendorId).lean();
        if (!vendor || String(vendor.merchant) !== String(merchantId)) {
            return {
                error: 'VENDOR_NOT_FOUND',
                message: 'Vendor not found for this checkout',
            };
        }

        const vendorGateways = filterByPlatform(
            await VendorPaymentGateway.find({
                vendorId,
                ...liveQuery,
                gateway: { $in: platformAvailable },
            }),
            platformAvailable
        );

        if (preferredGateway) {
            const vendorMatch = vendorGateways.find((g) => g.gateway === preferredGateway);
            if (vendorMatch) return { config: vendorMatch, ownerType: 'vendor', fallback: false };
            if (vendorGateways.length === 0) {
                return {
                    error: 'VENDOR_NOT_CONFIGURED',
                    message: 'This seller has not activated online payments. Please use Cash on Delivery.',
                };
            }
            return {
                error: 'GATEWAY_UNAVAILABLE',
                message: `${preferredGateway} is not available for this seller. Try another method or COD.`,
            };
        }

        if (vendorGateways.length > 0) {
            return pickFromPool(vendorGateways, null, settings, 'vendor');
        }

        return {
            error: 'VENDOR_NOT_CONFIGURED',
            message: 'This seller has not activated online payments. Please use Cash on Delivery.',
        };
    }

    // Merchant / single-vendor store order
    const merchantGateways = filterByPlatform(
        await MerchantPaymentGateway.find({
            merchantId,
            ...liveQuery,
            ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {}),
        }),
        platformAvailable
    );

    if (preferredGateway) {
        const merchantMatch = merchantGateways.find((g) => g.gateway === preferredGateway);
        if (merchantMatch) return { config: merchantMatch, ownerType: 'merchant', fallback: false };
        return {
            error: 'GATEWAY_UNAVAILABLE',
            message: `${preferredGateway} is not available. Try another method or COD.`,
        };
    }

    if (merchantGateways.length > 0) {
        return pickFromPool(merchantGateways, null, settings, 'merchant');
    }

    return {
        error: 'NO_GATEWAY_AVAILABLE',
        message: 'No online payment gateway is activated. Please use Cash on Delivery.',
    };
}

function pickFromPool(pool, preferredGateway, settings, ownerType) {
    let selected = null;
    if (preferredGateway) {
        selected = pool.find((g) => g.gateway === preferredGateway) || null;
    }
    if (!selected && settings.defaultGateway) {
        selected = pool.find((g) => g.gateway === settings.defaultGateway) || null;
    }
    if (!selected) {
        selected = pool.find((g) => g.isDefault) || pool[0];
    }
    return selected ? { config: selected, ownerType, fallback: false } : null;
}

/**
 * List available payment options for checkout UI (no secrets).
 */
export async function listCheckoutPaymentOptions({ merchantId, storeId, vendorId }) {
    const store = storeId ? await Store.findById(storeId).lean() : null;
    const settings = await getOrCreateMarketplaceSettings(merchantId, storeId);
    const platformAvailable = await getPlatformAvailableGateways();
    const options = [];

    const pushOption = (doc, ownerType) => {
        if (!platformAvailable.includes(doc.gateway)) return;
        if (!CHECKOUT_READY_GATEWAYS.includes(doc.gateway)) return;
        const meta = GATEWAY_META[doc.gateway];
        options.push({
            gateway: doc.gateway,
            name: meta?.name || doc.gateway,
            description: meta?.description || '',
            environment: doc.environment,
            currency: 'INR',
            ownerType,
            isDefault: !!doc.isDefault,
            checkoutReady: true,
            fallback: false,
        });
    };

    const isMultiVendor = store?.planType === 'Multi Vendor';
    const useVendorFlow = isMultiVendor && vendorId;
    let vendorGatewayMissing = false;

    if (useVendorFlow) {
        const vendorGws = await VendorPaymentGateway.find({
            vendorId,
            ...liveQuery,
            gateway: { $in: platformAvailable },
        });

        if (vendorGws.length) {
            vendorGws.forEach((g) => pushOption(g, 'vendor'));
        } else {
            vendorGatewayMissing = true;
            // Owner-only: do NOT list merchant gateways for vendor carts
        }
    } else {
        const merchantGws = await MerchantPaymentGateway.find({
            merchantId,
            ...liveQuery,
            ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {}),
        });
        merchantGws.forEach((g) => pushOption(g, 'merchant'));
    }

    const codEnabled = store?.paymentSettings?.codEnabled !== false;
    if (codEnabled) {
        options.push({
            gateway: 'cod',
            name: 'Cash on Delivery',
            description: 'Pay when your order is delivered',
            environment: null,
            currency: 'INR',
            ownerType: 'store',
            isDefault: options.length === 0,
        });
    }

    return {
        options,
        paymentMode: 'vendor',
        allowVendorGateway: true,
        allowVendorGatewayFallback: false,
        vendorGatewayMissing,
        vendorGatewayError: vendorGatewayMissing
            ? 'This seller has not activated online payments. You can still pay with Cash on Delivery.'
            : null,
        storePlanType: store?.planType || 'Single Vendor',
        platformAvailableGateways: platformAvailable,
    };
}

export { loadEncryption, GATEWAY_META, SUPPORTED_GATEWAYS, getPlatformAvailableGateways };
