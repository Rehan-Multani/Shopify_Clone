import { encrypt } from '../../../shared/encryption.js';
import MerchantEmailConfig from '../models/MerchantEmailConfig.js';
import VendorEmailConfig from '../models/VendorEmailConfig.js';
import { buildFromDoc } from '../../../shared/emailResolver.js';

const testRateLimit = new Map();

function rateLimitOk(key, max = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const arr = (testRateLimit.get(key) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) return false;
    arr.push(now);
    testRateLimit.set(key, arr);
    return true;
}

async function sendTestWithDraft(tmp, to, subject) {
    const built = await buildFromDoc({ ...tmp, enabled: true, status: 'configured' }, 'merchant');
    if (!built) return { success: false, message: 'Incomplete SMTP configuration' };
    try {
        await built.transporter.sendMail({
            from: built.fromHeader,
            to,
            subject,
            text: 'This is a test email from your Storify email configuration.',
            html: '<p>This is a <strong>test email</strong> from your Storify email configuration.</p>',
            replyTo: built.replyTo || undefined
        });
        return { success: true, message: 'Email Sent Successfully' };
    } catch (err) {
        return { success: false, message: err.message || 'Authentication Failed' };
    }
}

function serializeConfig(doc) {
    if (!doc) {
        return {
            configured: false,
            provider: 'brevo',
            authMode: 'smtp',
            senderName: '',
            senderEmail: '',
            replyToEmail: '',
            smtpHost: 'smtp-relay.brevo.com',
            smtpPort: 587,
            smtpSecure: false,
            smtpUsername: '',
            smtpPasswordMasked: '',
            apiKeyMasked: '',
            passwordConfigured: false,
            apiKeyConfigured: false,
            status: 'disabled',
            verified: false,
            enabled: false,
            lastTestedAt: null,
            lastTestResult: null
        };
    }
    return {
        configured: true,
        id: doc._id,
        provider: doc.provider,
        authMode: doc.authMode,
        senderName: doc.senderName,
        senderEmail: doc.senderEmail,
        replyToEmail: doc.replyToEmail,
        smtpHost: doc.smtpHost,
        smtpPort: doc.smtpPort,
        smtpSecure: doc.smtpSecure,
        smtpUsername: doc.smtpUsername,
        smtpPasswordMasked: doc.smtpPasswordEncrypted ? '••••••••••••' : '',
        apiKeyMasked: doc.apiKeyEncrypted ? '••••••••••••' : '',
        passwordConfigured: Boolean(doc.smtpPasswordEncrypted),
        apiKeyConfigured: Boolean(doc.apiKeyEncrypted),
        status: doc.status,
        verified: doc.verified,
        enabled: doc.enabled,
        lastTestedAt: doc.lastTestedAt,
        lastTestResult: doc.lastTestResult
    };
}

function applySecrets(doc, body) {
    const {
        provider, authMode, senderName, senderEmail, replyToEmail,
        smtpHost, smtpPort, smtpSecure, smtpUsername, smtpPassword, apiKey, enabled
    } = body;

    if (provider) doc.provider = provider;
    if (authMode) doc.authMode = authMode;
    if (senderName !== undefined) doc.senderName = senderName;
    if (senderEmail !== undefined) doc.senderEmail = String(senderEmail).trim().toLowerCase();
    if (replyToEmail !== undefined) doc.replyToEmail = String(replyToEmail || '').trim().toLowerCase();
    if (smtpHost !== undefined) doc.smtpHost = smtpHost || 'smtp-relay.brevo.com';
    if (smtpPort !== undefined) doc.smtpPort = Number(smtpPort) || 587;
    if (smtpSecure !== undefined) doc.smtpSecure = !!smtpSecure;
    if (smtpUsername !== undefined) doc.smtpUsername = smtpUsername;
    if (enabled !== undefined) doc.enabled = !!enabled;

    if (smtpPassword && !String(smtpPassword).includes('•')) {
        doc.smtpPasswordEncrypted = encrypt(smtpPassword);
    }
    if (apiKey && !String(apiKey).includes('•')) {
        doc.apiKeyEncrypted = encrypt(apiKey);
    }

    const hasSmtp = doc.smtpUsername && doc.smtpPasswordEncrypted;
    const hasApi = doc.apiKeyEncrypted;
    const hasSender = doc.senderName && doc.senderEmail;

    if (hasSender && (hasSmtp || hasApi)) {
        doc.status = doc.verified ? 'verified' : 'configured';
        if (enabled === undefined) doc.enabled = true;
    } else if (!doc.enabled) {
        doc.status = 'disabled';
    }
}

function buildDraft(doc, body) {
    const draft = doc ? doc.toObject() : { enabled: true, status: 'configured' };
    const tmp = { ...draft };
    if (body.smtpPassword && !String(body.smtpPassword).includes('•')) {
        tmp.smtpPasswordEncrypted = encrypt(body.smtpPassword);
    }
    if (body.apiKey && !String(body.apiKey).includes('•')) {
        tmp.apiKeyEncrypted = encrypt(body.apiKey);
    }
    Object.assign(tmp, {
        provider: body.provider || tmp.provider || 'brevo',
        authMode: body.authMode || tmp.authMode || 'smtp',
        senderName: body.senderName ?? tmp.senderName,
        senderEmail: body.senderEmail ?? tmp.senderEmail,
        replyToEmail: body.replyToEmail ?? tmp.replyToEmail,
        smtpHost: body.smtpHost ?? tmp.smtpHost ?? 'smtp-relay.brevo.com',
        smtpPort: body.smtpPort ?? tmp.smtpPort ?? 587,
        smtpSecure: body.smtpSecure ?? tmp.smtpSecure ?? false,
        smtpUsername: body.smtpUsername ?? tmp.smtpUsername,
        enabled: true
    });
    return tmp;
}

export const getMerchantEmailConfig = async (req, res) => {
    try {
        const merchantId = req.merchant?._id || req.headers['x-merchant-id'];
        if (!merchantId) return res.status(401).json({ message: 'Unauthorized' });
        const doc = await MerchantEmailConfig.findOne({ merchantId });
        res.json({ success: true, config: serializeConfig(doc) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const upsertMerchantEmailConfig = async (req, res) => {
    try {
        const merchantId = req.merchant?._id || req.headers['x-merchant-id'];
        if (!merchantId) return res.status(401).json({ message: 'Unauthorized' });
        let doc = await MerchantEmailConfig.findOne({ merchantId });
        if (!doc) doc = new MerchantEmailConfig({ merchantId });
        applySecrets(doc, req.body);
        await doc.save();
        res.json({ success: true, message: 'Email configuration saved', config: serializeConfig(doc) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const disableMerchantEmailConfig = async (req, res) => {
    try {
        const merchantId = req.merchant?._id || req.headers['x-merchant-id'];
        if (!merchantId) return res.status(401).json({ message: 'Unauthorized' });
        const doc = await MerchantEmailConfig.findOne({ merchantId });
        if (!doc) return res.status(404).json({ message: 'Not configured' });
        doc.enabled = false;
        doc.status = 'disabled';
        await doc.save();
        res.json({ success: true, message: 'Email configuration disabled', config: serializeConfig(doc) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const testMerchantEmailConfig = async (req, res) => {
    try {
        const merchantId = req.merchant?._id || req.headers['x-merchant-id'];
        if (!merchantId) return res.status(401).json({ message: 'Unauthorized' });
        if (!rateLimitOk(`m:${merchantId}`)) {
            return res.status(429).json({ message: 'Too many test emails. Try again later.' });
        }
        const to = req.body?.email || req.body?.to;
        if (!to) return res.status(400).json({ message: 'Recipient email is required' });

        let doc = await MerchantEmailConfig.findOne({ merchantId });
        const tmp = buildDraft(doc, req.body || {});
        const result = await sendTestWithDraft(tmp, to, 'Storify — Test email (Merchant SMTP)');

        if (!doc) doc = new MerchantEmailConfig({ merchantId });
        applySecrets(doc, req.body || {});
        doc.lastTestedAt = new Date();
        doc.lastTestResult = result;
        if (result.success) {
            doc.verified = true;
            doc.status = 'verified';
            doc.enabled = true;
        } else {
            doc.status = 'error';
            doc.verified = false;
        }
        await doc.save();

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message || 'Authentication Failed' });
        }
        res.json({ success: true, message: 'Email Sent Successfully', config: serializeConfig(doc) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getVendorEmailConfig = async (req, res) => {
    try {
        const vendorId = req.vendor?._id || req.headers['x-vendor-id'];
        if (!vendorId) return res.status(401).json({ message: 'Unauthorized' });
        const doc = await VendorEmailConfig.findOne({ vendorId });
        res.json({ success: true, config: serializeConfig(doc) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const upsertVendorEmailConfig = async (req, res) => {
    try {
        const vendorId = req.vendor?._id || req.headers['x-vendor-id'];
        if (!vendorId) return res.status(401).json({ message: 'Unauthorized' });
        let doc = await VendorEmailConfig.findOne({ vendorId });
        if (!doc) {
            doc = new VendorEmailConfig({
                vendorId,
                merchantId: req.headers['x-merchant-id'] || null
            });
        }
        applySecrets(doc, req.body);
        await doc.save();
        res.json({ success: true, message: 'Email configuration saved', config: serializeConfig(doc) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const disableVendorEmailConfig = async (req, res) => {
    try {
        const vendorId = req.vendor?._id || req.headers['x-vendor-id'];
        if (!vendorId) return res.status(401).json({ message: 'Unauthorized' });
        const doc = await VendorEmailConfig.findOne({ vendorId });
        if (!doc) return res.status(404).json({ message: 'Not configured' });
        doc.enabled = false;
        doc.status = 'disabled';
        await doc.save();
        res.json({ success: true, message: 'Email configuration disabled', config: serializeConfig(doc) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const testVendorEmailConfig = async (req, res) => {
    try {
        const vendorId = req.vendor?._id || req.headers['x-vendor-id'];
        if (!vendorId) return res.status(401).json({ message: 'Unauthorized' });
        if (!rateLimitOk(`v:${vendorId}`)) {
            return res.status(429).json({ message: 'Too many test emails. Try again later.' });
        }
        const to = req.body?.email || req.body?.to;
        if (!to) return res.status(400).json({ message: 'Recipient email is required' });

        let doc = await VendorEmailConfig.findOne({ vendorId });
        const tmp = buildDraft(doc, req.body || {});
        const result = await sendTestWithDraft(tmp, to, 'Storify — Test email (Vendor SMTP)');

        if (!doc) {
            doc = new VendorEmailConfig({
                vendorId,
                merchantId: req.headers['x-merchant-id'] || null
            });
        }
        applySecrets(doc, req.body || {});
        doc.lastTestedAt = new Date();
        doc.lastTestResult = result;
        if (result.success) {
            doc.verified = true;
            doc.status = 'verified';
            doc.enabled = true;
        } else {
            doc.status = 'error';
            doc.verified = false;
        }
        await doc.save();

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message || 'Authentication Failed' });
        }
        res.json({ success: true, message: 'Email Sent Successfully', config: serializeConfig(doc) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
