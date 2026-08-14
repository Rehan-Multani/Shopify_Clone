/**
 * ShippingService — create / track Shiprocket shipments.
 * Never throws into the order HTTP path: caller should catch and keep the order.
 */
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { resolveShippingConfig } from './shippingResolver.js';
import {
    loginShiprocket,
    createShiprocketOrder,
    assignShiprocketAwb,
    trackShiprocketAwb,
} from '../utils/shiprocketClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadEncryption() {
    const sharedPath = path.resolve(__dirname, '../../../shared/encryption.js');
    return import(pathToFileURL(sharedPath).href);
}

const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // ~9 days (Shiprocket tokens last ~10)

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
    lastError: reason === 'NO_KEYS' || reason === 'PLATFORM_DISABLED' ? '' : String(reason || '').slice(0, 300),
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
    const login = await loginShiprocket({ email: creds.email, password: creds.password });
    if (!login.ok) {
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
    return {
        order_id: String(order._id),
        order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 10),
        pickup_location: doc.pickupLocation || 'Primary',
        billing_customer_name: name.first,
        billing_last_name: name.last,
        billing_address: addr.address || 'Address not provided',
        billing_city: addr.city || 'NA',
        billing_pincode: String(addr.pincode || doc.pickupPincode || '110001'),
        billing_state: addr.state || 'NA',
        billing_country: 'India',
        billing_email: order.customerEmail || 'noreply@storify.local',
        billing_phone: phone || '9999999999',
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
        ...(doc.channelId ? { channel_id: Number(doc.channelId) || doc.channelId } : {}),
    };
};

/**
 * Best-effort Shiprocket create. Mutates order.shipping. Does not throw to caller
 * unless you want the message — wrap at orderController.
 */
export async function fulfillOrderShipment(order) {
    try {
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
        const created = await createShiprocketOrder(token, buildCreatePayload(order, resolved.doc));
        if (!created.ok) {
            applyManualFallback(order, created.message);
            return { ok: false, mode: 'manual', reason: created.message };
        }

        const data = created.data || {};
        let awb = data.awb_code || data.awb || '';
        const shipmentId = String(data.shipment_id || data.shipmentId || '');
        let courierName = data.courier_name || '';

        if (shipmentId && !awb) {
            const assigned = await assignShiprocketAwb(token, shipmentId);
            if (assigned.ok) {
                const inner = assigned.data?.response?.data || assigned.data || {};
                awb = inner.awb_code || inner.awb || awb;
                courierName = inner.courier_name || courierName;
            }
        }

        order.shipping = {
            provider: 'shiprocket',
            ownerType: resolved.ownerType,
            status: awb ? 'awb_generated' : 'created',
            shiprocketOrderId: String(data.order_id || order._id),
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
        applyManualFallback(order, err.message || 'SHIPROCKET_FAILED');
        return { ok: false, mode: 'manual', reason: err.message };
    }
}

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
        if (!tracked.ok) return { ok: false, message: tracked.message };

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
                order.status = mapped.orderStatus;
                order.trackingStatus = order.trackingStatus || [];
                order.trackingStatus.push({
                    status: mapped.orderStatus,
                    updatedAt: new Date(),
                    description: mapped.description,
                });
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
    if (s.includes('CANCEL')) {
        return { shippingStatus: 'failed', orderStatus: null, description: 'Shiprocket shipment cancelled.' };
    }
    return { shippingStatus: 'created', orderStatus: null, description: raw || '' };
}

export default {
    fulfillOrderShipment,
    syncOrderTracking,
    applyManualFallback,
    mapShiprocketStatus,
};
