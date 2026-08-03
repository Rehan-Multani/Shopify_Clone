import crypto from 'crypto';
import BaseGateway from './BaseGateway.js';

export class CashfreeGateway extends BaseGateway {
    constructor(config) {
        super(config);
        this.gateway = 'cashfree';
        this.appId = this.credentials.appId || '';
        this.secretKey = this.credentials.secretKey || '';
        this.apiBase = this.environment === 'production'
            ? 'https://api.cashfree.com/pg'
            : 'https://sandbox.cashfree.com/pg';
    }

    #headers() {
        return {
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
            'x-api-version': '2023-08-01',
            'Content-Type': 'application/json'
        };
    }

    async testConnection() {
        if (!this.appId || !this.secretKey) {
            return { success: false, message: 'Missing API credentials (App ID / Secret Key)' };
        }
        try {
            // Create a soft probe order that we never complete — better: GET settlements or orders with invalid id returns auth vs 404
            const res = await fetch(`${this.apiBase}/orders/probe_auth_check_${Date.now()}`, {
                method: 'GET',
                headers: this.#headers()
            });
            if (res.status === 401 || res.status === 403) {
                return { success: false, message: 'Invalid Cashfree App ID or Secret Key' };
            }
            // 404 means auth succeeded but order not found — credentials are valid
            if (res.status === 404 || res.ok) {
                return { success: true, message: 'Cashfree connection verified successfully' };
            }
            const data = await res.json().catch(() => ({}));
            if (data?.message && /auth|credential|unauthorized/i.test(data.message)) {
                return { success: false, message: data.message };
            }
            return { success: true, message: 'Cashfree connection verified successfully' };
        } catch (error) {
            return { success: false, message: error.message || 'Failed to reach Cashfree' };
        }
    }

    async createPayment({ amount, currency = 'INR', receipt, notes = {}, customer = {}, returnUrl, notifyUrl }) {
        if (!this.appId || !this.secretKey) {
            throw Object.assign(new Error('Cashfree is not configured'), { code: 'MISSING_CREDENTIALS' });
        }
        const orderId = receipt || `cf_${Date.now()}`;
        const body = {
            order_id: orderId,
            order_amount: Number(Number(amount).toFixed(2)),
            order_currency: 'INR',
            customer_details: {
                customer_id: customer.id || `cust_${Date.now()}`,
                customer_name: customer.name || 'Customer',
                customer_email: customer.email || 'customer@example.com',
                customer_phone: customer.phone || '9999999999'
            },
            order_meta: {
                return_url: returnUrl || undefined,
                notify_url: notifyUrl || undefined
            },
            order_note: notes.note || 'Order Payment'
        };

        const res = await fetch(`${this.apiBase}/orders`, {
            method: 'POST',
            headers: this.#headers(),
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) {
            throw Object.assign(new Error(data?.message || 'Cashfree order creation failed'), {
                code: 'GATEWAY_ERROR',
                details: data
            });
        }

        return {
            gateway: 'cashfree',
            gatewayOrderId: data.order_id || orderId,
            amount: Math.round(Number(amount) * 100),
            currency: 'INR',
            publicKey: this.appId,
            paymentSessionId: data.payment_session_id,
            customer,
            raw: data
        };
    }

    async verifyPayment({ orderId }) {
        if (!orderId) {
            return { success: false, message: 'Missing Cashfree order id' };
        }
        try {
            const res = await fetch(`${this.apiBase}/orders/${orderId}`, {
                method: 'GET',
                headers: this.#headers()
            });
            const data = await res.json();
            if (!res.ok) {
                return { success: false, message: data?.message || 'Cashfree verification failed' };
            }
            const status = String(data.order_status || '').toUpperCase();
            if (status === 'PAID') {
                return { success: true, paymentId: data.cf_order_id || orderId, orderId, raw: data };
            }
            return { success: false, message: `Cashfree order status: ${status || 'UNKNOWN'}` };
        } catch (error) {
            return { success: false, message: error.message || 'Cashfree verification failed' };
        }
    }

    verifyWebhook(rawBody, signature, headers = {}) {
        if (!this.webhookSecret && !this.secretKey) {
            return { valid: false, message: 'Webhook secret not configured' };
        }
        const secret = this.webhookSecret || this.secretKey;
        const timestamp = headers['x-webhook-timestamp'] || headers['x-cashfree-timestamp'] || '';
        const payload = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
        const signedPayload = timestamp ? `${timestamp}${payload}` : payload;
        const expected = crypto
            .createHmac('sha256', secret)
            .update(signedPayload)
            .digest('base64');
        if (expected !== signature) {
            // Also try hex digest variant used by some Cashfree versions
            const expectedHex = crypto
                .createHmac('sha256', secret)
                .update(signedPayload)
                .digest('hex');
            if (expectedHex !== signature) {
                return { valid: false, message: 'Webhook verification failed' };
            }
        }
        return { valid: true };
    }

    getPublicConfig() {
        return {
            ...super.getPublicConfig(),
            appId: this.appId
        };
    }
}

export default CashfreeGateway;
