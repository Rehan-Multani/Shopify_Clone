import Order from '../models/Order.js';
import Store from '../models/Store.js';
import VendorSettlement from '../models/VendorSettlement.js';

/**
 * Mark checkout payment + order paid exactly once; bump store revenue; create fallback settlement if needed.
 */
export async function finalizeSuccessfulPayment(payment, gatewayPaymentId = '') {
    if (!payment) return null;

    if (payment.status !== 'paid') {
        payment.status = 'paid';
        if (gatewayPaymentId) payment.gatewayPaymentId = gatewayPaymentId;
        await payment.save();
    } else if (gatewayPaymentId && !payment.gatewayPaymentId) {
        payment.gatewayPaymentId = gatewayPaymentId;
        await payment.save();
    }

    await markOrderPaid({
        orderId: payment.orderId,
        gatewayPaymentId: payment.gatewayPaymentId || gatewayPaymentId,
        checkoutPaymentId: payment._id,
        paymentMethod: payment.gateway,
        ownerType: payment.ownerType,
        isFallback: !!payment.isFallback,
        vendorId: payment.vendorId
    });

    return payment;
}

/**
 * Mark order paid exactly once; bump store revenue; create fallback settlement if needed.
 */
export async function markOrderPaid({
    orderId,
    gatewayPaymentId = '',
    checkoutPaymentId = null,
    paymentMethod = null,
    ownerType = null,
    isFallback = false,
    vendorId = null
}) {
    if (!orderId) return null;

    const order = await Order.findById(orderId);
    if (!order) return null;

    const wasPaid = order.paymentStatus === 'paid';

    if (!wasPaid) {
        order.paymentStatus = 'paid';
        if (gatewayPaymentId) order.gatewayPaymentId = gatewayPaymentId;
        if (checkoutPaymentId) order.checkoutPaymentId = checkoutPaymentId;
        if (paymentMethod) order.paymentMethod = paymentMethod;
        if (ownerType) order.paymentOwnerType = ownerType;
        if (typeof isFallback === 'boolean') order.isFallbackPayment = isFallback;
        if (vendorId) order.vendorId = vendorId;

        order.trackingStatus = order.trackingStatus || [];
        order.trackingStatus.push({
            status: 'payment_paid',
            updatedAt: new Date(),
            description: 'Online payment captured successfully.'
        });

        await order.save();

        await Store.findByIdAndUpdate(order.storeId, {
            $inc: { revenue: order.totalAmount }
        });

        // Wave 7 — theme revenue attribution (no PII)
        try {
            const storeApi = process.env.STORE_SERVICE_URL || 'http://localhost:5004';
            const attr = order.themeAttribution || order.themeMeta || {};
            await fetch(`${storeApi}/api/themes/analytics/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-store-id': String(order.storeId),
                },
                body: JSON.stringify({
                    storeId: String(order.storeId),
                    eventType: 'purchase',
                    themeId: attr.themeId || attr.themeFolder || '',
                    themeVersion: attr.themeVersion || '',
                    experimentId: attr.experimentId || '',
                    variantKey: attr.variantKey || '',
                    sessionKey: attr.sessionKey || '',
                    revenue: order.totalAmount,
                    currency: attr.currency || 'INR',
                    orderId: String(order._id),
                    meta: { source: 'order_paid' },
                }),
            });
        } catch (attrErr) {
            console.warn('[orderPayment] theme attribution:', attrErr.message);
        }
    } else {
        let dirty = false;
        if (gatewayPaymentId && !order.gatewayPaymentId) {
            order.gatewayPaymentId = gatewayPaymentId;
            dirty = true;
        }
        if (checkoutPaymentId && !order.checkoutPaymentId) {
            order.checkoutPaymentId = checkoutPaymentId;
            dirty = true;
        }
        if (dirty) await order.save();
    }

    if (isFallback && (vendorId || order.vendorId)) {
        const vid = vendorId || order.vendorId;
        await VendorSettlement.findOneAndUpdate(
            { orderId: order._id },
            {
                $setOnInsert: {
                    merchantId: order.merchantId,
                    vendorId: vid,
                    storeId: order.storeId,
                    orderId: order._id,
                    checkoutPaymentId: checkoutPaymentId || order.checkoutPaymentId,
                    amount: order.totalAmount,
                    currency: 'INR',
                    status: 'pending',
                    note: 'Fallback payment collected on merchant gateway — owed to vendor'
                }
            },
            { upsert: true, new: true }
        );
    }

    return order;
}

export async function markOrderPaymentFailed(orderId, reason = '') {
    if (!orderId) return null;
    const order = await Order.findById(orderId);
    if (!order || order.paymentStatus === 'paid') return order;

    order.paymentStatus = 'failed';
    order.trackingStatus = order.trackingStatus || [];
    order.trackingStatus.push({
        status: 'payment_failed',
        updatedAt: new Date(),
        description: reason || 'Payment failed or cancelled.'
    });
    await order.save();
    return order;
}

export default { finalizeSuccessfulPayment, markOrderPaid, markOrderPaymentFailed };
