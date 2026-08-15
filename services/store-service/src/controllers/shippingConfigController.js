/**
 * Merchant / Vendor Shiprocket credential configuration.
 * Email-parity: verify-to-activate, owner-only live use, deactivate on auth fail.
 */
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import MerchantShiprocketConfig from '../models/MerchantShiprocketConfig.js';
import VendorShiprocketConfig from '../models/VendorShiprocketConfig.js';
import { isShiprocketEnabledOnPlatform } from '../services/shippingResolver.js';
import { loginShiprocket } from '../utils/shiprocketClient.js';
import Order from '../models/Order.js';
import { mapShiprocketStatus, emitShippingStatusEmail } from '../services/shippingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testRateLimit = new Map();

function rateLimitOk(key, max = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const arr = (testRateLimit.get(key) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) return false;
    arr.push(now);
    testRateLimit.set(key, arr);
    return true;
}

async function loadEncryption() {
    const sharedPath = path.resolve(__dirname, '../../../shared/encryption.js');
    return import(pathToFileURL(sharedPath).href);
}

const getMerchantId = (req) => req.merchant?._id || req.headers['x-merchant-id'];
const getVendorId = (req) => req.vendor?._id || req.headers['x-vendor-id'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function humanizeShiprocketError(msg) {
    const raw = String(msg || 'Shiprocket error');
    const lower = raw.toLowerCase();
    if (lower.includes('invalid') || lower.includes('unauthorized') || lower.includes('401') || lower.includes('credential')) {
        return 'Shiprocket login failed. Check API email and password.';
    }
    if (lower.includes('pickup') || lower.includes('warehouse')) {
        return 'Pickup location issue. Ensure a “Primary” pickup exists in your Shiprocket account.';
    }
    return raw.slice(0, 300);
}

async function mergeCredentials(existingEncrypted, incoming = {}, { applyPassword = true } = {}) {
    const { decryptCredentials, encryptCredentials } = await loadEncryption();
    const existing = decryptCredentials(existingEncrypted) || {};
    const merged = { ...existing };
    for (const [key, value] of Object.entries(incoming || {})) {
        if (value === undefined || value === null) continue;
        if (key === 'password' && !applyPassword) continue;
        const str = String(value);
        if (!str || str.includes('•')) continue;
        merged[key] = str;
    }
    const hasAll = Boolean(merged.email && merged.password);
    return {
        encrypted: encryptCredentials(merged),
        plain: merged,
        hasAll,
        passwordChanged: Boolean(
            applyPassword
            && incoming.password
            && !String(incoming.password).includes('•')
            && String(incoming.password).trim()
        ),
        emailChanged: Boolean(
            incoming.email
            && String(incoming.email).trim().toLowerCase()
            && String(incoming.email).trim().toLowerCase() !== String(existing.email || '').toLowerCase()
        ),
    };
}

async function toPublic(doc, platformEnabled) {
    const { decryptCredentials, maskCredentials } = await loadEncryption();
    const credentials = decryptCredentials(doc.credentials);
    return {
        id: doc._id,
        enabled: !!doc.enabled,
        status: doc.status,
        verified: doc.status === 'verified' && !!doc.enabled,
        pickupLocation: 'Primary',
        pickupPincode: doc.pickupPincode || '',
        channelId: '',
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
    verified: false,
    pickupLocation: 'Primary',
    pickupPincode: '',
    channelId: '',
    credentials: {},
    lastTestedAt: null,
    lastTestResult: null,
    platformEnabled,
    updatedAt: null,
});

function validateCredsInput(body = {}, { requirePassword, existingHasPassword }) {
    const email = String(body.credentials?.email || body.email || '').trim().toLowerCase();
    const password = String(body.credentials?.password || body.password || '').trim();
    const hasNewPassword = Boolean(password && !password.includes('•'));
    if (!email) return { ok: false, message: 'Shiprocket API email is required' };
    if (!EMAIL_RE.test(email)) return { ok: false, message: 'Shiprocket API email is invalid' };
    if (requirePassword && !hasNewPassword && !existingHasPassword) {
        return { ok: false, message: 'Shiprocket API password is required' };
    }
    return {
        ok: true,
        email,
        hasNewPassword,
        password: hasNewPassword ? password : '',
        credentials: {
            email,
            ...(hasNewPassword ? { password } : {}),
        },
    };
}

async function verifyLoginPlain(plain) {
    const result = await loginShiprocket({
        email: plain.email,
        password: plain.password,
    });
    return {
        ok: result.ok,
        message: humanizeShiprocketError(result.message || (result.ok ? 'Connected' : 'Login failed')),
        token: result.token,
    };
}

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

        const existingHasPassword = Boolean(doc?.credentials);
        const validated = validateCredsInput(req.body, {
            requirePassword: true,
            existingHasPassword: existingHasPassword && !!doc,
        });
        if (!validated.ok) return res.status(400).json({ message: validated.message });

        const merged = await mergeCredentials(doc?.credentials || '', validated.credentials);
        if (!merged.hasAll) {
            return res.status(400).json({
                message: 'Shiprocket email and password are required',
                code: 'MISSING_CREDENTIALS',
            });
        }

        // New/changed credentials must login before we store them as live candidates
        if (merged.passwordChanged || merged.emailChanged || !doc) {
            const probe = await verifyLoginPlain(merged.plain);
            if (!probe.ok) {
                return res.status(400).json({ message: probe.message, code: 'SHIPROCKET_AUTH_FAILED' });
            }
        }

        const identityChanged = merged.passwordChanged || merged.emailChanged;
        const payload = {
            merchantId,
            storeId: storeId || null,
            credentials: merged.encrypted,
            pickupLocation: 'Primary',
            pickupPincode: req.body.pickupPincode ?? doc?.pickupPincode ?? '',
            channelId: '',
        };

        if (!doc) {
            doc = await MerchantShiprocketConfig.create({
                ...payload,
                status: 'configured',
                enabled: false,
            });
        } else {
            Object.assign(doc, payload);
            if (identityChanged || doc.status !== 'verified') {
                doc.status = 'configured';
                doc.enabled = false;
                doc.tokenEncrypted = '';
                doc.tokenExpiresAt = null;
            }
            await doc.save();
        }

        const needsTest = !doc.enabled || doc.status !== 'verified';
        res.json({
            message: needsTest
                ? 'Shiprocket login OK. Send Test & activate to enable automated shipping.'
                : 'Shiprocket configuration saved',
            config: await toPublic(doc, platformEnabled),
        });
    } catch (error) {
        res.status(500).json({ message: humanizeShiprocketError(error.message) || 'Failed to save shipping configuration' });
    }
};

export const testMerchantShipping = async (req, res) => {
    try {
        const merchantId = getMerchantId(req);
        if (!merchantId) return res.status(401).json({ message: 'Merchant authentication required' });
        if (!rateLimitOk(`m:${merchantId}`)) {
            return res.status(429).json({ message: 'Too many tests. Try again in 15 minutes.' });
        }

        const storeId = req.body.storeId || req.headers['x-store-id'] || null;
        let doc = await MerchantShiprocketConfig.findOne({
            merchantId,
            ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {}),
        }).sort({ storeId: -1 });

        const validated = validateCredsInput(req.body, {
            requirePassword: true,
            existingHasPassword: Boolean(doc?.credentials),
        });
        // Allow test with saved creds only
        const incoming = req.body.credentials || {};
        const hasIncoming = Boolean(
            (incoming.email || incoming.password)
            && Object.keys(incoming).length
        );

        if (!doc && !hasIncoming && !validated.ok) {
            return res.status(404).json({ message: 'Save credentials first', code: 'NOT_CONFIGURED' });
        }

        const { decryptCredentials, encrypt } = await loadEncryption();
        let plain;
        if (hasIncoming && validated.ok) {
            const merged = await mergeCredentials(doc?.credentials || '', validated.credentials);
            plain = merged.plain;
            if (!doc) {
                doc = new MerchantShiprocketConfig({
                    merchantId,
                    storeId: storeId || null,
                    pickupLocation: 'Primary',
                });
            }
            if (merged.passwordChanged || !doc.credentials) {
                doc.credentials = merged.encrypted;
            } else if (validated.email) {
                const m2 = await mergeCredentials(doc.credentials, { email: validated.email }, { applyPassword: false });
                doc.credentials = m2.encrypted;
                plain = { ...decryptCredentials(doc.credentials), ...plain };
            }
        } else {
            if (!doc) return res.status(404).json({ message: 'Save credentials first', code: 'NOT_CONFIGURED' });
            plain = decryptCredentials(doc.credentials);
        }

        if (!plain?.email || !plain?.password) {
            return res.status(400).json({ message: 'Shiprocket email and password are required' });
        }

        const result = await verifyLoginPlain(plain);
        doc.pickupLocation = 'Primary';
        if (req.body.pickupPincode !== undefined) doc.pickupPincode = req.body.pickupPincode;
        doc.lastTestedAt = new Date();
        doc.lastTestResult = { success: result.ok, message: result.message };

        if (result.ok) {
            doc.status = 'verified';
            doc.enabled = true;
            if (result.token) {
                doc.tokenEncrypted = encrypt(result.token);
                doc.tokenExpiresAt = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
            }
        } else {
            doc.status = 'error';
            doc.enabled = false;
            doc.tokenEncrypted = '';
            doc.tokenExpiresAt = null;
        }
        await doc.save();

        if (!result.ok) {
            return res.status(400).json({
                success: false,
                message: result.message,
                config: await toPublic(doc, true),
            });
        }
        res.json({
            success: true,
            message: 'Shiprocket verified and activated. Orders will use Shiprocket; otherwise COD / manual.',
            config: await toPublic(doc, true),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: humanizeShiprocketError(error.message) });
    }
};

export const disableMerchantShipping = async (req, res) => {
    try {
        const merchantId = getMerchantId(req);
        if (!merchantId) return res.status(401).json({ message: 'Merchant authentication required' });
        const storeId = req.body.storeId || req.headers['x-store-id'] || null;
        const doc = await MerchantShiprocketConfig.findOne({
            merchantId,
            ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {}),
        }).sort({ storeId: -1 });
        if (!doc) return res.status(404).json({ message: 'Not configured' });
        doc.enabled = false;
        doc.status = doc.credentials ? 'configured' : 'not_configured';
        doc.tokenEncrypted = '';
        doc.tokenExpiresAt = null;
        await doc.save();
        res.json({
            message: 'Shiprocket disabled. Orders will use COD / manual shipping.',
            config: await toPublic(doc, await isShiprocketEnabledOnPlatform()),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        const validated = validateCredsInput(req.body, {
            requirePassword: true,
            existingHasPassword: Boolean(doc?.credentials),
        });
        if (!validated.ok) return res.status(400).json({ message: validated.message });

        const merged = await mergeCredentials(doc?.credentials || '', validated.credentials);
        if (!merged.hasAll) {
            return res.status(400).json({
                message: 'Shiprocket email and password are required',
                code: 'MISSING_CREDENTIALS',
            });
        }

        if (merged.passwordChanged || merged.emailChanged || !doc) {
            const probe = await verifyLoginPlain(merged.plain);
            if (!probe.ok) {
                return res.status(400).json({ message: probe.message, code: 'SHIPROCKET_AUTH_FAILED' });
            }
        }

        const identityChanged = merged.passwordChanged || merged.emailChanged;
        const payload = {
            vendorId,
            merchantId: req.body.merchantId || req.headers['x-merchant-id'] || doc?.merchantId || null,
            storeId: req.body.storeId || req.headers['x-store-id'] || null,
            credentials: merged.encrypted,
            pickupLocation: 'Primary',
            pickupPincode: req.body.pickupPincode ?? doc?.pickupPincode ?? '',
            channelId: '',
        };

        if (!doc) {
            doc = await VendorShiprocketConfig.create({
                ...payload,
                status: 'configured',
                enabled: false,
            });
        } else {
            Object.assign(doc, payload);
            if (identityChanged || doc.status !== 'verified') {
                doc.status = 'configured';
                doc.enabled = false;
                doc.tokenEncrypted = '';
                doc.tokenExpiresAt = null;
            }
            await doc.save();
        }

        const needsTest = !doc.enabled || doc.status !== 'verified';
        res.json({
            message: needsTest
                ? 'Shiprocket login OK. Send Test & activate to enable automated shipping.'
                : 'Shiprocket configuration saved',
            config: await toPublic(doc, platformEnabled),
        });
    } catch (error) {
        res.status(500).json({ message: humanizeShiprocketError(error.message) });
    }
};

export const testVendorShipping = async (req, res) => {
    try {
        const vendorId = getVendorId(req);
        if (!vendorId) return res.status(401).json({ message: 'Vendor authentication required' });
        if (!rateLimitOk(`v:${vendorId}`)) {
            return res.status(429).json({ message: 'Too many tests. Try again in 15 minutes.' });
        }

        let doc = await VendorShiprocketConfig.findOne({ vendorId });
        const { decryptCredentials, encrypt } = await loadEncryption();
        const validated = validateCredsInput(req.body, {
            requirePassword: true,
            existingHasPassword: Boolean(doc?.credentials),
        });
        const incoming = req.body.credentials || {};
        const hasIncoming = Boolean(incoming.email || incoming.password);

        let plain;
        if (hasIncoming && validated.ok) {
            const merged = await mergeCredentials(doc?.credentials || '', validated.credentials);
            plain = merged.plain;
            if (!doc) {
                doc = new VendorShiprocketConfig({
                    vendorId,
                    merchantId: req.headers['x-merchant-id'] || null,
                    pickupLocation: 'Primary',
                });
            }
            if (merged.passwordChanged || !doc.credentials) {
                doc.credentials = merged.encrypted;
            }
        } else {
            if (!doc) return res.status(404).json({ message: 'Save credentials first', code: 'NOT_CONFIGURED' });
            plain = decryptCredentials(doc.credentials);
        }

        if (!plain?.email || !plain?.password) {
            return res.status(400).json({ message: 'Shiprocket email and password are required' });
        }

        const result = await verifyLoginPlain(plain);
        doc.pickupLocation = 'Primary';
        if (req.body.pickupPincode !== undefined) doc.pickupPincode = req.body.pickupPincode;
        doc.lastTestedAt = new Date();
        doc.lastTestResult = { success: result.ok, message: result.message };

        if (result.ok) {
            doc.status = 'verified';
            doc.enabled = true;
            if (result.token) {
                doc.tokenEncrypted = encrypt(result.token);
                doc.tokenExpiresAt = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
            }
        } else {
            doc.status = 'error';
            doc.enabled = false;
            doc.tokenEncrypted = '';
            doc.tokenExpiresAt = null;
        }
        await doc.save();

        if (!result.ok) {
            return res.status(400).json({
                success: false,
                message: result.message,
                config: await toPublic(doc, true),
            });
        }
        res.json({
            success: true,
            message: 'Shiprocket verified and activated. Your orders use Shiprocket; otherwise COD / manual.',
            config: await toPublic(doc, true),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: humanizeShiprocketError(error.message) });
    }
};

export const disableVendorShipping = async (req, res) => {
    try {
        const vendorId = getVendorId(req);
        if (!vendorId) return res.status(401).json({ message: 'Vendor authentication required' });
        const doc = await VendorShiprocketConfig.findOne({ vendorId });
        if (!doc) return res.status(404).json({ message: 'Not configured' });
        doc.enabled = false;
        doc.status = doc.credentials ? 'configured' : 'not_configured';
        doc.tokenEncrypted = '';
        doc.tokenExpiresAt = null;
        await doc.save();
        res.json({
            message: 'Shiprocket disabled. Orders will use COD / manual shipping.',
            config: await toPublic(doc, await isShiprocketEnabledOnPlatform()),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/** Public webhook — requires SHIPROCKET_WEBHOOK_SECRET in production. */
export const shiprocketWebhook = async (req, res) => {
    try {
        const isProd = process.env.NODE_ENV === 'production';
        const expected = String(process.env.SHIPROCKET_WEBHOOK_SECRET || '').trim();
        if (isProd && !expected) {
            console.error('[Shiprocket webhook] SHIPROCKET_WEBHOOK_SECRET is required in production');
            return res.status(503).json({ ok: false, message: 'Webhook not configured' });
        }
        if (expected) {
            const provided = String(
                req.headers['x-api-key']
                || req.headers['x-shiprocket-token']
                || req.query?.token
                || ''
            ).trim();
            if (!provided || provided !== expected) {
                return res.status(401).json({ ok: false, message: 'Unauthorized webhook' });
            }
        }

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
                const prevStatus = order.status;
                order.status = mapped.orderStatus;
                order.trackingStatus = order.trackingStatus || [];
                order.trackingStatus.push({
                    status: mapped.orderStatus,
                    updatedAt: new Date(),
                    description: mapped.description,
                });
                emitShippingStatusEmail(order, prevStatus, mapped.orderStatus);
            }
        }
        await order.save();
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('[Shiprocket webhook]', error.message);
        res.status(200).json({ ok: true });
    }
};
