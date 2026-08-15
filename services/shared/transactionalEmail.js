/**
 * Central transactional email entry — owner-only SMTP (no cross-tenant fallback).
 * Durable queue via Redis when REDIS_URL is set; otherwise in-process memory list.
 */

import {
    sendWithResolver,
    enqueueEmailJob,
    setEmailQueueHandler,
    startEmailQueueWorker,
    testSmtpConnection,
    resolveEmailSender,
    verifySmtpDraft,
    humanizeSmtpError
} from './emailResolver.js';
import { registerEmailConfigModels } from './emailConfigModels.js';
import { applyEmailRoute, EMAIL_ROUTE } from './emailEvents.js';
import { assertCredentialsEncryptionKey } from './encryption.js';

let models = null;

export function initTransactionalEmail(mongoose) {
    try {
        assertCredentialsEncryptionKey();
    } catch (err) {
        console.error('[email]', err.message);
        if (String(process.env.NODE_ENV || '').toLowerCase() === 'production') {
            throw err;
        }
    }
    models = registerEmailConfigModels(mongoose);
    setEmailQueueHandler(async (payload) => {
        await sendTransactionalEmail(payload);
    });
    startEmailQueueWorker();
    return models;
}

function requireModels() {
    if (!models) {
        throw new Error(
            'Transactional email not initialized. Call initTransactionalEmail(mongoose) in server.js after connectDB.'
        );
    }
    return models;
}

/**
 * Resolve + send immediately using only the intended owner's SMTP.
 * Forgot-password / PLATFORM events always strip tenant ids → admin env / platform SMTP.
 */
export async function sendTransactionalEmail({
    to,
    subject,
    text,
    html,
    merchantId = null,
    vendorId = null,
    event = 'transactional'
}) {
    if (!to) throw new Error('Email recipient required');
    const { MerchantEmailConfig, VendorEmailConfig, EmailDeliveryLog } = requireModels();

    const routed = applyEmailRoute({ event, merchantId, vendorId });
    const useMerchantId = routed.route === EMAIL_ROUTE.PLATFORM ? null : routed.merchantId;
    const useVendorId = routed.route === EMAIL_ROUTE.PLATFORM ? null : routed.vendorId;

    const log = await EmailDeliveryLog.create({
        to,
        subject,
        event,
        merchantId: useMerchantId || null,
        vendorId: useVendorId || null,
        status: 'queued'
    });

    try {
        const result = await sendWithResolver({
            to,
            subject,
            text,
            html,
            vendorId: useVendorId,
            merchantId: useMerchantId,
            models: { MerchantEmailConfig, VendorEmailConfig },
            event
        });

        log.status = 'sent';
        log.ownerType = result.ownerType;
        log.fromEmail = result.from;
        log.fallbackUsed = false;
        log.fallbackChain = result.fallbackChain || [];
        await log.save();
        return result;
    } catch (err) {
        const skipped = err.code === 'EMAIL_SKIPPED' || err.skipped;
        log.status = skipped ? 'skipped' : 'failed';
        log.error = humanizeSmtpError(err.message || (skipped ? 'owner SMTP not configured' : 'send failed'));
        log.fallbackUsed = false;
        log.fallbackChain = err.fallbackChain || [];
        await log.save();
        throw err;
    }
}

/**
 * Queue email (async, Redis-backed when available). Preferred for HTTP handlers.
 */
export function enqueueTransactionalEmail(payload) {
    return enqueueEmailJob(payload);
}

export async function resolveSenderForContext({ merchantId, vendorId }) {
    const m = requireModels();
    return resolveEmailSender({ merchantId, vendorId }, m);
}

export { testSmtpConnection, verifySmtpDraft, humanizeSmtpError };
export function getEmailConfigModels() {
    return requireModels();
}
