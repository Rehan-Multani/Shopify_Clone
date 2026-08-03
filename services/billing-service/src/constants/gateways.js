export const SUPPORTED_GATEWAYS = ['razorpay', 'stripe', 'payu', 'cashfree'];

/** Gateways with complete storefront checkout + verify (hide incomplete from customers). */
export const CHECKOUT_READY_GATEWAYS = ['razorpay', 'payu'];

export const GATEWAY_META = {
    razorpay: {
        id: 'razorpay',
        name: 'Razorpay',
        description: 'UPI, Cards, Netbanking & Wallets (India)',
        credentialFields: [
            { key: 'keyId', label: 'Key ID', type: 'text', secret: false, required: true },
            { key: 'keySecret', label: 'Key Secret', type: 'password', secret: true, required: true },
            { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', secret: true, required: false }
        ],
        defaultCurrency: 'INR'
    },
    stripe: {
        id: 'stripe',
        name: 'Stripe',
        description: 'Cards, Apple Pay, Google Pay & international payments',
        credentialFields: [
            { key: 'publishableKey', label: 'Publishable Key', type: 'text', secret: false, required: true },
            { key: 'secretKey', label: 'Secret Key', type: 'password', secret: true, required: true },
            { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', secret: true, required: false }
        ],
        defaultCurrency: 'INR'
    },
    payu: {
        id: 'payu',
        name: 'PayU',
        description: 'Cards, UPI, Netbanking & EMI (India)',
        credentialFields: [
            { key: 'merchantKey', label: 'Merchant Key', type: 'text', secret: false, required: true },
            { key: 'merchantSalt', label: 'Merchant Salt', type: 'password', secret: true, required: true }
        ],
        defaultCurrency: 'INR'
    },
    cashfree: {
        id: 'cashfree',
        name: 'Cashfree',
        description: 'UPI, Cards & Instant settlements',
        credentialFields: [
            { key: 'appId', label: 'App ID', type: 'text', secret: false, required: true },
            { key: 'secretKey', label: 'Secret Key', type: 'password', secret: true, required: true },
            { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', secret: true, required: false }
        ],
        defaultCurrency: 'INR'
    }
};

export const PAYMENT_MODES = ['merchant', 'vendor', 'split'];

export const ENVIRONMENTS = ['sandbox', 'production'];

export function isSupportedGateway(gateway) {
    return SUPPORTED_GATEWAYS.includes(String(gateway || '').toLowerCase());
}

export function isCheckoutReadyGateway(gateway) {
    return CHECKOUT_READY_GATEWAYS.includes(String(gateway || '').toLowerCase());
}

export function getRequiredCredentialKeys(gateway) {
    const meta = GATEWAY_META[gateway];
    if (!meta) return [];
    return meta.credentialFields.filter((f) => f.required).map((f) => f.key);
}

export function validateCredentialsPayload(gateway, credentials = {}) {
    const required = getRequiredCredentialKeys(gateway);
    const missing = required.filter((key) => !credentials[key] || String(credentials[key]).trim() === '');
    return { valid: missing.length === 0, missing };
}
