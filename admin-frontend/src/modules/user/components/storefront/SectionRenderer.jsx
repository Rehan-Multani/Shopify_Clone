import React, { Suspense } from 'react';
import { useTheme } from './themeEngine/ThemeContext';
import SectionErrorBoundary from './themeEngine/SectionErrorBoundary';
import {
    resolveSectionComponent,
    registerComponent,
} from './themeEngine/ComponentRegistry';

const SectionFallback = () => (
    <div className="py-16 w-full flex items-center justify-center" aria-hidden="true">
        <div className="h-8 w-8 rounded-full border-2 border-zinc-200 border-t-zinc-500 animate-spin" />
    </div>
);

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

const NewsletterSection = ({ settings = {} }) => {
    const { title = 'Subscribe to our newsletter', subtitle = 'Get promotions and announcements', buttonLabel = 'Subscribe' } = settings;
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
                        type="button"
                        className="px-7 py-3.5 text-[11px] font-bold uppercase tracking-widest btn-premium text-white shrink-0"
                        style={{ backgroundColor: 'var(--color-accent, var(--color-primary))', borderRadius: 'var(--radius-button, var(--border-radius, 10px))' }}
                    >
                        {buttonLabel}
                    </button>
                </div>
            </div>
        </section>
    );
};

const HeroSectionInline = ({ section, theme }) => {
    const settings = section.settings || {};
    const blocks = section.blocks || [];
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
                                marginBottom: style.marginBottom !== undefined ? `${style.marginBottom}px` : undefined,
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
                            className="leading-relaxed drop-shadow animate-fade-in-up font-medium max-w-xl"
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
                                marginBottom: style.marginBottom !== undefined ? `${style.marginBottom}px` : undefined,
                            }}
                        >
                            {formatText(block.settings?.text || 'Discover premium catalog.')}
                        </p>
                    );
                }
                return null;
            })}

            {(blocks || []).some((b) => b.type === 'button') && (
                <div className={`flex flex-wrap gap-3.5 pt-3 ${isSplit || heroStyle === 'promo' ? 'justify-start' : 'justify-center'}`}>
                    {(blocks || []).filter((b) => b.type === 'button').map((block, idx) => {
                        const style = block.settings?.style || {};
                        const isPrimary = idx === 0;
                        return (
                            <React.Fragment key={block.blockId || idx}>
                                {block.settings?.startNewRow && <div className="w-full h-0" />}
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
                    : (settings.height || (heroStyle === 'promo' ? '620px' : '75vh')),
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
                }`}
                />
            )}
            <div className={`relative z-10 w-full flex flex-col space-y-5 ${
                heroStyle === 'promo' ? 'max-w-7xl mx-auto items-start px-4 sm:px-8'
                    : heroStyle === 'cinematic' ? 'max-w-4xl items-center px-4'
                        : 'max-w-3xl items-center px-4'
            }`}
            >
                {contentBody}
            </div>
        </section>
    );
};

const FeaturesGridInline = ({ section }) => {
    const settings = section.settings || {};
    const blocks = section.blocks || [];
    const items = blocks.length > 0 ? blocks : (settings.features || []);

    const getIconSvg = (iconName) => {
        const props = { className: 'w-5 h-5', stroke: 'currentColor', strokeWidth: '2.2', fill: 'none', viewBox: '0 0 24 24' };
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
                    <p className="text-sm text-zinc-600 font-medium leading-relaxed">{settings.subtitle}</p>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 max-w-6xl mx-auto">
                {items.map((item, index) => {
                    const blockSettings = item.settings || {};
                    return (
                        <div key={item.blockId || index} className="flex flex-col items-start text-left space-y-4">
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
};

const HeadingInline = ({ settings = {} }) => {
    const style = settings.style || {};
    const HeadingTag = style.tag || 'h2';
    return (
        <div className="py-2.5 px-4 max-w-7xl mx-auto w-full">
            <HeadingTag
                className="leading-tight tracking-tight"
                style={{
                    fontSize: style.fontSize ? `clamp(${Math.max(18, Math.round(Number(style.fontSize) * 0.75))}px, 4vw, ${style.fontSize}px)` : 'clamp(20px, 4vw, 28px)',
                    color: style.color || '#18181b',
                    fontWeight: style.fontWeight || '700',
                    textAlign: style.textAlign || 'center',
                    marginTop: style.marginTop !== undefined ? `${style.marginTop}px` : '10px',
                    marginBottom: style.marginBottom !== undefined ? `${style.marginBottom}px` : '15px',
                    lineHeight: style.lineHeight || '1.3',
                    letterSpacing: style.letterSpacing || 'normal',
                    textTransform: style.textTransform || 'none',
                }}
            >
                {formatText(settings.text || 'New Heading Element')}
            </HeadingTag>
        </div>
    );
};

const ParagraphInline = ({ settings = {} }) => {
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
                }}
            >
                {formatText(settings.text || 'Write your text details here.')}
            </p>
        </div>
    );
};

const ButtonInline = ({ settings = {} }) => {
    const style = settings.style || {};
    const alignStyles = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };
    return (
        <div className={`py-3 px-4 max-w-7xl mx-auto w-full flex ${alignStyles[style.textAlign || 'center']}`}>
            <a
                href={settings.link || '#'}
                className="transition-all hover:opacity-90 font-semibold inline-block text-center"
                style={{
                    backgroundColor: style.backgroundColor || '#008060',
                    color: style.textColor || '#ffffff',
                    borderRadius: style.borderRadius || '8px',
                    padding: `${style.paddingY !== undefined ? style.paddingY : 10}px ${style.paddingX !== undefined ? style.paddingX : 20}px`,
                    fontSize: style.fontSize ? `${style.fontSize}px` : '13px',
                }}
            >
                {settings.label || 'Click Me'}
            </a>
        </div>
    );
};

const ImageInline = ({ settings = {} }) => {
    const style = settings.style || {};
    return (
        <div className="py-3 px-4 max-w-7xl mx-auto w-full flex justify-center">
            <img
                src={getImageUrl(settings.imageUrl) || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600'}
                alt={settings.alt || 'Store image'}
                className="max-w-full"
                loading="lazy"
                style={{
                    width: style.width || '100%',
                    height: style.height || 'auto',
                    objectFit: style.objectFit || 'cover',
                    borderRadius: style.borderRadius || '8px',
                }}
            />
        </div>
    );
};

const SpacerInline = ({ settings = {} }) => (
    <div style={{ height: settings.height || 40 }} aria-hidden="true" />
);

const DividerInline = ({ settings = {} }) => (
    <div className="px-6 py-4 max-w-7xl mx-auto w-full">
        <hr style={{
            borderStyle: settings.style || 'solid',
            borderColor: settings.color || '#e4e4e7',
            borderWidth: settings.thickness || '1px',
        }}
        />
    </div>
);

// Register inline / specialty components into the central registry
registerComponent('newsletter', NewsletterSection);
registerComponent('Newsletter', NewsletterSection);
registerComponent('heading', HeadingInline);
registerComponent('paragraph', ParagraphInline);
registerComponent('button', ButtonInline);
registerComponent('image', ImageInline);
registerComponent('spacer', SpacerInline);
registerComponent('divider', DividerInline);
registerComponent('features-grid', FeaturesGridInline);

/**
 * Dynamic section renderer — resolves via ComponentRegistry, never crashes the page.
 */
const SectionRenderer = ({ section, storeId, onAddToCart, customer, showFallback = false }) => {
    const theme = useTheme();
    if (!section || section.enabled === false) return null;

    const type = section.type;
    const componentKey = section.component || type;
    const settings = section.settings || {};
    const blocks = section.blocks || [];

    // Theme pack may declare supportedSections — preserve config, mark inactive UI-wise
    const supported = theme.supportedSections;
    const sectionKeys = [type, section.component, componentKey].filter(Boolean).map((k) => String(k).toLowerCase());
    const isThemeUnsupported = Array.isArray(supported) && supported.length > 0
        && !supported.some((s) => sectionKeys.includes(String(s).toLowerCase()))
        && !['header', 'footer'].includes(String(type || '').toLowerCase());

    if (isThemeUnsupported) {
        if (!showFallback) return null;
        return (
            <div
                className="p-6 my-4 mx-auto max-w-xl rounded-2xl border border-dashed border-amber-300 bg-amber-50 text-center"
                data-section-inactive="true"
                data-section-type={componentKey}
                role="status"
            >
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                    Unsupported Section
                </p>
                <p className="mt-1 text-xs text-amber-700">
                    “{section.name || componentKey}” is not supported by this theme. Configuration is preserved — replace or hide it in the builder.
                </p>
            </div>
        );
    }

    // Force carousel layout for product-slider type
    const effectiveSettings = type === 'product-slider' || section.component === 'ProductSlider'
        ? { ...settings, layout: settings.layout || 'carousel' }
        : settings;

    const Registered = resolveSectionComponent(section);
    const isHero = type === 'hero' || ['Hero', 'HeroSplit', 'HeroFullScreen', 'HeroImage'].includes(section.component);

    let content = null;

    if (isHero) {
        content = <HeroSectionInline section={section} theme={theme} />;
    } else if (type === 'features-grid') {
        content = <FeaturesGridInline section={section} />;
    } else if (type === 'heading') {
        content = <HeadingInline settings={settings} />;
    } else if (type === 'paragraph') {
        content = <ParagraphInline settings={settings} />;
    } else if (type === 'button') {
        content = <ButtonInline settings={settings} />;
    } else if (type === 'image') {
        content = <ImageInline settings={settings} />;
    } else if (type === 'spacer') {
        content = <SpacerInline settings={settings} />;
    } else if (type === 'divider') {
        content = <DividerInline settings={settings} />;
    } else if (type === 'newsletter' || section.component === 'Newsletter') {
        content = <NewsletterSection settings={settings} />;
    } else if (Registered) {
        content = React.createElement(Registered, {
            settings: effectiveSettings,
            blocks,
            storeId,
            onAddToCart,
            customer,
            section,
            theme,
        });
    } else {
        console.warn(`[SectionRenderer] Unknown section component/type: "${componentKey}". Skipping.`);
        if (showFallback) {
            content = (
                <div className="p-8 bg-amber-50 border border-amber-100 text-amber-800 text-center font-bold text-xs uppercase tracking-wider rounded-2xl max-w-xl mx-auto my-8">
                    Unsupported Section: {componentKey}
                </div>
            );
        } else {
            content = null;
        }
    }

    if (!content) return null;

    return (
        <SectionErrorBoundary
            sectionType={componentKey}
            sectionId={section.sectionId || section._id}
            showFallback={showFallback}
            resetKey={`${section.sectionId}-${componentKey}`}
        >
            <Suspense fallback={<SectionFallback />}>
                {content}
            </Suspense>
        </SectionErrorBoundary>
    );
};

export default SectionRenderer;
