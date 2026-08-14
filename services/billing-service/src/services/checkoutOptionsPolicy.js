/**
 * Pure checkout payment policy — no DB, no secrets.
 * Used by getPaymentOptions and Phase 3 verification smoke.
 */

export function applyPaymentToggles(options, { onlineEnabled = true, codEnabled = true } = {}) {
    return (options || []).filter((opt) => {
        if (opt.gateway === 'cod') return codEnabled !== false;
        return onlineEnabled !== false;
    });
}

export function describeCheckoutAvailability(options) {
    const list = options || [];
    const hasCod = list.some((o) => o.gateway === 'cod');
    const hasOnline = list.some((o) => o.gateway && o.gateway !== 'cod');
    if (!list.length) {
        return {
            code: 'NO_PAYMENT_METHODS',
            message: 'No payment methods are available. Enable Cash on Delivery or configure an online payment gateway.',
            hasCod: false,
            hasOnline: false,
        };
    }
    return { code: null, message: null, hasCod, hasOnline };
}

/**
 * Who collects online payment (COD is independent and not represented here).
 */
export function resolveOnlineOwner({ isMultiVendor, vendorId, vendorHasGateway, merchantHasGateway }) {
    if (isMultiVendor && vendorId) {
        if (vendorHasGateway) return { ownerType: 'vendor', fallback: false };
        if (merchantHasGateway) return { ownerType: 'merchant', fallback: true };
        return { ownerType: null, fallback: false, error: 'NO_GATEWAY_AVAILABLE' };
    }
    if (merchantHasGateway) return { ownerType: 'merchant', fallback: false };
    return { ownerType: null, fallback: false, error: 'NO_GATEWAY_AVAILABLE' };
}

/** Duplicate capture guard used by markOrderPaid. */
export function paidOnceGuard(wasPaid) {
    return {
        captureRevenue: !wasPaid,
        emitPaymentEmail: !wasPaid,
        skipDuplicatePaid: !!wasPaid,
    };
}

export default {
    applyPaymentToggles,
    describeCheckoutAvailability,
    resolveOnlineOwner,
    paidOnceGuard,
};
