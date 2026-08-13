/**
 * Responsive value helpers — consistent { desktop, tablet, mobile } model.
 */

export const normalizeResponsiveValue = (value, fallback = { desktop: 0, tablet: 0, mobile: 0 }) => {
    const base = {
        desktop: fallback.desktop ?? 0,
        tablet: fallback.tablet ?? fallback.desktop ?? 0,
        mobile: fallback.mobile ?? fallback.desktop ?? 0,
    };

    if (value == null) return { ...base };

    if (typeof value === 'number' || typeof value === 'string') {
        const n = Number(value);
        const v = Number.isFinite(n) ? n : base.desktop;
        return { desktop: v, tablet: v, mobile: v };
    }

    if (typeof value === 'object') {
        const desktop = value.desktop != null && value.desktop !== ''
            ? Number(value.desktop)
            : base.desktop;
        const tablet = value.tablet != null && value.tablet !== ''
            ? Number(value.tablet)
            : (Number.isFinite(desktop) ? desktop : base.tablet);
        const mobile = value.mobile != null && value.mobile !== ''
            ? Number(value.mobile)
            : (Number.isFinite(desktop) ? desktop : base.mobile);
        return {
            desktop: Number.isFinite(desktop) ? desktop : base.desktop,
            tablet: Number.isFinite(tablet) ? tablet : base.tablet,
            mobile: Number.isFinite(mobile) ? mobile : base.mobile,
        };
    }

    return { ...base };
};

/**
 * Resolve value for a viewport. Missing tablet/mobile → fallback to desktop
 * unless field.fallbackViewport is set.
 */
export const resolveResponsiveForViewport = (value, viewport = 'desktop', field = {}) => {
    const defaults = field.defaultValue || { desktop: 0, tablet: 0, mobile: 0 };
    const normalized = normalizeResponsiveValue(value, defaults);
    const vp = ['desktop', 'tablet', 'mobile'].includes(viewport) ? viewport : 'desktop';
    if (normalized[vp] != null && normalized[vp] !== '') return normalized[vp];
    const fb = field.fallbackViewport || 'desktop';
    return normalized[fb] ?? normalized.desktop;
};

export default {
    normalizeResponsiveValue,
    resolveResponsiveForViewport,
};
