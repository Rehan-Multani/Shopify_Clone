import React from 'react';
import HeroSection from './sections/HeroSection';
import CategorySection from './sections/CategorySection';
import FeaturedProductsSection from './sections/FeaturedProductsSection';
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
    PricingTableSection
} from './sections/NewSections';

const formatText = (text) => {
    if (!text || typeof text !== 'string') return text;
    return text.split(/<br\s*\/?>/gi).map((part, index, array) => (
        <React.Fragment key={index}>
            {part}
            {index < array.length - 1 && <br />}
        </React.Fragment>
    ));
};

// A dynamic newsletter block/section
const NewsletterSection = ({ settings = {} }) => {
    const { title = 'Subscribe to our newsletter', subtitle = 'Get promotions and announcements' } = settings;
    return (
        <section className="py-20 px-4 bg-transparent text-center border-t border-b border-zinc-200/50 max-w-4xl mx-auto rounded-3xl my-6 bg-white/40 backdrop-blur-sm shadow-sm">
            <div className="max-w-xl mx-auto space-y-4">
                <h2 className="text-xl font-black text-zinc-950 uppercase tracking-widest">{title}</h2>
                <p className="text-xs text-zinc-550 font-semibold max-w-sm mx-auto leading-relaxed">{subtitle}</p>
                <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5 pt-4">
                    <input 
                        type="email" 
                        placeholder="Enter your email address"
                        className="flex-grow px-4.5 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white shadow-sm transition-all focus:border-[var(--color-primary)] input-premium" 
                    />
                    <button 
                        className="px-7 py-3 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition-premium cursor-pointer btn-premium"
                        style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                    >
                        Subscribe
                    </button>
                </div>
            </div>
        </section>
    );
};

const SectionRenderer = ({ section }) => {
    if (!section || !section.enabled) return null;

    const { type, settings = {}, blocks = [] } = section;

    switch (type) {
        case 'hero': {
            const isSplit = settings.layout === 'split';
            const bgType = settings.backgroundType || 'image';
            
            let heroBg = '';
            if (bgType === 'solid') {
                heroBg = settings.backgroundColor || '#008060';
            } else if (bgType === 'gradient') {
                heroBg = settings.backgroundGradient || 'linear-gradient(to right, #008060, #047857, #064e3b)';
            } else {
                heroBg = settings.backgroundImage && !isSplit
                    ? `url(${settings.backgroundImage})` 
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
            
            const contentBody = (
                <div className={`relative z-10 w-full flex flex-col space-y-6.5 ${isSplit ? 'items-start text-left' : 'items-center text-center'}`}>
                    {(blocks || []).map((block, index) => {
                        if (block.type === 'heading') {
                            const style = block.settings?.style || {};
                            const HeadingTag = style.tag || (isSplit ? 'h2' : 'h1');
                            return (
                                <HeadingTag 
                                    key={block.blockId || index} 
                                    className="leading-tight tracking-tight drop-shadow-sm animate-fade-in-up font-black"
                                    style={{ 
                                        animationDelay: '0ms',
                                        fontSize: style.fontSize ? `${style.fontSize}px` : (isSplit ? '42px' : '48px'),
                                        color: isSplit ? 'var(--color-primary)' : (style.color || '#ffffff'),
                                        fontWeight: style.fontWeight || '900',
                                        lineHeight: style.lineHeight || undefined,
                                        letterSpacing: style.letterSpacing || undefined,
                                        textTransform: style.textTransform || 'none',
                                        textAlign: isSplit ? 'left' : (style.textAlign || 'center'),
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
                            return (
                                <p 
                                    key={block.blockId || index} 
                                    className="leading-relaxed drop-shadow animate-fade-in-up font-semibold"
                                    style={{ 
                                        animationDelay: '100ms',
                                        fontSize: style.fontSize ? `${style.fontSize}px` : '15px',
                                        color: isSplit ? '#4b5563' : (style.color || '#ffffff'),
                                        fontWeight: style.fontWeight || '500',
                                        lineHeight: style.lineHeight || undefined,
                                        letterSpacing: style.letterSpacing || undefined,
                                        textTransform: style.textTransform || 'none',
                                        textAlign: isSplit ? 'left' : (style.textAlign || 'center'),
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
                        <div className={`flex flex-wrap gap-4 pt-2 ${isSplit ? 'justify-start' : 'justify-center'}`}>
                            {(blocks || []).filter(b => b.type === 'button').map((block, idx) => {
                                const style = block.settings?.style || {};
                                return (
                                    <React.Fragment key={block.blockId || idx}>
                                        {block.settings?.startNewRow && <div className="w-full h-0"></div>}
                                        <a
                                            href={block.settings?.link || '/catalog'}
                                            className="transition-all hover:scale-105 active:scale-95 transition-all duration-300 animate-fade-in-up cursor-pointer flex items-center justify-center font-bold"
                                            style={{ 
                                                backgroundColor: style.backgroundColor || (idx === 0 ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.15)'), 
                                                color: style.textColor || '#ffffff',
                                                borderColor: style.borderColor || (style.borderWidth && style.borderWidth !== '0px' ? '#18181b' : 'transparent'),
                                                borderStyle: (style.borderWidth && style.borderWidth !== '0px') ? 'solid' : 'none',
                                                borderWidth: style.borderWidth || '0px',
                                                borderRadius: style.borderRadius || 'var(--border-radius)',
                                                padding: `${style.paddingY !== undefined ? style.paddingY : 12}px ${style.paddingX !== undefined ? style.paddingX : 28}px`,
                                                fontSize: style.fontSize ? `${style.fontSize}px` : '10px',
                                                boxShadow: style.shadow === 'lg' ? '0 10px 15px -3px rgba(0,0,0,0.1)' : style.shadow === 'md' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : style.shadow === 'sm' ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none',
                                                animationDelay: `${200 + idx * 50}ms`
                                            }}
                                        >
                                            {block.settings?.label || 'Shop Now'}
                                        </a>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}

                    {/* Fallback if no blocks */}
                    {blocks.length === 0 && (
                        <div className={`${isSplit ? 'text-zinc-800' : 'text-white'} space-y-4`}>
                            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">{formatText(settings.title || 'Welcome to Our Store')}</h1>
                            <p className="text-xs sm:text-sm text-zinc-550 font-semibold max-w-sm">{formatText(settings.subtitle)}</p>
                        </div>
                    )}

                    {/* QubanHC Style Trust Badges */}
                    {settings.showTrustBadges !== false && (
                        <div className={`flex flex-wrap items-center gap-6 pt-6.5 mt-2.5 border-t w-full text-[9px] font-black uppercase tracking-widest animate-fade-in-up ${isSplit ? 'border-zinc-200 justify-start text-zinc-650' : 'border-white/10 justify-center text-white/95'}`} style={{ animationDelay: '350ms' }}>
                            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-full border ${isSplit ? 'bg-zinc-50 border-zinc-200/60' : 'bg-black/25 border-white/5'}`}>
                                <span className="text-xs">🚚</span>
                                <span>{settings.badge1Text || 'Free Shipping'}</span>
                            </div>
                            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-full border ${isSplit ? 'bg-zinc-50 border-zinc-200/60' : 'bg-black/25 border-white/5'}`}>
                                <span className="text-xs">🛡️</span>
                                <span>{settings.badge2Text || 'Secure Payments'}</span>
                            </div>
                            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-full border ${isSplit ? 'bg-zinc-50 border-zinc-200/60' : 'bg-black/25 border-white/5'}`}>
                                <span className="text-xs">🔄</span>
                                <span>{settings.badge3Text || 'Easy Returns'}</span>
                            </div>
                        </div>
                    )}
                </div>
            );

            if (isSplit) {
                return (
                    <section 
                        className="relative flex items-center justify-center py-16 px-6 md:px-12 rounded-3xl"
                        style={{ minHeight: settings.height || '500px', ...splitBgStyle }}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-6xl mx-auto">
                            {contentBody}
                            <div className="flex justify-center items-center w-full">
                                <div 
                                    className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl border border-teal-100/50 bg-white p-2.5"
                                    style={{ animationDelay: '200ms' }}
                                >
                                    <div className="w-full h-full rounded-[22px] overflow-hidden bg-zinc-50 relative group">
                                        {settings.backgroundImage ? (
                                            <img src={settings.backgroundImage} alt="Hero illustration" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
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
                    className="relative flex items-center justify-center overflow-hidden py-24 px-4 text-center rounded-3xl"
                    style={{
                        background: heroBg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',   
                        minHeight: settings.height || '480px'
                    }}
                >
                    {/* Dark Overlay */}
                    {bgType === 'image' && <div className="absolute inset-0 bg-black/45"></div>}
                    <div className="relative z-10 max-w-2xl w-full flex flex-col items-center space-y-6.5">
                        {contentBody}
                    </div>
                </section>
            );
        }

        case 'categories':
        case 'category-grid':
            return <CategorySection settings={settings} />;

        case 'banners':
            return <BannerSection settings={settings} />;

        case 'image-banner':
            return <ImageBannerSection settings={settings} />;

        case 'video-banner':
            return <VideoBannerSection settings={settings} />;

        case 'carousel':
            return <CarouselSection settings={settings} blocks={blocks} />;

        case 'features-grid':
            const items = blocks.length > 0 ? blocks : (settings.features || []);
            
            const getIconSvg = (iconName) => {
                const props = { className: "w-5 h-5 text-[var(--color-primary)]", stroke: "currentColor", strokeWidth: "2.2", fill: "none", viewBox: "0 0 24 24" };
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
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent max-w-7xl mx-auto w-full space-y-12">
                    <div className="text-center space-y-2.5 max-w-xl mx-auto">
                        <h2 className="text-xl sm:text-2xl font-black text-zinc-950 uppercase tracking-widest leading-tight">
                            {settings.title || 'Why Choose Us'}
                        </h2>
                        {settings.subtitle && (
                            <p className="text-xs text-zinc-550 font-semibold leading-relaxed">
                                {settings.subtitle}
                            </p>
                        )}
                        <div className="w-8 h-0.5 rounded-full mx-auto" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-4">
                        {items.map((item, index) => {
                            const blockSettings = item.settings || {};
                            return (
                                <div 
                                    key={item.blockId || index} 
                                    className="p-8 bg-white border border-zinc-200/60 rounded-3xl flex flex-col items-start text-left space-y-4.5 card-premium relative hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.06)]"
                                    style={{ borderRadius: 'var(--border-radius, 16px)' }}
                                >
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[var(--color-primary-light)]/60 border border-[var(--color-primary-semi)] shadow-inner">
                                        {getIconSvg(blockSettings.icon)}
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                                            {blockSettings.title || 'Feature Title'}
                                        </h3>
                                        <p className="text-xs text-zinc-550 leading-relaxed font-semibold">
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

        case 'featured-products':
        case 'product-slider':
        case 'best-sellers':
            return <FeaturedProductsSection settings={settings} />;

        case 'testimonials':
            // Render Testimonials based on blocks
            const list = blocks.length > 0 ? blocks : (settings.testimonials || []);
            return (
                <section className="py-20 px-4 text-center space-y-10">
                    <div className="space-y-1 border-b border-zinc-200/65 pb-4 flex items-center justify-between max-w-7xl mx-auto">
                        <div>
                            <h2 className="text-lg font-black tracking-widest text-zinc-900 uppercase">{settings.title || 'What Our Customers Say'}</h2>
                            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
                        {list.map((item, index) => (
                            <div 
                                key={item.blockId || index} 
                                className="p-7 bg-white border border-zinc-200/60 rounded-2xl flex flex-col justify-between space-y-5 card-premium w-full md:w-[340px] text-left relative"
                                style={{ borderRadius: 'var(--border-radius, 12px)' }}
                            >
                                <span className="absolute -top-3 -right-1 text-7xl text-[var(--color-primary)] opacity-5 select-none font-serif leading-none">“</span>
                                <div className="flex gap-1 text-amber-400">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <svg key={star} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-zinc-650 italic text-xs font-semibold leading-relaxed relative z-10">
                                    "{item.settings?.text || item.text || 'Amazing shopping experience, highly recommended!'}"
                                </p>
                                <div className="flex items-center gap-3 pt-3 border-t border-zinc-100">
                                    <div className="w-7 h-7 rounded-full text-white flex items-center justify-center font-black text-[9px] uppercase shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
                                        {(item.settings?.author || item.author || 'H')[0]}
                                    </div>
                                    <span className="block text-[10px] font-black text-zinc-700 tracking-wider uppercase">
                                        {item.settings?.author || item.author || 'Happy Customer'}
                                    </span>
                                </div>
                            </div>
                        ))}
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
                            fontSize: style.fontSize ? `${style.fontSize}px` : '28px',
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
                            fontSize: style.fontSize ? `${style.fontSize}px` : '14px',
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
                            fontSize: style.fontSize ? `${style.fontSize}px` : '13px',
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
                        src={settings.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600'}
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
