import MerchantPaymentGateway from '../models/MerchantPaymentGateway.js';
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

function getMerchantId(req) {
    return req.merchant?._id || req.headers['x-merchant-id'];
}

function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
}

async function writeAudit({ actorId, ownerId, gateway, action, metadata, ipAddress }) {
    try {
        await PaymentGatewayAuditLog.create({
            actorType: 'merchant',
            actorId,
            ownerType: 'merchant',
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
    const { decryptCredentials, decrypt, maskCredentials } = await loadEncryption();
    const credentials = decryptCredentials(doc.credentials);
    const masked = maskCredentials(doc.gateway, credentials);
    return serializeGatewayDoc(doc, masked, GATEWAY_META[doc.gateway]);
}

/**
 * Merge incoming credentials with existing decrypted ones.
 * Masked values (containing •) or empty strings keep previous secrets.
 */
async function mergeCredentials(gateway, existingEncrypted, incoming = {}, existingWebhookEncrypted = '') {
    const { decryptCredentials, decrypt, encryptCredentials, encrypt } = await loadEncryption();
    const existing = decryptCredentials(existingEncrypted);
    const existingWebhook = existingWebhookEncrypted ? decrypt(existingWebhookEncrypted) : '';

    const merged = { ...existing };
    for (const [key, value] of Object.entries(incoming || {})) {
        if (value === undefined || value === null) continue;
        const str = String(value);
        if (!str || str.includes('•')) continue; // keep existing secret
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

// GET /merchant/payment-gateways
export const listMerchantGateways = async (req, res) => {
    try {
        const merchantId = getMerchantId(req);
        if (!merchantId) return res.status(401).json({ message: 'Merchant authentication required' });

        const storeId = req.query.storeId || req.headers['x-store-id'] || null;
        const docs = await MerchantPaymentGateway.find({
            merchantId,
            ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {})
        }).sort({ gateway: 1 });

        const platformAvailable = await getPlatformAvailableGateways();
        const byGateway = Object.fromEntries(docs.map((d) => [d.gateway, d]));
        const gateways = [];

        for (const gw of platformAvailable) {
            if (byGateway[gw]) {
                gateways.push(await toPublicGateway(byGateway[gw]));
            } else {
                const meta = GATEWAY_META[gw];
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
                    createdAt: null
                });
            }
        }

        const settings = await getOrCreateMarketplaceSettings(merchantId, storeId);
        res.json({
            gateways,
            platformAvailableGateways: platformAvailable,
            marketplace: {
                allowVendorGateway: settings.allowVendorGateway,
                allowVendorGatewayFallback: settings.allowVendorGatewayFallback !== false,
                allowedVendorGateways: settings.allowedVendorGateways,
                paymentMode: settings.paymentMode,
                defaultGateway: settings.defaultGateway,
                splitPaymentEnabled: settings.splitPaymentEnabled,
                commissionPercent: settings.commissionPercent
            },
            meta: Object.fromEntries(platformAvailable.map((g) => [g, GATEWAY_META[g]]))
        });
    } catch (error) {
        console.error('listMerchantGateways:', error);
        res.status(500).json({ message: error.message || 'Failed to list payment gateways' });
    }
};

// POST /merchant/payment-gateways  OR  PUT /merchant/payment-gateways/:gateway
export const upsertMerchantGateway = async (req, res) => {
    try {
        const merchantId = getMerchantId(req);
        if (!merchantId) return res.status(401).json({ message: 'Merchant authentication required' });

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

        const storeId = req.body.storeId || req.headers['x-store-id'] || null;
        const {
            environment = 'sandbox',
            currency,
            enabled,
            isDefault,
            credentials = {},
            webhookSecret
        } = req.body;

        let doc = await MerchantPaymentGateway.findOne({
            merchantId,
            gateway,
            storeId: storeId || null
        });

        const merged = await mergeCredentials(
            gateway,
            doc?.credentials || '',
            { ...credentials, ...(webhookSecret !== undefined ? { webhookSecret } : {}) },
            doc?.webhookSecret || ''
        );

        // On create, require credentials
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
            merchantId,
            storeId: storeId || null,
            gateway,
            environment: environment === 'production' ? 'production' : 'sandbox',
            currency: 'INR',
            credentials: merged.encryptedCredentials,
            webhookSecret: merged.encryptedWebhook,
            status
        };

        if (typeof enabled === 'boolean') payload.enabled = enabled && merged.hasAllRequired;
        if (typeof isDefault === 'boolean') payload.isDefault = isDefault;

        if (doc) {
            Object.assign(doc, payload);
            await doc.save();
            await writeAudit({
                actorId: merchantId,
                ownerId: merchantId,
                gateway,
                action: 'update',
                metadata: { enabled: doc.enabled, environment: doc.environment },
                ipAddress: getClientIp(req)
            });
        } else {
            doc = await MerchantPaymentGateway.create({
                ...payload,
                enabled: typeof enabled === 'boolean' ? enabled && merged.hasAllRequired : false,
                isDefault: !!isDefault
            });
            await writeAudit({
                actorId: merchantId,
                ownerId: merchantId,
                gateway,
                action: 'create',
                metadata: { environment: doc.environment },
                ipAddress: getClientIp(req)
            });
        }

        if (doc.isDefault) {
            await MerchantPaymentGateway.updateMany(
                { merchantId, _id: { $ne: doc._id } },
                { $set: { isDefault: false } }
            );
        }

        res.json({ gateway: await toPublicGateway(doc), message: 'Payment gateway saved successfully' });
    } catch (error) {
        console.error('upsertMerchantGateway:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Gateway configuration already exists' });
        }
        res.status(500).json({ message: error.message || 'Failed to save payment gateway' });
    }
};

// DELETE /merchant/payment-gateways/:gateway
export const deleteMerchantGateway = async (req, res) => {
    try {
        const merchantId = getMerchantId(req);
        if (!merchantId) return res.status(401).json({ message: 'Merchant authentication required' });

        const gateway = String(req.params.gateway || '').toLowerCase();
        if (!isSupportedGateway(gateway)) {
            return res.status(400).json({ message: 'Unsupported gateway' });
        }

        const storeId = req.query.storeId || req.headers['x-store-id'] || null;
        const doc = await MerchantPaymentGateway.findOneAndDelete({
            merchantId,
            gateway,
            ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {})
        });

        if (!doc) return res.status(404).json({ message: 'Gateway configuration not found' });

        await writeAudit({
            actorId: merchantId,
            ownerId: merchantId,
            gateway,
            action: 'delete',
            metadata: {},
            ipAddress: getClientIp(req)
        });

        res.json({ message: 'Payment gateway configuration deleted' });
    } catch (error) {
        console.error('deleteMerchantGateway:', error);
        res.status(500).json({ message: error.message || 'Failed to delete payment gateway' });
    }
};

// POST /merchant/payment-gateways/:gateway/test
export const testMerchantGateway = async (req, res) => {
    try {
        const merchantId = getMerchantId(req);
        if (!merchantId) return res.status(401).json({ message: 'Merchant authentication required' });

        const gateway = String(req.params.gateway || '').toLowerCase();
        if (!isSupportedGateway(gateway)) {
            return res.status(400).json({ message: 'Unsupported gateway' });
        }

        const storeId = req.body.storeId || req.headers['x-store-id'] || null;
        const doc = await MerchantPaymentGateway.findOne({
            merchantId,
            gateway,
            ...(storeId ? { $or: [{ storeId }, { storeId: null }] } : {})
        });

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
            actorId: merchantId,
            ownerId: merchantId,
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

        res.json({
            success: true,
            message: result.message,
            gateway: await toPublicGateway(doc)
        });
    } catch (error) {
        console.error('testMerchantGateway:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Test connection failure',
            code: 'TEST_CONNECTION_FAILURE'
        });
    }
};
