import RazorpayGateway from './RazorpayGateway.js';
import StripeGateway from './StripeGateway.js';
import PayUGateway from './PayUGateway.js';
import CashfreeGateway from './CashfreeGateway.js';
import { isSupportedGateway } from '../constants/gateways.js';

const GATEWAY_CLASSES = {
    razorpay: RazorpayGateway,
    stripe: StripeGateway,
    payu: PayUGateway,
    cashfree: CashfreeGateway
};

/**
 * Factory — instantiate a gateway adapter from decrypted credentials.
 */
export function createGatewayInstance(gateway, config = {}) {
    const key = String(gateway || '').toLowerCase();
    if (!isSupportedGateway(key)) {
        throw Object.assign(new Error(`Unsupported payment gateway: ${gateway}`), { code: 'UNSUPPORTED_GATEWAY' });
    }
    const GatewayClass = GATEWAY_CLASSES[key];
    return new GatewayClass(config);
}

export { RazorpayGateway, StripeGateway, PayUGateway, CashfreeGateway };
export default createGatewayInstance;
