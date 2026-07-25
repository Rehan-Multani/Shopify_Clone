import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../themeEngine/ThemeContext';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL?.replace('/api', '') || '';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${ASSETS_BASE_URL}${cleanPath}`;
};

// Image Banner
export const ImageBannerSection = ({ settings = {} }) => {
    const {
        imageUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600',
        title = 'Special Promotion',
        subtitle = 'Grab the latest designs at 30% discount',
        buttonLabel = 'Shop Now',
        buttonLink = '#',
        height = '400px',
        layout = 'side'
    } = settings;

    if (layout === 'overlay') {
        return (
            <section
                className="relative overflow-hidden w-full flex items-center justify-center text-center px-6 sm:px-12 py-24 md:py-32"
                style={{
                    minHeight: height || '78vh',
                    backgroundImage: `url(${getImageUrl(imageUrl)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/25 z-0" />
                <div className="relative z-10 flex flex-col items-center space-y-5 text-white max-w-3xl">
                    <h2
                        className="text-3xl sm:text-5xl md:text-6xl font-medium leading-[1.02] tracking-tight"
                        style={{ fontFamily: 'var(--heading-font)' }}
                    >
                        {title}
                    </h2>
                    <div className="h-[2px] w-14 bg-[var(--color-accent,var(--color-primary))]" />
                    <p className="text-sm sm:text-base text-white/85 font-medium leading-relaxed max-w-lg tracking-[0.04em]">
                        {subtitle}
                    </p>
                    {buttonLabel && (
                        <div className="pt-4">
                            <a
                                href={buttonLink}
                                className="inline-block px-9 py-3.5 text-white text-[11px] font-bold uppercase tracking-[0.18em] btn-premium"
                                style={{
                                    backgroundColor: 'var(--color-accent, var(--color-primary))',
                                    borderRadius: 'var(--border-radius, 10px)',
                                }}
                            >
                                {buttonLabel}
                            </a>
                        </div>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[440px] md:min-h-[560px]">
                <div className="flex flex-col justify-center space-y-5 px-8 sm:px-12 lg:px-16 py-16 bg-[var(--color-secondary)]">
                    <h2
                        className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.08] tracking-tight text-zinc-900"
                        style={{ fontFamily: 'var(--heading-font)' }}
                    >
                        {title}
                    </h2>
                    <div className="h-[2px] w-14" style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }} />
                    <p className="text-sm md:text-base text-zinc-600 font-medium leading-relaxed max-w-md">
                        {subtitle}
                    </p>
                    {buttonLabel && (
                        <div className="pt-3">
                            <a
                                href={buttonLink}
                                className="inline-block px-9 py-3.5 text-white text-[11px] font-bold uppercase tracking-[0.18em] btn-premium"
                                style={{
                                    backgroundColor: 'var(--color-primary)',
                                    borderRadius: 'var(--border-radius, 10px)',
                                }}
                            >
                                {buttonLabel}
                            </a>
                        </div>
                    )}
                </div>
                <div className="relative min-h-[300px] overflow-hidden group">
                    <img
                        src={getImageUrl(imageUrl)}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                </div>
            </div>
        </section>
    );
};

// Video Banner
export const VideoBannerSection = ({ settings = {} }) => {
    const {
        videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40194-large.mp4',
        title = 'Luxury Reimagined',
        subtitle = 'Step into the new season of design excellence',
        buttonLabel = 'Explore Collection',
        buttonLink = '#',
        height = '480px'
    } = settings;

    return (
        <section 
            className="relative flex items-center justify-center bg-zinc-950 overflow-hidden py-24 px-6 text-center w-full"
            style={{ minHeight: height || '70vh' }}
        >
            <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
                <source src={videoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative z-10 max-w-2xl w-full flex flex-col items-center space-y-5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">
                    New Arrivals
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                    {title}
                </h1>
                <p className="text-xs sm:text-sm text-white/90 font-semibold max-w-lg leading-relaxed drop-shadow">
                    {subtitle}
                </p>
                {buttonLabel && (
                    <a 
                        href={buttonLink}
                        className="px-7 py-3 text-white font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 btn-premium"
                        style={{ 
                            backgroundColor: 'var(--color-primary)', 
                            borderRadius: 'var(--border-radius)'
                        }}
                    >
                        {buttonLabel}
                    </a>
                )}
            </div>
        </section>
    );
};

// Carousel Slider Section
export const CarouselSection = ({ settings = {}, blocks = [] }) => {
    const {
        title = 'Our Collection Stories',
        height = '400px',
        autoplay = true,
        autoplayDelay = 5000,
        showArrows = true,
        showDots = true,
        infinite = true,
    } = settings;
    const slides = blocks.length > 0 ? blocks : [
        { settings: { imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600', title: 'Summer Essentials', link: '#' } },
        { settings: { imageUrl: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=1600', title: 'Autumn Looks', link: '#' } }
    ];

    const [activeIdx, setActiveIdx] = useState(0);
    const touchStart = useRef(null);

    const goTo = (next) => {
        if (infinite) {
            setActiveIdx((next + slides.length) % slides.length);
        } else {
            setActiveIdx(Math.max(0, Math.min(slides.length - 1, next)));
        }
    };

    useEffect(() => {
        if (!autoplay || window.matchMedia('(prefers-reduced-motion: reduce)').matches || slides.length < 2) return undefined;
        const interval = setInterval(() => {
            setActiveIdx(prev => (prev + 1) % slides.length);
        }, Number(autoplayDelay) || 5000);
        return () => clearInterval(interval);
    }, [slides.length, autoplay, autoplayDelay]);

    const activeSlide = slides[activeIdx]?.settings || {};

    return (
        <section 
            className="relative overflow-hidden w-full"
            style={{ height: height || '70vh', minHeight: '420px' }}
            role="region"
            aria-roledescription="carousel"
            aria-label={title}
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') goTo(activeIdx - 1);
                if (event.key === 'ArrowRight') goTo(activeIdx + 1);
            }}
            onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
            onTouchEnd={(event) => {
                if (touchStart.current === null) return;
                const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
                if (Math.abs(delta) > 45) goTo(activeIdx + (delta < 0 ? 1 : -1));
                touchStart.current = null;
            }}
        >
            <div className="absolute inset-0 transition-opacity duration-700">
                <img 
                    src={getImageUrl(activeSlide.imageUrl)} 
                    alt={activeSlide.title} 
                    className="w-full h-full object-cover"
                    loading={activeIdx === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-black/35"></div>
            </div>

            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 z-10 text-white space-y-4">
                <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-wider">{activeSlide.title || title}</h3>
                {activeSlide.link && (
                    <a 
                        href={activeSlide.link}
                        className="px-6 py-2.5 bg-white text-zinc-950 font-black text-[10px] uppercase tracking-widest shadow rounded-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        Explore
                    </a>
                )}
            </div>

            {showArrows && slides.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => goTo(activeIdx - 1)}
                        aria-label="Previous slide"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/85 text-zinc-900 grid place-items-center backdrop-blur hover:bg-white transition"
                    >←</button>
                    <button
                        type="button"
                        onClick={() => goTo(activeIdx + 1)}
                        aria-label="Next slide"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/85 text-zinc-900 grid place-items-center backdrop-blur hover:bg-white transition"
                    >→</button>
                </>
            )}

            {/* Dots */}
            {showDots && <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                {slides.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setActiveIdx(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        aria-current={idx === activeIdx ? 'true' : undefined}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === activeIdx ? 'bg-white w-6' : 'bg-white/40'}`}
                    />
                ))}
            </div>}
        </section>
    );
};

// Shoppable editorial image with configurable product hotspots.
export const LookbookSection = ({ settings = {}, blocks = [] }) => {
    const [active, setActive] = useState(null);
    const hotspots = blocks.length ? blocks : [
        { settings: { x: 35, y: 32, label: 'Signature Jacket', price: '₹2,499', link: '/catalog' } },
        { settings: { x: 62, y: 72, label: 'Everyday Sneakers', price: '₹2,999', link: '/catalog' } },
    ];
    return (
        <section className="w-full py-0">
            <div className="px-4 sm:px-6 md:px-10 lg:px-14 py-16 md:py-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <h2 className="text-3xl md:text-5xl font-medium tracking-tight" style={{ fontFamily: 'var(--heading-font)' }}>{settings.title || 'The Lookbook'}</h2>
                    <div className="h-[2px] w-14" style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }} />
                </div>
                <p className="text-sm opacity-55 max-w-xs leading-relaxed">{settings.subtitle || 'Tap a hotspot to discover products in this scene.'}</p>
            </div>
            <div className="relative min-h-[70vh] md:min-h-[85vh] overflow-hidden w-full">
                <img
                    src={getImageUrl(settings.imageUrl || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600')}
                    alt={settings.alt || 'Shoppable collection lookbook'}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {hotspots.map((item, index) => {
                    const itemSettings = item.settings || item;
                    return (
                        <div key={item.blockId || index} className="absolute z-10" style={{ left: `${itemSettings.x || 50}%`, top: `${itemSettings.y || 50}%` }}>
                            <button
                                type="button"
                                aria-label={`View ${itemSettings.label || 'product'}`}
                                aria-expanded={active === index}
                                onClick={() => setActive(active === index ? null : index)}
                                className="w-11 h-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white text-zinc-950 grid place-items-center text-lg shadow-[0_12px_30px_-10px_rgba(0,0,0,.45)] ring-4 ring-white/35 transition-transform hover:scale-105"
                            >+</button>
                            {active === index && (
                                <a
                                    href={itemSettings.link || '/catalog'}
                                    className="absolute left-5 top-3 w-56 bg-white text-zinc-900 p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,.45)] store-card"
                                    style={{ borderRadius: 'var(--border-radius, 14px)' }}
                                >
                                    <strong className="text-base block font-medium" style={{ fontFamily: 'var(--heading-font)' }}>{itemSettings.label || 'Featured product'}</strong>
                                    <span className="text-[11px] mt-2.5 block uppercase tracking-[0.16em] opacity-55 font-semibold">{itemSettings.price || 'View product'} →</span>
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export const BeforeAfterSection = ({ settings = {} }) => {
    const [position, setPosition] = useState(50);
    const before = getImageUrl(settings.beforeImage || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400');
    const after = getImageUrl(settings.afterImage || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400');
    return (
        <section className="max-w-6xl mx-auto my-10 px-4">
            <div className="text-center mb-7">
                <span className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--color-primary)]">Transformation</span>
                <h2 className="text-2xl md:text-4xl mt-2" style={{ fontFamily: 'var(--heading-font)' }}>{settings.title || 'Before & After'}</h2>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden select-none" style={{ borderRadius: 'var(--border-radius)' }}>
                <img src={after} alt={settings.afterAlt || 'After'} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${position}%` }}>
                    <img src={before} alt={settings.beforeAlt || 'Before'} loading="lazy" className="absolute inset-y-0 left-0 h-full max-w-none object-cover" style={{ width: 'min(1100px, calc(100vw - 32px))' }} />
                </div>
                <div className="absolute inset-y-0 w-0.5 bg-white shadow-xl" style={{ left: `${position}%` }}>
                    <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-full grid place-items-center text-zinc-800 shadow-lg">↔</span>
                </div>
                <span className="absolute left-4 top-4 bg-black/65 text-white px-3 py-1 text-[10px] font-black uppercase">Before</span>
                <span className="absolute right-4 top-4 bg-black/65 text-white px-3 py-1 text-[10px] font-black uppercase">After</span>
                <input
                    type="range"
                    min="5"
                    max="95"
                    value={position}
                    onChange={(event) => setPosition(Number(event.target.value))}
                    aria-label="Move before and after comparison"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                />
            </div>
        </section>
    );
};

export const StorytellingSection = ({ settings = {}, blocks = [] }) => {
    const chapters = blocks.length ? blocks : [
        { settings: { eyebrow: '01 — Origin', title: 'How it started', text: 'A small idea, shaped by care and a belief that better products should feel personal.' } },
        { settings: { eyebrow: '02 — Process', title: 'How we make it', text: 'Thoughtful materials, trusted partners, and a process designed around lasting quality.' } },
        { settings: { eyebrow: '03 — Promise', title: 'Why it matters', text: 'Transparent sourcing and products made to earn a place in your everyday life.' } },
    ];
    return (
        <section className="w-full px-4 sm:px-6 md:px-10 lg:px-14 py-24 md:py-32">
            <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-12 lg:gap-24">
                <div className="lg:sticky lg:top-28 lg:self-start space-y-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[.22em] opacity-45">{settings.eyebrow || 'Our story'}</span>
                    <h2 className="text-4xl md:text-6xl leading-[0.95] font-medium" style={{ fontFamily: 'var(--heading-font)' }}>{settings.title || 'Made with intention.'}</h2>
                    <div className="h-[2px] w-14" style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }} />
                    <p className="text-sm opacity-55 mt-2 max-w-md leading-relaxed">{settings.subtitle || 'Follow the journey from first idea to finished product.'}</p>
                </div>
                <div className="space-y-0 divide-y divide-black/10">
                    {chapters.map((chapter, index) => {
                        const item = chapter.settings || chapter;
                        return (
                            <article key={chapter.blockId || index} className="py-10 md:py-14 first:pt-0">
                                <span className="text-[10px] font-bold uppercase tracking-[.2em] opacity-40">{item.eyebrow}</span>
                                <h3 className="text-2xl md:text-4xl mt-3 font-medium" style={{ fontFamily: 'var(--heading-font)' }}>{item.title}</h3>
                                <p className="text-sm opacity-60 mt-4 max-w-xl leading-relaxed">{item.text}</p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export const ShoppableVideoSection = ({ settings = {}, blocks = [] }) => (
    <section className="w-full">
        <div className="grid lg:grid-cols-[1.4fr_.6fr] bg-zinc-950 text-white overflow-hidden min-h-[70vh]">
            <div className="relative min-h-[460px]">
                <video
                    src={settings.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-with-a-green-jacket-39875-large.mp4'}
                    poster={getImageUrl(settings.posterImage)}
                    autoPlay={settings.autoplay !== false}
                    muted
                    loop={settings.loop !== false}
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-50">{settings.eyebrow || 'In motion'}</span>
                <h2 className="text-3xl md:text-5xl font-medium leading-tight" style={{ fontFamily: 'var(--heading-font)' }}>{settings.title || 'See it in motion'}</h2>
                <p className="text-sm opacity-60 leading-relaxed">{settings.subtitle || 'Shop products featured in this film.'}</p>
                <div className="space-y-3 pt-2">
                    {(blocks.length ? blocks : [{ settings: { label: 'Shop the edit', link: '/catalog' } }]).map((block, i) => (
                        <a key={block.blockId || i} href={(block.settings || block).link || '/catalog'} className="block py-3 border-b border-white/15 text-sm font-medium hover:opacity-70 transition-opacity">
                            {(block.settings || block).label || 'Shop now'} →
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

// Rich Text Block
export const RichTextSection = ({ settings = {} }) => {
    const {
        title = 'Our Mission',
        content = 'We strive to provide organic, comfortable fashion with durable and sustainable operations.',
        alignment = 'center'
    } = settings;

    const alignmentClasses = {
        left: 'text-left items-start',
        center: 'text-center items-center',
        right: 'text-right items-end'
    };

    return (
        <section className="py-16 px-6 max-w-4xl mx-auto">
            <div className={`flex flex-col space-y-4 ${alignmentClasses[alignment]}`}>
                {title && (
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-zinc-900">
                        {title}
                    </h2>
                )}
                <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                <p className="text-xs text-zinc-650 leading-relaxed font-semibold max-w-2xl whitespace-pre-line">
                    {content}
                </p>
            </div>
        </section>
    );
};

// Accordion & FAQ Lists
export const AccordionSection = ({ settings = {}, blocks = [] }) => {
    const { title = 'Questions & Answers' } = settings;
    const items = blocks.length > 0 ? blocks : [
        { settings: { title: 'What is your refund policy?', content: 'We offer a 30-day no-questions-asked refund policy for all unused products.' } },
        { settings: { title: 'How long does delivery take?', content: 'Delivery usually takes between 3 to 5 business days for domestic orders.' } }
    ];

    const [openIdx, setOpenIdx] = useState(null);

    const toggleRow = (idx) => {
        setOpenIdx(openIdx === idx ? null : idx);
    };

    return (
        <section className="py-16 px-6 max-w-3xl mx-auto space-y-6">
            {title && (
                <div className="text-center space-y-1.5 mb-6">
                    <h2 className="text-lg font-black uppercase tracking-widest text-zinc-950">{title}</h2>
                    <div className="w-8 h-0.5 rounded-full mx-auto" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                </div>
            )}

            <div className="space-y-3">
                {items.map((item, idx) => {
                    const blockSettings = item.settings || {};
                    const q = blockSettings.title || blockSettings.question || 'FAQ Item';
                    const a = blockSettings.content || blockSettings.answer || '';
                    const isOpen = openIdx === idx;

                    return (
                        <div 
                            key={item.blockId || idx}
                            className="bg-white border border-zinc-200 rounded-2xl overflow-hidden transition-all duration-300"
                            style={{ borderRadius: 'var(--border-radius)' }}
                        >
                            <button
                                onClick={() => toggleRow(idx)}
                                className="w-full p-4 text-left flex justify-between items-center text-xs font-black uppercase tracking-wider text-zinc-800 hover:bg-zinc-50"
                            >
                                <span>{q}</span>
                                <span className={`text-[10px] transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>
                            {isOpen && (
                                <div className="p-4 border-t border-zinc-100 text-xs text-zinc-600 leading-relaxed font-semibold bg-zinc-50/30">
                                    {a}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

// Countdown Timer
export const CountdownSection = ({ settings = {} }) => {
    const theme = useTheme();
    const {
        title = 'Flash Sale Ends In!',
        targetDate = new Date(Date.now() + 86400000 * 2).toISOString()
    } = settings;

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTime = () => {
            const difference = +new Date(targetDate) - +new Date();
            let timeLeftVal = { days: 0, hours: 0, minutes: 0, seconds: 0 };

            if (difference > 0) {
                timeLeftVal = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            setTimeLeft(timeLeftVal);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const formatNum = (num) => String(num).padStart(2, '0');
    const isConversion = theme.sectionStyle === 'conversion' || theme.themeSlug === 'velocity' || theme.themeSlug === 'flash';
    const isUrgent = theme.motionPreset === 'urgent' || theme.themeSlug === 'flash' || theme.themeSlug === 'street';

    return (
        <section
            className="theme-countdown py-16 px-6 text-center w-full border-y border-black/5"
            style={{
                background: isUrgent
                    ? 'var(--color-primary)'
                    : isConversion
                        ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-secondary))'
                        : 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                color: isUrgent ? '#fff' : 'var(--color-text)',
            }}
        >
            <div className="space-y-6 max-w-4xl mx-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70">Limited Time Only</span>
                <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight" style={{ fontFamily: 'var(--heading-font)' }}>{title}</h3>

                <div className="flex justify-center items-stretch gap-2 sm:gap-3 pt-2">
                    {[
                        [timeLeft.days, 'Days'],
                        [timeLeft.hours, 'Hours'],
                        [timeLeft.minutes, 'Mins'],
                        [timeLeft.seconds, 'Secs'],
                    ].map(([value, label], idx) => (
                        <React.Fragment key={label}>
                            {idx > 0 && <span className="self-center text-2xl font-light opacity-30 px-1">:</span>}
                            <div className="flex flex-col min-w-[70px] sm:min-w-[96px] py-4 px-3" style={{ background: isUrgent ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.04)' }}>
                                <span className="text-3xl sm:text-5xl font-black tabular-nums leading-none" style={{ fontFamily: 'var(--theme-price-font)' }}>{formatNum(value)}</span>
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-55 mt-2">{label}</span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Contact Form
export const ContactFormSection = ({ settings = {} }) => {
    const {
        title = 'Get in Touch',
        subtitle = 'Send us a message and we will respond in 24 hours.'
    } = settings;

    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
    };

    return (
        <section className="py-16 px-6 max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-1.5">
                <h2 className="text-lg font-black uppercase text-zinc-950 tracking-widest">{title}</h2>
                <p className="text-xs text-zinc-550 font-semibold leading-relaxed max-w-sm mx-auto">{subtitle}</p>
                <div className="w-8 h-0.5 rounded-full mx-auto" style={{ backgroundColor: 'var(--color-primary)' }}></div>
            </div>

            {formSubmitted ? (
                <div className="p-8 text-center bg-emerald-50 border border-emerald-150 rounded-2xl space-y-2">
                    <span className="text-2xl">✨</span>
                    <h4 className="text-xs font-black text-emerald-850 uppercase">Message Sent!</h4>
                    <p className="text-[10px] font-semibold text-emerald-700 leading-relaxed">
                        Thank you for reaching out. A representative will contact you shortly.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input 
                            type="text" 
                            required 
                            placeholder="Your Name" 
                            className="px-4.5 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white input-premium w-full"
                        />
                        <input 
                            type="email" 
                            required 
                            placeholder="Email Address" 
                            className="px-4.5 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white input-premium w-full"
                        />
                    </div>
                    <textarea 
                        required 
                        rows={4} 
                        placeholder="Message details..." 
                        className="px-4.5 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white input-premium w-full"
                    />
                    <button 
                        type="submit"
                        className="w-full py-3.5 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition-premium cursor-pointer btn-premium"
                        style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                    >
                        Send Inquiry
                    </button>
                </form>
            )}
        </section>
    );
};

// Social Icons Footer / Follow Bar
export const SocialIconsSection = ({ settings = {} }) => {
    const { title = 'Follow Our Journey' } = settings;

    return (
        <section className="py-12 px-6 text-center max-w-xl mx-auto space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-950 tracking-widest">{title}</h4>
            <div className="flex justify-center gap-4">
                <a href="#" className="w-9 h-9 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center text-xs transition-colors shadow-sm">
                    FB
                </a>
                <a href="#" className="w-9 h-9 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center text-xs transition-colors shadow-sm">
                    IG
                </a>
                <a href="#" className="w-9 h-9 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center text-xs transition-colors shadow-sm">
                    TW
                </a>
                <a href="#" className="w-9 h-9 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center text-xs transition-colors shadow-sm">
                    YT
                </a>
            </div>
        </section>
    );
};

// Pricing Table comparisons
export const PricingTableSection = ({ settings = {}, blocks = [] }) => {
    const { title = 'Pricing Plans' } = settings;
    const plans = blocks.length > 0 ? blocks : [
        { settings: { planName: 'Basic', price: '₹999', features: 'Standard access, 1 store, basic theme customizer', buttonLabel: 'Subscribe' } },
        { settings: { planName: 'Enterprise Pro', price: '₹2,999', features: 'All access, unlimited pages, custom CSS/JS, priority support', buttonLabel: 'Go Pro', isPopular: true } }
    ];

    return (
        <section className="py-16 px-6 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-1.5">
                <h2 className="text-lg font-black uppercase text-zinc-950 tracking-widest">{title}</h2>
                <div className="w-8 h-0.5 rounded-full mx-auto" style={{ backgroundColor: 'var(--color-primary)' }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {plans.map((p, idx) => {
                    const blockSettings = p.settings || {};
                    const isPopular = !!blockSettings.isPopular;

                    return (
                        <div 
                            key={p.blockId || idx}
                            className={`p-8 bg-white border rounded-3xl flex flex-col justify-between space-y-6 relative transition-all duration-300 ${
                                isPopular 
                                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-xl scale-[1.02]' 
                                    : 'border-zinc-200/80 shadow-sm hover:shadow-md'
                            }`}
                            style={{ borderRadius: 'var(--border-radius)' }}
                        >
                            {isPopular && (
                                <span className="absolute -top-3.5 right-6 px-3 py-1 bg-[var(--color-primary)] text-white text-[8px] font-black uppercase tracking-wider rounded-full shadow-sm">
                                    Most Popular
                                </span>
                            )}
                            
                            <div className="space-y-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                                    {blockSettings.planName}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-zinc-950">{blockSettings.price}</span>
                                    <span className="text-[10px] text-zinc-400 font-bold">/ month</span>
                                </div>
                                <p className="text-[10px] text-zinc-650 leading-relaxed font-semibold pt-2">
                                    {blockSettings.features}
                                </p>
                            </div>

                            <button 
                                className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow transition-premium btn-premium"
                                style={{ 
                                    backgroundColor: isPopular ? 'var(--color-primary)' : 'var(--color-secondary)',
                                    color: isPopular ? '#ffffff' : 'var(--color-primary)',
                                    border: isPopular ? 'none' : '1px solid var(--color-primary)',
                                    borderRadius: 'var(--border-radius)' 
                                }}
                            >
                                {blockSettings.buttonLabel || 'Subscribe'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
