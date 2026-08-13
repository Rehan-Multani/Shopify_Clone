/**
 * Lightweight theme analytics helpers (no PII).
 */

export const ALLOWED_THEME_EVENTS = new Set([
    'page_view',
    'product_view',
    'add_to_cart',
    'begin_checkout',
    'purchase',
    'theme_preview',
    'theme_published',
    'theme_upgraded',
    'theme_load',
    'session_start',
]);

export const stripSensitiveMeta = (meta = {}) => {
    if (!meta || typeof meta !== 'object') return {};
    const {
        email, password, token, authorization, card, phone, address,
        customerName, customerEmail, shippingAddress, billingAddress,
        ...rest
    } = meta;
    return rest;
};

export const buildThemeEventPayload = ({
    storeId,
    themeId = '',
    themeVersion = '',
    eventType,
    meta = {},
    sessionKey = '',
    revenue,
} = {}) => {
    if (!storeId) throw new Error('storeId required');
    if (!ALLOWED_THEME_EVENTS.has(String(eventType))) throw new Error('Invalid eventType');
    return {
        storeId: String(storeId),
        themeId: String(themeId).slice(0, 120),
        themeVersion: String(themeVersion).slice(0, 40),
        eventType: String(eventType),
        meta: stripSensitiveMeta(meta),
        sessionKey: String(sessionKey || '').slice(0, 64),
        revenue: revenue == null || Number.isNaN(Number(revenue)) ? undefined : Number(revenue),
        timestamp: new Date().toISOString(),
    };
};

export default {
    ALLOWED_THEME_EVENTS,
    stripSensitiveMeta,
    buildThemeEventPayload,
};
