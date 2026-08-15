import { encrypt } from '../../../shared/encryption.js';
import { verifySmtpDraft, humanizeSmtpError } from '../../../shared/emailResolver.js';
import { redisIncrWithTtl } from '../../../shared/redisLite.js';
import MerchantEmailConfig from '../models/MerchantEmailConfig.js';
import VendorEmailConfig from '../models/VendorEmailConfig.js';
import { getEmailConfigModels } from '../../../shared/transactionalEmail.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function rateLimitOk(key, max = 5, windowSec = 15 * 60) {
    try {
        const n = await redisIncrWithTtl(`email:test:${key}`, windowSec);
        return n <= max;
    } catch {
        return false;
    }
}

function isValidEmail(value) {
    return EMAIL_RE.test(String(value || '').trim());
}

/**
 * Validate Brevo SMTP payload for save / test.
 * @returns {{ ok: true, data } | { ok: false, message }}
 */
function validateBrevoPayload(body = {}, { requirePassword = false, existingPassword = false } = {}) {
    const senderName = String(body.senderName || '').trim();
    const senderEmail = String(body.senderEmail || '').trim().toLowerCase();
    const replyToEmail = String(body.replyToEmail || '').trim().toLowerCase();
    const smtpUsername = String(body.smtpUsername || '').trim();
    const rawPass = body.smtpPassword;
    const hasNewPassword = Boolean(rawPass && !String(rawPass).includes('•'));

    if (!senderName) return { ok: false, message: 'Sender name is required' };
    if (!senderEmail) return { ok: false, message: 'Sender email is required' };
    if (!isValidEmail(senderEmail)) return { ok: false, message: 'Sender email is invalid' };
    if (replyToEmail && !isValidEmail(replyToEmail)) {
        return { ok: false, message: 'Reply-to email is invalid' };
    }
    if (!smtpUsername) return { ok: false, message: 'SMTP username is required' };
    if (requirePassword && !hasNewPassword && !existingPassword) {
        return { ok: false, message: 'SMTP password / key is required' };
    }

    return {
        ok: true,
        data: {
            senderName,
            senderEmail,
            replyToEmail,
            smtpUsername,
            hasNewPassword,
            smtpPassword: hasNewPassword ? String(rawPass).trim() : ''
        }
    };
}

async function sendTestWithDraft(tmp, to, subject) {
    const { buildFromDoc } = await import('../../../shared/emailResolver.js');
    const built = await buildFromDoc({ ...tmp, enabled: true, status: 'verified' }, 'merchant');
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
        return { success: false, message: humanizeSmtpError(err) };
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
        configured: Boolean(doc.smtpUsername && doc.smtpPasswordEncrypted && doc.senderEmail),
        id: doc._id,
        provider: 'brevo',
        authMode: 'smtp',
        senderName: doc.senderName,
        senderEmail: doc.senderEmail,
        replyToEmail: doc.replyToEmail,
        smtpHost: 'smtp-relay.brevo.com',
        smtpPort: 587,
        smtpSecure: false,
        smtpUsername: doc.smtpUsername,
        smtpPasswordMasked: doc.smtpPasswordEncrypted ? '••••••••••••' : '',
        apiKeyMasked: '',
        passwordConfigured: Boolean(doc.smtpPasswordEncrypted),
        apiKeyConfigured: false,
        status: doc.status,
        verified: doc.verified,
        enabled: doc.enabled,
        lastTestedAt: doc.lastTestedAt,
        lastTestResult: doc.lastTestResult
    };
}

/**
 * Apply validated fields. Credential / sender changes clear verification
 * so live mail stays off until Test Email succeeds.
 */
function applySecrets(doc, body, { activate = false } = {}) {
    const prev = {
        senderEmail: doc.senderEmail,
        smtpUsername: doc.smtpUsername,
        hadPassword: Boolean(doc.smtpPasswordEncrypted)
    };

    doc.provider = 'brevo';
    doc.authMode = 'smtp';
    doc.smtpHost = 'smtp-relay.brevo.com';
    doc.smtpPort = 587;
    doc.smtpSecure = false;

    if (body.senderName !== undefined) doc.senderName = String(body.senderName || '').trim();
    if (body.senderEmail !== undefined) doc.senderEmail = String(body.senderEmail || '').trim().toLowerCase();
    if (body.replyToEmail !== undefined) {
        doc.replyToEmail = String(body.replyToEmail || '').trim().toLowerCase();
    }
    if (body.smtpUsername !== undefined) doc.smtpUsername = String(body.smtpUsername || '').trim();

    let passwordChanged = false;
    if (body.smtpPassword && !String(body.smtpPassword).includes('•')) {
        doc.smtpPasswordEncrypted = encrypt(String(body.smtpPassword).trim());
        passwordChanged = true;
    }

    const hasSmtp = doc.smtpUsername && doc.smtpPasswordEncrypted;
    const hasSender = doc.senderName && doc.senderEmail;
    const complete = hasSender && hasSmtp;

    const identityChanged =
        passwordChanged
        || (prev.senderEmail && doc.senderEmail !== prev.senderEmail)
        || (prev.smtpUsername && doc.smtpUsername !== prev.smtpUsername)
        || (passwordChanged && prev.hadPassword);

    if (!complete) {
        doc.enabled = false;
        doc.verified = false;
        doc.status = 'disabled';
        return { complete: false, identityChanged };
    }

    if (activate) {
        doc.verified = true;
        doc.status = 'verified';
        doc.enabled = true;
        return { complete: true, identityChanged: false };
    }

    // Save path: store credentials but do not send until verified
    if (identityChanged || !doc.verified) {
        doc.verified = false;
        doc.enabled = false;
        doc.status = 'configured';
    } else if (doc.verified) {
        doc.status = 'verified';
        doc.enabled = true;
    } else {
        doc.status = 'configured';
        doc.enabled = false;
    }

    return { complete: true, identityChanged };
}

function buildDraft(doc, body) {
    const draft = doc ? doc.toObject() : { enabled: true, status: 'verified' };
    const tmp = { ...draft };
    if (body.smtpPassword && !String(body.smtpPassword).includes('•')) {
        tmp.smtpPasswordEncrypted = encrypt(String(body.smtpPassword).trim());
    }
    Object.assign(tmp, {
        provider: 'brevo',
        authMode: 'smtp',
        senderName: body.senderName ?? tmp.senderName,
        senderEmail: String(body.senderEmail ?? tmp.senderEmail ?? '').trim().toLowerCase(),
        replyToEmail: String(body.replyToEmail ?? tmp.replyToEmail ?? '').trim().toLowerCase(),
        smtpHost: 'smtp-relay.brevo.com',
        smtpPort: 587,
        smtpSecure: false,
        smtpUsername: String(body.smtpUsername ?? tmp.smtpUsername ?? '').trim(),
        enabled: true,
        status: 'verified'
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
        const existingPassword = Boolean(doc?.smtpPasswordEncrypted);
        const validated = validateBrevoPayload(req.body || {}, {
            requirePassword: true,
            existingPassword
        });
        if (!validated.ok) return res.status(400).json({ message: validated.message });
        if (!validated.data.hasNewPassword && !existingPassword) {
            return res.status(400).json({ message: 'SMTP password / key is required' });
        }

        // New password must pass Brevo SMTP verify before we store it
        if (validated.data.hasNewPassword) {
            const probe = await verifySmtpDraft({
                smtpUsername: validated.data.smtpUsername,
                smtpPassword: validated.data.smtpPassword,
                senderEmail: validated.data.senderEmail,
                enabled: true,
                status: 'verified'
            });
            if (!probe.success) {
                return res.status(400).json({ message: probe.message || 'SMTP authentication failed' });
            }
        }

        if (!doc) doc = new MerchantEmailConfig({ merchantId });
        applySecrets(doc, {
            ...req.body,
            ...validated.data,
            smtpPassword: validated.data.hasNewPassword ? validated.data.smtpPassword : undefined
        });
        await doc.save();

        const needsTest = !doc.verified || !doc.enabled;
        res.json({
            success: true,
            message: needsTest
                ? 'SMTP login OK. Send a test email to verify and activate.'
                : 'Email configuration saved',
            config: serializeConfig(doc)
        });
    } catch (error) {
        res.status(500).json({ message: humanizeSmtpError(error.message) });
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
        doc.verified = false;
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
        if (!(await rateLimitOk(`m:${merchantId}`))) {
            return res.status(429).json({ message: 'Too many test emails. Try again in 15 minutes.' });
        }

        const to = String(req.body?.email || req.body?.to || '').trim().toLowerCase();
        if (!to || !isValidEmail(to)) {
            return res.status(400).json({ message: 'A valid recipient email is required' });
        }

        let doc = await MerchantEmailConfig.findOne({ merchantId });
        const existingPassword = Boolean(doc?.smtpPasswordEncrypted);
        const validated = validateBrevoPayload(req.body || {}, {
            requirePassword: true,
            existingPassword
        });
        if (!validated.ok) return res.status(400).json({ message: validated.message });
        if (!validated.data.hasNewPassword && !existingPassword) {
            return res.status(400).json({ message: 'SMTP password / key is required' });
        }

        const bodyForDraft = {
            ...req.body,
            ...validated.data,
            smtpPassword: validated.data.hasNewPassword ? validated.data.smtpPassword : undefined
        };
        const tmp = buildDraft(doc, bodyForDraft);
        const result = await sendTestWithDraft(tmp, to, 'Storify — Test email (Merchant SMTP)');

        if (!doc) doc = new MerchantEmailConfig({ merchantId });
        if (result.success) {
            applySecrets(doc, bodyForDraft, { activate: true });
        } else {
            // Keep previous good password if a new wrong password was tried
            const bodyKeepPass = { ...bodyForDraft };
            if (existingPassword && validated.data.hasNewPassword) {
                delete bodyKeepPass.smtpPassword;
            }
            applySecrets(doc, bodyKeepPass, { activate: false });
            doc.status = 'error';
            doc.verified = false;
            doc.enabled = false;
        }
        doc.lastTestedAt = new Date();
        doc.lastTestResult = result;
        await doc.save();

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message || 'Authentication Failed',
                config: serializeConfig(doc)
            });
        }
        res.json({
            success: true,
            message: 'Email Sent Successfully. Configuration is verified and active.',
            config: serializeConfig(doc)
        });
    } catch (error) {
        res.status(500).json({ message: humanizeSmtpError(error.message) });
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
        const existingPassword = Boolean(doc?.smtpPasswordEncrypted);
        const validated = validateBrevoPayload(req.body || {}, {
            requirePassword: true,
            existingPassword
        });
        if (!validated.ok) return res.status(400).json({ message: validated.message });
        if (!validated.data.hasNewPassword && !existingPassword) {
            return res.status(400).json({ message: 'SMTP password / key is required' });
        }

        if (validated.data.hasNewPassword) {
            const probe = await verifySmtpDraft({
                smtpUsername: validated.data.smtpUsername,
                smtpPassword: validated.data.smtpPassword,
                senderEmail: validated.data.senderEmail,
                enabled: true,
                status: 'verified'
            });
            if (!probe.success) {
                return res.status(400).json({ message: probe.message || 'SMTP authentication failed' });
            }
        }

        if (!doc) {
            doc = new VendorEmailConfig({
                vendorId,
                merchantId: req.headers['x-merchant-id'] || null
            });
        }
        applySecrets(doc, {
            ...req.body,
            ...validated.data,
            smtpPassword: validated.data.hasNewPassword ? validated.data.smtpPassword : undefined
        });
        await doc.save();

        const needsTest = !doc.verified || !doc.enabled;
        res.json({
            success: true,
            message: needsTest
                ? 'SMTP login OK. Send a test email to verify and activate.'
                : 'Email configuration saved',
            config: serializeConfig(doc)
        });
    } catch (error) {
        res.status(500).json({ message: humanizeSmtpError(error.message) });
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
        doc.verified = false;
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
        if (!(await rateLimitOk(`v:${vendorId}`))) {
            return res.status(429).json({ message: 'Too many test emails. Try again in 15 minutes.' });
        }

        const to = String(req.body?.email || req.body?.to || '').trim().toLowerCase();
        if (!to || !isValidEmail(to)) {
            return res.status(400).json({ message: 'A valid recipient email is required' });
        }

        let doc = await VendorEmailConfig.findOne({ vendorId });
        const existingPassword = Boolean(doc?.smtpPasswordEncrypted);
        const validated = validateBrevoPayload(req.body || {}, {
            requirePassword: true,
            existingPassword
        });
        if (!validated.ok) return res.status(400).json({ message: validated.message });
        if (!validated.data.hasNewPassword && !existingPassword) {
            return res.status(400).json({ message: 'SMTP password / key is required' });
        }

        const bodyForDraft = {
            ...req.body,
            ...validated.data,
            smtpPassword: validated.data.hasNewPassword ? validated.data.smtpPassword : undefined
        };
        const tmp = buildDraft(doc, bodyForDraft);
        const result = await sendTestWithDraft(tmp, to, 'Storify — Test email (Vendor SMTP)');

        if (!doc) {
            doc = new VendorEmailConfig({
                vendorId,
                merchantId: req.headers['x-merchant-id'] || null
            });
        }
        if (result.success) {
            applySecrets(doc, bodyForDraft, { activate: true });
        } else {
            const bodyKeepPass = { ...bodyForDraft };
            if (existingPassword && validated.data.hasNewPassword) {
                delete bodyKeepPass.smtpPassword;
            }
            applySecrets(doc, bodyKeepPass, { activate: false });
            doc.status = 'error';
            doc.verified = false;
            doc.enabled = false;
        }
        doc.lastTestedAt = new Date();
        doc.lastTestResult = result;
        await doc.save();

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message || 'Authentication Failed',
                config: serializeConfig(doc)
            });
        }
        res.json({
            success: true,
            message: 'Email Sent Successfully. Configuration is verified and active.',
            config: serializeConfig(doc)
        });
    } catch (error) {
        res.status(500).json({ message: humanizeSmtpError(error.message) });
    }
};

async function listDeliveryLogs({ merchantId = null, vendorId = null, limit = 20 }) {
    const { EmailDeliveryLog } = getEmailConfigModels();
    const filter = {};
    if (vendorId) filter.vendorId = vendorId;
    else if (merchantId) filter.merchantId = merchantId;
    const logs = await EmailDeliveryLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(Math.min(50, Number(limit) || 20))
        .lean();
    return logs.map((l) => ({
        id: l._id,
        to: l.to,
        subject: l.subject,
        event: l.event,
        status: l.status,
        error: l.error || '',
        fromEmail: l.fromEmail || '',
        ownerType: l.ownerType,
        createdAt: l.createdAt
    }));
}

export const listMerchantEmailLogs = async (req, res) => {
    try {
        const merchantId = req.merchant?._id || req.headers['x-merchant-id'];
        if (!merchantId) return res.status(401).json({ message: 'Unauthorized' });
        const logs = await listDeliveryLogs({ merchantId, limit: req.query?.limit });
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const listVendorEmailLogs = async (req, res) => {
    try {
        const vendorId = req.vendor?._id || req.headers['x-vendor-id'];
        if (!vendorId) return res.status(401).json({ message: 'Unauthorized' });
        const logs = await listDeliveryLogs({ vendorId, limit: req.query?.limit });
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
