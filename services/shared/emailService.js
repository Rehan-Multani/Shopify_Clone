/**
 * EmailService — event emit + owner routing.
 * Never throws to callers. Never coupled to Shiprocket / payment adapters.
 *
 * Owner-only SMTP: vendor XOR merchant XOR platform. No cross-tenant fallback.
 * If the intended owner has no SMTP configured, the send is skipped.
 */
import { enqueueTransactionalEmail } from './transactionalEmail.js';
import { applyEmailRoute } from './emailEvents.js';

/**
 * Fire-and-forget transactional email.
 * @returns {{ queued?: boolean, skipped?: boolean, reason?: string }}
 */
export function emitEmail({
    event = 'transactional',
    to,
    subject,
    text,
    html,
    merchantId = null,
    vendorId = null,
} = {}) {
    try {
        if (!to || !subject) {
            return { skipped: true, reason: 'NO_RECIPIENT_OR_SUBJECT' };
        }
        const routed = applyEmailRoute({ event, merchantId, vendorId });
        // ORDER with neither owner → nothing to send
        if (
            routed.route !== 'platform'
            && !routed.merchantId
            && !routed.vendorId
        ) {
            return { skipped: true, reason: 'NO_EMAIL_OWNER', route: routed.route };
        }
        enqueueTransactionalEmail({
            to,
            subject,
            text,
            html,
            merchantId: routed.merchantId,
            vendorId: routed.vendorId,
            event,
        });
        return { queued: true, route: routed.route };
    } catch (err) {
        console.error('[email-service]', event, err.message);
        return { skipped: true, reason: err.message };
    }
}

/**
 * Resolve owner ids from an order document (MV vendor → merchant).
 */
export function ownerFromOrder(order) {
    if (!order) return { merchantId: null, vendorId: null };
    return {
        merchantId: order.merchantId || null,
        vendorId: order.vendorId || null,
    };
}

export default { emitEmail, ownerFromOrder };
