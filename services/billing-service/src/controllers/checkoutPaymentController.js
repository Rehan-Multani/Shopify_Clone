import Store from '../models/Store.js';
import Vendor from '../models/Vendor.js';
import Order from '../models/Order.js';
import CheckoutPayment from '../models/CheckoutPayment.js';
import {
    listCheckoutPaymentOptions,
    resolveCheckoutGateway,
    buildGatewayClient
} from '../services/gatewayResolver.js';
import { finalizeSuccessfulPayment, markOrderPaymentFailed } from '../services/orderPaymentService.js';
import { isSupportedGateway, isCheckoutReadyGateway } from '../constants/gateways.js';

function normalizeId(value) {
    if (!value) return null;
    if (typeof value === 'object' && value._id) return String(value._id);
    return String(value);
}

function amountsMatch(a, b, tolerance = 0.02) {
    return Math.abs(Number(a) - Number(b)) <= tolerance;
}

// GET /checkout/payment-options
export const getPaymentOptions = async (req, res) => {
    try {
        const storeId = req.query.storeId || req.headers['x-store-id'];
        const vendorId = normalizeId(req.query.vendorId) || null;

        if (!storeId) {
            return res.status(400).json({ message: 'storeId is required' });
        }

        const store = await Store.findById(storeId).lean();
        if (!store) return res.status(404).json({ message: 'Store not found' });

        let safeVendorId = null;
        if (vendorId) {
            const vendor = await Vendor.findById(vendorId).lean();
            if (vendor && String(vendor.merchant) === String(store.merchantId) && String(vendor.store) === String(storeId)) {
                safeVendorId = vendorId;
            }
        }

        const result = await listCheckoutPaymentOptions({
            merchantId: store.merchantId,
            storeId,
            vendorId: safeVendorId
        });

        const onlineEnabled = store.paymentSettings?.onlineEnabled !== false;
        const options = (result.options || []).filter((opt) => {
            if (opt.gateway === 'cod') return true;
            return onlineEnabled;
        });

        res.json({
            ...result,
            options,
            onlineEnabled,
            codEnabled: store.paymentSettings?.codEnabled !== false,
            resolvedOwner: safeVendorId ? 'vendor' : 'merchant',
            vendorId: safeVendorId,
            merchantId: store.merchantId
        });
    } catch (error) {
        console.error('getPaymentOptions:', error);
        res.status(500).json({ message: error.message || 'Failed to load payment options' });
    }
};

// POST /checkout/create-payment
export const createCheckoutPayment = async (req, res) => {
    try {
        const {
            storeId,
            vendorId: rawVendorId = null,
            gateway,
            orderId,
            customer = {},
            returnUrl,
            notifyUrl,
            notes = {},
            idempotencyKey: clientIdempotencyKey = null
        } = req.body;

        if (!storeId) return res.status(400).json({ message: 'storeId is required' });
        if (!orderId) {
            return res.status(400).json({
                message: 'orderId is required. Place the order first, then create payment.',
                code: 'ORDER_REQUIRED'
            });
        }

        const store = await Store.findById(storeId).lean();
        if (!store) return res.status(404).json({ message: 'Store not found' });

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });

        if (String(order.storeId) !== String(storeId)) {
            return res.status(400).json({ message: 'Order does not belong to this store', code: 'ORDER_STORE_MISMATCH' });
        }

        const merchantId = store.merchantId;
        if (String(order.merchantId) !== String(merchantId)) {
            return res.status(400).json({ message: 'Order merchant mismatch', code: 'ORDER_MERCHANT_MISMATCH' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({
                message: 'Order is already paid',
                code: 'ORDER_ALREADY_PAID',
                orderId: order._id
            });
        }

        // Server-side amount only — never trust client-sent amount
        const amount = Number(order.totalAmount);
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Order has invalid amount', code: 'INVALID_AMOUNT' });
        }

        let vendorId = normalizeId(rawVendorId) || normalizeId(order.vendorId);
        if (vendorId) {
            const vendor = await Vendor.findById(vendorId).lean();
            if (!vendor || String(vendor.merchant) !== String(merchantId) || String(vendor.store) !== String(storeId)) {
                return res.status(400).json({
                    message: 'Vendor does not belong to this store',
                    code: 'INVALID_VENDOR'
                });
            }
        } else {
            vendorId = null;
        }

        const idempotencyKey = String(clientIdempotencyKey || `${orderId}:${gateway || 'cod'}`).slice(0, 120);

        // Idempotent replay
        const existing = await CheckoutPayment.findOne({ idempotencyKey });
        if (existing) {
            if (existing.status === 'paid') {
                return res.json({
                    paymentId: existing._id,
                    gateway: existing.gateway,
                    status: 'paid',
                    amount: existing.amount,
                    currency: 'INR',
                    orderId: existing.orderId,
                    replayed: true
                });
            }
            return res.json({
                paymentId: existing._id,
                gateway: existing.gateway,
                ownerType: existing.ownerType,
                fallback: !!existing.isFallback,
                merchantId: existing.merchantId,
                vendorId: existing.vendorId,
                status: existing.status,
                gatewayOrderId: existing.gatewayOrderId,
                amount: Math.round(existing.amount * 100),
                currency: 'INR',
                publicKey: existing.metadata?.publicKey,
                clientSecret: existing.clientSecret || undefined,
                paymentSessionId: existing.metadata?.paymentSessionId || undefined,
                paymentUrl: existing.metadata?.paymentUrl || undefined,
                form: existing.metadata?.form || undefined,
                orderId: existing.orderId,
                replayed: true
            });
        }

        // COD short-circuit
        if (gateway === 'cod') {
            if (store.paymentSettings?.codEnabled === false) {
                return res.status(400).json({ message: 'Cash on Delivery is not available' });
            }
            const payment = await CheckoutPayment.create({
                storeId,
                merchantId,
                vendorId,
                orderId,
                gateway: 'cod',
                ownerType: 'store',
                isFallback: false,
                amount,
                currency: 'INR',
                status: 'pending',
                idempotencyKey,
                metadata: { customer, notes }
            });
            order.paymentMethod = 'COD';
            order.checkoutPaymentId = payment._id;
            await order.save();
            return res.json({
                paymentId: payment._id,
                gateway: 'cod',
                status: 'pending',
                amount: payment.amount,
                currency: 'INR',
                orderId: order._id
            });
        }

        if (!gateway || !isSupportedGateway(gateway)) {
            return res.status(400).json({
                message: 'Unsupported or missing payment gateway',
                code: 'UNSUPPORTED_GATEWAY'
            });
        }

        if (!isCheckoutReadyGateway(gateway)) {
            return res.status(400).json({
                message: `${gateway} checkout is not available yet. Please use Razorpay or PayU.`,
                code: 'GATEWAY_NOT_CHECKOUT_READY'
            });
        }

        if (store.paymentSettings?.onlineEnabled === false) {
            return res.status(400).json({ message: 'Online payments are disabled for this store' });
        }

        const resolved = await resolveCheckoutGateway({
            merchantId,
            storeId,
            vendorId,
            preferredGateway: gateway
        });

        if (!resolved) {
            return res.status(400).json({
                message: 'No configured payment gateway available. Please contact the store.',
                code: 'NO_GATEWAY_AVAILABLE'
            });
        }

        if (resolved.error) {
            const status = resolved.error === 'VENDOR_GATEWAY_NOT_CONFIGURED' ? 422 : 400;
            return res.status(status).json({
                message: resolved.message || 'Payment gateway unavailable',
                code: resolved.error
            });
        }

        if (!resolved.config || resolved.config.gateway !== gateway) {
            return res.status(400).json({
                message: `${gateway} is not available for this checkout. Try another method.`,
                code: 'GATEWAY_UNAVAILABLE',
                availableGateway: resolved.config?.gateway
            });
        }

        if (resolved.ownerType === 'vendor') {
            if (String(resolved.config.vendorId) !== String(vendorId)) {
                return res.status(400).json({ message: 'Gateway owner mismatch', code: 'GATEWAY_OWNER_MISMATCH' });
            }
        } else if (resolved.ownerType === 'merchant') {
            if (String(resolved.config.merchantId) !== String(merchantId)) {
                return res.status(400).json({ message: 'Gateway owner mismatch', code: 'GATEWAY_OWNER_MISMATCH' });
            }
        }

        let client;
        try {
            client = await buildGatewayClient(resolved.config);
        } catch (err) {
            return res.status(400).json({
                message: err.message || 'Invalid gateway credentials',
                code: 'INVALID_KEYS'
            });
        }

        const hostBase = `${req.protocol}://${req.get('host')}`;
        const payuReturnUrl = `${hostBase}/api/checkout/payu-return`;
        const effectiveReturnUrl = gateway === 'payu' ? payuReturnUrl : returnUrl;
        const effectiveNotifyUrl = notifyUrl || `${hostBase}/api/webhooks/${gateway}`;

        const receipt = `ord_${String(orderId).slice(-8)}_${Date.now().toString(36)}`;
        let gatewayResult;
        try {
            gatewayResult = await client.createPayment({
                amount,
                currency: 'INR',
                receipt,
                notes: {
                    ...notes,
                    storeId: String(storeId),
                    merchantId: String(merchantId),
                    vendorId: vendorId ? String(vendorId) : '',
                    orderId: String(orderId)
                },
                customer,
                returnUrl: effectiveReturnUrl,
                notifyUrl: effectiveNotifyUrl
            });
        } catch (err) {
            const code = err.code || 'GATEWAY_ERROR';
            const status = code === 'MISSING_CREDENTIALS' ? 400 : 502;
            return res.status(status).json({
                message: err.message || 'Gateway timeout or payment creation failed',
                code: code === 'MISSING_CREDENTIALS' ? 'MISSING_CREDENTIALS' : 'GATEWAY_TIMEOUT'
            });
        }

        // For PayU, keep frontend redirect in metadata; surl/furl already point to our return handler
        if (gateway === 'payu' && gatewayResult.form) {
            gatewayResult.form.surl = payuReturnUrl;
            gatewayResult.form.furl = payuReturnUrl;
        }

        let payment;
        try {
            payment = await CheckoutPayment.create({
                storeId,
                merchantId,
                vendorId,
                orderId,
                gateway,
                ownerType: resolved.ownerType,
                isFallback: !!resolved.fallback,
                amount,
                currency: 'INR',
                status: 'created',
                gatewayOrderId: gatewayResult.gatewayOrderId,
                clientSecret: gatewayResult.clientSecret || '',
                idempotencyKey,
                metadata: {
                    customer,
                    notes,
                    publicKey: gatewayResult.publicKey,
                    paymentSessionId: gatewayResult.paymentSessionId,
                    form: gatewayResult.form,
                    paymentUrl: gatewayResult.paymentUrl,
                    frontendReturnUrl: returnUrl || '',
                    fallback: !!resolved.fallback
                },
                rawResponse: gatewayResult.raw || {}
            });
        } catch (err) {
            // Race on unique idempotencyKey
            if (err?.code === 11000) {
                const raced = await CheckoutPayment.findOne({ idempotencyKey });
                if (raced) {
                    return res.json({
                        paymentId: raced._id,
                        gateway: raced.gateway,
                        status: raced.status,
                        gatewayOrderId: raced.gatewayOrderId,
                        amount: Math.round(raced.amount * 100),
                        currency: 'INR',
                        publicKey: raced.metadata?.publicKey,
                        form: raced.metadata?.form,
                        paymentUrl: raced.metadata?.paymentUrl,
                        orderId: raced.orderId,
                        replayed: true
                    });
                }
            }
            throw err;
        }

        order.paymentMethod = gateway;
        order.checkoutPaymentId = payment._id;
        order.paymentOwnerType = resolved.ownerType;
        order.isFallbackPayment = !!resolved.fallback;
        if (vendorId) order.vendorId = vendorId;
        await order.save();

        res.json({
            paymentId: payment._id,
            gateway,
            ownerType: resolved.ownerType,
            fallback: !!resolved.fallback,
            merchantId,
            vendorId,
            status: 'created',
            gatewayOrderId: gatewayResult.gatewayOrderId,
            amount: gatewayResult.amount,
            currency: 'INR',
            publicKey: gatewayResult.publicKey,
            clientSecret: gatewayResult.clientSecret || undefined,
            paymentSessionId: gatewayResult.paymentSessionId || undefined,
            paymentUrl: gatewayResult.paymentUrl || undefined,
            form: gatewayResult.form || undefined,
            orderId: order._id
        });
    } catch (error) {
        console.error('createCheckoutPayment:', error);
        res.status(500).json({ message: error.message || 'Failed to create payment', code: 'PAYMENT_FAILURE' });
    }
};

async function loadPaymentGatewayClient(payment) {
    let configDoc = null;
    if (payment.ownerType === 'vendor' && payment.vendorId) {
        const VendorPaymentGateway = (await import('../models/VendorPaymentGateway.js')).default;
        configDoc = await VendorPaymentGateway.findOne({
            vendorId: payment.vendorId,
            gateway: payment.gateway
        });
    } else {
        const MerchantPaymentGateway = (await import('../models/MerchantPaymentGateway.js')).default;
        configDoc = await MerchantPaymentGateway.findOne({
            merchantId: payment.merchantId,
            gateway: payment.gateway
        });
    }
    if (!configDoc) {
        throw Object.assign(new Error('Gateway configuration missing for verification'), { code: 'NOT_CONFIGURED' });
    }
    return buildGatewayClient(configDoc);
}

// POST /checkout/verify-payment
export const verifyCheckoutPayment = async (req, res) => {
    try {
        const { paymentId, gateway, ...gatewayPayload } = req.body;
        if (!paymentId) return res.status(400).json({ message: 'paymentId is required' });

        const payment = await CheckoutPayment.findById(paymentId);
        if (!payment) return res.status(404).json({ message: 'Payment record not found' });

        if (payment.gateway === 'cod') {
            payment.status = 'pending';
            await payment.save();
            return res.json({ success: true, status: 'pending', paymentId: payment._id, gateway: 'cod', orderId: payment.orderId });
        }

        if (payment.status === 'paid') {
            return res.json({
                success: true,
                status: 'paid',
                paymentId: payment._id,
                gateway: payment.gateway,
                gatewayPaymentId: payment.gatewayPaymentId,
                orderId: payment.orderId,
                replayed: true
            });
        }

        const client = await loadPaymentGatewayClient(payment);
        let result;

        if (payment.gateway === 'razorpay') {
            result = await client.verifyPayment({
                razorpay_order_id: gatewayPayload.razorpay_order_id || payment.gatewayOrderId,
                razorpay_payment_id: gatewayPayload.razorpay_payment_id,
                razorpay_signature: gatewayPayload.razorpay_signature
            });
        } else if (payment.gateway === 'payu') {
            result = await client.verifyPayment({
                txnid: gatewayPayload.txnid || payment.gatewayOrderId,
                amount: gatewayPayload.amount,
                productinfo: gatewayPayload.productinfo,
                firstname: gatewayPayload.firstname,
                email: gatewayPayload.email,
                status: gatewayPayload.status,
                hash: gatewayPayload.hash,
                mihpayid: gatewayPayload.mihpayid
            });
            if (result.success && gatewayPayload.amount != null && !amountsMatch(gatewayPayload.amount, payment.amount)) {
                result = { success: false, message: 'Paid amount does not match order amount' };
            }
        } else if (payment.gateway === 'stripe') {
            result = await client.verifyPayment({
                paymentIntentId: gatewayPayload.paymentIntentId || gatewayPayload.gatewayPaymentId || payment.gatewayOrderId
            });
        } else if (payment.gateway === 'cashfree') {
            result = await client.verifyPayment({
                orderId: gatewayPayload.orderId || payment.gatewayOrderId
            });
        } else {
            return res.status(400).json({ message: 'Unsupported gateway for verification' });
        }

        if (!result.success) {
            payment.status = 'failed';
            await payment.save();
            await markOrderPaymentFailed(payment.orderId, result.message || 'Payment verification failed');
            return res.status(400).json({
                success: false,
                message: result.message || 'Payment verification failed',
                code: 'PAYMENT_FAILURE',
                orderId: payment.orderId
            });
        }

        await finalizeSuccessfulPayment(payment, result.paymentId || gatewayPayload.razorpay_payment_id || gatewayPayload.mihpayid || '');

        res.json({
            success: true,
            status: 'paid',
            paymentId: payment._id,
            gateway: payment.gateway,
            gatewayPaymentId: payment.gatewayPaymentId,
            orderId: payment.orderId
        });
    } catch (error) {
        console.error('verifyCheckoutPayment:', error);
        const code = error.code || 'PAYMENT_FAILURE';
        const status = code === 'NOT_CONFIGURED' ? 400 : 500;
        res.status(status).json({ message: error.message || 'Payment verification failed', code });
    }
};

/**
 * PayU browser return (surl/furl). Verifies hash, marks order paid, redirects to storefront.
 */
export const payuReturn = async (req, res) => {
    const payload = { ...(req.body || {}), ...(req.query || {}) };
    const txnid = payload.txnid;
    const frontendFallback = '/';

    const redirectTo = (url, params = {}) => {
        try {
            const u = new URL(url, 'http://localhost');
            Object.entries(params).forEach(([k, v]) => {
                if (v != null && v !== '') u.searchParams.set(k, String(v));
            });
            // Absolute vs relative
            if (/^https?:\/\//i.test(url)) {
                const abs = new URL(url);
                Object.entries(params).forEach(([k, v]) => {
                    if (v != null && v !== '') abs.searchParams.set(k, String(v));
                });
                return res.redirect(302, abs.toString());
            }
            return res.redirect(302, `${u.pathname}${u.search}`);
        } catch {
            return res.redirect(302, frontendFallback);
        }
    };

    try {
        if (!txnid) {
            return redirectTo(frontendFallback, { payment: 'failed', reason: 'missing_txn' });
        }

        const payment = await CheckoutPayment.findOne({ gateway: 'payu', gatewayOrderId: txnid });
        if (!payment) {
            return redirectTo(frontendFallback, { payment: 'failed', reason: 'payment_not_found' });
        }

        const frontendUrl = payment.metadata?.frontendReturnUrl || frontendFallback;

        if (payment.status === 'paid') {
            return redirectTo(frontendUrl, {
                payment: 'success',
                orderId: String(payment.orderId),
                paymentId: String(payment._id)
            });
        }

        const client = await loadPaymentGatewayClient(payment);
        const result = await client.verifyPayment({
            txnid: payload.txnid,
            amount: payload.amount,
            productinfo: payload.productinfo,
            firstname: payload.firstname,
            email: payload.email,
            status: payload.status,
            hash: payload.hash
        });

        if (!result.success || (payload.amount != null && !amountsMatch(payload.amount, payment.amount))) {
            payment.status = 'failed';
            await payment.save();
            await markOrderPaymentFailed(payment.orderId, result.message || 'PayU verification failed');
            return redirectTo(frontendUrl, {
                payment: 'failed',
                orderId: String(payment.orderId),
                reason: 'verification_failed'
            });
        }

        await finalizeSuccessfulPayment(payment, payload.mihpayid || result.paymentId || txnid);

        return redirectTo(frontendUrl, {
            payment: 'success',
            orderId: String(payment.orderId),
            paymentId: String(payment._id)
        });
    } catch (error) {
        console.error('payuReturn:', error);
        return redirectTo(frontendFallback, { payment: 'failed', reason: 'server_error' });
    }
};

// GET /checkout/payment-status?orderId=
export const getPaymentStatus = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        if (!orderId) return res.status(400).json({ message: 'orderId is required' });

        const order = await Order.findById(orderId).lean();
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const payment = await CheckoutPayment.findOne({ orderId }).sort({ createdAt: -1 }).lean();

        res.json({
            orderId: order._id,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            totalAmount: order.totalAmount,
            checkoutPayment: payment
                ? {
                    paymentId: payment._id,
                    gateway: payment.gateway,
                    status: payment.status,
                    gatewayPaymentId: payment.gatewayPaymentId
                }
                : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load payment status' });
    }
};
