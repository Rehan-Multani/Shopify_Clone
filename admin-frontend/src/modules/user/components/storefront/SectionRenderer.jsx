import React from 'react';
import HeroSection from './sections/HeroSection';
import CategorySection from './sections/CategorySection';
import FeaturedProductsSection from './sections/FeaturedProductsSection';
import TestimonialsSection from './sections/TestimonialsSection';
import BannerSection from './sections/BannerSection';

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
        case 'hero':
            // Render Shopify Style Hero section with its sub-blocks
            return (
                <section 
                    className="relative min-h-[480px] flex items-center justify-center bg-zinc-950 overflow-hidden py-20 px-4 text-center rounded-3xl"
                    style={{
                        backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/45"></div>

                    <div className="relative z-10 max-w-2xl w-full flex flex-col items-center space-y-5.5">
                        {blocks.map((block, index) => {
                            if (block.type === 'heading') {
                                return (
                                    <h1 
                                        key={block.blockId || index} 
                                        className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md animate-fade-in-up"
                                        style={{ animationDelay: '0ms' }}
                                    >
                                        {block.settings?.text || 'Welcome to Our Store'}
                                    </h1>
                                );
                            }
                            if (block.type === 'subheading') {
                                return (
                                    <p 
                                        key={block.blockId || index} 
                                        className="text-xs sm:text-sm text-white/90 font-semibold max-w-lg leading-relaxed drop-shadow animate-fade-in-up"
                                        style={{ animationDelay: '100ms' }}
                                    >
                                        {block.settings?.text || 'Discover premium catalog.'}
                                    </p>
                                );
                            }
                            if (block.type === 'button') {
                                return (
                                    <button 
                                        key={block.blockId || index} 
                                        className="px-7 py-3 text-white font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 animate-fade-in-up cursor-pointer btn-premium"
                                        style={{ 
                                            backgroundColor: 'var(--color-primary)', 
                                            borderRadius: 'var(--border-radius)',
                                            animationDelay: '200ms'
                                        }}
                                    >
                                        {block.settings?.label || 'Shop Now'}
                                    </button>
                                );
                            }
                            return null;
                        })}
                        {/* Fallback if no blocks */}
                        {blocks.length === 0 && (
                            <div className="text-white space-y-4">
                                <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">{settings.title || 'Welcome to Our Store'}</h1>
                                <p className="text-xs sm:text-sm text-white/80 font-semibold max-w-sm mx-auto">{settings.subtitle}</p>
                            </div>
                        )}
                    </div>
                </section>
            );

        case 'categories':
            return <CategorySection settings={settings} />;

        case 'banners':
            return <BannerSection settings={settings} />;

        case 'featured-products':
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
