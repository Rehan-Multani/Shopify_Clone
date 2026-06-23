import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';
import CategorySection from '../../components/storefront/sections/CategorySection';
import FeaturedProductsSection from '../../components/storefront/sections/FeaturedProductsSection';

const GATEWAY_URL = 'http://localhost:5000/api';

const StorefrontHome = ({ cartCount, onAddToCart, customer, onLogout, storeInfo }) => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [pageSections, setPageSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!storeId) return;
        const fetchHomeLayout = async () => {
            try {
                const res = await fetch(`${GATEWAY_URL}/store-pages/home?storeId=${storeId}`);
                const data = await res.json();
                if (data.success && data.page?.sections) {
                    const sorted = (data.page.sections || []).sort((a, b) => (a.order || 0) - (b.order || 0));
                    setPageSections(sorted.filter(s => s.enabled));
                }
            } catch (err) {
                console.error('Error fetching home page sections:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeLayout();
    }, [storeId]);

    const handleSearchClick = () => {
        navigate(`/store/${storeId}/catalog`);
    };

    if (loading) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="space-y-0">
                {pageSections.map((section, idx) => {
                    const { type, settings = {}, blocks = [] } = section;

                    switch (type) {
                        case 'hero':
                            const bannerImg = settings.backgroundImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80';
                            const headingBlock = blocks.find(b => b.type === 'heading');
                            const subheadingBlock = blocks.find(b => b.type === 'subheading');
                            const buttonBlock = blocks.find(b => b.type === 'button');

                            return (
                                <section 
                                    key={section.sectionId || idx}
                                    className="relative min-h-[550px] flex items-center justify-center bg-gray-900 overflow-hidden py-24 px-6 md:px-12 text-center"
                                    style={{
                                        backgroundImage: `url(${bannerImg.startsWith('http') || bannerImg.startsWith('data:') ? bannerImg : `http://localhost:5000${bannerImg}`})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                >
                                    <div className="absolute inset-0 bg-black/45"></div>

                                    <div className="relative z-10 max-w-3xl w-full flex flex-col items-center space-y-6">
                                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                                            {headingBlock?.settings?.text || 'Welcome to Our Store'}
                                        </h1>
                                        <p className="text-base sm:text-lg md:text-xl text-white/95 font-medium max-w-xl leading-relaxed drop-shadow">
                                            {subheadingBlock?.settings?.text || 'Discover our exclusive products selected just for you.'}
                                        </p>
                                        <button 
                                            onClick={handleSearchClick}
                                            className="px-8 py-3.5 text-white font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                                            style={{ 
                                                backgroundColor: 'var(--color-primary, #008060)', 
                                                borderRadius: 'var(--border-radius, 8px)' 
                                            }}
                                        >
                                            {buttonBlock?.settings?.label || 'Shop Now'}
                                        </button>
                                    </div>
                                </section>
                            );

                        case 'categories':
                            return (
                                <CategorySection 
                                    key={section.sectionId || idx} 
                                    settings={settings} 
                                    storeId={storeId} 
                                />
                            );

                        case 'featured-products':
                            return (
                                <FeaturedProductsSection 
                                    key={section.sectionId || idx} 
                                    settings={settings} 
                                    storeId={storeId} 
                                    onAddToCart={onAddToCart}
                                />
                            );

                        case 'testimonials':
                            const list = blocks.length > 0 ? blocks : (settings.testimonials || []);
                            return (
                                <section key={section.sectionId || idx} className="py-20 px-6 bg-white text-center">
                                    <div className="max-w-6xl mx-auto space-y-12">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black text-gray-900">{settings.title || 'What Our Customers Say'}</h2>
                                            <div className="w-12 h-1 bg-[var(--color-primary)] mx-auto rounded-full"></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {list.map((item, bIdx) => (
                                                <div 
                                                    key={item.blockId || bIdx} 
                                                    className="p-8 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between space-y-6 hover:shadow-lg transition-shadow"
                                                    style={{ borderRadius: 'var(--border-radius, 12px)' }}
                                                >
                                                    <p className="text-sm italic text-gray-600 leading-relaxed">
                                                        "{item.settings?.text || item.text || 'Amazing shopping experience, highly recommended!'}"
                                                    </p>
                                                    <span className="block text-xs font-black text-[var(--color-primary)] uppercase tracking-widest">
                                                        — {item.settings?.author || item.author || 'Happy Customer'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            );

                        case 'newsletter':
                            return (
                                <section key={section.sectionId || idx} className="py-20 px-6 bg-gray-50/50 text-center border-t border-b border-gray-100">
                                    <div className="max-w-xl mx-auto space-y-6">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                            {settings.title || 'Subscribe to our newsletter'}
                                        </h2>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {settings.subtitle || 'Get weekly updates, promotions, and new product announcements.'}
                                        </p>
                                        <div className="flex gap-2 max-w-md mx-auto pt-2">
                                            <input 
                                                type="email" 
                                                placeholder="email@example.com"
                                                className="flex-grow px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white" 
                                            />
                                            <button 
                                                className="px-6 py-3 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                                                style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                                            >
                                                Subscribe
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            );

                        default:
                            return null;
                    }
                })}
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontHome;
