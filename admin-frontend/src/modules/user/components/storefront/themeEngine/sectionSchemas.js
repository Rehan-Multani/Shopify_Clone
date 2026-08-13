/**
 * Schema-driven section field definitions for the page builder.
 * SettingsPanel uses this as the single source of truth.
 */

export const PRODUCT_SOURCE_OPTIONS = [
    { value: 'featured', label: 'Featured Products' },
    { value: 'latest', label: 'Latest Products' },
    { value: 'best_sellers', label: 'Best Sellers' },
    { value: 'on_sale', label: 'On Sale' },
    { value: 'category', label: 'Category Products' },
    { value: 'manual', label: 'Manual Selection' },
];

const opt = (values) => {
    if (!Array.isArray(values)) return [];
    return values.map((v) => (typeof v === 'string' ? { value: v, label: v } : v));
};

const productSourceFields = (defaults = {}) => [
    {
        name: 'source',
        type: 'select',
        label: 'Product Source',
        options: PRODUCT_SOURCE_OPTIONS,
        defaultValue: defaults.source || 'featured',
    },
    {
        name: 'categoryId',
        type: 'category',
        label: 'Category',
        defaultValue: '',
        visibleWhen: { field: 'source', equals: 'category' },
    },
    {
        name: 'productIds',
        type: 'products',
        label: 'Products (IDs, comma-separated)',
        defaultValue: '',
        visibleWhen: { field: 'source', equals: 'manual' },
    },
    {
        name: 'limit',
        type: 'number',
        label: 'Number of Products',
        min: 1,
        max: 24,
        defaultValue: defaults.limit ?? 8,
    },
];

export const sectionSchemas = {
    hero: {
        component: 'Hero',
        label: 'Hero',
        hasBlocks: true,
        fields: [
            { name: 'title', type: 'text', label: 'Heading', defaultValue: 'Welcome to Our Store' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: '' },
            { name: 'backgroundImage', type: 'image', label: 'Hero Image', defaultValue: '' },
            {
                name: 'backgroundType',
                type: 'select',
                label: 'Background Type',
                options: opt(['image', 'solid', 'gradient']),
                defaultValue: 'image',
            },
            {
                name: 'backgroundColor',
                type: 'color',
                label: 'Background Color',
                defaultValue: '#111111',
                visibleWhen: { field: 'backgroundType', equals: 'solid' },
            },
            {
                name: 'backgroundGradient',
                type: 'text',
                label: 'Background Gradient',
                defaultValue: 'linear-gradient(to right, #111111, #333333)',
                visibleWhen: { field: 'backgroundType', equals: 'gradient' },
            },
            {
                name: 'layout',
                type: 'select',
                label: 'Layout',
                options: opt(['full', 'split']),
                defaultValue: 'full',
            },
            {
                name: 'heroStyle',
                type: 'select',
                label: 'Hero Style',
                options: opt(['full', 'split', 'cinematic', 'minimal', 'promo']),
                defaultValue: 'cinematic',
            },
            { name: 'height', type: 'text', label: 'Height', defaultValue: '720px' },
            {
                name: 'overlayOpacity',
                type: 'number',
                label: 'Overlay Opacity',
                min: 0,
                max: 1,
                step: 0.05,
                defaultValue: 0.4,
            },
            {
                name: 'alignment',
                type: 'alignment',
                label: 'Alignment',
                options: opt(['left', 'center', 'right']),
                defaultValue: 'center',
            },
            {
                name: 'paddingY',
                type: 'responsivePadding',
                label: 'Vertical Padding (px)',
                min: 0,
                max: 160,
                defaultValue: { desktop: 80, tablet: 56, mobile: 32 },
            },
            {
                name: 'titleFontSize',
                type: 'responsiveFontSize',
                label: 'Heading Size (px)',
                min: 16,
                max: 96,
                defaultValue: { desktop: 48, tablet: 40, mobile: 32 },
            },
            { name: 'showTrustBadges', type: 'boolean', label: 'Show Trust Badges', defaultValue: true },
            {
                name: 'badge1Text',
                type: 'text',
                label: 'Badge 1',
                defaultValue: 'Free Shipping',
                visibleWhen: { field: 'showTrustBadges', equals: true },
            },
            {
                name: 'badge2Text',
                type: 'text',
                label: 'Badge 2',
                defaultValue: 'Secure Payments',
                visibleWhen: { field: 'showTrustBadges', equals: true },
            },
            {
                name: 'badge3Text',
                type: 'text',
                label: 'Badge 3',
                defaultValue: 'Easy Returns',
                visibleWhen: { field: 'showTrustBadges', equals: true },
            },
            {
                name: 'animation',
                type: 'select',
                label: 'Animation',
                options: opt(['none', 'subtle', 'smooth', 'fade', 'slide', 'zoom', 'luxury']),
                defaultValue: 'luxury',
            },
        ],
    },
    'featured-products': {
        component: 'ProductGrid',
        label: 'Featured Products',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Featured Products' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: '' },
            ...productSourceFields({ source: 'featured', limit: 8 }),
            {
                name: 'columns',
                type: 'responsiveNumber',
                label: 'Columns',
                min: 1,
                max: 6,
                defaultValue: { desktop: 4, tablet: 3, mobile: 2 },
            },
            {
                name: 'gap',
                type: 'responsiveGap',
                label: 'Grid Gap (px)',
                min: 0,
                max: 64,
                defaultValue: { desktop: 24, tablet: 16, mobile: 12 },
            },
            {
                name: 'mobileColumns',
                type: 'number',
                label: 'Mobile Columns (legacy)',
                min: 1,
                max: 3,
                defaultValue: 2,
                helpText: 'Prefer Columns responsive control above when available.',
            },
            {
                name: 'layout',
                type: 'select',
                label: 'Layout',
                options: opt(['grid', 'carousel']),
                defaultValue: 'grid',
            },
            {
                name: 'cardStyle',
                type: 'select',
                label: 'Card Style',
                options: opt(['standard', 'minimal', 'luxury', 'editorial', 'electronics', 'furniture']),
                defaultValue: 'luxury',
            },
            { name: 'showPrice', type: 'boolean', label: 'Show Price', defaultValue: true },
            { name: 'showRating', type: 'boolean', label: 'Show Rating', defaultValue: false },
            { name: 'showWishlist', type: 'boolean', label: 'Show Wishlist', defaultValue: true },
            { name: 'showQuickView', type: 'boolean', label: 'Show Quick View', defaultValue: false },
        ],
    },
    'product-slider': {
        component: 'ProductSlider',
        label: 'Product Slider',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Just Arrived' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: '' },
            ...productSourceFields({ source: 'latest', limit: 10 }),
            {
                name: 'layout',
                type: 'select',
                label: 'Layout',
                options: opt(['carousel', 'grid']),
                defaultValue: 'carousel',
            },
            {
                name: 'cardStyle',
                type: 'select',
                label: 'Card Style',
                options: opt(['standard', 'minimal', 'luxury', 'editorial', 'electronics', 'furniture']),
                defaultValue: 'luxury',
            },
        ],
    },
    'best-sellers': {
        component: 'BestSellers',
        label: 'Best Sellers',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Best Sellers' },
            ...productSourceFields({ source: 'best_sellers', limit: 4 }),
        ],
    },
    'category-grid': {
        component: 'CategoryGrid',
        label: 'Category Grid',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Shop by Collection' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: '' },
            { name: 'limit', type: 'number', label: 'Number of Categories', min: 1, max: 16, defaultValue: 6 },
            { name: 'columns', type: 'number', label: 'Columns', min: 2, max: 6, defaultValue: 3 },
        ],
    },
    categories: {
        component: 'CategoryGrid',
        label: 'Categories',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Categories' },
            { name: 'limit', type: 'number', label: 'Number of Categories', min: 1, max: 16, defaultValue: 6 },
        ],
    },
    'image-banner': {
        component: 'Banner',
        label: 'Image Banner',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Summer Collection' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: '' },
            { name: 'imageUrl', type: 'image', label: 'Banner Image', defaultValue: '' },
            { name: 'buttonLabel', type: 'text', label: 'Button Text', defaultValue: 'Shop Now' },
            { name: 'buttonLink', type: 'url', label: 'Button Link', defaultValue: '/catalog' },
            {
                name: 'alignment',
                type: 'alignment',
                label: 'Alignment',
                options: opt(['left', 'center', 'right']),
                defaultValue: 'center',
            },
            {
                name: 'overlay',
                type: 'number',
                label: 'Overlay',
                min: 0,
                max: 1,
                step: 0.05,
                defaultValue: 0.4,
            },
        ],
    },
    'image-text': {
        component: 'ImageText',
        label: 'Image + Text',
        fields: [
            { name: 'eyebrow', type: 'text', label: 'Eyebrow', defaultValue: '' },
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Crafted with intention' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: '' },
            { name: 'content', type: 'richText', label: 'Body', defaultValue: '' },
            { name: 'imageUrl', type: 'image', label: 'Image', defaultValue: '' },
            {
                name: 'imagePosition',
                type: 'select',
                label: 'Image Position',
                options: opt(['left', 'right']),
                defaultValue: 'right',
            },
            { name: 'buttonLabel', type: 'text', label: 'Button Text', defaultValue: 'Explore Collection' },
            { name: 'buttonLink', type: 'url', label: 'Button Link', defaultValue: '/catalog' },
        ],
    },
    testimonials: {
        component: 'Testimonials',
        label: 'Testimonials',
        hasBlocks: true,
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'What Our Customers Say' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: '' },
        ],
    },
    newsletter: {
        component: 'Newsletter',
        label: 'Newsletter',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Subscribe to our newsletter' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: 'Get promotions and announcements' },
            { name: 'buttonLabel', type: 'text', label: 'Button Text', defaultValue: 'Subscribe' },
        ],
    },
    'rich-text': {
        component: 'RichText',
        label: 'Rich Text',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: '' },
            { name: 'content', type: 'richText', label: 'Content', defaultValue: '' },
            {
                name: 'alignment',
                type: 'alignment',
                label: 'Alignment',
                options: opt(['left', 'center', 'right']),
                defaultValue: 'center',
            },
        ],
    },
    faq: {
        component: 'FAQ',
        label: 'FAQ',
        hasBlocks: true,
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'FAQ' },
        ],
    },
    accordion: {
        component: 'FAQ',
        label: 'Accordion',
        hasBlocks: true,
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'FAQ' },
        ],
    },
    'video-banner': {
        component: 'HeroVideo',
        label: 'Video Banner',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: '' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: '' },
            { name: 'videoUrl', type: 'url', label: 'Video URL', defaultValue: '' },
            { name: 'buttonLabel', type: 'text', label: 'Button Text', defaultValue: 'Shop Now' },
            { name: 'buttonLink', type: 'url', label: 'Button Link', defaultValue: '/catalog' },
        ],
    },
    'features-grid': {
        component: 'FeaturesGrid',
        label: 'Features Grid',
        hasBlocks: true,
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Why Choose Us' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: '' },
        ],
    },
    countdown: {
        component: 'Countdown',
        label: 'Countdown',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Sale Ends Soon' },
            { name: 'targetDate', type: 'text', label: 'Target Date (ISO)', defaultValue: '' },
        ],
    },
    spacer: {
        component: 'Spacer',
        label: 'Spacer',
        fields: [
            { name: 'height', type: 'number', label: 'Height (px)', min: 8, max: 200, defaultValue: 40 },
        ],
    },
    divider: {
        component: 'Divider',
        label: 'Divider',
        fields: [
            {
                name: 'style',
                type: 'select',
                label: 'Style',
                options: opt(['solid', 'dashed', 'dotted']),
                defaultValue: 'solid',
            },
            { name: 'color', type: 'color', label: 'Color', defaultValue: '#e4e4e7' },
            { name: 'thickness', type: 'text', label: 'Thickness', defaultValue: '1px' },
        ],
    },
    heading: {
        component: 'Heading',
        label: 'Heading',
        fields: [
            { name: 'text', type: 'text', label: 'Text', defaultValue: 'New Heading' },
        ],
    },
    paragraph: {
        component: 'Paragraph',
        label: 'Paragraph',
        fields: [
            { name: 'text', type: 'textarea', label: 'Text', defaultValue: '' },
        ],
    },
    button: {
        component: 'Button',
        label: 'Button',
        fields: [
            { name: 'label', type: 'text', label: 'Label', defaultValue: 'Click Me' },
            { name: 'link', type: 'url', label: 'Link', defaultValue: '#' },
        ],
    },
    image: {
        component: 'Image',
        label: 'Image',
        fields: [
            { name: 'imageUrl', type: 'image', label: 'Image', defaultValue: '' },
            { name: 'alt', type: 'text', label: 'Alt Text', defaultValue: '' },
        ],
    },
    lookbook: {
        component: 'Gallery',
        label: 'Lookbook',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Shop the Look' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: '' },
            { name: 'imageUrl', type: 'image', label: 'Image', defaultValue: '' },
        ],
    },
    'before-after': {
        component: 'BeforeAfter',
        label: 'Before / After',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'See the Transformation' },
            { name: 'beforeImage', type: 'image', label: 'Before Image', defaultValue: '' },
            { name: 'afterImage', type: 'image', label: 'After Image', defaultValue: '' },
        ],
    },
    storytelling: {
        component: 'Storytelling',
        label: 'Storytelling',
        fields: [
            { name: 'eyebrow', type: 'text', label: 'Eyebrow', defaultValue: 'Our Story' },
            { name: 'title', type: 'text', label: 'Title', defaultValue: '' },
            { name: 'subtitle', type: 'textarea', label: 'Subtitle', defaultValue: '' },
        ],
    },
    'shoppable-video': {
        component: 'ShoppableVideo',
        label: 'Shoppable Video',
        fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: '' },
            { name: 'videoUrl', type: 'url', label: 'Video URL', defaultValue: '' },
            { name: 'autoplay', type: 'boolean', label: 'Autoplay', defaultValue: true },
            { name: 'loop', type: 'boolean', label: 'Loop', defaultValue: true },
        ],
    },
};

/** Component-name aliases → schema key */
const SCHEMA_ALIASES = {
    Hero: 'hero',
    HeroSplit: 'hero',
    HeroFullScreen: 'hero',
    HeroImage: 'hero',
    ProductGrid: 'featured-products',
    ProductSlider: 'product-slider',
    FeaturedProducts: 'featured-products',
    BestSellers: 'best-sellers',
    CategoryGrid: 'category-grid',
    FeaturedCategories: 'category-grid',
    Banner: 'image-banner',
    PromoBanner: 'image-banner',
    ImageText: 'image-text',
    Testimonials: 'testimonials',
    Newsletter: 'newsletter',
    RichText: 'rich-text',
    FAQ: 'faq',
    Gallery: 'lookbook',
};

export const normalizeFieldOptions = (field) => {
    if (!field?.options) return [];
    return opt(field.options);
};

export const getSectionSchema = (typeOrComponent) => {
    if (!typeOrComponent) return null;
    const key = SCHEMA_ALIASES[typeOrComponent] || typeOrComponent;
    if (sectionSchemas[key]) return { ...sectionSchemas[key], schemaKey: key };
    const byComponent = Object.entries(sectionSchemas).find(([, s]) => s.component === typeOrComponent);
    if (byComponent) return { ...byComponent[1], schemaKey: byComponent[0] };
    return null;
};

export const getSchemaDefaults = (schema) => {
    if (!schema?.fields) return {};
    const defaults = {};
    schema.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
            defaults[field.name] = field.defaultValue;
        }
    });
    return defaults;
};

/**
 * Merge schema defaults under existing settings (settings win).
 * Does not mutate inputs.
 */
export const mergeSectionSettings = (schema, settings = {}) => {
    const defaults = getSchemaDefaults(schema);
    return { ...defaults, ...(settings || {}) };
};

export const isFieldVisible = (field, settings = {}) => {
    const rule = field?.visibleWhen;
    if (!rule) return true;
    const current = settings[rule.field];
    if (Object.prototype.hasOwnProperty.call(rule, 'equals')) {
        return current === rule.equals;
    }
    if (Object.prototype.hasOwnProperty.call(rule, 'notEquals')) {
        return current !== rule.notEquals;
    }
    if (Array.isArray(rule.in)) {
        return rule.in.includes(current);
    }
    return true;
};

export const getVisibleFields = (schema, settings = {}) => {
    if (!schema?.fields) return [];
    const resolved = mergeSectionSettings(schema, settings);
    return schema.fields.filter((field) => isFieldVisible(field, resolved));
};

export const ALLOWED_SECTION_TYPES = [
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
];

export default sectionSchemas;
