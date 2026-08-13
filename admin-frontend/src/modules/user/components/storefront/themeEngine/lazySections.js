import { lazy } from 'react';

/**
 * Lazy loaders for storefront section components.
 * Hero / newsletter / heading blocks stay eager (inline in SectionRenderer).
 */
export const lazySectionLoaders = {
    CategorySection: () => import('../sections/CategorySection'),
    FeaturedProductsSection: () => import('../sections/FeaturedProductsSection'),
    BestSellerSection: () => import('../sections/BestSellerSection'),
    TestimonialsSection: () => import('../sections/TestimonialsSection'),
    BannerSection: () => import('../sections/BannerSection'),
    ImageTextSection: () => import('../sections/ImageTextSection'),
    NewSections: () => import('../sections/NewSections'),
};

const lazyDefault = (loader) => lazy(() => loader().then((m) => ({ default: m.default })));

const lazyNamed = (loader, exportName) =>
    lazy(() => loader().then((m) => ({ default: m[exportName] })));

export const LazyCategorySection = lazyDefault(lazySectionLoaders.CategorySection);
export const LazyFeaturedProductsSection = lazyDefault(lazySectionLoaders.FeaturedProductsSection);
export const LazyBestSellerSection = lazyDefault(lazySectionLoaders.BestSellerSection);
export const LazyTestimonialsSection = lazyDefault(lazySectionLoaders.TestimonialsSection);
export const LazyBannerSection = lazyDefault(lazySectionLoaders.BannerSection);
export const LazyImageTextSection = lazyDefault(lazySectionLoaders.ImageTextSection);

export const LazyImageBannerSection = lazyNamed(lazySectionLoaders.NewSections, 'ImageBannerSection');
export const LazyVideoBannerSection = lazyNamed(lazySectionLoaders.NewSections, 'VideoBannerSection');
export const LazyCarouselSection = lazyNamed(lazySectionLoaders.NewSections, 'CarouselSection');
export const LazyRichTextSection = lazyNamed(lazySectionLoaders.NewSections, 'RichTextSection');
export const LazyAccordionSection = lazyNamed(lazySectionLoaders.NewSections, 'AccordionSection');
export const LazyCountdownSection = lazyNamed(lazySectionLoaders.NewSections, 'CountdownSection');
export const LazyContactFormSection = lazyNamed(lazySectionLoaders.NewSections, 'ContactFormSection');
export const LazySocialIconsSection = lazyNamed(lazySectionLoaders.NewSections, 'SocialIconsSection');
export const LazyPricingTableSection = lazyNamed(lazySectionLoaders.NewSections, 'PricingTableSection');
export const LazyLookbookSection = lazyNamed(lazySectionLoaders.NewSections, 'LookbookSection');
export const LazyBeforeAfterSection = lazyNamed(lazySectionLoaders.NewSections, 'BeforeAfterSection');
export const LazyStorytellingSection = lazyNamed(lazySectionLoaders.NewSections, 'StorytellingSection');
export const LazyShoppableVideoSection = lazyNamed(lazySectionLoaders.NewSections, 'ShoppableVideoSection');
