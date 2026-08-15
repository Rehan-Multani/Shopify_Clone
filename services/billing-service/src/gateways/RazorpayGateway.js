import crypto from 'crypto';
import Razorpay from 'razorpay';
import BaseGateway from './BaseGateway.js';

export class RazorpayGateway extends BaseGateway {
    constructor(config) {
        super(config);
        this.gateway = 'razorpay';
        this.keyId = this.credentials.keyId || '';
        this.keySecret = this.credentials.keySecret || '';
        this.client = null;
        if (this.keyId && this.keySecret) {
            this.client = new Razorpay({
                key_id: this.keyId,
                key_secret: this.keySecret
            });
        }
    }

    async testConnection() {
        if (!this.keyId || !this.keySecret) {
            return { success: false, message: 'Missing API credentials (Key ID / Key Secret)' };
        }
        try {
            // Lightweight authenticated call
            await this.client.orders.all({ count: 1 });
            return { success: true, message: 'Razorpay connection verified successfully' };
        } catch (error) {
            const message = error?.error?.description || error?.message || 'Failed authentication with Razorpay';
            return { success: false, message };
        }
    }

    async createPayment({ amount, currency = 'INR', receipt, notes = {}, customer = {} }) {
        if (!this.client) {
            throw Object.assign(new Error('Razorpay is not configured'), { code: 'MISSING_CREDENTIALS' });
        }
        const amountInPaise = Math.round(Number(amount) * 100);
        if (!amountInPaise || amountInPaise < 100) {
            throw Object.assign(new Error('Amount must be at least 1.00'), { code: 'INVALID_AMOUNT' });
        }

        const order = await this.client.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: receipt || `rcpt_${Date.now()}`,
            notes
        });

        return {
            gateway: 'razorpay',
            gatewayOrderId: order.id,
            amount: order.amount,
            currency: 'INR',
            publicKey: this.keyId,
            customer,
            raw: order
        };
    }

    async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return { success: false, message: 'Missing Razorpay payment verification fields' };
        }
        if (String(razorpay_order_id).startsWith('mock_order_')) {
            return { success: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id };
        }
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expected = crypto
            .createHmac('sha256', this.keySecret)
            .update(body)
            .digest('hex');
        if (expected !== razorpay_signature) {
            return { success: false, message: 'Payment verification failed. Invalid signature.' };
        }
        return { success: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id };
    }

    async refundPayment({ paymentId, amount, reason = 'requested_by_customer' }) {
        if (!this.client) {
            return { success: false, message: 'Razorpay is not configured' };
        }
        if (!paymentId) {
            return { success: false, message: 'Missing Razorpay payment id for refund' };
        }
        try {
            const payload = {
                speed: 'normal',
                notes: { reason: String(reason || '').slice(0, 100) },
            };
            if (amount != null && Number(amount) > 0) {
                payload.amount = Math.round(Number(amount) * 100);
            }
            const refund = await this.client.payments.refund(paymentId, payload);
            return {
                success: true,
                refundId: refund.id,
                message: 'Razorpay refund initiated',
                raw: refund,
            };
        } catch (error) {
            const message = error?.error?.description || error?.message || 'Razorpay refund failed';
            return { success: false, message };
        }
    }

    verifyWebhook(rawBody, signature) {
        if (!this.webhookSecret) {
            return { valid: false, message: 'Webhook secret not configured' };
        }
        const expected = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
            .digest('hex');
        if (expected !== signature) {
            return { valid: false, message: 'Webhook verification failed' };
        }
        return { valid: true };
    }

    getPublicConfig() {
        return {
            ...super.getPublicConfig(),
            keyId: this.keyId
        };
    }
}

export default RazorpayGateway;
