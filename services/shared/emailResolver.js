/**
 * Simplified sendWithResolver — try vendor, then merchant, then platform.
 */
import nodemailer from 'nodemailer';
import { decrypt } from './encryption.js';

function platformTransport() {
    const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';
    const from = process.env.SMTP_FROM || '"Storify" <noreply@storify.com>';
    if (!user || !pass) return null;
    return {
        ownerType: 'platform',
        ownerId: null,
        senderName: 'Storify',
        senderEmail: (from.match(/<([^>]+)>/) || [])[1] || from,
        replyTo: null,
        fromHeader: from,
        transporter: nodemailer.createTransport({
            host, port, secure, auth: { user, pass }
        })
    };
}

function formatFrom(name, email) {
    return `"${String(name || 'Store').replace(/"/g, '')}" <${email}>`;
}

async function buildFromDoc(doc, ownerType) {
    if (!doc?.enabled || !doc.senderEmail) return null;
    if (doc.status === 'disabled') return null;

    const authMode = doc.authMode || 'smtp';
    let user = doc.smtpUsername || '';
    let pass = doc.smtpPasswordEncrypted ? decrypt(doc.smtpPasswordEncrypted) : '';
    let host = doc.smtpHost || 'smtp-relay.brevo.com';
    let port = Number(doc.smtpPort) || 587;
    let secure = !!doc.smtpSecure;

    if (authMode === 'api') {
        const apiKey = doc.apiKeyEncrypted ? decrypt(doc.apiKeyEncrypted) : '';
        if (!apiKey) return null;
        pass = apiKey;
        if (!user) user = doc.smtpUsername || doc.senderEmail;
        host = host || 'smtp-relay.brevo.com';
        port = 587;
        secure = false;
    }

    if (!user || !pass) return null;

    return {
        ownerType,
        ownerId: doc.vendorId || doc.merchantId || null,
        senderName: doc.senderName || 'Store',
        senderEmail: doc.senderEmail,
        replyTo: doc.replyToEmail || doc.senderEmail,
        fromHeader: formatFrom(doc.senderName || 'Store', doc.senderEmail),
        transporter: nodemailer.createTransport({
            host, port, secure, auth: { user, pass }
        })
    };
}

export async function resolveEmailSender(ctx = {}, models = {}) {
    const { vendorId, merchantId } = ctx;
    const { MerchantEmailConfig, VendorEmailConfig } = models;

    if (vendorId && VendorEmailConfig) {
        const vdoc = await VendorEmailConfig.findOne({
            vendorId,
            enabled: true,
            status: { $in: ['configured', 'verified'] }
        });
        const v = await buildFromDoc(vdoc, 'vendor');
        if (v) return { ...v, fallbackChain: ['vendor'] };
    }

    if (merchantId && MerchantEmailConfig) {
        const mdoc = await MerchantEmailConfig.findOne({
            merchantId,
            enabled: true,
            status: { $in: ['configured', 'verified'] }
        });
        const m = await buildFromDoc(mdoc, 'merchant');
        if (m) return { ...m, fallbackChain: ['merchant'] };
    }

    const platform = platformTransport();
    if (platform) return { ...platform, fallbackChain: ['platform'] };
    return null;
}

export async function sendWithResolver({
    to, subject, text, html, vendorId = null, merchantId = null, models = {}
}) {
    const chain = [];
    const errors = [];

    const trySend = async (resolved, label) => {
        if (!resolved) return null;
        try {
            const info = await resolved.transporter.sendMail({
                from: resolved.fromHeader,
                to,
                subject,
                text,
                html,
                replyTo: resolved.replyTo || undefined
            });
            chain.push(label);
            return {
                success: true,
                info,
                ownerType: resolved.ownerType,
                from: resolved.fromHeader,
                fallbackChain: [...chain],
                fallbackUsed: label !== (vendorId ? 'vendor' : merchantId ? 'merchant' : 'platform')
                    && !(label === 'platform' && !vendorId && !merchantId)
            };
        } catch (err) {
            chain.push(`${label}:fail`);
            errors.push(err);
            console.error(`[email-resolver] ${label} failed:`, err.message);
            return null;
        }
    };

    // 1) Vendor
    if (vendorId && models.VendorEmailConfig) {
        const vdoc = await models.VendorEmailConfig.findOne({
            vendorId, enabled: true, status: { $in: ['configured', 'verified'] }
        });
        const v = await buildFromDoc(vdoc, 'vendor');
        const ok = await trySend(v, 'vendor');
        if (ok) return ok;
    }

    // 2) Merchant
    if (merchantId && models.MerchantEmailConfig) {
        const mdoc = await models.MerchantEmailConfig.findOne({
            merchantId, enabled: true, status: { $in: ['configured', 'verified'] }
        });
        const m = await buildFromDoc(mdoc, 'merchant');
        const ok = await trySend(m, 'merchant');
        if (ok) {
            ok.fallbackUsed = !!vendorId;
            return ok;
        }
    }

    // 3) Platform
    const platform = platformTransport();
    const ok = await trySend(platform, 'platform');
    if (ok) {
        ok.fallbackUsed = !!(vendorId || merchantId);
        return ok;
    }

    throw Object.assign(
        new Error(errors[errors.length - 1]?.message || 'Email sending failed — no working SMTP'),
        { code: 'EMAIL_SEND_FAILED', fallbackChain: chain }
    );
}

const memoryQueue = [];
let draining = false;

async function drain() {
    if (draining) return;
    draining = true;
    while (memoryQueue.length) {
        const job = memoryQueue.shift();
        try { await job(); } catch (e) { console.error('[email-queue]', e.message); }
    }
    draining = false;
}

export function enqueueEmail(taskFn) {
    memoryQueue.push(taskFn);
    setImmediate(() => drain());
    return { queued: true };
}

export async function testSmtpConnection(docLike) {
    const built = await buildFromDoc({ ...docLike, enabled: true, status: 'configured' }, 'merchant');
    if (!built) return { success: false, message: 'Incomplete SMTP configuration' };
    try {
        await built.transporter.verify();
        // Also try a no-op or just verify is enough
        return { success: true, message: 'SMTP connection verified successfully' };
    } catch (err) {
        return { success: false, message: err.message || 'SMTP authentication failed' };
    }
}

export { platformTransport, formatFrom, buildFromDoc };

