/**
 * Central transactional email events + routing policy.
 * Does not send mail. Used by EmailService.
 *
 * Routes (owner-only SMTP — no cross-tenant fallback):
 *   platform  — platform env SMTP only (SaaS signup, billing, portal OTP)
 *   merchant  — merchant SMTP only (customer signup / store mails)
 *   order     — vendor SMTP if vendorId, else merchant SMTP only
 */

export const EMAIL_ROUTE = {
    PLATFORM: 'platform',
    MERCHANT: 'merchant',
    ORDER: 'order',
};

export const EMAIL_EVENTS = {
    // Platform tenants
    merchant_signup: {
        route: EMAIL_ROUTE.PLATFORM,
        label: 'Merchant account welcome',
    },
    vendor_signup: {
        route: EMAIL_ROUTE.PLATFORM,
        label: 'Vendor account welcome',
    },
    signup_welcome: {
        route: EMAIL_ROUTE.PLATFORM,
        label: 'Merchant signup (legacy id)',
    },
    store_created: { route: EMAIL_ROUTE.PLATFORM, label: 'Store created' },
    payment_success: { route: EMAIL_ROUTE.PLATFORM, label: 'Plan payment success' },
    store_payment_success: { route: EMAIL_ROUTE.PLATFORM, label: 'Store + plan payment' },
    theme_purchase_success: { route: EMAIL_ROUTE.PLATFORM, label: 'Theme purchase' },
    password_changed: { route: EMAIL_ROUTE.PLATFORM, label: 'Merchant password changed' },
    support_admin_reply: { route: EMAIL_ROUTE.PLATFORM, label: 'Support reply' },
    // Forgot-password OTP — always admin / platform env SMTP (never tenant config)
    forgot_password_otp: { route: EMAIL_ROUTE.PLATFORM, label: 'Forgot password OTP' },

    // Storefront customer
    customer_signup: {
        route: EMAIL_ROUTE.MERCHANT,
        label: 'Customer welcome / account created',
    },

    // Order lifecycle (owner-only: vendor XOR merchant)
    customer_order_confirmation: {
        route: EMAIL_ROUTE.ORDER,
        label: 'Order confirmation (COD placed / online paid)',
    },
    customer_payment_success: {
        route: EMAIL_ROUTE.ORDER,
        label: 'Customer payment captured',
    },
    customer_order_processing: {
        route: EMAIL_ROUTE.ORDER,
        label: 'Order confirmed / processing',
    },
    customer_order_shipped: {
        route: EMAIL_ROUTE.ORDER,
        label: 'Order shipped',
    },
    customer_order_out_for_delivery: {
        route: EMAIL_ROUTE.ORDER,
        label: 'Out for delivery',
    },
    customer_order_delivered: {
        route: EMAIL_ROUTE.ORDER,
        label: 'Order delivered',
    },
    customer_order_cancelled: {
        route: EMAIL_ROUTE.ORDER,
        label: 'Order cancelled',
    },
    customer_order_refunded: {
        route: EMAIL_ROUTE.ORDER,
        label: 'Order refunded',
    },
};

/** Existing store-service statuses that may emit a customer email. */
export const ORDER_STATUS_EMAIL_MAP = {
    accepted: 'customer_order_processing',
    shipped: 'customer_order_shipped',
    out_for_delivery: 'customer_order_out_for_delivery',
    delivered: 'customer_order_delivered',
    cancelled: 'customer_order_cancelled',
};

export const isKnownEmailEvent = (event) => Boolean(EMAIL_EVENTS[event]);

export const getEmailRoute = (event) => EMAIL_EVENTS[event]?.route || EMAIL_ROUTE.ORDER;

/**
 * Apply routing policy to owner ids. Never invents ids.
 */
export const applyEmailRoute = ({ event, merchantId = null, vendorId = null } = {}) => {
    const route = getEmailRoute(event);
    if (route === EMAIL_ROUTE.PLATFORM) {
        return { route, merchantId: null, vendorId: null };
    }
    if (route === EMAIL_ROUTE.MERCHANT) {
        return { route, merchantId: merchantId || null, vendorId: null };
    }
    // ORDER: exclusive owner — vendor if present, otherwise merchant. Never both.
    if (vendorId) {
        return { route, merchantId: null, vendorId: vendorId || null };
    }
    return {
        route,
        merchantId: merchantId || null,
        vendorId: null,
    };
};

export const statusEmailEvent = (status) => ORDER_STATUS_EMAIL_MAP[String(status || '').toLowerCase()] || null;

export default {
    EMAIL_ROUTE,
    EMAIL_EVENTS,
    ORDER_STATUS_EMAIL_MAP,
    isKnownEmailEvent,
    getEmailRoute,
    applyEmailRoute,
    statusEmailEvent,
};
