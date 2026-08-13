/**
 * Section compatibility suggestions for theme switches.
 * Only include deterministic remaps — never unsafe guesses.
 */

export const SECTION_COMPATIBILITY_MAP = [
    {
        oldType: 'testimonials-legacy',
        oldComponent: 'TestimonialsLegacy',
        suggested: [{ type: 'testimonials', component: 'Testimonials', label: 'Testimonials' }],
    },
    {
        oldType: 'image-banner-old',
        oldComponent: 'ImageBannerOld',
        suggested: [
            { type: 'image-banner', component: 'PromoBanner', label: 'Image Banner' },
            { type: 'image-text', component: 'ImageText', label: 'Image + Text' },
        ],
    },
    {
        oldType: 'old-product-section',
        oldComponent: 'OldProductSection',
        suggested: [{ type: 'featured-products', component: 'FeaturedProducts', label: 'Featured Products' }],
    },
    {
        oldType: 'product-grid-legacy',
        oldComponent: 'ProductGridLegacy',
        suggested: [{ type: 'featured-products', component: 'ProductGrid', label: 'Product Grid' }],
    },
    {
        oldType: 'banner',
        oldComponent: 'Banner',
        suggested: [{ type: 'image-banner', component: 'PromoBanner', label: 'Image Banner' }],
    },
    {
        oldType: 'gallery',
        oldComponent: 'Gallery',
        suggested: [{ type: 'lookbook', component: 'Gallery', label: 'Lookbook' }],
    },
];

const norm = (v) => String(v || '').trim().toLowerCase();

/**
 * Detect unsupported sections vs theme supportedSections list.
 */
export const detectUnsupportedSections = (sections = [], supportedSections = null) => {
    if (!Array.isArray(sections)) return [];
    if (!Array.isArray(supportedSections) || supportedSections.length === 0) return [];

    const allowed = new Set(supportedSections.map(norm));
    // Always allow chrome
    allowed.add('header');
    allowed.add('footer');

    return sections.filter((sec) => {
        if (!sec || sec.enabled === false) return false;
        const keys = [sec.type, sec.component].filter(Boolean).map(norm);
        return !keys.some((k) => allowed.has(k));
    });
};

/**
 * Build suggestion list for a section. Returns [] when no safe suggestion exists.
 */
export const suggestRemapForSection = (section = {}, supportedSections = null) => {
    const type = norm(section.type);
    const component = norm(section.component);
    const entry = SECTION_COMPATIBILITY_MAP.find(
        (m) => norm(m.oldType) === type || norm(m.oldComponent) === component
    );
    if (!entry) return [];

    let suggestions = entry.suggested || [];
    if (Array.isArray(supportedSections) && supportedSections.length) {
        const allowed = new Set(supportedSections.map(norm));
        suggestions = suggestions.filter((s) => allowed.has(norm(s.type)) || allowed.has(norm(s.component)));
    }
    return suggestions;
};

/**
 * Build compatibility report for theme switch / upgrade UI.
 */
export const buildCompatibilityReport = (sections = [], supportedSections = null) => {
    const unsupported = detectUnsupportedSections(sections, supportedSections);
    const items = unsupported.map((sec) => ({
        sectionId: sec.sectionId || sec._id || '',
        name: sec.name || sec.type || sec.component || 'Section',
        type: sec.type || '',
        component: sec.component || '',
        suggestions: suggestRemapForSection(sec, supportedSections),
        preserved: true,
    }));
    return {
        needsAttention: items.length,
        items,
    };
};

/**
 * Create a remapped section while preserving the original as backup.
 * Does NOT mutate the input section.
 */
export const createRemappedSection = (original, suggestion) => {
    if (!original || !suggestion) return null;
    const backup = JSON.parse(JSON.stringify(original));
    const next = {
        ...JSON.parse(JSON.stringify(original)),
        sectionId: Math.random().toString(36).slice(2, 11),
        type: suggestion.type,
        component: suggestion.component || '',
        name: suggestion.label || suggestion.type,
        enabled: true,
        settings: { ...(original.settings || {}) },
        blocks: Array.isArray(original.blocks) ? JSON.parse(JSON.stringify(original.blocks)) : [],
        _remappedFrom: {
            sectionId: backup.sectionId || backup._id,
            type: backup.type,
            component: backup.component,
            settings: backup.settings,
            blocks: backup.blocks,
            preservedAt: new Date().toISOString(),
        },
    };
    return { remapped: next, originalBackup: backup };
};

export default {
    SECTION_COMPATIBILITY_MAP,
    detectUnsupportedSections,
    suggestRemapForSection,
    buildCompatibilityReport,
    createRemappedSection,
};
