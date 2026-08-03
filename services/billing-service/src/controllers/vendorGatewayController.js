import VendorPaymentGateway from '../models/VendorPaymentGateway.js';
import Vendor from '../models/Vendor.js';
import PaymentGatewayAuditLog from '../models/PaymentGatewayAuditLog.js';
import {
    GATEWAY_META,
    SUPPORTED_GATEWAYS,
    isSupportedGateway,
    validateCredentialsPayload
} from '../constants/gateways.js';
import {
    loadEncryption,
    serializeGatewayDoc,
    buildGatewayClient,
    getOrCreateMarketplaceSettings,
    getPlatformAvailableGateways
} from '../services/gatewayResolver.js';

function getVendorId(req) {
    return req.vendor?._id || req.headers['x-vendor-id'];
}

function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
}

async function writeAudit({ actorId, ownerId, gateway, action, metadata, ipAddress }) {
    try {
        await PaymentGatewayAuditLog.create({
            actorType: 'vendor',
            actorId,
            ownerType: 'vendor',
            ownerId,
            gateway,
            action,
            metadata,
            ipAddress
        });
    } catch (err) {
        console.error('Audit log failed:', err.message);
    }
}

async function toPublicGateway(doc) {
    const { decryptCredentials, maskCredentials } = await loadEncryption();
    const credentials = decryptCredentials(doc.credentials);
    const masked = maskCredentials(doc.gateway, credentials);
    return serializeGatewayDoc(doc, masked, GATEWAY_META[doc.gateway]);
}

async function mergeCredentials(gateway, existingEncrypted, incoming = {}, existingWebhookEncrypted = '') {
    const { decryptCredentials, decrypt, encryptCredentials, encrypt } = await loadEncryption();
    const existing = decryptCredentials(existingEncrypted);
    const existingWebhook = existingWebhookEncrypted ? decrypt(existingWebhookEncrypted) : '';

    const merged = { ...existing };
    for (const [key, value] of Object.entries(incoming || {})) {
        if (value === undefined || value === null) continue;
        const str = String(value);
        if (!str || str.includes('•')) continue;
        merged[key] = str;
    }

    let webhookSecret = existingWebhook || merged.webhookSecret || '';
    if (incoming.webhookSecret && !String(incoming.webhookSecret).includes('•')) {
        webhookSecret = String(incoming.webhookSecret);
        merged.webhookSecret = webhookSecret;
    }

    const meta = GATEWAY_META[gateway];
    const requiredKeys = (meta?.credentialFields || []).filter((f) => f.required).map((f) => f.key);
    const hasAllRequired = requiredKeys.every((k) => merged[k]);

    return {
        encryptedCredentials: encryptCredentials(merged),
        encryptedWebhook: webhookSecret ? encrypt(webhookSecret) : '',
        plainCredentials: merged,
        hasAllRequired
    };
}

async function getVendorContext(req) {
    const vendorId = getVendorId(req);
    if (!vendorId) return { error: { status: 401, message: 'Vendor authentication required' } };

    const vendor = await Vendor.findById(vendorId).lean();
    if (!vendor) return { error: { status: 404, message: 'Vendor not found' } };

    // Multi Vendor: vendors can always configure their own gateways (no merchant permission toggle)
    const settings = await getOrCreateMarketplaceSettings(vendor.merchant, vendor.store);
    return { vendorId, vendor, settings };
}

// GET /vendor/payment-gateways
export const listVendorGateways = async (req, res) => {
    try {
        const vendorId = getVendorId(req);
        if (!vendorId) return res.status(401).json({ message: 'Vendor authentication required' });

        const vendor = await Vendor.findById(vendorId).lean();
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const settings = await getOrCreateMarketplaceSettings(vendor.merchant, vendor.store);
        const platformAvailable = await getPlatformAvailableGateways();

        // Vendors can configure any Super Admin–enabled platform gateway
        const permitted = platformAvailable;

        const docs = await VendorPaymentGateway.find({ vendorId }).sort({ gateway: 1 });
        const byGateway = Object.fromEntries(docs.map((d) => [d.gateway, d]));

        const gateways = [];
        for (const gw of permitted) {
            const meta = GATEWAY_META[gw];
            if (byGateway[gw]) {
                gateways.push({
                    ...(await toPublicGateway(byGateway[gw])),
                    permitted: true
                });
            } else {
                gateways.push({
                    id: null,
                    gateway: gw,
                    name: meta.name,
                    description: meta.description,
                    environment: 'sandbox',
                    currency: 'INR',
                    enabled: false,
                    isDefault: false,
                    status: 'not_configured',
                    credentials: {},
                    webhookSecretConfigured: false,
                    lastTestedAt: null,
                    lastTestResult: null,
                    updatedAt: null,
                    createdAt: null,
                    permitted: true
                });
            }
        }

        res.json({
            gateways,
            allowVendorGateway: true,
            allowedGateways: permitted,
            platformAvailableGateways: platformAvailable,
            marketplace: {
                paymentMode: 'vendor',
                allowVendorGateway: true,
                allowVendorGatewayFallback: true
            },
            meta: Object.fromEntries(permitted.map((g) => [g, GATEWAY_META[g]]))
        });
    } catch (error) {
        console.error('listVendorGateways:', error);
        res.status(500).json({ message: error.message || 'Failed to list vendor payment gateways' });
    }
};

// POST / PUT vendor gateway
export const upsertVendorGateway = async (req, res) => {
    try {
        const ctx = await getVendorContext(req);
        if (ctx.error) return res.status(ctx.error.status).json(ctx.error);

        const { vendorId, vendor, settings } = ctx;
        const gateway = String(req.params.gateway || req.body.gateway || '').toLowerCase();
        if (!isSupportedGateway(gateway)) {
            return res.status(400).json({ message: `Unsupported gateway. Allowed: ${SUPPORTED_GATEWAYS.join(', ')}` });
        }

        const platformAvailable = await getPlatformAvailableGateways();
        if (!platformAvailable.includes(gateway)) {
            return res.status(403).json({
                message: 'This payment gateway is not enabled on the platform by Super Admin',
                code: 'PLATFORM_GATEWAY_DISABLED'
            });
        }

        const {
            environment = 'sandbox',
            currency,
            enabled,
            credentials = {},
            webhookSecret
        } = req.body;

        let doc = await VendorPaymentGateway.findOne({ vendorId, gateway });
        const merged = await mergeCredentials(
            gateway,
            doc?.credentials || '',
            { ...credentials, ...(webhookSecret !== undefined ? { webhookSecret } : {}) },
            doc?.webhookSecret || ''
        );

        if (!doc) {
            const validation = validateCredentialsPayload(gateway, merged.plainCredentials);
            if (!validation.valid) {
                return res.status(400).json({
                    message: 'Missing API credentials',
                    missing: validation.missing,
                    code: 'MISSING_CREDENTIALS'
                });
            }
        }

        const status = merged.hasAllRequired ? 'configured' : 'not_configured';
        const payload = {
            vendorId,
            merchantId: vendor.merchant,
            storeId: vendor.store || null,
            gateway,
            environment: environment === 'production' ? 'production' : 'sandbox',
            currency: 'INR',
            credentials: merged.encryptedCredentials,
            webhookSecret: merged.encryptedWebhook,
            status
        };
        if (typeof enabled === 'boolean') payload.enabled = enabled && merged.hasAllRequired;

        if (doc) {
            Object.assign(doc, payload);
            await doc.save();
            await writeAudit({
                actorId: vendorId,
                ownerId: vendorId,
                gateway,
                action: 'update',
                metadata: { enabled: doc.enabled },
                ipAddress: getClientIp(req)
            });
        } else {
            doc = await VendorPaymentGateway.create({
                ...payload,
                enabled: typeof enabled === 'boolean' ? enabled && merged.hasAllRequired : false
            });
            await writeAudit({
                actorId: vendorId,
                ownerId: vendorId,
                gateway,
                action: 'create',
                metadata: {},
                ipAddress: getClientIp(req)
            });
        }

        res.json({ gateway: await toPublicGateway(doc), message: 'Vendor payment gateway saved successfully' });
    } catch (error) {
        console.error('upsertVendorGateway:', error);
        res.status(500).json({ message: error.message || 'Failed to save vendor payment gateway' });
    }
};

export const deleteVendorGateway = async (req, res) => {
    try {
        const ctx = await getVendorContext(req);
        if (ctx.error) return res.status(ctx.error.status).json(ctx.error);

        const gateway = String(req.params.gateway || '').toLowerCase();
        if (!isSupportedGateway(gateway)) {
            return res.status(400).json({ message: 'Unsupported gateway' });
        }

        const doc = await VendorPaymentGateway.findOneAndDelete({ vendorId: ctx.vendorId, gateway });
        if (!doc) return res.status(404).json({ message: 'Gateway configuration not found' });

        await writeAudit({
            actorId: ctx.vendorId,
            ownerId: ctx.vendorId,
            gateway,
            action: 'delete',
            metadata: {},
            ipAddress: getClientIp(req)
        });

        res.json({ message: 'Vendor payment gateway configuration deleted' });
    } catch (error) {
        console.error('deleteVendorGateway:', error);
        res.status(500).json({ message: error.message || 'Failed to delete vendor payment gateway' });
    }
};

export const testVendorGateway = async (req, res) => {
    try {
        const ctx = await getVendorContext(req);
        if (ctx.error) return res.status(ctx.error.status).json(ctx.error);

        const gateway = String(req.params.gateway || '').toLowerCase();
        if (!isSupportedGateway(gateway)) {
            return res.status(400).json({ message: 'Unsupported gateway' });
        }

        const doc = await VendorPaymentGateway.findOne({ vendorId: ctx.vendorId, gateway });
        if (!doc) {
            return res.status(404).json({ message: 'Gateway not configured. Save credentials first.', code: 'NOT_CONFIGURED' });
        }

        const client = await buildGatewayClient(doc);
        const result = await client.testConnection();

        doc.lastTestedAt = new Date();
        doc.lastTestResult = { success: result.success, message: result.message };
        doc.status = result.success ? 'verified' : 'error';
        await doc.save();

        await writeAudit({
            actorId: ctx.vendorId,
            ownerId: ctx.vendorId,
            gateway,
            action: 'test',
            metadata: result,
            ipAddress: getClientIp(req)
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message || 'Test connection failure',
                code: 'TEST_CONNECTION_FAILURE',
                gateway: await toPublicGateway(doc)
            });
        }

        res.json({ success: true, message: result.message, gateway: await toPublicGateway(doc) });
    } catch (error) {
        console.error('testVendorGateway:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Test connection failure',
            code: 'TEST_CONNECTION_FAILURE'
        });
    }
};
