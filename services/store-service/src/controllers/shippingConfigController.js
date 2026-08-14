/**
 * Merchant / Vendor Shiprocket credential configuration.
 * Pattern mirrors billing-service payment gateways (encrypted, masked, test, enable).
 */
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import MerchantShiprocketConfig from '../models/MerchantShiprocketConfig.js';
import VendorShiprocketConfig from '../models/VendorShiprocketConfig.js';
import { isShiprocketEnabledOnPlatform } from '../services/shippingResolver.js';
import { loginShiprocket } from '../utils/shiprocketClient.js';
import Order from '../models/Order.js';
import { mapShiprocketStatus } from '../services/shippingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadEncryption() {
    const sharedPath = path.resolve(__dirname, '../../../shared/encryption.js');
    return import(pathToFileURL(sharedPath).href);
}

const getMerchantId = (req) => req.merchant?._id || req.headers['x-merchant-id'];
const getVendorId = (req) => req.vendor?._id || req.headers['x-vendor-id'];

async function mergeCredentials(existingEncrypted, incoming = {}) {
    const { decryptCredentials, encryptCredentials } = await loadEncryption();
    const existing = decryptCredentials(existingEncrypted) || {};
    const merged = { ...existing };
    for (const [key, value] of Object.entries(incoming || {})) {
        if (value === undefined || value === null) continue;
        const str = String(value);
        if (!str || str.includes('•')) continue;
        merged[key] = str;
    }
    const hasAll = Boolean(merged.email && merged.password);
    return {
        encrypted: encryptCredentials(merged),
        plain: merged,
        hasAll,
    };
}

async function toPublic(doc, platformEnabled) {
    const { decryptCredentials, maskCredentials } = await loadEncryption();
    const credentials = decryptCredentials(doc.credentials);
    return {
        id: doc._id,
        enabled: !!doc.enabled,
        status: doc.status,
        pickupLocation: doc.pickupLocation || 'Primary',
        pickupPincode: doc.pickupPincode || '',
        channelId: doc.channelId || '',
        credentials: maskCredentials('shiprocket', credentials),
        lastTestedAt: doc.lastTestedAt,
        lastTestResult: doc.lastTestResult,
        platformEnabled,
        updatedAt: doc.updatedAt,
    };
}

const emptyPublic = (platformEnabled) => ({
    id: null,
    enabled: false,
    status: 'not_configured',
    pickupLocation: 'Primary',
    pickupPincode: '',
    channelId: '',
    credentials: {},
    lastTestedAt: null,
    lastTestResult: null,
    platformEnabled,
    updatedAt: null,
});

export const getMerchantShipping = async (req, res) => {
    try {
        const merchantId = getMerchantId(req);
        if (!merchantId) return res.status(401).json({ message: 'Merchant authentication required' });
        const platformEnabled = await isShiprocketEnabledOnPlatform();
        const storeId = req.query.storeId || req.headers['x-store-id'] || null;
        const doc = await MerchantShiprocketConfig.findOne({
            merchantId,
            ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {}),
        }).sort({ storeId: -1 });
        res.json({
            provider: 'shiprocket',
            platformEnabled,
            config: doc ? await toPublic(doc, platformEnabled) : emptyPublic(platformEnabled),
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load shipping configuration' });
    }
};

export const upsertMerchantShipping = async (req, res) => {
    try {
        const merchantId = getMerchantId(req);
        if (!merchantId) return res.status(401).json({ message: 'Merchant authentication required' });
        const platformEnabled = await isShiprocketEnabledOnPlatform();
        if (!platformEnabled) {
            return res.status(403).json({
                message: 'Shiprocket is disabled on the platform by Super Admin',
                code: 'PLATFORM_SHIPPING_DISABLED',
            });
        }

        const storeId = req.body.storeId || req.headers['x-store-id'] || null;
        let doc = await MerchantShiprocketConfig.findOne({
            merchantId,
            storeId: storeId || null,
        });

        const merged = await mergeCredentials(doc?.credentials || '', req.body.credentials || {});
        if (!doc && !merged.hasAll) {
            return res.status(400).json({
                message: 'Shiprocket email and password are required',
                code: 'MISSING_CREDENTIALS',
            });
        }

        const payload = {
            merchantId,
            storeId: storeId || null,
            credentials: merged.encrypted,
            pickupLocation: req.body.pickupLocation || doc?.pickupLocation || 'Primary',
            pickupPincode: req.body.pickupPincode ?? doc?.pickupPincode ?? '',
            channelId: req.body.channelId ?? doc?.channelId ?? '',
            status: merged.hasAll ? 'configured' : 'not_configured',
        };
        if (typeof req.body.enabled === 'boolean') {
            payload.enabled = req.body.enabled && merged.hasAll;
        }

        if (doc) {
            Object.assign(doc, payload);
            await doc.save();
        } else {
            doc = await MerchantShiprocketConfig.create({
                ...payload,
                enabled: typeof req.body.enabled === 'boolean' ? req.body.enabled && merged.hasAll : false,
            });
        }

        res.json({
            message: 'Shiprocket configuration saved',
            config: await toPublic(doc, platformEnabled),
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to save shipping configuration' });
    }
};

export const testMerchantShipping = async (req, res) => {
    try {
        const merchantId = getMerchantId(req);
        if (!merchantId) return res.status(401).json({ message: 'Merchant authentication required' });
        const storeId = req.body.storeId || req.headers['x-store-id'] || null;
        const doc = await MerchantShiprocketConfig.findOne({
            merchantId,
            ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {}),
        }).sort({ storeId: -1 });
        if (!doc) {
            return res.status(404).json({ message: 'Save credentials first', code: 'NOT_CONFIGURED' });
        }
        const { decryptCredentials, encrypt } = await loadEncryption();
        const creds = decryptCredentials(doc.credentials);
        const result = await loginShiprocket(creds);
        doc.lastTestedAt = new Date();
        doc.lastTestResult = { success: result.ok, message: result.message || (result.ok ? 'Connected' : 'Failed') };
        doc.status = result.ok ? 'verified' : 'error';
        if (result.ok && result.token) {
            doc.tokenEncrypted = encrypt(result.token);
            doc.tokenExpiresAt = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
        }
        await doc.save();
        if (!result.ok) {
            return res.status(400).json({
                success: false,
                message: result.message || 'Test connection failure',
                config: await toPublic(doc, true),
            });
        }
        res.json({ success: true, message: 'Shiprocket connection verified', config: await toPublic(doc, true) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Test connection failure' });
    }
};

export const getVendorShipping = async (req, res) => {
    try {
        const vendorId = getVendorId(req);
        if (!vendorId) return res.status(401).json({ message: 'Vendor authentication required' });
        const platformEnabled = await isShiprocketEnabledOnPlatform();
        const doc = await VendorShiprocketConfig.findOne({ vendorId });
        res.json({
            provider: 'shiprocket',
            platformEnabled,
            config: doc ? await toPublic(doc, platformEnabled) : emptyPublic(platformEnabled),
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load shipping configuration' });
    }
};

export const upsertVendorShipping = async (req, res) => {
    try {
        const vendorId = getVendorId(req);
        if (!vendorId) return res.status(401).json({ message: 'Vendor authentication required' });
        const platformEnabled = await isShiprocketEnabledOnPlatform();
        if (!platformEnabled) {
            return res.status(403).json({
                message: 'Shiprocket is disabled on the platform by Super Admin',
                code: 'PLATFORM_SHIPPING_DISABLED',
            });
        }
        let doc = await VendorShiprocketConfig.findOne({ vendorId });
        const merged = await mergeCredentials(doc?.credentials || '', req.body.credentials || {});
        if (!doc && !merged.hasAll) {
            return res.status(400).json({
                message: 'Shiprocket email and password are required',
                code: 'MISSING_CREDENTIALS',
            });
        }
        const payload = {
            vendorId,
            merchantId: req.body.merchantId || req.headers['x-merchant-id'] || doc?.merchantId || null,
            storeId: req.body.storeId || req.headers['x-store-id'] || null,
            credentials: merged.encrypted,
            pickupLocation: req.body.pickupLocation || doc?.pickupLocation || 'Primary',
            pickupPincode: req.body.pickupPincode ?? doc?.pickupPincode ?? '',
            channelId: req.body.channelId ?? doc?.channelId ?? '',
            status: merged.hasAll ? 'configured' : 'not_configured',
        };
        if (typeof req.body.enabled === 'boolean') {
            payload.enabled = req.body.enabled && merged.hasAll;
        }
        if (doc) {
            Object.assign(doc, payload);
            await doc.save();
        } else {
            doc = await VendorShiprocketConfig.create({
                ...payload,
                enabled: typeof req.body.enabled === 'boolean' ? req.body.enabled && merged.hasAll : false,
            });
        }
        res.json({
            message: 'Shiprocket configuration saved',
            config: await toPublic(doc, platformEnabled),
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to save shipping configuration' });
    }
};

export const testVendorShipping = async (req, res) => {
    try {
        const vendorId = getVendorId(req);
        if (!vendorId) return res.status(401).json({ message: 'Vendor authentication required' });
        const doc = await VendorShiprocketConfig.findOne({ vendorId });
        if (!doc) {
            return res.status(404).json({ message: 'Save credentials first', code: 'NOT_CONFIGURED' });
        }
        const { decryptCredentials, encrypt } = await loadEncryption();
        const creds = decryptCredentials(doc.credentials);
        const result = await loginShiprocket(creds);
        doc.lastTestedAt = new Date();
        doc.lastTestResult = { success: result.ok, message: result.message || (result.ok ? 'Connected' : 'Failed') };
        doc.status = result.ok ? 'verified' : 'error';
        if (result.ok && result.token) {
            doc.tokenEncrypted = encrypt(result.token);
            doc.tokenExpiresAt = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
        }
        await doc.save();
        if (!result.ok) {
            return res.status(400).json({
                success: false,
                message: result.message || 'Test connection failure',
                config: await toPublic(doc, true),
            });
        }
        res.json({ success: true, message: 'Shiprocket connection verified', config: await toPublic(doc, true) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Test connection failure' });
    }
};

/** Public webhook — never logs secrets. Shiprocket status → order shipping. */
export const shiprocketWebhook = async (req, res) => {
    try {
        const body = req.body || {};
        const awb = body.awb || body.awb_code || body.awb_code_number;
        if (!awb) return res.status(200).json({ ok: true, ignored: true });
        const order = await Order.findOne({ 'shipping.awb': String(awb) });
        if (!order) return res.status(200).json({ ok: true, ignored: true });

        const current = body.current_status || body.shipment_status || body.status || '';
        const mapped = mapShiprocketStatus(String(current));
        order.shipping = order.shipping || {};
        order.shipping.status = mapped.shippingStatus;
        order.shipping.lastSyncedAt = new Date();
        if (mapped.orderStatus && !['delivered', 'cancelled', 'rejected'].includes(order.status)) {
            if (order.status !== mapped.orderStatus) {
                order.status = mapped.orderStatus;
                order.trackingStatus.push({
                    status: mapped.orderStatus,
                    updatedAt: new Date(),
                    description: mapped.description,
                });
            }
        }
        await order.save();
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('[Shiprocket webhook]', error.message);
        res.status(200).json({ ok: true });
    }
};
