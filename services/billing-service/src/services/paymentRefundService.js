/**
 * Provider-side refund for a paid checkout order.
 * Idempotent: already-refunded payments return success without double-charging the gateway.
 */
import CheckoutPayment from '../models/CheckoutPayment.js';
import Order from '../models/Order.js';
import Store from '../models/Store.js';
import MerchantPaymentGateway from '../models/MerchantPaymentGateway.js';
import VendorPaymentGateway from '../models/VendorPaymentGateway.js';
import { buildGatewayClient } from './gatewayResolver.js';
import { emitEmail, ownerFromOrder } from '../../../shared/emailService.js';
import { orderStatusEmail } from '../../../shared/storefrontEmails.js';

async function loadConfigForPayment(payment) {
    if (payment.ownerType === 'vendor' && payment.vendorId) {
        return VendorPaymentGateway.findOne({
            vendorId: payment.vendorId,
            gateway: payment.gateway,
        });
    }
    return MerchantPaymentGateway.findOne({
        merchantId: payment.merchantId,
        gateway: payment.gateway,
    });
}

/**
 * @param {{ orderId: string, merchantId?: string, vendorId?: string, reason?: string, amount?: number }} args
 */
export async function refundOrderPayment({
    orderId,
    merchantId = null,
    vendorId = null,
    reason = 'Merchant refund',
    amount = null,
} = {}) {
    if (!orderId) {
        return { ok: false, code: 'ORDER_REQUIRED', message: 'orderId is required' };
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return { ok: false, code: 'ORDER_NOT_FOUND', message: 'Order not found' };
    }

    if (merchantId && String(order.merchantId) !== String(merchantId)) {
        return { ok: false, code: 'FORBIDDEN', message: 'Order does not belong to this merchant' };
    }
    if (vendorId && order.vendorId && String(order.vendorId) !== String(vendorId)) {
        return { ok: false, code: 'FORBIDDEN', message: 'Order does not belong to this vendor' };
    }

    if (String(order.paymentStatus || '').toLowerCase() === 'refunded') {
        return { ok: true, alreadyRefunded: true, order, message: 'Order already marked refunded' };
    }

    const method = String(order.paymentMethod || '').toLowerCase();
    if (!method || method === 'cod') {
        order.paymentStatus = 'refunded';
        order.trackingStatus = order.trackingStatus || [];
        order.trackingStatus.push({
            status: 'refunded',
            updatedAt: new Date(),
            description: 'COD / offline order marked refunded (no gateway refund).',
        });
        await order.save();
        return { ok: true, mode: 'manual', order, message: 'COD order marked refunded' };
    }

    if (String(order.paymentStatus || '').toLowerCase() !== 'paid') {
        return {
            ok: false,
            code: 'NOT_PAID',
            message: 'Only paid online orders can be refunded via the payment gateway',
        };
    }

    let payment = null;
    if (order.checkoutPaymentId) {
        payment = await CheckoutPayment.findById(order.checkoutPaymentId);
    }
    if (!payment) {
        payment = await CheckoutPayment.findOne({
            orderId: order._id,
            status: 'paid',
        }).sort({ updatedAt: -1 });
    }

    if (!payment || payment.gateway === 'cod') {
        return {
            ok: false,
            code: 'PAYMENT_NOT_FOUND',
            message: 'No paid online payment record found for this order',
        };
    }

    if (payment.status === 'refunded') {
        order.paymentStatus = 'refunded';
        await order.save();
        return { ok: true, alreadyRefunded: true, order, payment, message: 'Payment already refunded' };
    }

    const config = await loadConfigForPayment(payment);
    if (!config) {
        return {
            ok: false,
            code: 'GATEWAY_NOT_CONFIGURED',
            message: 'Payment gateway config missing — cannot call provider refund',
        };
    }

    const client = await buildGatewayClient(config);
    const refundAmount = amount != null ? Number(amount) : Number(payment.amount || order.totalAmount);
    const paymentId = payment.gatewayPaymentId
        || (payment.gateway === 'payu' ? payment.gatewayPaymentId || payment.gatewayOrderId : '')
        || (payment.gateway === 'stripe' || payment.gateway === 'cashfree' ? payment.gatewayOrderId : '')
        || payment.gatewayPaymentId;

    // Razorpay needs payment id (pay_...); PayU needs mihpayid; Stripe PI; Cashfree order id
    const providerPaymentId = payment.gatewayPaymentId
        || (['stripe', 'cashfree', 'payu'].includes(payment.gateway) ? payment.gatewayOrderId : '')
        || '';

    if (!providerPaymentId) {
        return {
            ok: false,
            code: 'MISSING_GATEWAY_PAYMENT_ID',
            message: 'Missing gateway payment id — cannot refund. Capture may be incomplete.',
        };
    }

    const result = await client.refundPayment({
        paymentId: providerPaymentId,
        orderId: payment.gatewayOrderId,
        amount: refundAmount,
        reason,
    });

    if (!result.success) {
        return {
            ok: false,
            code: 'GATEWAY_REFUND_FAILED',
            message: result.message || 'Provider refund failed',
            details: result.raw,
        };
    }

    payment.status = 'refunded';
    payment.metadata = {
        ...(payment.metadata || {}),
        refundId: result.refundId || '',
        refundedAt: new Date().toISOString(),
        refundReason: String(reason || '').slice(0, 200),
    };
    await payment.save();

    const wasPaid = order.paymentStatus === 'paid';
    order.paymentStatus = 'refunded';
    order.trackingStatus = order.trackingStatus || [];
    order.trackingStatus.push({
        status: 'refunded',
        updatedAt: new Date(),
        description: `Refund processed via ${payment.gateway}${result.refundId ? ` (${result.refundId})` : ''}.`,
    });
    await order.save();

    if (wasPaid && order.storeId && order.totalAmount) {
        try {
            await Store.findByIdAndUpdate(order.storeId, {
                $inc: { revenue: -Math.abs(Number(order.totalAmount) || 0) },
            });
        } catch {
            /* best-effort */
        }
    }

    try {
        if (order.customerEmail) {
            const mail = orderStatusEmail(order, 'customer_order_refunded');
            if (mail) {
                emitEmail({
                    event: 'customer_order_refunded',
                    ...ownerFromOrder(order),
                    ...mail,
                });
            }
        }
    } catch (mailErr) {
        console.error('[refund email]', mailErr.message);
    }

    return {
        ok: true,
        mode: 'gateway',
        order,
        payment,
        refundId: result.refundId,
        message: result.message || 'Refund successful',
    };
}

export default { refundOrderPayment };
