/**
 * Cross-store authorization helpers (Wave 8).
 * Downstream services must not trust x-store-id alone.
 */
import Store from '../models/Store.js';

/**
 * Load a store only if the caller owns it (or is admin).
 * @returns {{ ok: true, store } | { ok: false, status: number, message: string }}
 */
export const requireOwnedStore = async (req, storeId, { select } = {}) => {
    if (!storeId) {
        return { ok: false, status: 400, message: 'Store ID header is missing' };
    }

    if (req.previewAuth && !req.merchant) {
        if (String(req.previewAuth.storeId) !== String(storeId)) {
            return { ok: false, status: 403, message: 'Preview cannot access other stores' };
        }
        const q = Store.findById(storeId);
        if (select) q.select(select);
        const store = await q;
        if (!store) return { ok: false, status: 404, message: 'Store not found' };
        return { ok: true, store, preview: true };
    }

    if (req.admin && !req.merchant) {
        const q = Store.findById(storeId);
        if (select) q.select(select);
        const store = await q;
        if (!store) return { ok: false, status: 404, message: 'Store not found' };
        return { ok: true, store };
    }

    if (!req.merchant?._id) {
        return { ok: false, status: 401, message: 'Unauthorized' };
    }

    const filter = { _id: storeId, merchantId: req.merchant._id };
    const q = Store.findOne(filter);
    if (select) q.select(select);
    const store = await q;
    if (!store) {
        // Distinguish missing vs forbidden without leaking ownership
        const exists = await Store.exists({ _id: storeId });
        if (!exists) return { ok: false, status: 404, message: 'Store not found' };
        return { ok: false, status: 403, message: 'Store access denied' };
    }
    return { ok: true, store };
};

export default requireOwnedStore;
