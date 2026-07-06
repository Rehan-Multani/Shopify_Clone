import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
                className="relative overflow-hidden rounded-3xl my-6 mx-auto max-w-7xl shadow-sm border border-zinc-200/40 flex items-center justify-center text-center p-8 sm:p-12 md:p-16"
                style={{ 
                    minHeight: height, 
                    backgroundImage: `url(${getImageUrl(imageUrl)})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center' 
                }}
            >
                <div className="absolute inset-0 bg-black/45 z-0"></div>
                <div className="relative z-10 flex flex-col items-center space-y-4 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">
                        Featured Offer
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black leading-tight uppercase drop-shadow">
                        {title}
                    </h2>
                    <p className="text-xs sm:text-sm text-white/90 font-semibold leading-relaxed max-w-md drop-shadow">
                        {subtitle}
                    </p>
                    {buttonLabel && (
                        <div className="pt-2">
                            <a
                                href={buttonLink}
                                className="inline-block px-7 py-3 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition-premium btn-premium"
                                style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
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
        <section className="relative overflow-hidden rounded-3xl my-6 mx-auto max-w-7xl shadow-sm border border-zinc-200/40">
            <div className="flex flex-col md:flex-row bg-[#fafafa]">
                <div className="flex-1 p-8 sm:p-12 md:p-16 flex flex-col justify-center space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">
                        Featured Offer
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 leading-tight uppercase">
                        {title}
                    </h2>
                    <p className="text-xs text-zinc-550 font-semibold leading-relaxed max-w-md">
                        {subtitle}
                    </p>
                    {buttonLabel && (
                        <div className="pt-2">
                            <a
                                href={buttonLink}
                                className="inline-block px-7 py-3 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition-premium btn-premium"
                                style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                            >
                                {buttonLabel}
                            </a>
                        </div>
                    )}
                </div>
                <div className="flex-1 relative" style={{ minHeight: height }}>
                    <img 
                        src={getImageUrl(imageUrl)} 
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover"
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
            className="relative flex items-center justify-center bg-zinc-950 overflow-hidden py-20 px-4 text-center rounded-3xl my-6 max-w-7xl mx-auto"
            style={{ minHeight: height }}
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
    const { title = 'Our Collection Stories', height = '400px' } = settings;
    const slides = blocks.length > 0 ? blocks : [
        { settings: { imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600', title: 'Summer Essentials', link: '#' } },
        { settings: { imageUrl: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=1600', title: 'Autumn Looks', link: '#' } }
    ];

    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIdx(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const activeSlide = slides[activeIdx]?.settings || {};

    return (
        <section 
            className="relative overflow-hidden rounded-3xl my-6 mx-auto max-w-7xl shadow-sm border border-zinc-200/40"
            style={{ height: height }}
        >
            <div className="absolute inset-0 transition-opacity duration-700">
                <img 
                    src={getImageUrl(activeSlide.imageUrl)} 
                    alt={activeSlide.title} 
                    className="w-full h-full object-cover"
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

            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                {slides.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setActiveIdx(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === activeIdx ? 'bg-white w-6' : 'bg-white/40'}`}
                    />
                ))}
            </div>
        </section>
    );
};

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

    return (
        <section className="py-14 px-6 text-center max-w-4xl mx-auto rounded-3xl bg-red-50 border border-red-150 my-6 shadow-sm">
            <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-red-600">Limited Time Only</span>
                <h3 className="text-xl sm:text-2xl font-black text-red-950 uppercase">{title}</h3>
                
                <div className="flex justify-center items-center gap-4 sm:gap-6 pt-2">
                    <div className="flex flex-col">
                        <span className="text-2xl sm:text-3xl font-black text-red-800">{formatNum(timeLeft.days)}</span>
                        <span className="text-[8px] font-bold text-red-600 uppercase tracking-widest">Days</span>
                    </div>
                    <span className="text-xl font-bold text-red-300">:</span>
                    <div className="flex flex-col">
                        <span className="text-2xl sm:text-3xl font-black text-red-800">{formatNum(timeLeft.hours)}</span>
                        <span className="text-[8px] font-bold text-red-600 uppercase tracking-widest">Hours</span>
                    </div>
                    <span className="text-xl font-bold text-red-300">:</span>
                    <div className="flex flex-col">
                        <span className="text-2xl sm:text-3xl font-black text-red-800">{formatNum(timeLeft.minutes)}</span>
                        <span className="text-[8px] font-bold text-red-600 uppercase tracking-widest">Mins</span>
                    </div>
                    <span className="text-xl font-bold text-red-300">:</span>
                    <div className="flex flex-col">
                        <span className="text-2xl sm:text-3xl font-black text-red-800">{formatNum(timeLeft.seconds)}</span>
                        <span className="text-[8px] font-bold text-red-600 uppercase tracking-widest">Secs</span>
                    </div>
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
                    <div className="grid grid-cols-2 gap-3">
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
