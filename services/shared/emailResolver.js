/**
 * Owner-only SMTP send — no cross-tenant fallback.
 *
 * Intended owner:
 *   vendorId set  → vendor SMTP only (skip if missing/fails)
 *   merchantId set → merchant SMTP only (skip if missing/fails)
 *   neither        → platform SMTP (env, then PlatformSetting DB)
 */
import nodemailer from 'nodemailer';
import { decrypt } from './encryption.js';
import { redisQueuePush, redisQueuePop, initSharedRedis } from './redisLite.js';

let platformSmtpCache = { at: 0, value: null };

export function humanizeSmtpError(err) {
    const raw = String(err?.message || err || 'SMTP error');
    const lower = raw.toLowerCase();
    if (lower.includes('invalid login') || lower.includes('authentication failed') || lower.includes('535')) {
        return 'Brevo SMTP login failed. Check SMTP username and SMTP key (not the API v3 key).';
    }
    if (lower.includes('sender') && (lower.includes('not verified') || lower.includes('unverified'))) {
        return 'Sender email is not verified in Brevo. Verify the sender or domain in Brevo → Senders.';
    }
    if (lower.includes('daily') || lower.includes('quota') || lower.includes('limit')) {
        return 'Brevo sending limit reached. Check your Brevo plan / daily quota.';
    }
    if (lower.includes('relay') || lower.includes('not allowed')) {
        return 'Brevo rejected this sender. Confirm the From address is allowed for your SMTP account.';
    }
    if (lower.includes('enotfound') || lower.includes('econnrefused') || lower.includes('etimedout')) {
        return 'Could not reach Brevo SMTP (smtp-relay.brevo.com). Check network / firewall.';
    }
    return raw;
}

async function loadPlatformSmtpFromDb() {
    const now = Date.now();
    if (platformSmtpCache.value && now - platformSmtpCache.at < 60_000) {
        return platformSmtpCache.value;
    }
    try {
        const mongoose = (await import('mongoose')).default;
        if (mongoose.connection?.readyState !== 1) return null;
        const doc = await mongoose.connection.collection('platformsettings').findOne(
            {},
            { projection: {
                platformSmtpHost: 1,
                platformSmtpPort: 1,
                platformSmtpUser: 1,
                platformSmtpPassEncrypted: 1,
                platformSmtpFrom: 1,
                platformSmtpEnabled: 1
            } }
        );
        if (!doc || doc.platformSmtpEnabled === false) {
            platformSmtpCache = { at: now, value: null };
            return null;
        }
        const user = doc.platformSmtpUser || '';
        const pass = doc.platformSmtpPassEncrypted ? decrypt(doc.platformSmtpPassEncrypted) : '';
        if (!user || !pass) {
            platformSmtpCache = { at: now, value: null };
            return null;
        }
        const value = {
            host: doc.platformSmtpHost || 'smtp-relay.brevo.com',
            port: Number(doc.platformSmtpPort) || 587,
            user,
            pass,
            from: doc.platformSmtpFrom || '"Storify" <noreply@storify.com>'
        };
        platformSmtpCache = { at: now, value };
        return value;
    } catch {
        return null;
    }
}

export function clearPlatformSmtpCache() {
    platformSmtpCache = { at: 0, value: null };
}

async function platformTransport() {
    const envUser = process.env.SMTP_USER || '';
    const envPass = process.env.SMTP_PASS || '';
    let host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    let port = parseInt(process.env.SMTP_PORT || '587', 10);
    let user = envUser;
    let pass = envPass;
    let from = process.env.SMTP_FROM || '"Storify" <noreply@storify.com>';

    if (!user || !pass) {
        const db = await loadPlatformSmtpFromDb();
        if (db) {
            host = db.host;
            port = db.port;
            user = db.user;
            pass = db.pass;
            from = db.from || from;
        }
    }

    if (!user || !pass) return null;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
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
    if (doc.status !== 'verified') return null;

    let user = doc.smtpUsername || '';
    let pass = doc.smtpPasswordEncrypted ? decrypt(doc.smtpPasswordEncrypted) : '';
    const host = 'smtp-relay.brevo.com';
    const port = 587;
    const secure = false;

    if (!pass && doc.apiKeyEncrypted) {
        pass = decrypt(doc.apiKeyEncrypted);
        if (!user) user = doc.smtpUsername || doc.senderEmail;
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

async function markOwnerSmtpBroken(models, { vendorId, merchantId }, errMessage) {
    try {
        const patch = {
            status: 'error',
            verified: false,
            enabled: false,
            lastTestedAt: new Date(),
            lastTestResult: {
                success: false,
                message: humanizeSmtpError(errMessage)
            }
        };
        if (vendorId && models.VendorEmailConfig) {
            await models.VendorEmailConfig.updateOne({ vendorId }, { $set: patch });
        } else if (merchantId && models.MerchantEmailConfig) {
            await models.MerchantEmailConfig.updateOne({ merchantId }, { $set: patch });
        }
    } catch (e) {
        console.error('[email-resolver] failed to mark SMTP error:', e.message);
    }
}

function skipError(message, chain = []) {
    return Object.assign(new Error(message), {
        code: 'EMAIL_SKIPPED',
        skipped: true,
        fallbackChain: chain,
        fallbackUsed: false
    });
}

function sendFailError(message, chain = []) {
    return Object.assign(new Error(humanizeSmtpError(message)), {
        code: 'EMAIL_SEND_FAILED',
        skipped: false,
        fallbackChain: chain,
        fallbackUsed: false
    });
}

/** Resolve which single owner should send — never cascades. Only verified SMTP. */
export async function resolveEmailSender(ctx = {}, models = {}) {
    const { vendorId, merchantId } = ctx;
    const { MerchantEmailConfig, VendorEmailConfig } = models;

    if (vendorId && VendorEmailConfig) {
        const vdoc = await VendorEmailConfig.findOne({
            vendorId,
            enabled: true,
            status: 'verified'
        });
        const v = await buildFromDoc(vdoc, 'vendor');
        if (v) return { ...v, fallbackChain: ['vendor'], fallbackUsed: false };
        return null;
    }

    if (merchantId && MerchantEmailConfig) {
        const mdoc = await MerchantEmailConfig.findOne({
            merchantId,
            enabled: true,
            status: 'verified'
        });
        const m = await buildFromDoc(mdoc, 'merchant');
        if (m) return { ...m, fallbackChain: ['merchant'], fallbackUsed: false };
        return null;
    }

    const platform = await platformTransport();
    if (platform) return { ...platform, fallbackChain: ['platform'], fallbackUsed: false };
    return null;
}

/**
 * Send using only the intended owner's SMTP.
 */
export async function sendWithResolver({
    to, subject, text, html, vendorId = null, merchantId = null, models = {}
}) {
    const chain = [];

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
                fallbackUsed: false
            };
        } catch (err) {
            chain.push(`${label}:fail`);
            const nice = humanizeSmtpError(err);
            console.error(`[email-resolver] ${label} failed:`, nice);
            if (label === 'vendor' || label === 'merchant') {
                await markOwnerSmtpBroken(models, { vendorId, merchantId }, nice);
            }
            throw sendFailError(nice, chain);
        }
    };

    if (vendorId) {
        if (!models.VendorEmailConfig) {
            throw skipError('Email skipped — vendor SMTP not available', ['vendor:skip']);
        }
        const vdoc = await models.VendorEmailConfig.findOne({
            vendorId, enabled: true, status: 'verified'
        });
        const v = await buildFromDoc(vdoc, 'vendor');
        if (!v) {
            throw skipError('Email skipped — vendor SMTP not configured or not verified', ['vendor:skip']);
        }
        return trySend(v, 'vendor');
    }

    if (merchantId) {
        if (!models.MerchantEmailConfig) {
            throw skipError('Email skipped — merchant SMTP not available', ['merchant:skip']);
        }
        const mdoc = await models.MerchantEmailConfig.findOne({
            merchantId, enabled: true, status: 'verified'
        });
        const m = await buildFromDoc(mdoc, 'merchant');
        if (!m) {
            throw skipError('Email skipped — merchant SMTP not configured or not verified', ['merchant:skip']);
        }
        return trySend(m, 'merchant');
    }

    const platform = await platformTransport();
    if (!platform) {
        throw skipError(
            'Email skipped — platform SMTP not configured (set SMTP_USER/SMTP_PASS or Super Admin → Email)',
            ['platform:skip']
        );
    }
    return trySend(platform, 'platform');
}

let queueHandler = null;
let draining = false;

export function setEmailQueueHandler(fn) {
    queueHandler = fn;
}

async function drainQueueOnce() {
    if (draining || !queueHandler) return;
    draining = true;
    try {
        // Process up to 20 jobs per tick
        for (let i = 0; i < 20; i += 1) {
            const job = await redisQueuePop();
            if (!job) break;
            try {
                await queueHandler(job);
            } catch (e) {
                console.error('[email-queue]', e.message);
            }
        }
    } finally {
        draining = false;
    }
}

export async function enqueueEmailJob(payload) {
    await redisQueuePush({
        ...payload,
        enqueuedAt: new Date().toISOString()
    });
    setImmediate(() => drainQueueOnce());
    return { queued: true };
}

/** @deprecated use enqueueEmailJob(payload) */
export function enqueueEmail(taskFn) {
    if (typeof taskFn === 'function') {
        setImmediate(async () => {
            try { await taskFn(); } catch (e) { console.error('[email-queue]', e.message); }
        });
        return { queued: true };
    }
    return enqueueEmailJob(taskFn);
}

export function startEmailQueueWorker() {
    initSharedRedis().finally(() => {
        setInterval(() => drainQueueOnce(), 2000);
        setImmediate(() => drainQueueOnce());
    });
}

export async function testSmtpConnection(docLike) {
    const built = await buildFromDoc({ ...docLike, enabled: true, status: 'verified' }, 'merchant');
    if (!built) return { success: false, message: 'Incomplete SMTP configuration' };
    try {
        await built.transporter.verify();
        return { success: true, message: 'SMTP connection verified successfully' };
    } catch (err) {
        return { success: false, message: humanizeSmtpError(err) };
    }
}

/**
 * Live SMTP verify for a draft (used on Save when password changes).
 */
export async function verifySmtpDraft(docLike) {
    const user = docLike.smtpUsername || '';
    let pass = docLike.smtpPasswordEncrypted ? decrypt(docLike.smtpPasswordEncrypted) : (docLike.smtpPassword || '');
    if (!user || !pass || !docLike.senderEmail) {
        return { success: false, message: 'Incomplete SMTP configuration' };
    }
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: { user, pass }
        });
        await transporter.verify();
        return { success: true, message: 'SMTP login accepted by Brevo' };
    } catch (err) {
        return { success: false, message: humanizeSmtpError(err) };
    }
}

export { platformTransport, formatFrom, buildFromDoc };
