/**
 * ShippingService — create / track Shiprocket shipments.
 * Never throws into the order HTTP path: caller should catch and keep the order.
 *
 * Fulfill only when eligible (COD, or online paid / accepted) — avoids orphan Shiprocket
 * shipments for abandoned unpaid checkouts.
 */
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { resolveShippingConfig, markShippingConfigBroken } from './shippingResolver.js';
import {
    loginShiprocket,
    createShiprocketOrder,
    assignShiprocketAwb,
    trackShiprocketAwb,
    cancelShiprocketOrders,
} from '../utils/shiprocketClient.js';
import { emitEmail, ownerFromOrder } from '../../../shared/emailService.js';
import { statusEmailEvent } from '../../../shared/emailEvents.js';
import { orderStatusEmail } from '../../../shared/storefrontEmails.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadEncryption() {
    const sharedPath = path.resolve(__dirname, '../../../shared/encryption.js');
    return import(pathToFileURL(sharedPath).href);
}

const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000;

const isAuthFailureMessage = (msg = '', status = 0) => {
    const s = String(msg || '').toLowerCase();
    if (status === 401 || status === 403) return true;
    return s.includes('unauthorized')
        || s.includes('unauthenticated')
        || s.includes('invalid login')
        || s.includes('login failed')
        || s.includes('authentication failed')
        || s.includes('invalid credentials')
        || s.includes('token expired')
        || s.includes('token has expired')
        || s.includes('jwt expired');
};

const isDuplicateOrderMessage = (msg = '') => {
    const s = String(msg || '').toLowerCase();
    return s.includes('already exists')
        || s.includes('duplicate')
        || s.includes('order id already');
};

/**
 * When to create / finish a Shiprocket shipment for an order.
 * Skips only when AWB already exists (fully fulfilled).
 */
export function canFulfillShiprocket(order) {
    if (!order) return false;
    if (order.shipping?.provider === 'shiprocket' && order.shipping?.awb) return false;
    if (['cancelled', 'rejected'].includes(String(order.status || '').toLowerCase())) return false;

    const method = String(order.paymentMethod || 'COD').toUpperCase();
    const paid = String(order.paymentStatus || '').toLowerCase() === 'paid';
    const status = String(order.status || '').toLowerCase();

    if (method === 'COD') return true;
    if (paid) return true;
    if (['accepted', 'shipped', 'out_for_delivery', 'processing'].includes(status)) return true;
    return false;
}

const splitName = (full = '') => {
    const parts = String(full).trim().split(/\s+/).filter(Boolean);
    return {
        first: parts[0] || 'Customer',
        last: parts.slice(1).join(' ') || '',
    };
};

const manualShipping = (reason = 'NO_KEYS') => ({
    provider: 'manual',
    ownerType: null,
    status: 'manual',
    shiprocketOrderId: '',
    shipmentId: '',
    awb: '',
    courierName: '',
    trackingUrl: '',
    lastError: ['NO_KEYS', 'PLATFORM_DISABLED', 'VENDOR_NOT_CONFIGURED', 'MERCHANT_NOT_CONFIGURED', 'NOT_ELIGIBLE'].includes(reason)
        ? ''
        : String(reason || '').slice(0, 300),
    lastSyncedAt: new Date(),
    fallbackReason: reason,
});

export const applyManualFallback = (order, reason) => {
    order.shipping = {
        ...(order.shipping?.toObject?.() || order.shipping || {}),
        ...manualShipping(reason),
    };
    return order;
};

async function getTokenForDoc(doc) {
    const { decryptCredentials, decrypt, encrypt } = await loadEncryption();
    const now = Date.now();
    if (doc.tokenEncrypted && doc.tokenExpiresAt && new Date(doc.tokenExpiresAt).getTime() > now + 60_000) {
        const cached = decrypt(doc.tokenEncrypted);
        if (cached) return cached;
    }
    const creds = decryptCredentials(doc.credentials);
    if (!creds?.email || !creds?.password) {
        await markShippingConfigBroken(doc, 'Shiprocket credentials incomplete');
        throw new Error('Shiprocket credentials incomplete');
    }
    const login = await loginShiprocket({ email: creds.email, password: creds.password });
    if (!login.ok) {
        await markShippingConfigBroken(doc, login.message || 'Shiprocket login failed');
        throw new Error(login.message || 'Shiprocket login failed');
    }
    doc.tokenEncrypted = encrypt(login.token);
    doc.tokenExpiresAt = new Date(now + TOKEN_TTL_MS);
    await doc.save();
    return login.token;
}

const buildCreatePayload = (order, doc) => {
    const addr = order.shippingAddress || {};
    const name = splitName(order.customerName);
    const paymentMethod = String(order.paymentMethod || 'COD').toUpperCase() === 'COD' ? 'COD' : 'Prepaid';
    const items = (order.products || []).map((p, i) => ({
        name: p.productName || `Item ${i + 1}`,
        sku: String(p.productId || `sku-${i + 1}`).slice(0, 50),
        units: Math.max(1, Number(p.quantity) || 1),
        selling_price: Number(p.price) || 0,
    }));
    const phone = String(order.customerPhone || '').replace(/\D/g, '').slice(-10);
    // Never use warehouse pickup PIN as customer delivery PIN
    const pincode = String(addr.pincode || '').replace(/\D/g, '');
    return {
        order_id: String(order._id),
        order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 10),
        pickup_location: doc.pickupLocation || 'Primary',
        billing_customer_name: name.first,
        billing_last_name: name.last,
        billing_address: addr.address || 'Address not provided',
        billing_city: addr.city || 'NA',
        billing_pincode: pincode,
        billing_state: addr.state || 'NA',
        billing_country: 'India',
        billing_email: order.customerEmail || 'noreply@storify.local',
        billing_phone: phone,
        shipping_is_billing: true,
        order_items: items.length ? items : [{
            name: 'Order item',
            sku: 'item',
            units: 1,
            selling_price: Number(order.totalAmount) || 0,
        }],
        payment_method: paymentMethod,
        sub_total: Number(order.subtotal || order.totalAmount) || 0,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5,
    };
};

const assertShiprocketAddress = (payload) => {
    if (!/^\d{6}$/.test(String(payload.billing_pincode || ''))) {
        return { ok: false, message: 'Valid 6-digit delivery pincode required for Shiprocket' };
    }
    if (!/^\d{10}$/.test(String(payload.billing_phone || ''))) {
        return { ok: false, message: 'Valid 10-digit phone required for Shiprocket' };
    }
    if (!String(payload.billing_address || '').trim() || payload.billing_address === 'Address not provided') {
        return { ok: false, message: 'Shipping address required for Shiprocket' };
    }
    return { ok: true };
};

export async function fulfillOrderShipment(order) {
    try {
        if (!canFulfillShiprocket(order)) {
            // Prepaid unpaid: leave shipping as-is (usually pending/manual), do not stamp errors
            if (!order.shipping?.provider || order.shipping.provider === 'manual') {
                applyManualFallback(order, 'NOT_ELIGIBLE');
            }
            return { ok: false, mode: 'manual', reason: 'NOT_ELIGIBLE' };
        }

        const resolved = await resolveShippingConfig({
            merchantId: order.merchantId,
            storeId: order.storeId,
            vendorId: order.vendorId,
        });

        if (!resolved.ok) {
            applyManualFallback(order, resolved.reason);
            return { ok: false, mode: 'manual', reason: resolved.reason };
        }

        const token = await getTokenForDoc(resolved.doc);
        const existing = order.shipping || {};
        let shipmentId = String(existing.shipmentId || '');
        let shiprocketOrderId = String(existing.shiprocketOrderId || '');
        let awb = String(existing.awb || '');
        let courierName = String(existing.courierName || '');

        // Idempotent: only create when we have no Shiprocket shipment yet
        if (!shipmentId && !awb) {
            const payload = buildCreatePayload(order, resolved.doc);
            const addrOk = assertShiprocketAddress(payload);
            if (!addrOk.ok) {
                applyManualFallback(order, addrOk.message);
                return { ok: false, mode: 'manual', reason: addrOk.message };
            }

            const created = await createShiprocketOrder(token, payload);
            if (!created.ok) {
                if (isAuthFailureMessage(created.message, created.status)) {
                    await markShippingConfigBroken(resolved.doc, created.message);
                }
                // Duplicate order_id on Shiprocket — keep trying AWB via existing ids if any
                if (!isDuplicateOrderMessage(created.message)) {
                    applyManualFallback(order, created.message);
                    return { ok: false, mode: 'manual', reason: created.message };
                }
                // If duplicate and we somehow have no shipmentId, mark as created without AWB for later retry
                shiprocketOrderId = shiprocketOrderId || String(order._id);
            } else {
                const data = created.data || {};
                awb = data.awb_code || data.awb || '';
                shipmentId = String(data.shipment_id || data.shipmentId || '');
                courierName = data.courier_name || courierName;
                shiprocketOrderId = String(data.order_id || order._id);
            }
        }

        if (shipmentId && !awb) {
            const assigned = await assignShiprocketAwb(token, shipmentId);
            if (assigned.ok) {
                const inner = assigned.data?.response?.data || assigned.data || {};
                awb = inner.awb_code || inner.awb || awb;
                courierName = inner.courier_name || courierName;
            } else if (isAuthFailureMessage(assigned.message, assigned.status)) {
                await markShippingConfigBroken(resolved.doc, assigned.message);
            }
        }

        order.shipping = {
            provider: 'shiprocket',
            ownerType: resolved.ownerType,
            status: awb ? 'awb_generated' : 'created',
            shiprocketOrderId: shiprocketOrderId || String(order._id),
            shipmentId,
            awb: String(awb || ''),
            courierName: String(courierName || ''),
            trackingUrl: awb ? `https://shiprocket.co/tracking/${awb}` : '',
            lastError: '',
            lastSyncedAt: new Date(),
            fallbackReason: '',
        };
        return { ok: true, mode: 'shiprocket', shipping: order.shipping };
    } catch (err) {
        if (isAuthFailureMessage(err.message, 0)) {
            try {
                const resolved = await resolveShippingConfig({
                    merchantId: order.merchantId,
                    storeId: order.storeId,
                    vendorId: order.vendorId,
                });
                if (resolved.ok) await markShippingConfigBroken(resolved.doc, err.message);
            } catch {
                /* ignore */
            }
        }
        applyManualFallback(order, err.message || 'SHIPROCKET_FAILED');
        return { ok: false, mode: 'manual', reason: err.message };
    }
}

/**
 * Best-effort cancel on Shiprocket when local order is cancelled.
 * Never throws — local cancel must always succeed.
 */
export async function cancelOrderShipment(order) {
    try {
        if (order?.shipping?.provider !== 'shiprocket') {
            return { ok: false, skipped: true };
        }
        const id = order.shipping.shiprocketOrderId || order._id;
        if (!id) return { ok: false, skipped: true };

        const resolved = await resolveShippingConfig({
            merchantId: order.merchantId,
            storeId: order.storeId,
            vendorId: order.vendorId,
        });
        if (!resolved.ok) {
            order.shipping.lastError = 'Cancel skipped — Shiprocket not live';
            return { ok: false, skipped: true };
        }

        const token = await getTokenForDoc(resolved.doc);
        const cancelled = await cancelShiprocketOrders(token, [id]);
        if (!cancelled.ok) {
            if (isAuthFailureMessage(cancelled.message, cancelled.status)) {
                await markShippingConfigBroken(resolved.doc, cancelled.message);
            }
            order.shipping.lastError = String(cancelled.message || 'Cancel failed').slice(0, 300);
            return { ok: false, message: cancelled.message };
        }
        order.shipping.status = 'failed';
        order.shipping.lastError = '';
        order.shipping.lastSyncedAt = new Date();
        return { ok: true };
    } catch (err) {
        if (order?.shipping) {
            order.shipping.lastError = String(err.message || 'Cancel failed').slice(0, 300);
        }
        return { ok: false, message: err.message };
    }
}

const emitStatusMailIfChanged = (order, prevStatus, nextStatus) => {
    try {
        if (!nextStatus || prevStatus === nextStatus || !order?.customerEmail) return;
        const event = statusEmailEvent(nextStatus);
        if (!event) return;
        const mail = orderStatusEmail(order, event);
        if (mail) {
            emitEmail({ event, ...ownerFromOrder(order), ...mail });
        }
    } catch (err) {
        console.error('[Shipping] status email skipped:', err.message);
    }
};

export async function syncOrderTracking(order) {
    try {
        if (order.shipping?.provider !== 'shiprocket' || !order.shipping?.awb) {
            return { ok: false, skipped: true };
        }
        const resolved = await resolveShippingConfig({
            merchantId: order.merchantId,
            storeId: order.storeId,
            vendorId: order.vendorId,
        });
        if (!resolved.ok) return { ok: false, skipped: true };

        const token = await getTokenForDoc(resolved.doc);
        const tracked = await trackShiprocketAwb(token, order.shipping.awb);
        if (!tracked.ok) {
            if (isAuthFailureMessage(tracked.message, tracked.status)) {
                await markShippingConfigBroken(resolved.doc, tracked.message);
            }
            return { ok: false, message: tracked.message };
        }

        const tracking = tracked.data?.tracking_data || tracked.data || {};
        const current = tracking.shipment_status
            || tracking.track_status
            || tracking.current_status
            || tracking.shipment_track?.[0]?.current_status
            || '';
        const mapped = mapShiprocketStatus(String(current));

        order.shipping.status = mapped.shippingStatus;
        order.shipping.lastSyncedAt = new Date();
        order.shipping.lastError = '';
        if (mapped.orderStatus && !['delivered', 'cancelled', 'rejected'].includes(order.status)) {
            if (order.status !== mapped.orderStatus) {
                const prevStatus = order.status;
                order.status = mapped.orderStatus;
                order.trackingStatus = order.trackingStatus || [];
                order.trackingStatus.push({
                    status: mapped.orderStatus,
                    updatedAt: new Date(),
                    description: mapped.description,
                });
                emitStatusMailIfChanged(order, prevStatus, mapped.orderStatus);
            }
        }
        return { ok: true, current };
    } catch (err) {
        return { ok: false, message: err.message };
    }
}

export function mapShiprocketStatus(raw) {
    const s = String(raw || '').toUpperCase();
    if (s.includes('OUT FOR DELIVERY') || s.includes('OFD')) {
        return { shippingStatus: 'in_transit', orderStatus: 'out_for_delivery', description: 'Out for delivery (Shiprocket).' };
    }
    if (s.includes('DELIVER')) {
        return { shippingStatus: 'delivered', orderStatus: 'delivered', description: 'Delivered via Shiprocket.' };
    }
    if (s.includes('SHIPPED') || s.includes('IN TRANSIT') || s.includes('PICKED')) {
        return { shippingStatus: 'in_transit', orderStatus: 'shipped', description: 'Shipped via Shiprocket.' };
    }
    if (s.includes('CANCEL') || s.includes('RTO')) {
        return { shippingStatus: 'failed', orderStatus: null, description: 'Shiprocket shipment cancelled / RTO.' };
    }
    return { shippingStatus: 'created', orderStatus: null, description: raw || '' };
}

/** Used by webhook + sync when order status advances via Shiprocket. */
export function emitShippingStatusEmail(order, prevStatus, nextStatus) {
    emitStatusMailIfChanged(order, prevStatus, nextStatus);
}

export default {
    fulfillOrderShipment,
    cancelOrderShipment,
    syncOrderTracking,
    applyManualFallback,
    mapShiprocketStatus,
    canFulfillShiprocket,
    emitShippingStatusEmail,
};
