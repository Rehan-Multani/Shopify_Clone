import React from 'react';
import HeroSection from './sections/HeroSection';
import CategorySection from './sections/CategorySection';
import FeaturedProductsSection from './sections/FeaturedProductsSection';
import TestimonialsSection from './sections/TestimonialsSection';

// A dynamic newsletter block/section
const NewsletterSection = ({ settings = {} }) => {
    const { title = 'Subscribe to our newsletter', subtitle = 'Get promotions and announcements' } = settings;
    return (
        <section className="py-16 px-6 bg-gray-50 border-t border-gray-100 text-center space-y-6">
            <div className="max-w-xl mx-auto space-y-2">
                <h2 className="text-3xl font-extrabold text-[var(--color-secondary)] tracking-tight">{title}</h2>
                <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
            </div>
            <div className="max-w-md mx-auto flex gap-2">
                <input 
                    type="email" 
                    placeholder="email@example.com"
                    className="flex-grow px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                />
                <button 
                    className="px-6 py-3 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                >
                    Subscribe
                </button>
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
                    className="relative min-h-[450px] flex items-center justify-center bg-gray-900 overflow-hidden py-16 px-6 md:px-12 text-center"
                    style={{
                        backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/50"></div>

                    <div className="relative z-10 max-w-2xl w-full flex flex-col items-center space-y-4">
                        {blocks.map((block, index) => {
                            if (block.type === 'heading') {
                                return (
                                    <h1 
                                        key={block.blockId || index} 
                                        className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight animate-in fade-in slide-in-from-bottom duration-500"
                                    >
                                        {block.settings?.text || 'Welcome to Our Store'}
                                    </h1>
                                );
                            }
                            if (block.type === 'subheading') {
                                return (
                                    <p 
                                        key={block.blockId || index} 
                                        className="text-base md:text-lg text-white/90 font-medium max-w-lg leading-relaxed animate-in fade-in slide-in-from-bottom duration-500 delay-100"
                                    >
                                        {block.settings?.text || 'Discover premium catalog.'}
                                    </p>
                                );
                            }
                            if (block.type === 'button') {
                                return (
                                    <button 
                                        key={block.blockId || index} 
                                        className="px-8 py-3.5 text-white font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-500 delay-200"
                                        style={{ 
                                            backgroundColor: 'var(--color-primary)', 
                                            borderRadius: 'var(--border-radius)' 
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
                            <div className="text-white">
                                <h1 className="text-4xl font-bold">{settings.title || 'Welcome to Our Store'}</h1>
                                <p className="mt-2 text-white/80">{settings.subtitle}</p>
                            </div>
                        )}
                    </div>
                </section>
            );

        case 'categories':
            return <CategorySection settings={settings} />;

        case 'featured-products':
            return <FeaturedProductsSection settings={settings} />;

        case 'testimonials':
            // Render Testimonials based on blocks
            return (
                <section className="py-16 px-6 bg-white text-center space-y-10">
                    <h2 className="text-2xl font-black text-[var(--color-secondary)] uppercase tracking-wider">{settings.title || 'Testimonials'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {blocks.map((block, index) => (
                            <div 
                                key={block.blockId || index} 
                                className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow"
                                style={{ borderRadius: 'var(--border-radius)' }}
                            >
                                <p className="text-sm italic text-gray-600">"{block.settings?.text || 'Great service!'}"</p>
                                <span className="block text-xs font-black text-[var(--color-primary)] uppercase tracking-widest">— {block.settings?.author || 'Happy Customer'}</span>
                            </div>
                        ))}
                        {blocks.length === 0 && settings.testimonials?.map((t, idx) => (
                            <div 
                                key={idx} 
                                className="p-6 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between space-y-4"
                                style={{ borderRadius: 'var(--border-radius)' }}
                            >
                                <p className="text-sm italic text-gray-600">"{t.text}"</p>
                                <span className="block text-xs font-black text-[var(--color-primary)] uppercase tracking-widest">— {t.author}</span>
                            </div>
                        ))}
                    </div>
                </section>
            );

        case 'newsletter':
            return <NewsletterSection settings={settings} />;

        default:
            return (
                <div className="p-6 bg-yellow-50 text-yellow-800 text-center font-bold">
                    Unsupported Section: {type}
                </div>
            );
    }
};

export default SectionRenderer;
