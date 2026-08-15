import crypto from 'crypto';
import BaseGateway from './BaseGateway.js';

export class StripeGateway extends BaseGateway {
    constructor(config) {
        super(config);
        this.gateway = 'stripe';
        this.publishableKey = this.credentials.publishableKey || '';
        this.secretKey = this.credentials.secretKey || '';
        this.apiBase = 'https://api.stripe.com/v1';
    }

    async #request(path, { method = 'GET', body } = {}) {
        const headers = {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const res = await fetch(`${this.apiBase}${path}`, {
            method,
            headers,
            body: body ? new URLSearchParams(body).toString() : undefined
        });
        const data = await res.json();
        if (!res.ok) {
            const message = data?.error?.message || 'Stripe API request failed';
            const err = new Error(message);
            err.code = data?.error?.code || 'STRIPE_ERROR';
            err.status = res.status;
            throw err;
        }
        return data;
    }

    async testConnection() {
        if (!this.secretKey || !this.publishableKey) {
            return { success: false, message: 'Missing API credentials (Publishable Key / Secret Key)' };
        }
        try {
            await this.#request('/balance');
            return { success: true, message: 'Stripe connection verified successfully' };
        } catch (error) {
            return { success: false, message: error.message || 'Failed authentication with Stripe' };
        }
    }

    async createPayment({ amount, currency = 'INR', receipt, notes = {}, customer = {} }) {
        if (!this.secretKey) {
            throw Object.assign(new Error('Stripe is not configured'), { code: 'MISSING_CREDENTIALS' });
        }
        const amountMinor = Math.round(Number(amount) * 100);
        if (!amountMinor || amountMinor < 50) {
            throw Object.assign(new Error('Amount too small for Stripe'), { code: 'INVALID_AMOUNT' });
        }

        const intent = await this.#request('/payment_intents', {
            method: 'POST',
            body: {
                amount: String(amountMinor),
                currency: 'inr',
                'metadata[receipt]': receipt || '',
                'metadata[store]': notes.storeId || '',
                'automatic_payment_methods[enabled]': 'true',
                ...(customer.email ? { receipt_email: customer.email } : {})
            }
        });

        return {
            gateway: 'stripe',
            gatewayOrderId: intent.id,
            amount: intent.amount,
            currency: 'INR',
            publicKey: this.publishableKey,
            clientSecret: intent.client_secret,
            customer,
            raw: intent
        };
    }

    async verifyPayment({ paymentIntentId }) {
        if (!paymentIntentId) {
            return { success: false, message: 'Missing Stripe payment intent id' };
        }
        try {
            const intent = await this.#request(`/payment_intents/${paymentIntentId}`);
            if (intent.status === 'succeeded') {
                return { success: true, paymentId: intent.id, orderId: intent.id, raw: intent };
            }
            return { success: false, message: `Payment status is ${intent.status}` };
        } catch (error) {
            return { success: false, message: error.message || 'Stripe verification failed' };
        }
    }

    async refundPayment({ paymentId, amount, reason = 'requested_by_customer' }) {
        if (!this.secretKey) {
            return { success: false, message: 'Stripe is not configured' };
        }
        if (!paymentId) {
            return { success: false, message: 'Missing Stripe payment intent id for refund' };
        }
        try {
            const body = {
                payment_intent: paymentId,
                reason: 'requested_by_customer',
                'metadata[note]': String(reason || '').slice(0, 100),
            };
            if (amount != null && Number(amount) > 0) {
                body.amount = String(Math.round(Number(amount) * 100));
            }
            const refund = await this.#request('/refunds', { method: 'POST', body });
            return {
                success: true,
                refundId: refund.id,
                message: 'Stripe refund created',
                raw: refund,
            };
        } catch (error) {
            return { success: false, message: error.message || 'Stripe refund failed' };
        }
    }

    verifyWebhook(rawBody, signature) {
        if (!this.webhookSecret) {
            return { valid: false, message: 'Webhook secret not configured' };
        }
        // Stripe signature format: t=timestamp,v1=signature
        try {
            const parts = Object.fromEntries(
                String(signature || '')
                    .split(',')
                    .map((p) => p.trim().split('='))
                    .filter((p) => p.length === 2)
            );
            const timestamp = parts.t;
            const v1 = parts.v1;
            if (!timestamp || !v1) {
                return { valid: false, message: 'Invalid Stripe signature header' };
            }
            const payload = `${timestamp}.${typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody)}`;
            const expected = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(payload, 'utf8')
                .digest('hex');
            const a = Buffer.from(expected);
            const b = Buffer.from(v1);
            if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
                return { valid: false, message: 'Webhook verification failed' };
            }
            return { valid: true };
        } catch (error) {
            return { valid: false, message: error.message || 'Webhook verification failed' };
        }
    }

    getPublicConfig() {
        return {
            ...super.getPublicConfig(),
            publishableKey: this.publishableKey
        };
    }
}

export default StripeGateway;
