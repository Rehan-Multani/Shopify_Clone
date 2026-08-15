export class BaseGateway {
    constructor(config = {}) {
        this.gateway = 'base';
        this.credentials = config.credentials || {};
        this.environment = config.environment || 'sandbox';
        this.currency = config.currency || 'INR';
        this.webhookSecret = config.webhookSecret || this.credentials.webhookSecret || '';
    }

    async testConnection() {
        throw new Error('testConnection() not implemented');
    }

    async createPayment({ amount, currency, receipt, notes, customer, returnUrl, notifyUrl }) {
        throw new Error('createPayment() not implemented');
    }

    async verifyPayment(payload) {
        throw new Error('verifyPayment() not implemented');
    }

    /**
     * Provider refund. amount = major currency units (e.g. INR rupees), optional.
     * @returns {{ success: boolean, refundId?: string, message?: string, raw?: object }}
     */
    async refundPayment({ paymentId, amount, reason }) {
        throw new Error('refundPayment() not implemented');
    }

    verifyWebhook(rawBody, signature, headers = {}) {
        throw new Error('verifyWebhook() not implemented');
    }

    getPublicConfig() {
        return {
            gateway: this.gateway,
            environment: this.environment,
            currency: this.currency
        };
    }
}

export default BaseGateway;
