/**
 * Theme / page-builder configuration validation & sanitization.
 * Never allow arbitrary executable JS from merchant config.
 */

export const ALLOWED_SECTION_TYPES = new Set([
    'hero',
    'categories',
    'category-grid',
    'banners',
    'image-banner',
    'video-banner',
    'carousel',
    'lookbook',
    'before-after',
    'storytelling',
    'brand-story',
    'image-text',
    'shoppable-video',
    'features-grid',
    'rich-text',
    'accordion',
    'faq',
    'countdown',
    'contact-form',
    'social-icons',
    'pricing-table',
    'best-sellers',
    'featured-products',
    'product-slider',
    'testimonials',
    'heading',
    'paragraph',
    'button',
    'image',
    'newsletter',
    'spacer',
    'divider',
    'header',
    'footer',
]);

export const ALLOWED_COMPONENTS = new Set([
    'Hero',
    'HeroSplit',
    'HeroFullScreen',
    'HeroImage',
    'HeroVideo',
    'HeroSlider',
    'ProductGrid',
    'ProductSlider',
    'CategoryGrid',
    'CategorySlider',
    'Banner',
    'ImageText',
    'Testimonials',
    'FAQ',
    'Newsletter',
    'RichText',
    'Gallery',
    'LogoCloud',
    'PromoBanner',
    'FeaturedCategories',
    'FeaturedProducts',
    'BestSellers',
    'Collection',
]);

const SAFE_URL = /^(https?:\/\/|\/uploads\/|\/themes\/|\/catalog|\/pages\/|\/product\/|#|mailto:|tel:)/i;

export const sanitizeHtml = (value) => {
    if (typeof value !== 'string') return value;
    return value
        .replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
        .replace(/<\s*script\b[^>]*>?/gi, '')
        .replace(/<\/\s*script\s*>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
        .replace(/data:text\/html/gi, '');
};

export const sanitizeUrl = (value) => {
    if (value == null || value === '') return '';
    const str = String(value).trim();
    if (!str) return '';
    if (SAFE_URL.test(str) || str.startsWith('/') || str.startsWith('data:image/')) {
        return sanitizeHtml(str);
    }
    // Relative store paths without leading slash
    if (/^[a-z0-9\-_/?.=&]+$/i.test(str)) {
        return str;
    }
    return '';
};

const sanitizeDeep = (input, keyHint = '') => {
    if (input == null) return input;
    if (typeof input === 'string') {
        const lowerKey = String(keyHint).toLowerCase();
        if (
            lowerKey.includes('url')
            || lowerKey.includes('link')
            || lowerKey.includes('image')
            || lowerKey.includes('href')
            || lowerKey.includes('src')
            || lowerKey === 'backgroundimage'
            || lowerKey === 'imageurl'
            || lowerKey === 'ogimage'
            || lowerKey === 'canonical'
        ) {
            return sanitizeUrl(input);
        }
        if (
            lowerKey.includes('content')
            || lowerKey.includes('html')
            || lowerKey.includes('text')
            || lowerKey.includes('subtitle')
            || lowerKey.includes('title')
            || lowerKey.includes('description')
        ) {
            return sanitizeHtml(input);
        }
        return sanitizeHtml(input);
    }
    if (Array.isArray(input)) {
        return input.map((item) => sanitizeDeep(item, keyHint));
    }
    if (typeof input === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(input)) {
            out[k] = sanitizeDeep(v, k);
        }
        return out;
    }
    return input;
};

export const sanitizeThemeSettings = (settings = {}) => {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
        return {};
    }
    // Strip any attempt to inject executable payloads
    const { customJS, javascript, scripts, onLoad, ...rest } = settings;
    return sanitizeDeep(rest);
};

export const validateAndSanitizeSections = (sections) => {
    if (!Array.isArray(sections)) {
        return { ok: false, message: 'Sections must be an array', sections: [] };
    }

    const cleaned = [];
    for (const raw of sections) {
        if (!raw || typeof raw !== 'object') continue;
        const type = String(raw.type || '').trim();
        const component = raw.component ? String(raw.component).trim() : '';

        if (!type && !component) continue;

        if (type && !ALLOWED_SECTION_TYPES.has(type)) {
            console.warn(`[themeValidation] Skipping unknown section type: ${type}`);
            continue;
        }
        if (component && !ALLOWED_COMPONENTS.has(component) && !ALLOWED_SECTION_TYPES.has(component)) {
            console.warn(`[themeValidation] Skipping unknown component: ${component}`);
            continue;
        }

        cleaned.push({
            sectionId: raw.sectionId || undefined,
            type: type || component.toLowerCase(),
            component: component || '',
            order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : 0,
            enabled: raw.enabled !== false,
            locked: !!raw.locked,
            settings: sanitizeDeep(raw.settings || {}),
            blocks: Array.isArray(raw.blocks)
                ? raw.blocks
                    .filter((b) => b && b.type)
                    .map((b) => ({
                        blockId: b.blockId || undefined,
                        type: String(b.type),
                        settings: sanitizeDeep(b.settings || {}),
                    }))
                : [],
        });
    }

    return { ok: true, sections: cleaned };
};

export default {
    ALLOWED_SECTION_TYPES,
    ALLOWED_COMPONENTS,
    sanitizeHtml,
    sanitizeUrl,
    sanitizeThemeSettings,
    validateAndSanitizeSections,
};
