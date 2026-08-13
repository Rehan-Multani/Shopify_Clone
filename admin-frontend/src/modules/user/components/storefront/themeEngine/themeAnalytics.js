/**
 * Lightweight theme analytics client — no PII.
 * Consent-aware: pending until user chooses; then granted/denied.
 */
const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;
const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

export const CONSENT_KEY = 'storify_analytics_consent';

export const getAnalyticsConsent = () => {
    try {
        const v = localStorage.getItem(CONSENT_KEY);
        if (v === 'granted') return 'granted';
        if (v === 'denied') return 'denied';
        return 'pending';
    } catch {
        return 'denied';
    }
};

export const setAnalyticsConsent = (value) => {
    try {
        const next = value === 'denied' ? 'denied' : 'granted';
        localStorage.setItem(CONSENT_KEY, next);
    } catch {
        /* ignore */
    }
};

/**
 * Best-effort consent audit beacon — no PII, never blocks navigation.
 */
export const persistConsentAudit = ({ storeId, consent } = {}) => {
    if (!storeId || !consent) return;
    try {
        const sessionKey = getOrCreateSessionKey(storeId);
        const url = `${STORE_API_URL || GATEWAY_URL}/themes/consent`;
        const body = JSON.stringify({
            storeId,
            consent: consent === 'denied' ? 'denied' : 'granted',
            sessionKey,
        });
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            const blob = new Blob([body], { type: 'application/json' });
            navigator.sendBeacon(url, blob);
            return;
        }
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-store-id': storeId },
            body,
            keepalive: true,
        }).catch(() => {});
    } catch {
        /* ignore — storefront must continue */
    }
};

export const trackThemeAnalyticsEvent = async ({
    storeId,
    themeId = '',
    themeVersion = '',
    eventType,
    meta = {},
    experimentId = '',
    variantKey = '',
    metrics,
    sessionKey = '',
    revenue,
    currency,
    orderId,
} = {}) => {
    if (!storeId || !eventType) return;
    if (getAnalyticsConsent() !== 'granted') return;
    try {
        const url = `${STORE_API_URL || GATEWAY_URL}/themes/analytics/events`;
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-store-id': storeId,
            },
            body: JSON.stringify({
                storeId,
                themeId,
                themeVersion,
                eventType,
                meta,
                experimentId,
                variantKey,
                sessionKey,
                revenue,
                currency,
                orderId,
                metrics,
            }),
            keepalive: true,
        });
    } catch {
        // fire-and-forget
    }
};

export const getOrCreateVisitorKey = (storeId) => {
    const key = `theme_exp_visitor_${storeId}`;
    const consent = getAnalyticsConsent();
    try {
        if (consent !== 'granted') {
            let session = sessionStorage.getItem(key);
            if (!session) {
                session = `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
                sessionStorage.setItem(key, session);
            }
            return session;
        }
        let v = localStorage.getItem(key);
        if (!v) {
            v = `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
            localStorage.setItem(key, v);
        }
        return v;
    } catch {
        return `anon-${Date.now()}`;
    }
};

/** Short-lived first-party session key (tab/session scoped). */
export const getOrCreateSessionKey = (storeId) => {
    const key = `theme_session_${storeId}`;
    try {
        let v = sessionStorage.getItem(key);
        if (!v) {
            v = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
            sessionStorage.setItem(key, v);
        }
        return v;
    } catch {
        return `s-${Date.now()}`;
    }
};

export const getThemeAttribution = (storeId) => {
    try {
        const raw = localStorage.getItem(`_theme_meta_${storeId}`);
        const meta = raw ? JSON.parse(raw) : {};
        return {
            themeId: meta.themeId || meta.themeFolder || '',
            themeFolder: meta.themeFolder || '',
            themeVersion: meta.themeVersion || '',
            experimentId: meta.experimentId || '',
            variantKey: meta.variantKey || '',
            sessionKey: getOrCreateSessionKey(storeId),
        };
    } catch {
        return { sessionKey: getOrCreateSessionKey(storeId) };
    }
};

export const assignStoreExperiment = async (storeId) => {
    if (!storeId || getAnalyticsConsent() !== 'granted') return null;
    try {
        const activeRes = await fetch(`${STORE_API_URL || GATEWAY_URL}/themes/experiments/active`, {
            headers: { 'x-store-id': storeId },
        });
        if (!activeRes.ok) return null;
        const activeJson = await activeRes.json();
        const experimentId = activeJson?.data?._id;
        if (!experimentId) return null;

        const visitorKey = getOrCreateVisitorKey(storeId);
        const assignRes = await fetch(`${STORE_API_URL || GATEWAY_URL}/themes/experiments/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-store-id': storeId,
            },
            body: JSON.stringify({ storeId, experimentId, visitorKey }),
        });
        if (!assignRes.ok) return null;
        const assigned = await assignRes.json();
        if (!assigned.success) return null;
        return assigned;
    } catch {
        return null;
    }
};

export default trackThemeAnalyticsEvent;
