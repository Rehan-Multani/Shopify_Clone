import CheckoutPayment from '../models/CheckoutPayment.js';
import MerchantPaymentGateway from '../models/MerchantPaymentGateway.js';
import VendorPaymentGateway from '../models/VendorPaymentGateway.js';
import { buildGatewayClient } from '../services/gatewayResolver.js';
import { finalizeSuccessfulPayment, markOrderPaymentFailed } from '../services/orderPaymentService.js';
import { isSupportedGateway } from '../constants/gateways.js';

/**
 * Resolve gateway config ONLY via our CheckoutPayment record.
 * Never fall back to a random merchant's keys (cross-tenant risk).
 */
async function findConfigForWebhook(gateway, gatewayOrderId, body = {}) {
    const or = [];
    if (gatewayOrderId) or.push({ gatewayOrderId });
    if (body.order_id) or.push({ gatewayOrderId: body.order_id });
    if (body.txnid) or.push({ gatewayOrderId: body.txnid });
    if (body.payment_id) or.push({ gatewayPaymentId: body.payment_id });
    if (body?.payload?.payment?.entity?.order_id) {
        or.push({ gatewayOrderId: body.payload.payment.entity.order_id });
    }
    if (body?.payload?.payment?.entity?.id) {
        or.push({ gatewayPaymentId: body.payload.payment.entity.id });
    }

    if (!or.length) return { config: null, payment: null };

    const payment = await CheckoutPayment.findOne({ gateway, $or: or });
    if (!payment) return { config: null, payment: null };

    if (payment.ownerType === 'vendor' && payment.vendorId) {
        const doc = await VendorPaymentGateway.findOne({ vendorId: payment.vendorId, gateway });
        if (doc) return { config: doc, payment };
    }

    const doc = await MerchantPaymentGateway.findOne({ merchantId: payment.merchantId, gateway });
    return { config: doc || null, payment };
}

async function handleWebhook(gateway, req, res) {
    try {
        if (!isSupportedGateway(gateway)) {
            return res.status(400).json({ message: 'Unsupported gateway' });
        }

        const rawBody = req.rawBody || req.body;
        const signature =
            req.headers['x-razorpay-signature'] ||
            req.headers['stripe-signature'] ||
            req.headers['x-webhook-signature'] ||
            req.headers['x-cashfree-signature'] ||
            '';

        const body = typeof rawBody === 'string'
            ? (() => { try { return JSON.parse(rawBody); } catch { return req.body; } })()
            : (req.body || {});

        const gatewayOrderId =
            body?.payload?.payment?.entity?.order_id ||
            body?.data?.order?.order_id ||
            body?.order_id ||
            body?.txnid ||
            body?.id ||
            '';

        const { config, payment } = await findConfigForWebhook(gateway, gatewayOrderId, body);
        if (!payment) {
            return res.status(200).json({ received: true, gateway, matched: false });
        }
        if (!config) {
            return res.status(400).json({ message: 'No matching gateway configuration for webhook', code: 'NOT_CONFIGURED' });
        }

        const client = await buildGatewayClient(config);
        const verification = await client.verifyWebhook(rawBody, signature, req.headers);

        if (!verification.valid) {
            return res.status(400).json({
                message: verification.message || 'Webhook verification failed',
                code: 'WEBHOOK_VERIFICATION_FAILED'
            });
        }

        const eventType = body.event || body.type || body.txStatus || body.order_status || '';
        const paidHints = /paid|captured|success|charge.succeeded|payment.captured|PAYMENT_SUCCESS/i;
        const failHints = /failed|cancelled|canceled|payment.failed/i;

        const gatewayPaymentId =
            body?.payload?.payment?.entity?.id ||
            body?.data?.payment?.cf_payment_id ||
            body?.mihpayid ||
            payment.gatewayPaymentId;

        if (paidHints.test(String(eventType)) || body.status === 'success' || body.order_status === 'PAID') {
            await finalizeSuccessfulPayment(payment, gatewayPaymentId);
        } else if (failHints.test(String(eventType))) {
            if (payment.status !== 'paid') {
                payment.status = 'failed';
                await payment.save();
                await markOrderPaymentFailed(payment.orderId, `Webhook: ${eventType || 'failed'}`);
            }
        }

        res.json({ received: true, gateway, matched: true, paymentId: payment._id });
    } catch (error) {
        console.error(`${gateway} webhook error:`, error);
        res.status(500).json({ message: error.message || 'Webhook processing failed' });
    }
}

export const razorpayWebhook = (req, res) => handleWebhook('razorpay', req, res);
export const stripeWebhook = (req, res) => handleWebhook('stripe', req, res);
export const payuWebhook = (req, res) => handleWebhook('payu', req, res);
export const cashfreeWebhook = (req, res) => handleWebhook('cashfree', req, res);
