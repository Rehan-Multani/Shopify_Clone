import Order from '../models/Order.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { fulfillOrderShipment, syncOrderTracking, cancelOrderShipment, canFulfillShiprocket } from '../services/shippingService.js';
import { emitEmail, ownerFromOrder } from '../../../shared/emailService.js';
import { statusEmailEvent } from '../../../shared/emailEvents.js';
import {
    orderConfirmationEmail,
    orderStatusEmail,
} from '../../../shared/storefrontEmails.js';

// @desc    Get all orders for the merchant
// @route   GET /api/orders
// @access  Private/Merchant
export const getMyOrders = async (req, res) => {
    try {
        const merchantId = req.merchant._id;
        const { storeId } = req.query;

        const filter = { merchantId };
        if (storeId) {
            filter.storeId = storeId;
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { 
            customerName, 
            customerEmail, 
            customerPhone,
            customerId,
            paymentMethod,
            shippingAddress,
            products, 
            status, 
            storeId, 
            vendorId: bodyVendorId,
            couponCode
        } = req.body;

        if (!customerName) {
            return res.status(400).json({ message: 'Customer name is required' });
        }

        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'At least one product is required' });
        }

        // Determine storeId and merchantId
        let finalStoreId = storeId;
        let finalMerchantId = req.merchant?._id;
        let storeDoc = null;

        if (finalStoreId) {
            storeDoc = await Store.findById(finalStoreId);
            if (!storeDoc) {
                return res.status(400).json({ message: 'Store not found.' });
            }
            finalMerchantId = storeDoc.merchantId;
        } else if (finalMerchantId) {
            storeDoc = await Store.findOne({ merchantId: finalMerchantId });
            if (!storeDoc) {
                return res.status(400).json({ message: 'No store found for this merchant. Please create a store first.' });
            }
            finalStoreId = storeDoc._id;
        } else {
            return res.status(400).json({ message: 'storeId or merchant authentication is required' });
        }

        // Server-side totals + catalog prices — ignore client price / totalAmount / paymentStatus=paid
        const productIds = products.map((p) => p.productId).filter(Boolean);
        const dbProducts = await Product.find({
            _id: { $in: productIds },
            store: finalStoreId
        }).lean();
        const byId = new Map(dbProducts.map((p) => [String(p._id), p]));

        const normalizedProducts = [];
        for (const p of products) {
            const dbp = byId.get(String(p.productId));
            if (!dbp) {
                return res.status(400).json({
                    message: `Invalid product in cart: ${p.productName || p.productId}`,
                    code: 'INVALID_PRODUCT'
                });
            }
            if (dbp.isActive === false) {
                return res.status(400).json({
                    message: `Product unavailable: ${dbp.name}`,
                    code: 'PRODUCT_INACTIVE'
                });
            }
            normalizedProducts.push({
                productId: dbp._id,
                productName: dbp.name || p.productName,
                quantity: Math.max(1, Number(p.quantity) || 1),
                price: Number(dbp.sellingPrice) || 0,
                vendorId: dbp.vendor || p.vendorId || null
            });
        }
        const computedSubtotal = normalizedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const gstPercent = Number(storeDoc.gstPercent) || 0;
        const platformCommissionPercent = Number(storeDoc.platformCommission) || 0;
        const finalGst = Math.round(computedSubtotal * (gstPercent / 100));
        const finalCommission = Math.round(computedSubtotal * (platformCommissionPercent / 100));

        let finalDiscount = 0;
        if (couponCode && String(couponCode).trim()) {
            const coupon = await Coupon.findOne({
                store: finalStoreId,
                code: String(couponCode).trim().toUpperCase()
            });
            if (!coupon || coupon.isApproved === false || coupon.isActive === false) {
                return res.status(400).json({ message: 'Invalid or inactive coupon', code: 'INVALID_COUPON' });
            }
            const now = new Date();
            if (coupon.endDate && new Date(coupon.endDate) < now) {
                return res.status(400).json({ message: 'Coupon has expired', code: 'INVALID_COUPON' });
            }
            if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
                return res.status(400).json({ message: 'Coupon usage limit reached', code: 'INVALID_COUPON' });
            }
            if (computedSubtotal < (coupon.minimumOrderAmount || 0)) {
                return res.status(400).json({
                    message: `Minimum order amount for this coupon is ₹${coupon.minimumOrderAmount}`,
                    code: 'INVALID_COUPON'
                });
            }
            if (coupon.discountType === 'percentage') {
                finalDiscount = Math.round(computedSubtotal * (Number(coupon.discountValue) / 100));
            } else {
                finalDiscount = Number(coupon.discountValue) || 0;
            }
            finalDiscount = Math.min(finalDiscount, computedSubtotal);
            await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
        }

        const serverTotal = Math.max(0, computedSubtotal - finalDiscount + finalGst + finalCommission);

        const vendorIds = [
            ...new Set(
                [
                    bodyVendorId,
                    ...normalizedProducts.map((p) => p.vendorId).filter(Boolean)
                ].map((id) => String(id)).filter(Boolean)
            )
        ];
        const finalVendorId = vendorIds.length === 1 ? vendorIds[0] : null;

        const initialTrackingStatus = [
            {
                status: 'pending',
                updatedAt: new Date(),
                description: 'Order placed successfully. Waiting for payment / store acceptance.'
            }
        ];

        const order = await Order.create({
            merchantId: finalMerchantId,
            storeId: finalStoreId,
            vendorId: finalVendorId,
            customerName,
            customerEmail: customerEmail || '',
            customerPhone: customerPhone || '',
            customerId: customerId || null,
            paymentMethod: paymentMethod || 'COD',
            shippingAddress: shippingAddress || { address: '', city: '', state: '', pincode: '' },
            products: normalizedProducts,
            subtotal: computedSubtotal,
            gstAmount: finalGst,
            platformCommissionAmount: finalCommission,
            totalAmount: serverTotal,
            status: status || 'pending',
            // Always pending on create — paid only via verified payment / webhook
            paymentStatus: 'pending',
            trackingStatus: initialTrackingStatus,
            shipping: {
                provider: 'manual',
                status: 'manual',
            },
        });

        await Store.findByIdAndUpdate(finalStoreId, {
            $inc: { totalOrders: 1 }
        });

        try {
            const method = String(order.paymentMethod || 'COD').toUpperCase();
            // Prepaid: wait until paid / accepted (avoid orphan Shiprocket orders)
            if (method === 'COD') {
                await fulfillOrderShipment(order);
                await order.save();
            }
        } catch (shipErr) {
            console.error('[Shipping] fulfill skipped:', shipErr.message);
        }

        const method = String(order.paymentMethod || 'COD').toUpperCase();
        if (method === 'COD' && order.customerEmail) {
            try {
                emitEmail({
                    event: 'customer_order_confirmation',
                    ...ownerFromOrder(order),
                    ...orderConfirmationEmail(order),
                });
            } catch (mailErr) {
                console.error('[order email]', mailErr.message);
            }
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Merchant
export const updateOrderStatus = async (req, res) => {
    try {
        const merchantId = req.merchant._id;
        const { status, paymentStatus, trackingDescription } = req.body;

        const order = await Order.findOne({ _id: req.params.id, merchantId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const prevPaymentStatus = order.paymentStatus;
        const prevStatus = order.status;

        const wantsProviderRefund =
            paymentStatus !== undefined
            && paymentStatus === 'refunded'
            && prevPaymentStatus === 'paid'
            && String(order.paymentMethod || '').toLowerCase() !== 'cod';

        // Never mark refunded locally before gateway succeeds
        if (status !== undefined) order.status = status;
        if (paymentStatus !== undefined && !wantsProviderRefund) {
            order.paymentStatus = paymentStatus;
        }

        // If status changed, push to tracking timeline
        if (status !== undefined && status !== prevStatus) {
            let desc = trackingDescription || `Order status updated to ${status}.`;
            if (status === 'accepted') desc = trackingDescription || 'Store has accepted your order and is preparing it.';
            if (status === 'shipped') desc = trackingDescription || 'Order has been shipped and is in transit.';
            if (status === 'out_for_delivery') desc = trackingDescription || 'Order is out for delivery. Our delivery executive will reach you soon.';
            if (status === 'delivered') desc = trackingDescription || 'Order delivered successfully. Thank you for shopping!';
            if (status === 'completed') desc = trackingDescription || 'Order delivered successfully. Thank you for shopping!';
            if (status === 'cancelled') desc = trackingDescription || 'Order has been cancelled.';
            if (status === 'rejected') desc = trackingDescription || 'Order rejected by store.';

            order.trackingStatus.push({
                status,
                updatedAt: new Date(),
                description: desc
            });
        }

        // Merchant cancel/reject → best-effort cancel on Shiprocket
        if (
            status !== undefined
            && status !== prevStatus
            && ['cancelled', 'rejected'].includes(String(status))
            && order.shipping?.provider === 'shiprocket'
        ) {
            try {
                await cancelOrderShipment(order);
            } catch (shipErr) {
                console.error('[Shipping] merchant cancel skipped:', shipErr.message);
            }
        }

        // Provider refund FIRST — only then return refreshed refunded order
        if (wantsProviderRefund) {
            await order.save();
            try {
                const billingApi = process.env.BILLING_SERVICE_URL || 'http://localhost:5005';
                const secret = process.env.INTERNAL_SERVICE_SECRET || '';
                const refundRes = await fetch(`${billingApi}/api/checkout/refund-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(secret ? { 'x-internal-secret': secret } : {}),
                        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
                        ...(req.merchant?._id ? { 'x-merchant-id': String(req.merchant._id) } : {}),
                        ...(req.vendor?._id ? { 'x-vendor-id': String(req.vendor._id) } : {}),
                    },
                    body: JSON.stringify({
                        orderId: String(order._id),
                        reason: trackingDescription || 'Refund from order status update',
                    }),
                });
                const errBody = await refundRes.json().catch(() => ({}));
                if (!refundRes.ok) {
                    return res.status(400).json({
                        message: errBody.message || 'Gateway refund failed. Order was not marked refunded.',
                        code: errBody.code || 'REFUND_FAILED',
                    });
                }
                const refreshed = await Order.findById(order._id);
                return res.json(refreshed || errBody.order || order);
            } catch (refundErr) {
                console.error('[Refund] call failed:', refundErr.message);
                return res.status(502).json({
                    message: 'Could not reach billing service for refund. Order was not marked refunded.',
                    code: 'REFUND_UNAVAILABLE',
                });
            }
        }

        const updatedOrder = await order.save();

        // Shiprocket when eligible: paid online, accepted/shipped, or retry AWB if shipment created without AWB
        const needsFulfill =
            !updatedOrder.shipping?.awb
            && canFulfillShiprocket(updatedOrder)
            && (
                updatedOrder.shipping?.provider !== 'shiprocket'
                || !updatedOrder.shipping?.shipmentId
                || (updatedOrder.shipping?.provider === 'shiprocket' && !updatedOrder.shipping?.awb)
            );

        if (needsFulfill) {
            const paidNow = prevPaymentStatus !== 'paid' && updatedOrder.paymentStatus === 'paid';
            const statusRetry = status !== undefined && ['accepted', 'shipped', 'processing'].includes(String(updatedOrder.status));
            const awbRetry = updatedOrder.shipping?.provider === 'shiprocket' && !updatedOrder.shipping?.awb;
            if (paidNow || statusRetry || awbRetry) {
                try {
                    await fulfillOrderShipment(updatedOrder);
                    await updatedOrder.save();
                } catch (shipErr) {
                    console.error('[Shipping] retry skipped:', shipErr.message);
                }
            }
        }

        // If payment status changed to paid, update store revenue
        if (prevPaymentStatus !== 'paid' && updatedOrder.paymentStatus === 'paid') {
            await Store.findByIdAndUpdate(order.storeId, {
                $inc: { revenue: order.totalAmount }
            });
        }

        try {
            if (status !== undefined && status !== prevStatus && updatedOrder.customerEmail) {
                const event = statusEmailEvent(status);
                const mail = event ? orderStatusEmail(updatedOrder, event) : null;
                if (mail) {
                    emitEmail({ event, ...ownerFromOrder(updatedOrder), ...mail });
                }
            }
            // Manual COD/offline refund status (provider path already emails from billing)
            if (
                paymentStatus !== undefined
                && !wantsProviderRefund
                && prevPaymentStatus !== 'refunded'
                && updatedOrder.paymentStatus === 'refunded'
                && updatedOrder.customerEmail
            ) {
                const mail = orderStatusEmail(updatedOrder, 'customer_order_refunded');
                if (mail) {
                    emitEmail({
                        event: 'customer_order_refunded',
                        ...ownerFromOrder(updatedOrder),
                        ...mail,
                    });
                }
            }
        } catch (mailErr) {
            console.error('[order status email]', mailErr.message);
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders for a customer
// @route   GET /api/orders/customer/:customerId
// @access  Public
export const getCustomerOrders = async (req, res) => {
    try {
        const { customerId } = req.params;
        const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order details (for tracking)
// @route   GET /api/orders/:id
// @access  Public
export const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.shipping?.provider === 'shiprocket' && order.shipping?.awb) {
            const last = order.shipping.lastSyncedAt ? new Date(order.shipping.lastSyncedAt).getTime() : 0;
            if (Date.now() - last > 60_000) {
                try {
                    await syncOrderTracking(order);
                    await order.save();
                } catch (err) {
                    console.error('[Shipping] track skipped:', err.message);
                }
            }
        }
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel order by customer
// @route   PUT /api/orders/:id/cancel
// @access  Public
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if order status prevents cancellation
        if (order.status === 'out_for_delivery' || order.status === 'delivered') {
            return res.status(400).json({ 
                success: false, 
                message: 'Order cannot be cancelled once it is out for delivery or delivered.' 
            });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
        }

        if (order.status === 'rejected') {
            return res.status(400).json({ success: false, message: 'Order is already rejected.' });
        }

        order.status = 'cancelled';
        order.trackingStatus.push({
            status: 'cancelled',
            updatedAt: new Date(),
            description: 'Order cancelled by customer.'
        });

        try {
            await cancelOrderShipment(order);
        } catch (shipErr) {
            console.error('[Shipping] cancel skipped:', shipErr.message);
        }

        const updatedOrder = await order.save();
        try {
            if (updatedOrder.customerEmail) {
                const mail = orderStatusEmail(updatedOrder, 'customer_order_cancelled');
                if (mail) {
                    emitEmail({
                        event: 'customer_order_cancelled',
                        ...ownerFromOrder(updatedOrder),
                        ...mail,
                    });
                }
            }
        } catch (mailErr) {
            console.error('[cancel email]', mailErr.message);
        }
        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Internal: create Shiprocket shipment after online payment capture
// @route   POST /api/orders/internal/:id/fulfill-shipping
// @access  Internal (billing-service)
export const fulfillShippingInternal = async (req, res) => {
    try {
        const isProd = process.env.NODE_ENV === 'production';
        const expected = String(process.env.INTERNAL_SERVICE_SECRET || '').trim();
        if (isProd && !expected) {
            console.error('[Shipping] INTERNAL_SERVICE_SECRET is required in production');
            return res.status(503).json({ ok: false, message: 'Internal fulfill not configured' });
        }
        if (expected) {
            const provided = String(req.headers['x-internal-secret'] || '').trim();
            if (!provided || provided !== expected) {
                return res.status(401).json({ ok: false, message: 'Unauthorized' });
            }
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ ok: false, message: 'Order not found' });
        }

        // Ensure payment is reflected (billing may have just marked paid)
        if (String(order.paymentStatus || '').toLowerCase() !== 'paid'
            && String(order.paymentMethod || '').toUpperCase() !== 'COD') {
            return res.status(200).json({ ok: false, skipped: true, reason: 'NOT_PAID' });
        }

        await fulfillOrderShipment(order);
        await order.save();
        return res.json({ ok: true, shipping: order.shipping });
    } catch (error) {
        console.error('[Shipping] internal fulfill:', error.message);
        return res.status(200).json({ ok: false, message: error.message });
    }
};
