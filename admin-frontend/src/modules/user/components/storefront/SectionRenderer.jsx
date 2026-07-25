import React from 'react';
import HeroSection from './sections/HeroSection';
import CategorySection from './sections/CategorySection';
import FeaturedProductsSection from './sections/FeaturedProductsSection';
import BestSellerSection from './sections/BestSellerSection';
import TestimonialsSection from './sections/TestimonialsSection';
import BannerSection from './sections/BannerSection';
import {
    ImageBannerSection,
    VideoBannerSection,
    CarouselSection,
    RichTextSection,
    AccordionSection,
    CountdownSection,
    ContactFormSection,
    SocialIconsSection,
    PricingTableSection,
    LookbookSection,
    BeforeAfterSection,
    StorytellingSection,
    ShoppableVideoSection
} from './sections/NewSections';
import { useTheme } from './themeEngine/ThemeContext';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL?.replace('/api', '') || '';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${ASSETS_BASE_URL}${cleanPath}`;
};

const formatText = (text) => {
    if (!text || typeof text !== 'string') return text;
    return text.split(/<br\s*\/?>/gi).map((part, index, array) => (
        <React.Fragment key={index}>
            {part}
            {index < array.length - 1 && <br />}
        </React.Fragment>
    ));
};

// A dynamic newsletter block/section — dark band + accent CTA (premium reference style)
const NewsletterSection = ({ settings = {} }) => {
    const { title = 'Subscribe to our newsletter', subtitle = 'Get promotions and announcements' } = settings;
    return (
        <section className="py-20 md:py-24 px-6 w-full text-center" style={{ background: 'var(--color-secondary, #0f172a)', color: '#fff' }}>
            <div className="max-w-xl mx-auto space-y-5">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white" style={{ fontFamily: 'var(--heading-font)' }}>{title}</h2>
                <div className="h-[2px] w-14 mx-auto" style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }} />
                <p className="text-sm text-white/70 font-medium leading-relaxed">{subtitle}</p>
                <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5 pt-2">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="flex-grow px-4 py-3.5 text-sm focus:outline-none bg-white/10 border border-white/15 text-white placeholder:text-white/40"
                        style={{ borderRadius: 'var(--border-radius, 10px)' }}
                    />
                    <button
                        className="px-7 py-3.5 text-[11px] font-bold uppercase tracking-widest btn-premium text-white shrink-0"
                        style={{ backgroundColor: 'var(--color-accent, var(--color-primary))', borderRadius: 'var(--border-radius, 10px)' }}
                    >
                        Subscribe
                    </button>
                </div>
            </div>
        </section>
    );
};

const SectionRenderer = ({ section, storeId, onAddToCart, customer }) => {
    const theme = useTheme();
    if (!section || !section.enabled) return null;

    const { type, settings = {}, blocks = [] } = section;

    switch (type) {
        case 'hero': {
            const heroStyle = settings.heroStyle || theme.heroStyle || 'full';
            const isSplit = settings.layout === 'split' || heroStyle === 'split';
            const isFullBleed = ['cinematic', 'promo', 'full', 'minimal'].includes(heroStyle) && !isSplit;
            const bgType = settings.backgroundType || 'image';
            
            let heroBg = '';
            if (bgType === 'solid') {
                heroBg = settings.backgroundColor || '#008060';
            } else if (bgType === 'gradient') {
                heroBg = settings.backgroundGradient || 'linear-gradient(to right, #008060, #047857, #064e3b)';
            } else {
                heroBg = settings.backgroundImage && !isSplit
                    ? `url(${getImageUrl(settings.backgroundImage)})` 
                    : 'linear-gradient(to right, #008060, #047857, #064e3b)';
            }

            let splitBgStyle = {};
            if (bgType === 'solid') {
                splitBgStyle = { background: settings.backgroundColor || '#f0fdfa' };
            } else if (bgType === 'gradient') {
                splitBgStyle = { background: settings.backgroundGradient || 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)' };
            } else {
                splitBgStyle = { background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)' };
            }

            const trustBadges = settings.showTrustBadges === true && (
                <div className={`theme-hero-trust flex flex-wrap items-center gap-x-6 gap-y-2 pt-8 mt-1 w-full text-[10px] font-semibold uppercase tracking-[0.2em] animate-fade-in-up ${isSplit || heroStyle === 'promo' ? 'justify-start text-zinc-500' : 'justify-center text-white/80'}`} style={{ animationDelay: '350ms' }}>
                    {[
                        settings.badge1Text || 'Free Shipping',
                        settings.badge2Text || 'Secure Payments',
                        settings.badge3Text || 'Easy Returns',
                    ].map((label) => (
                        <span key={label} className="theme-hero-badge inline-flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full opacity-70" style={{ background: 'currentColor' }} aria-hidden="true" />
                            {label}
                        </span>
                    ))}
                </div>
            );
            
            const contentBody = (
                <div className={`relative z-10 w-full flex flex-col space-y-5 ${isSplit || heroStyle === 'promo' ? 'items-start text-left' : 'items-center text-center'}`}>
                    {(blocks || []).map((block, index) => {
                        if (block.type === 'heading') {
                            const style = block.settings?.style || {};
                            const HeadingTag = style.tag || (isSplit ? 'h2' : 'h1');
                            const alignLeft = isSplit || heroStyle === 'promo';
                            return (
                                <HeadingTag 
                                    key={block.blockId || index} 
                                    className="leading-[1.05] tracking-tight drop-shadow-sm animate-fade-in-up font-medium"
                                    style={{ 
                                        animationDelay: '0ms',
                                        fontSize: style.fontSize ? `clamp(${Math.max(20, Math.round(Number(style.fontSize) * 0.6))}px, 5vw, ${style.fontSize}px)` : (isSplit ? 'clamp(28px, 5vw, 48px)' : heroStyle === 'cinematic' ? 'clamp(2.75rem, 7.5vw, 5.5rem)' : 'clamp(2.25rem, 6vw, 4.25rem)'),
                                        color: isSplit ? 'var(--color-primary)' : (style.color || '#ffffff'),
                                        fontWeight: style.fontWeight || '500',
                                        lineHeight: style.lineHeight || '1.05',
                                        letterSpacing: style.letterSpacing || '-0.02em',
                                        textTransform: style.textTransform || 'none',
                                        fontFamily: 'var(--heading-font)',
                                        textAlign: alignLeft ? 'left' : (style.textAlign || 'center'),
                                        marginTop: style.marginTop !== undefined ? `${style.marginTop}px` : undefined,
                                        marginBottom: style.marginBottom !== undefined ? `${style.marginBottom}px` : undefined
                                    }}
                                >
                                    {formatText(block.settings?.text || 'Welcome to Our Store')}
                                </HeadingTag>
                            );
                        }
                        if (block.type === 'subheading') {
                            const style = block.settings?.style || {};
                            const alignLeft = isSplit || heroStyle === 'promo';
                            return (
                                <p 
                                    key={block.blockId || index} 
                                    className={`leading-relaxed drop-shadow animate-fade-in-up font-medium max-w-xl ${heroStyle === 'promo' ? '' : ''}`}
                                    style={{ 
                                        animationDelay: '100ms',
                                        fontSize: style.fontSize ? `clamp(${Math.max(13, Math.round(Number(style.fontSize) * 0.8))}px, 3.5vw, ${style.fontSize}px)` : 'clamp(13px, 2.4vw, 16px)',
                                        color: isSplit ? '#57534e' : (style.color || 'rgba(255,255,255,0.88)'),
                                        fontWeight: style.fontWeight || '500',
                                        lineHeight: style.lineHeight || '1.7',
                                        letterSpacing: style.letterSpacing || '0.14em',
                                        textTransform: style.textTransform || 'uppercase',
                                        textAlign: alignLeft ? 'left' : (style.textAlign || 'center'),
                                        marginTop: style.marginTop !== undefined ? `${style.marginTop}px` : undefined,
                                        marginBottom: style.marginBottom !== undefined ? `${style.marginBottom}px` : undefined
                                    }}
                                >
                                    {formatText(block.settings?.text || 'Discover premium catalog.')}
                                </p>
                            );
                        }
                        return null;
                    })}

                    {/* Render Buttons side-by-side */}
                    {(blocks || []).some(b => b.type === 'button') && (
                        <div className={`flex flex-wrap gap-3.5 pt-3 ${isSplit || heroStyle === 'promo' ? 'justify-start' : 'justify-center'}`}>
                            {(blocks || []).filter(b => b.type === 'button').map((block, idx) => {
                                const style = block.settings?.style || {};
                                const isPrimary = idx === 0;
                                return (
                                    <React.Fragment key={block.blockId || idx}>
                                        {block.settings?.startNewRow && <div className="w-full h-0"></div>}
                                        <a
                                            href={block.settings?.link || '/catalog'}
                                            className="theme-hero-cta btn-premium transition-all hover:-translate-y-0.5 active:scale-[0.98] duration-300 animate-fade-in-up cursor-pointer flex items-center justify-center gap-2 font-bold tracking-[0.14em] uppercase"
                                            style={{ 
                                                backgroundColor: style.backgroundColor || (isPrimary ? (heroStyle === 'promo' ? '#fff' : 'var(--color-accent, var(--color-primary))') : 'transparent'), 
                                                color: style.textColor || (heroStyle === 'promo' && isPrimary ? '#111' : '#ffffff'),
                                                borderColor: style.borderColor || (!isPrimary ? 'rgba(255,255,255,0.45)' : 'transparent'),
                                                borderStyle: 'solid',
                                                borderWidth: style.borderWidth || (!isPrimary ? '1px' : '0px'),
                                                borderRadius: style.borderRadius || 'var(--border-radius, 10px)',
                                                padding: `${style.paddingY !== undefined ? style.paddingY : 14}px ${style.paddingX !== undefined ? style.paddingX : 30}px`,
                                                fontSize: style.fontSize ? `${style.fontSize}px` : '11px',
                                                boxShadow: isPrimary ? '0 14px 40px -18px rgba(0,0,0,0.45)' : 'none',
                                                animationDelay: `${200 + idx * 50}ms`,
                                                backdropFilter: !isPrimary ? 'blur(8px)' : undefined,
                                            }}
                                        >
                                            <span>{block.settings?.label || 'Shop Now'}</span>
                                            <span aria-hidden="true" className="theme-hero-arrow">→</span>
                                        </a>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}

                    {/* Fallback if no blocks */}
                    {blocks.length === 0 && (
                        <div className={`${isSplit ? 'text-zinc-800' : 'text-white'} space-y-4`}>
                            <h1 className="text-3xl sm:text-5xl font-medium leading-tight tracking-tight" style={{ fontFamily: 'var(--heading-font)' }}>{formatText(settings.title || 'Welcome to Our Store')}</h1>
                            <p className="text-xs sm:text-sm font-medium tracking-[0.14em] uppercase opacity-80 max-w-sm">{formatText(settings.subtitle)}</p>
                        </div>
                    )}

                    {trustBadges}
                </div>
            );

            if (isSplit) {
                return (
                    <section 
                        className={`theme-hero theme-hero--${heroStyle} relative flex items-center justify-center py-16 px-6 md:px-12`}
                        style={{ minHeight: settings.height || '560px', ...splitBgStyle }}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-6xl mx-auto">
                            {contentBody}
                            <div className="flex justify-center items-center w-full">
                                <div 
                                    className="theme-hero-media relative w-full aspect-[4/3] overflow-hidden shadow-2xl bg-white p-2.5"
                                    style={{ animationDelay: '200ms', borderRadius: theme.borderRadius || '24px' }}
                                >
                                    <div className="w-full h-full overflow-hidden bg-zinc-50 relative group" style={{ borderRadius: `calc(${theme.borderRadius || '24px'} - 6px)` }}>
                                        {settings.backgroundImage ? (
                                            <img src={getImageUrl(settings.backgroundImage)} alt="Hero illustration" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 font-bold text-sm">
                                                <span>No image selected</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            }

            return (
                <section 
                    className={`theme-hero theme-hero--${heroStyle} relative flex items-center ${heroStyle === 'promo' ? 'justify-start text-left' : 'justify-center text-center'} overflow-hidden py-28 md:py-36 px-4 ${isFullBleed ? 'rounded-none' : ''}`}
                    style={{
                        background: bgType === 'image' ? undefined : heroBg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',   
                        minHeight: (heroStyle === 'cinematic' || heroStyle === 'full')
                            ? 'min(94vh, 920px)'
                            : (settings.height || (heroStyle === 'promo' ? '620px' : '75vh'))
                    }}
                >
                    {bgType === 'image' && (
                        <div
                            className="absolute inset-0 scale-105 animate-ken-burns bg-cover bg-center"
                            style={{ backgroundImage: heroBg }}
                            aria-hidden="true"
                        />
                    )}
                    {bgType === 'image' && (
                        <div className={`absolute inset-0 ${
                            heroStyle === 'minimal' ? 'bg-black/30'
                            : heroStyle === 'promo' ? 'bg-gradient-to-r from-black/78 via-black/48 to-black/18'
                            : heroStyle === 'cinematic' ? 'bg-gradient-to-t from-black/75 via-black/40 to-black/30'
                            : 'bg-gradient-to-t from-black/65 via-black/40 to-black/30'
                        }`} />
                    )}
                    <div className={`relative z-10 w-full flex flex-col space-y-5 ${
                        heroStyle === 'promo' ? 'max-w-7xl mx-auto items-start px-4 sm:px-8'
                        : heroStyle === 'cinematic' ? 'max-w-4xl items-center px-4'
                        : 'max-w-3xl items-center px-4'
                    }`}>
                        {contentBody}
                    </div>
                </section>
            );
        }

        case 'categories':
        case 'category-grid':
            return <CategorySection settings={settings} storeId={storeId} />;

        case 'banners':
            return <BannerSection settings={settings} />;

        case 'image-banner':
            return <ImageBannerSection settings={settings} />;

        case 'video-banner':
            return <VideoBannerSection settings={settings} />;

        case 'carousel':
            return <CarouselSection settings={settings} blocks={blocks} />;

        case 'lookbook':
            return <LookbookSection settings={settings} blocks={blocks} />;

        case 'before-after':
            return <BeforeAfterSection settings={settings} />;

        case 'storytelling':
        case 'brand-story':
            return <StorytellingSection settings={settings} blocks={blocks} />;

        case 'shoppable-video':
            return <ShoppableVideoSection settings={settings} blocks={blocks} />;

        case 'features-grid':
            const items = blocks.length > 0 ? blocks : (settings.features || []);
            
            const getIconSvg = (iconName) => {
                const props = { className: "w-5 h-5", stroke: "currentColor", strokeWidth: "2.2", fill: "none", viewBox: "0 0 24 24" };
                switch (iconName) {
                    case 'truck':
                        return (
                            <svg {...props}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.318-5.085a2.25 2.25 0 0 0-2.247-2.112h-3v5.625m-6 0h-3L3.375 7.5h6.75m0 3v-3.75m0 3.75h6.75M12 7.5h.008v.008H12V7.5z" />
                            </svg>
                        );
                    case 'rotate-ccw':
                        return (
                            <svg {...props}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        );
                    case 'shield-check':
                        return (
                            <svg {...props}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z" />
                            </svg>
                        );
                    case 'phone':
                        return (
                            <svg {...props}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.122-4.1-6.924-6.924l1.293-.97c.362-.272.528-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
                            </svg>
                        );
                    case 'heart-pulse':
                        return (
                            <svg {...props}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                        );
                    case 'lightning':
                        return (
                            <svg {...props}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        );
                    default:
                        return (
                            <svg {...props}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L14.907 18M18 10.5c0-4.142-3.358-7.5-7.5-7.5S3 6.358 3 10.5M21 21l-3.486-3.486" />
                            </svg>
                        );
                }
            };

            return (
                <section className="theme-features py-20 md:py-24 px-6 sm:px-10 lg:px-14 w-full space-y-14">
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-4xl font-medium tracking-tight leading-tight" style={{ fontFamily: 'var(--heading-font)' }}>
                            {settings.title || 'Why Choose Us'}
                        </h2>
                        <div className="h-[2px] w-14 mx-auto" style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }} />
                        {settings.subtitle && (
                            <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                                {settings.subtitle}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 max-w-6xl mx-auto">
                        {items.map((item, index) => {
                            const blockSettings = item.settings || {};
                            return (
                                <div 
                                    key={item.blockId || index} 
                                    className="flex flex-col items-start text-left space-y-4"
                                >
                                    <div className="w-10 h-10 flex items-center justify-center text-[var(--color-primary)]">
                                        {getIconSvg(blockSettings.icon)}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                                            {blockSettings.title || 'Feature Title'}
                                        </h3>
                                        <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                                            {blockSettings.text || 'Feature description details goes here to reassure customers.'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            );

        case 'rich-text':
            return <RichTextSection settings={settings} />;

        case 'accordion':
        case 'faq':
            return <AccordionSection settings={settings} blocks={blocks} />;

        case 'countdown':
            return <CountdownSection settings={settings} />;

        case 'contact-form':
            return <ContactFormSection settings={settings} />;

        case 'social-icons':
            return <SocialIconsSection settings={settings} />;

        case 'pricing-table':
            return <PricingTableSection settings={settings} blocks={blocks} />;

        case 'best-sellers':
            return <BestSellerSection settings={settings} storeId={storeId} onAddToCart={onAddToCart} customer={customer} />;

        case 'featured-products':
        case 'product-slider':
            return <FeaturedProductsSection settings={settings} storeId={storeId} onAddToCart={onAddToCart} customer={customer} />;

        case 'testimonials':
            // Render Testimonials based on blocks
            const list = blocks.length > 0 ? blocks : (settings.testimonials || []);
            return (
                <section className="py-24 px-6 w-full">
                    <div className="max-w-6xl mx-auto space-y-14">
                        <div className="text-center space-y-3">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--heading-font)' }}>{settings.title || 'What Our Customers Say'}</h2>
                            <div className="w-10 h-px mx-auto" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
                            {list.map((item, index) => (
                                <div 
                                    key={item.blockId || index} 
                                    className="flex flex-col justify-between space-y-6 text-left relative pt-2"
                                >
                                    <div className="space-y-4">
                                        <div className="flex gap-1 text-amber-400">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <svg key={star} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-zinc-700 text-sm font-medium leading-relaxed">
                                            "{item.settings?.text || item.text || 'Amazing shopping experience, highly recommended!'}"
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                                        <div className="w-8 h-8 text-white flex items-center justify-center font-black text-[10px] uppercase" style={{ backgroundColor: 'var(--color-primary)' }}>
                                            {(item.settings?.author || item.author || 'H')[0]}
                                        </div>
                                        <span className="block text-[11px] font-bold text-zinc-800 tracking-wide uppercase">
                                            {item.settings?.author || item.author || 'Happy Customer'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );

        case 'heading': {
            const style = settings.style || {};
            const HeadingTag = style.tag || 'h2';
            return (
                <div className="py-2.5 px-4 max-w-7xl mx-auto w-full">
                    <HeadingTag
                        className="leading-tight tracking-tight uppercase"
                        style={{
                            fontSize: style.fontSize ? `clamp(${Math.max(18, Math.round(Number(style.fontSize) * 0.75))}px, 4vw, ${style.fontSize}px)` : 'clamp(20px, 4vw, 28px)',
                            color: style.color || '#18181b',
                            fontWeight: style.fontWeight || '700',
                            textAlign: style.textAlign || 'center',
                            marginTop: style.marginTop !== undefined ? `${style.marginTop}px` : '10px',
                            marginBottom: style.marginBottom !== undefined ? `${style.marginBottom}px` : '15px',
                            lineHeight: style.lineHeight || '1.3',
                            letterSpacing: style.letterSpacing || 'normal',
                            textTransform: style.textTransform || 'none'
                        }}
                    >
                        {formatText(settings.text || 'New Heading Element')}
                    </HeadingTag>
                </div>
            );
        }

        case 'paragraph': {
            const style = settings.style || {};
            return (
                <div className="py-2 px-4 max-w-7xl mx-auto w-full">
                    <p
                        className="leading-relaxed"
                        style={{
                            fontSize: style.fontSize ? `clamp(${Math.max(12, Math.round(Number(style.fontSize) * 0.85))}px, 3.5vw, ${style.fontSize}px)` : 'clamp(13px, 3.5vw, 14px)',
                            color: style.color || '#3f3f46',
                            fontWeight: style.fontWeight || '400',
                            textAlign: style.textAlign || 'left',
                            marginTop: style.marginTop !== undefined ? `${style.marginTop}px` : '5px',
                            marginBottom: style.marginBottom !== undefined ? `${style.marginBottom}px` : '10px',
                            lineHeight: style.lineHeight || '1.6',
                            letterSpacing: style.letterSpacing || 'normal',
                            textTransform: style.textTransform || 'none'
                        }}
                    >
                        {formatText(settings.text || 'Write your text details here. This paragraph block is fully customizable.')}
                    </p>
                </div>
            );
        }

        case 'button': {
            const style = settings.style || {};
            const alignStyles = {
                left: 'justify-start',
                center: 'justify-center',
                right: 'justify-end'
            };
            return (
                <div className={`py-3 px-4 max-w-7xl mx-auto w-full flex ${alignStyles[style.textAlign || 'center']}`}>
                    <a
                        href={settings.link || '#'}
                        className="transition-all hover:opacity-90 font-semibold inline-block text-center"
                        style={{
                            backgroundColor: style.backgroundColor || '#008060',
                            color: style.textColor || '#ffffff',
                            borderColor: style.borderColor || 'transparent',
                            borderWidth: style.borderWidth || '0px',
                            borderStyle: style.borderWidth ? 'solid' : 'none',
                            borderRadius: style.borderRadius || '8px',
                            padding: `${style.paddingY !== undefined ? style.paddingY : 10}px ${style.paddingX !== undefined ? style.paddingX : 20}px`,
                            fontSize: style.fontSize ? `clamp(${Math.max(11, Math.round(Number(style.fontSize) * 0.85))}px, 3vw, ${style.fontSize}px)` : 'clamp(11px, 3vw, 13px)',
                            boxShadow: style.shadow === 'lg' ? '0 10px 15px -3px rgba(0,0,0,0.1)' : style.shadow === 'md' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : style.shadow === 'sm' ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        {settings.label || 'Click Me'}
                    </a>
                </div>
            );
        }

        case 'image': {
            const style = settings.style || {};
            return (
                <div className="py-3 px-4 max-w-7xl mx-auto w-full flex justify-center">
                    <img
                        src={getImageUrl(settings.imageUrl) || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600'}
                        alt="Customizable"
                        className="max-w-full"
                        style={{
                            width: style.width || '100%',
                            height: style.height || 'auto',
                            objectFit: style.objectFit || 'cover',
                            borderRadius: style.borderRadius || '8px'
                        }}
                    />
                </div>
            );
        }

        case 'newsletter':
            return <NewsletterSection settings={settings} />;

        default:
            return (
                <div className="p-8 bg-amber-50 border border-amber-100 text-amber-800 text-center font-bold text-xs uppercase tracking-wider rounded-2xl max-w-xl mx-auto my-8">
                    Unsupported Section: {type}
                </div>
            );
    }
};

export default SectionRenderer;
