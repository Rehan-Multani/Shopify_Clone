/**
 * Central transactional email entry — Vendor → Merchant → Platform.
 * Call initTransactionalEmail(mongoose) once from each service's server.js
 * before sending mail (binds models to that service's connected mongoose).
 */

import {
    sendWithResolver,
    enqueueEmail,
    testSmtpConnection,
    resolveEmailSender
} from './emailResolver.js';
import { registerEmailConfigModels } from './emailConfigModels.js';

let models = null;

export function initTransactionalEmail(mongoose) {
    models = registerEmailConfigModels(mongoose);
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
 * Resolve + send immediately (with fallback chain).
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

    const log = await EmailDeliveryLog.create({
        to,
        subject,
        event,
        merchantId: merchantId || null,
        vendorId: vendorId || null,
        status: 'queued'
    });

    try {
        const result = await sendWithResolver({
            to,
            subject,
            text,
            html,
            vendorId,
            merchantId,
            models: { MerchantEmailConfig, VendorEmailConfig },
            event
        });

        log.status = 'sent';
        log.ownerType = result.ownerType;
        log.fromEmail = result.from;
        log.fallbackUsed = !!result.fallbackUsed;
        log.fallbackChain = result.fallbackChain || [];
        await log.save();
        return result;
    } catch (err) {
        log.status = 'failed';
        log.error = err.message || 'send failed';
        log.fallbackChain = err.fallbackChain || [];
        await log.save();
        throw err;
    }
}

/**
 * Queue email (async). Preferred for HTTP handlers.
 */
export function enqueueTransactionalEmail(payload) {
    return enqueueEmail(async () => {
        try {
            await sendTransactionalEmail(payload);
        } catch (err) {
            console.error(`[email] ${payload.event || 'mail'} failed:`, err.message);
        }
    });
}

export async function resolveSenderForContext({ merchantId, vendorId }) {
    const m = requireModels();
    return resolveEmailSender({ merchantId, vendorId }, m);
}

export { testSmtpConnection };
export function getEmailConfigModels() {
    return requireModels();
}
