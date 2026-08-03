import crypto from 'crypto';
import BaseGateway from './BaseGateway.js';

export class PayUGateway extends BaseGateway {
    constructor(config) {
        super(config);
        this.gateway = 'payu';
        this.merchantKey = this.credentials.merchantKey || '';
        this.merchantSalt = this.credentials.merchantSalt || '';
        this.baseUrl = this.environment === 'production'
            ? 'https://secure.payu.in'
            : 'https://test.payu.in';
    }

    #hash(parts) {
        return crypto.createHash('sha512').update(parts.join('|')).digest('hex');
    }

    async testConnection() {
        if (!this.merchantKey || !this.merchantSalt) {
            return { success: false, message: 'Missing API credentials (Merchant Key / Merchant Salt)' };
        }
        try {
            // Verify credentials by hashing a known command and calling verify_payment info API shape
            const command = 'get_merchant_details';
            const hash = this.#hash([this.merchantKey, command, '1', this.merchantSalt]);
            const form = new URLSearchParams({
                key: this.merchantKey,
                command,
                var1: '1',
                hash
            });
            const res = await fetch(`${this.baseUrl}/merchant/postservice.php?form=2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: form.toString()
            });
            const text = await res.text();
            // PayU returns JSON or pipe-separated; treat HTTP success + non-auth-error as pass
            if (!res.ok) {
                return { success: false, message: 'PayU authentication failed' };
            }
            if (/invalid|unauthorized|authentication failed/i.test(text)) {
                return { success: false, message: 'Invalid PayU Merchant Key or Salt' };
            }
            return { success: true, message: 'PayU connection verified successfully' };
        } catch (error) {
            return { success: false, message: error.message || 'Failed to reach PayU' };
        }
    }

    async createPayment({ amount, currency = 'INR', receipt, notes = {}, customer = {}, returnUrl, notifyUrl }) {
        if (!this.merchantKey || !this.merchantSalt) {
            throw Object.assign(new Error('PayU is not configured'), { code: 'MISSING_CREDENTIALS' });
        }
        const txnid = receipt || `payu_${Date.now()}`;
        const productinfo = notes.productinfo || 'Order Payment';
        const firstname = customer.name || 'Customer';
        const email = customer.email || 'customer@example.com';
        const phone = customer.phone || '9999999999';
        const amt = Number(amount).toFixed(2);

        // key|txnid|amount|productinfo|firstname|email|||||||||||salt
        const hash = this.#hash([
            this.merchantKey,
            txnid,
            amt,
            productinfo,
            firstname,
            email,
            '', '', '', '', '', '', '', '', '',
            this.merchantSalt
        ]);

        return {
            gateway: 'payu',
            gatewayOrderId: txnid,
            amount: Math.round(Number(amount) * 100),
            currency: 'INR',
            publicKey: this.merchantKey,
            paymentUrl: `${this.baseUrl}/_payment`,
            form: {
                key: this.merchantKey,
                txnid,
                amount: amt,
                productinfo,
                firstname,
                email,
                phone,
                surl: returnUrl || '',
                furl: returnUrl || '',
                hash,
                service_provider: 'payu_paisa'
            },
            customer,
            raw: { txnid, hash }
        };
    }

    async verifyPayment({ txnid, amount, productinfo, firstname, email, status, hash }) {
        if (!txnid || !hash) {
            return { success: false, message: 'Missing PayU verification fields' };
        }
        // Reverse hash: salt|status|||||||||||email|firstname|productinfo|amount|txnid|key
        const expected = this.#hash([
            this.merchantSalt,
            status || '',
            '', '', '', '', '', '', '', '', '',
            email || '',
            firstname || '',
            productinfo || '',
            amount || '',
            txnid,
            this.merchantKey
        ]);
        if (expected.toLowerCase() !== String(hash).toLowerCase()) {
            return { success: false, message: 'Payment verification failed. Invalid PayU hash.' };
        }
        if (String(status).toLowerCase() !== 'success') {
            return { success: false, message: `PayU payment status: ${status}` };
        }
        return { success: true, paymentId: txnid, orderId: txnid };
    }

    async verifyWebhook(rawBody) {
        const payload = typeof rawBody === 'string'
            ? (() => { try { return JSON.parse(rawBody); } catch { return {}; } })()
            : (rawBody || {});
        if (!payload.hash) {
            return { valid: false, message: 'Missing PayU webhook hash' };
        }
        const result = await this.verifyPayment(payload);
        return { valid: result.success, message: result.message || '' };
    }

    getPublicConfig() {
        return {
            ...super.getPublicConfig(),
            merchantKey: this.merchantKey,
            paymentUrl: `${this.baseUrl}/_payment`
        };
    }
}

export default PayUGateway;
