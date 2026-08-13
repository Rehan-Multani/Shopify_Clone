import {
    LazyCategorySection,
    LazyFeaturedProductsSection,
    LazyBestSellerSection,
    LazyTestimonialsSection,
    LazyBannerSection,
    LazyImageTextSection,
    LazyImageBannerSection,
    LazyVideoBannerSection,
    LazyCarouselSection,
    LazyRichTextSection,
    LazyAccordionSection,
    LazyCountdownSection,
    LazyContactFormSection,
    LazySocialIconsSection,
    LazyPricingTableSection,
    LazyLookbookSection,
    LazyBeforeAfterSection,
    LazyStorytellingSection,
    LazyShoppableVideoSection,
} from './lazySections.js';

/**
 * Central component registry (lazy where safe).
 * section.component || section.type → React component
 * Hero / newsletter / heading remain inline in SectionRenderer (eager).
 */
const componentRegistry = {
    Hero: null,
    HeroSplit: null,
    HeroFullScreen: null,
    ProductGrid: LazyFeaturedProductsSection,
    ProductSlider: LazyFeaturedProductsSection,
    CategoryGrid: LazyCategorySection,
    CategorySlider: LazyCategorySection,
    Banner: LazyImageBannerSection,
    ImageText: LazyImageTextSection,
    Testimonials: LazyTestimonialsSection,
    FAQ: LazyAccordionSection,
    Newsletter: null,
    RichText: LazyRichTextSection,
    Gallery: LazyLookbookSection,
    Collection: LazyFeaturedProductsSection,

    hero: null,
    categories: LazyCategorySection,
    'category-grid': LazyCategorySection,
    banners: LazyBannerSection,
    'image-banner': LazyImageBannerSection,
    'video-banner': LazyVideoBannerSection,
    carousel: LazyCarouselSection,
    lookbook: LazyLookbookSection,
    'before-after': LazyBeforeAfterSection,
    storytelling: LazyStorytellingSection,
    'brand-story': LazyStorytellingSection,
    'image-text': LazyImageTextSection,
    'shoppable-video': LazyShoppableVideoSection,
    'features-grid': null,
    'rich-text': LazyRichTextSection,
    accordion: LazyAccordionSection,
    faq: LazyAccordionSection,
    countdown: LazyCountdownSection,
    'contact-form': LazyContactFormSection,
    'social-icons': LazySocialIconsSection,
    'pricing-table': LazyPricingTableSection,
    'best-sellers': LazyBestSellerSection,
    'featured-products': LazyFeaturedProductsSection,
    'product-slider': LazyFeaturedProductsSection,
    testimonials: LazyTestimonialsSection,
    newsletter: null,
    heading: null,
    paragraph: null,
    button: null,
    image: null,
};

const COMPONENT_ALIASES = {
    Hero: 'hero',
    HeroSplit: 'hero',
    HeroFullScreen: 'hero',
    HeroImage: 'hero',
    HeroSlider: 'carousel',
    HeroVideo: 'video-banner',
    ProductGrid: 'featured-products',
    ProductSlider: 'product-slider',
    CategoryGrid: 'category-grid',
    CategorySlider: 'category-grid',
    Banner: 'image-banner',
    ImageText: 'image-text',
    Testimonials: 'testimonials',
    FAQ: 'faq',
    Newsletter: 'newsletter',
    RichText: 'rich-text',
    Gallery: 'lookbook',
    LogoCloud: 'social-icons',
    PromoBanner: 'image-banner',
    FeaturedCategories: 'category-grid',
    FeaturedProducts: 'featured-products',
    BestSellers: 'best-sellers',
};

export const registerComponent = (key, Component) => {
    if (!key || !Component) return;
    componentRegistry[key] = Component;
};

export const resolveSectionComponent = (section = {}) => {
    const candidates = [
        section.component,
        section.type,
        COMPONENT_ALIASES[section.component],
        COMPONENT_ALIASES[section.type],
    ].filter(Boolean);

    for (const key of candidates) {
        const Comp = componentRegistry[key];
        if (Comp && typeof Comp !== 'string') return Comp;
    }
    return null;
};

export const getRegisteredKeys = () => Object.keys(componentRegistry).filter((k) => componentRegistry[k]);

export const isKnownSectionType = (typeOrComponent) => {
    if (!typeOrComponent) return false;
    if (componentRegistry[typeOrComponent] !== undefined) return true;
    if (COMPONENT_ALIASES[typeOrComponent]) return true;
    return false;
};

export { componentRegistry, COMPONENT_ALIASES };
export default componentRegistry;
