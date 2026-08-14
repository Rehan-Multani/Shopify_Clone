/**
 * Phase 3 — payment verification smoke (no live gateways, no secrets).
 * node services/billing-service/src/utils/paymentVerification.smoke.js
 */
import {
    applyPaymentToggles,
    describeCheckoutAvailability,
    resolveOnlineOwner,
    paidOnceGuard,
} from '../services/checkoutOptionsPolicy.js';
import { CHECKOUT_READY_GATEWAYS, SUPPORTED_GATEWAYS } from '../constants/gateways.js';
import { applyEmailRoute, EMAIL_ROUTE } from '../../../shared/emailEvents.js';

const assert = (c, m) => { if (!c) throw new Error(m); };

const razorpay = { gateway: 'razorpay', name: 'Razorpay' };
const payu = { gateway: 'payu', name: 'PayU' };
const cod = { gateway: 'cod', name: 'Cash on Delivery' };

// Online + COD together
{
    const opts = applyPaymentToggles([razorpay, cod], { onlineEnabled: true, codEnabled: true });
    assert(opts.some((o) => o.gateway === 'razorpay') && opts.some((o) => o.gateway === 'cod'), 'online+cod');
}

// COD only when no gateway
{
    const opts = applyPaymentToggles([cod], { onlineEnabled: true, codEnabled: true });
    assert(opts.length === 1 && opts[0].gateway === 'cod', 'cod only');
}

// Online only when COD disabled
{
    const opts = applyPaymentToggles([razorpay, payu, cod], { onlineEnabled: true, codEnabled: false });
    assert(opts.every((o) => o.gateway !== 'cod') && opts.length === 2, 'online only');
}

// Both unavailable → clear error
{
    const opts = applyPaymentToggles([razorpay, cod], { onlineEnabled: false, codEnabled: false });
    const d = describeCheckoutAvailability(opts);
    assert(d.code === 'NO_PAYMENT_METHODS' && !d.hasCod && !d.hasOnline, 'no methods error');
}

// Platform-disabled gateway not in checkout-ready list still excluded at checkout
assert(CHECKOUT_READY_GATEWAYS.includes('razorpay'), 'razorpay ready');
assert(!CHECKOUT_READY_GATEWAYS.includes('stripe'), 'stripe not checkout-ready');
assert(SUPPORTED_GATEWAYS.includes('stripe'), 'stripe still configurable in admin');

// Owner chain
assert(resolveOnlineOwner({
    isMultiVendor: true, vendorId: 'v', vendorHasGateway: true, merchantHasGateway: true,
}).ownerType === 'vendor', 'vendor first');

assert(resolveOnlineOwner({
    isMultiVendor: true, vendorId: 'v', vendorHasGateway: false, merchantHasGateway: true,
}).fallback === true && resolveOnlineOwner({
    isMultiVendor: true, vendorId: 'v', vendorHasGateway: false, merchantHasGateway: true,
}).ownerType === 'merchant', 'merchant fallback');

assert(resolveOnlineOwner({
    isMultiVendor: false, vendorId: null, vendorHasGateway: false, merchantHasGateway: true,
}).ownerType === 'merchant', 'SV merchant');

assert(resolveOnlineOwner({
    isMultiVendor: true, vendorId: 'v', vendorHasGateway: false, merchantHasGateway: false,
}).error === 'NO_GATEWAY_AVAILABLE', 'no online keys');

// Duplicate paid
{
    const first = paidOnceGuard(false);
    const replay = paidOnceGuard(true);
    assert(first.captureRevenue && first.emitPaymentEmail, 'first paid');
    assert(replay.skipDuplicatePaid && !replay.captureRevenue && !replay.emitPaymentEmail, 'replay');
}

// Payment email is order-owner routed, not inside gateway adapters
{
    const r = applyEmailRoute({ event: 'customer_payment_success', merchantId: 'm', vendorId: 'v' });
    assert(r.route === EMAIL_ROUTE.ORDER && r.vendorId === 'v', 'payment email order route');
}

console.log(JSON.stringify({
    ok: true,
    suite: 'paymentVerification.smoke',
    certified: [
        'online_plus_cod',
        'cod_only',
        'online_only',
        'no_methods_error',
        'vendor_then_merchant_fallback',
        'sv_merchant_only',
        'paid_once_guard',
        'payment_email_not_in_gateway',
    ],
}, null, 2));
console.log('paymentVerification.smoke.js — PASS');
