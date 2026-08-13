/**
 * Design token resolution for Shopify-style theme settings.
 * Maps merchant theme settings → CSS custom properties.
 */

const SPACING_SCALES = {
    tight: { section: '3rem', gap: '0.75rem', block: '1rem' },
    normal: { section: '5rem', gap: '1.25rem', block: '1.5rem' },
    roomy: { section: '7rem', gap: '1.75rem', block: '2rem' },
};

const SHADOW_PRESETS = {
    none: 'none',
    soft: '0 4px 20px -8px rgba(0,0,0,0.12)',
    medium: '0 12px 40px -16px rgba(0,0,0,0.18)',
    dramatic: '0 24px 60px -20px rgba(0,0,0,0.28)',
};

const MOTION_PRESETS = {
    none: { duration: '0ms', distance: '0px', ease: 'linear' },
    subtle: { duration: '280ms', distance: '8px', ease: 'ease-out' },
    smooth: { duration: '450ms', distance: '16px', ease: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    fade: { duration: '500ms', distance: '0px', ease: 'ease-out' },
    slide: { duration: '520ms', distance: '28px', ease: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    zoom: { duration: '480ms', distance: '0px', ease: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    luxury: { duration: '700ms', distance: '20px', ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    gentle: { duration: '450ms', distance: '16px', ease: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    cinematic: { duration: '800ms', distance: '24px', ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    snappy: { duration: '220ms', distance: '10px', ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    functional: { duration: '280ms', distance: '12px', ease: 'ease-out' },
};

const RADIUS_MAP = {
    solid: '8px',
    outline: '8px',
    pill: '9999px',
    square: '0px',
    rounded: '12px',
};

export const hexToRgba = (hex, alpha = 1) => {
    try {
        const cleanHex = String(hex || '').replace('#', '');
        let r;
        let g;
        let b;
        if (cleanHex.length === 3) {
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else {
            r = parseInt(cleanHex.substring(0, 2), 16);
            g = parseInt(cleanHex.substring(2, 4), 16);
            b = parseInt(cleanHex.substring(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch {
        return `rgba(0, 0, 0, ${alpha})`;
    }
};

export const isDarkColor = (hex) => {
    try {
        const cleanHex = String(hex || '').replace('#', '');
        let r;
        let g;
        let b;
        if (cleanHex.length === 3) {
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else {
            r = parseInt(cleanHex.substring(0, 2), 16);
            g = parseInt(cleanHex.substring(2, 4), 16);
            b = parseInt(cleanHex.substring(4, 6), 16);
        }
        return (r * 299 + g * 587 + b * 114) / 1000 < 128;
    } catch {
        return false;
    }
};

/**
 * Resolve theme settings into a flat CSS variable style object.
 */
export const resolveDesignTokens = (settings = {}) => {
    const primary = settings.primaryColor || '#0f172a';
    const secondary = settings.secondaryColor || '#ffffff';
    const accent = settings.accentColor || settings.primaryColor || '#c9a227';
    const borderRadius = settings.borderRadius || RADIUS_MAP[settings.buttonStyle] || '8px';
    const spacingKey = settings.spacingScale || 'normal';
    const spacing = SPACING_SCALES[spacingKey] || SPACING_SCALES.normal;
    const motionKey = settings.animationPreset || settings.motionPreset || 'smooth';
    const motion = MOTION_PRESETS[motionKey] || MOTION_PRESETS.smooth;
    const shadowKey = settings.shadowPreset || (settings.sectionStyle === 'cards' ? 'soft' : 'none');
    const headingFont = settings.headingFont || settings.fontFamily || 'Playfair Display, Georgia, serif';
    const bodyFont = settings.bodyFont || settings.fontFamily || 'DM Sans, Segoe UI, sans-serif';
    const containerWidth = settings.containerWidth || '1280px';
    const buttonRadius = settings.buttonStyle === 'pill'
        ? '9999px'
        : settings.buttonStyle === 'square'
            ? '0px'
            : borderRadius;

    return {
        '--color-primary': primary,
        '--color-secondary': secondary,
        '--color-accent': accent,
        '--color-primary-light': hexToRgba(primary, 0.1),
        '--color-primary-semi': hexToRgba(primary, 0.25),
        '--color-primary-dark': hexToRgba(primary, 0.8),
        '--color-accent-light': hexToRgba(accent, 0.12),
        '--color-text': isDarkColor(secondary) ? '#ffffff' : '#18181b',
        '--color-text-muted': isDarkColor(secondary) ? 'rgba(255,255,255,0.65)' : '#71717a',
        '--border-radius': borderRadius,
        '--radius-sm': `max(0px, calc(${borderRadius} - 4px))`,
        '--radius-md': borderRadius,
        '--radius-lg': `calc(${borderRadius} + 8px)`,
        '--radius-button': buttonRadius,
        '--heading-font': headingFont,
        '--body-font': bodyFont,
        '--font-heading': headingFont,
        '--font-body': bodyFont,
        '--font-button': settings.buttonFont || settings.navigationFont || bodyFont,
        '--font-nav': settings.navigationFont || bodyFont,
        '--font-price': settings.priceFont || bodyFont,
        '--heading-letter-spacing': settings.headingLetterSpacing || '-0.025em',
        '--body-line-height': String(settings.bodyLineHeight || 1.6),
        '--container-width': containerWidth,
        '--spacing-section': spacing.section,
        '--spacing-gap': spacing.gap,
        '--spacing-block': spacing.block,
        '--shadow-card': SHADOW_PRESETS[shadowKey] || SHADOW_PRESETS.soft,
        '--shadow-sm': SHADOW_PRESETS.soft,
        '--shadow-md': SHADOW_PRESETS.medium,
        '--shadow-lg': SHADOW_PRESETS.dramatic,
        '--motion-duration': motion.duration,
        '--motion-distance': motion.distance,
        '--motion-ease': motion.ease,
        '--motion-preset': motionKey,
        '--card-radius': borderRadius,
        '--header-style': settings.headerStyle || 'classic',
        '--footer-style': settings.footerStyle || 'columns',
        fontFamily: bodyFont,
    };
};

export const applyDesignTokensToElement = (element, settings = {}) => {
    if (!element) return;
    const tokens = resolveDesignTokens(settings);
    Object.entries(tokens).forEach(([key, value]) => {
        if (key.startsWith('--')) {
            element.style.setProperty(key, value);
        } else if (key === 'fontFamily') {
            element.style.fontFamily = value;
        }
    });
};

export default resolveDesignTokens;
