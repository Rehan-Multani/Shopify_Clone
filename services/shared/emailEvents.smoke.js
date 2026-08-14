/**
 * Phase 2 routing smoke — no SMTP required.
 * node services/shared/emailEvents.smoke.js
 */
import {
    applyEmailRoute,
    getEmailRoute,
    statusEmailEvent,
    EMAIL_ROUTE,
} from './emailEvents.js';
import { ownerFromOrder } from './emailService.js';
import { orderStatusEmail, customerSignupEmail } from './storefrontEmails.js';

const assert = (c, m) => { if (!c) throw new Error(m); };

assert(getEmailRoute('customer_signup') === EMAIL_ROUTE.MERCHANT, 'customer signup merchant');
assert(getEmailRoute('customer_order_confirmation') === EMAIL_ROUTE.ORDER, 'order route');
assert(getEmailRoute('merchant_signup') === EMAIL_ROUTE.PLATFORM, 'merchant signup platform');
assert(getEmailRoute('vendor_signup') === EMAIL_ROUTE.PLATFORM, 'vendor signup platform');
assert(getEmailRoute('payment_success') === EMAIL_ROUTE.PLATFORM, 'billing platform');

const plat = applyEmailRoute({
    event: 'merchant_signup',
    merchantId: 'm1',
    vendorId: 'v1',
});
assert(!plat.merchantId && !plat.vendorId, 'platform strips tenant ids');

const cust = applyEmailRoute({
    event: 'customer_signup',
    merchantId: 'm1',
    vendorId: 'v1',
});
assert(cust.merchantId === 'm1' && !cust.vendorId, 'customer signup ignores vendor');

const ord = applyEmailRoute({
    event: 'customer_order_shipped',
    merchantId: 'm1',
    vendorId: 'v1',
});
assert(ord.merchantId === 'm1' && ord.vendorId === 'v1', 'order keeps vendor');

assert(statusEmailEvent('shipped') === 'customer_order_shipped', 'shipped map');
assert(statusEmailEvent('pending') === null, 'pending no email');
assert(statusEmailEvent('accepted') === 'customer_order_processing', 'accepted processing');

const owner = ownerFromOrder({ merchantId: 'm', vendorId: 'v' });
assert(owner.vendorId === 'v' && owner.merchantId === 'm', 'owner from order');

const signup = customerSignupEmail({ name: 'A', email: 'a@b.com' });
assert(signup.to === 'a@b.com' && signup.subject, 'signup template');

const st = orderStatusEmail({ _id: '507f1f77bcf86cd799439011', customerName: 'A', customerEmail: 'a@b.com' }, 'customer_order_delivered');
assert(st && /delivered/i.test(st.subject), 'delivered template');
assert(orderStatusEmail({ customerEmail: 'a@b.com' }, 'unknown') === null, 'unknown status no mail');

console.log('emailEvents.smoke.js — routing + templates passed');
