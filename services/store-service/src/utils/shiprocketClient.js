/**
 * Minimal Shiprocket External API client.
 * Never logs email/password/token values.
 */
const BASE = 'https://apiv2.shiprocket.in/v1/external';

const request = async (path, { method = 'GET', token, body, timeoutMs = 12000 } = {}) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(`${BASE}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: ctrl.signal,
        });
        const json = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data: json };
    } catch (err) {
        const aborted = err?.name === 'AbortError';
        return {
            ok: false,
            status: 0,
            data: { message: aborted ? 'Shiprocket request timed out' : (err.message || 'Shiprocket request failed') },
        };
    } finally {
        clearTimeout(t);
    }
};

export const loginShiprocket = async ({ email, password }) => {
    if (!email || !password) {
        return { ok: false, status: 400, message: 'Shiprocket email and password are required' };
    }
    const result = await request('/auth/login', {
        method: 'POST',
        body: { email, password },
    });
    const token = result.data?.token;
    if (!result.ok || !token) {
        return {
            ok: false,
            status: result.status,
            message: result.data?.message || result.data?.error || 'Shiprocket login failed',
        };
    }
    return { ok: true, status: result.status, token, companyId: result.data?.company_id };
};

export const createShiprocketOrder = async (token, payload) => {
    const result = await request('/orders/create/adhoc', {
        method: 'POST',
        token,
        body: payload,
    });
    if (!result.ok) {
        return {
            ok: false,
            status: result.status,
            message: result.data?.message || result.data?.error || 'Shiprocket order create failed',
            data: result.data,
        };
    }
    return { ok: true, status: result.status, data: result.data };
};

export const assignShiprocketAwb = async (token, shipmentId) => {
    const result = await request('/courier/assign/awb', {
        method: 'POST',
        token,
        body: { shipment_id: shipmentId },
    });
    if (!result.ok) {
        return {
            ok: false,
            status: result.status,
            message: result.data?.message || result.data?.error || 'AWB assignment failed',
            data: result.data,
        };
    }
    return { ok: true, status: result.status, data: result.data };
};

export const trackShiprocketAwb = async (token, awb) => {
    const result = await request(`/courier/track/awb/${encodeURIComponent(awb)}`, { token });
    if (!result.ok) {
        return {
            ok: false,
            status: result.status,
            message: result.data?.message || 'Tracking lookup failed',
            data: result.data,
        };
    }
    return { ok: true, status: result.status, data: result.data };
};

/** Cancel Shiprocket order(s) by Shiprocket order id(s). Best-effort. */
export const cancelShiprocketOrders = async (token, ids = []) => {
    const list = (Array.isArray(ids) ? ids : [ids]).map(String).filter(Boolean);
    if (!list.length) {
        return { ok: false, status: 400, message: 'No Shiprocket order ids to cancel' };
    }
    const result = await request('/orders/cancel', {
        method: 'POST',
        token,
        body: { ids: list },
    });
    if (!result.ok) {
        return {
            ok: false,
            status: result.status,
            message: result.data?.message || result.data?.error || 'Shiprocket cancel failed',
            data: result.data,
        };
    }
    return { ok: true, status: result.status, data: result.data };
};

export default {
    loginShiprocket,
    createShiprocketOrder,
    assignShiprocketAwb,
    trackShiprocketAwb,
    cancelShiprocketOrders,
};
