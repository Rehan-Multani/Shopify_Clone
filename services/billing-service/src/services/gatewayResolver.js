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
            // Multi Vendor: vendors always configure their own gateways
            allowVendorGateway: true,
            allowVendorGatewayFallback: true,
            allowedVendorGateways: [...SUPPORTED_GATEWAYS],
            paymentMode: 'vendor',
            defaultGateway: null
        });
    }
    // Always keep vendor gateways allowed + merchant fallback on (no merchant toggles)
    let dirty = false;
    if (settings.allowVendorGateway !== true) {
        settings.allowVendorGateway = true;
        dirty = true;
    }
    if (settings.allowVendorGatewayFallback !== true) {
        settings.allowVendorGatewayFallback = true;
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

function filterByPlatform(gateways, platformAvailable) {
    const set = new Set(platformAvailable);
    return (gateways || []).filter((g) => set.has(g.gateway));
}

/**
 * Resolve which gateway config should process a checkout payment.
 *
 * Multi Vendor + vendorId:
 *   1. Vendor's own gateway (always allowed)
 *   2. If vendor has none → Merchant gateway fallback
 *
 * Single Vendor / no vendorId: Merchant gateway only.
 */
export async function resolveCheckoutGateway({ merchantId, storeId, vendorId, preferredGateway }) {
    const store = storeId ? await Store.findById(storeId).lean() : null;
    const isMultiVendor = store?.planType === 'Multi Vendor';
    const settings = await getOrCreateMarketplaceSettings(merchantId, storeId);
    const platformAvailable = await getPlatformAvailableGateways();

    const merchantGateways = filterByPlatform(
        await MerchantPaymentGateway.find({
            merchantId,
            enabled: true,
            status: { $in: ['configured', 'verified'] },
            ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {})
        }),
        platformAvailable
    );

    const useVendorFlow = isMultiVendor && vendorId;

    let vendorGateways = [];
    if (useVendorFlow) {
        const vendor = await Vendor.findById(vendorId).lean();
        if (vendor && String(vendor.merchant) === String(merchantId)) {
            vendorGateways = await VendorPaymentGateway.find({
                vendorId,
                enabled: true,
                status: { $in: ['configured', 'verified'] },
                gateway: { $in: platformAvailable }
            });
        }

        if (preferredGateway) {
            const vendorMatch = vendorGateways.find((g) => g.gateway === preferredGateway);
            if (vendorMatch) return { config: vendorMatch, ownerType: 'vendor' };
        } else if (vendorGateways.length > 0) {
            return pickFromPool(vendorGateways, null, settings, 'vendor');
        }

        // Vendor has no gateway → always fall back to merchant
        if (vendorGateways.length === 0) {
            if (preferredGateway) {
                const merchantMatch = merchantGateways.find((g) => g.gateway === preferredGateway);
                if (merchantMatch) return { config: merchantMatch, ownerType: 'merchant', fallback: true };
            }
            if (merchantGateways.length > 0) {
                const picked = pickFromPool(merchantGateways, preferredGateway, settings, 'merchant');
                if (picked) return { ...picked, fallback: true };
            }
            return { error: 'NO_GATEWAY_AVAILABLE', message: 'No payment gateway available' };
        }

        if (preferredGateway) {
            const merchantMatch = merchantGateways.find((g) => g.gateway === preferredGateway);
            if (merchantMatch) return { config: merchantMatch, ownerType: 'merchant', fallback: true };
            return {
                error: 'GATEWAY_UNAVAILABLE',
                message: `${preferredGateway} is not available for this checkout.`
            };
        }
    }

    if (preferredGateway) {
        const merchantMatch = merchantGateways.find((g) => g.gateway === preferredGateway);
        if (merchantMatch) return { config: merchantMatch, ownerType: 'merchant' };
        return null;
    }

    if (merchantGateways.length > 0) {
        return pickFromPool(merchantGateways, null, settings, 'merchant');
    }

    return null;
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
    return selected ? { config: selected, ownerType } : null;
}

/**
 * List available payment options for checkout UI (no secrets).
 */
export async function listCheckoutPaymentOptions({ merchantId, storeId, vendorId }) {
    const store = storeId ? await Store.findById(storeId).lean() : null;
    const settings = await getOrCreateMarketplaceSettings(merchantId, storeId);
    const platformAvailable = await getPlatformAvailableGateways();
    const options = [];

    const pushOption = (doc, ownerType, { fallback = false } = {}) => {
        if (!platformAvailable.includes(doc.gateway)) return;
        // Stripe/Cashfree stay configurable in admin but are not offered at checkout until E2E-ready
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
            fallback
        });
    };

    const isMultiVendor = store?.planType === 'Multi Vendor';
    const useVendorFlow = isMultiVendor && vendorId;

    if (useVendorFlow) {
        const vendorGws = await VendorPaymentGateway.find({
            vendorId,
            enabled: true,
            status: { $in: ['configured', 'verified'] },
            gateway: { $in: platformAvailable }
        });

        if (vendorGws.length) {
            vendorGws.forEach((g) => pushOption(g, 'vendor'));
        } else {
            // Always fall back to merchant gateways when vendor has none
            const merchantGws = await MerchantPaymentGateway.find({
                merchantId,
                enabled: true,
                status: { $in: ['configured', 'verified'] },
                ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {})
            });
            merchantGws.forEach((g) => pushOption(g, 'merchant', { fallback: true }));
        }
    } else {
        const merchantGws = await MerchantPaymentGateway.find({
            merchantId,
            enabled: true,
            status: { $in: ['configured', 'verified'] },
            ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {})
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
            isDefault: options.length === 0
        });
    }

    return {
        options,
        paymentMode: 'vendor',
        allowVendorGateway: true,
        allowVendorGatewayFallback: true,
        vendorGatewayMissing: false,
        vendorGatewayError: null,
        storePlanType: store?.planType || 'Single Vendor',
        platformAvailableGateways: platformAvailable
    };
}

export { loadEncryption, GATEWAY_META, SUPPORTED_GATEWAYS, getPlatformAvailableGateways };
