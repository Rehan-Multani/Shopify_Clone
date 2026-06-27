import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';
import CategorySection from '../../components/storefront/sections/CategorySection';
import FeaturedProductsSection from '../../components/storefront/sections/FeaturedProductsSection';
import BannerSection from '../../components/storefront/sections/BannerSection';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL.replace('/api', '');

const StorefrontHome = ({ cartCount, onAddToCart, customer, onLogout, storeInfo }) => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [pageSections, setPageSections] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribing, setSubscribing] = useState(false);
    const [newsletterMsg, setNewsletterMsg] = useState({ text: '', type: '' });

    const handleSubscribeNewsletter = async (e) => {
        e.preventDefault();
        if (!newsletterEmail || !newsletterEmail.trim()) return;

        setSubscribing(true);
        setNewsletterMsg({ text: '', type: '' });

        try {
            const res = await fetch(`${GATEWAY_URL}/customers/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-store-id': storeId
                },
                body: JSON.stringify({ email: newsletterEmail })
            });

            const data = await res.json();
            if (res.ok) {
                setNewsletterMsg({ text: data.message || 'Successfully subscribed!', type: 'success' });
                setNewsletterEmail('');
            } else {
                setNewsletterMsg({ text: data.message || 'Failed to subscribe.', type: 'error' });
            }
        } catch (err) {
            console.error('Error subscribing to newsletter:', err);
            setNewsletterMsg({ text: 'Network error. Please try again.', type: 'error' });
        } finally {
            setSubscribing(false);
        }
    };

    useEffect(() => {
        if (!storeId) return;
        const fetchHomeLayout = async () => {
            try {
                // Fetch page sections
                const res = await fetch(`${GATEWAY_URL}/store-pages/home?storeId=${storeId}`);
                const data = await res.json();
                if (data.success && data.page?.sections) {
                    const sorted = (data.page.sections || []).sort((a, b) => (a.order || 0) - (b.order || 0));
                    setPageSections(sorted.filter(s => s.enabled));
                }

                // Fetch banners to check if we have any active ones
                const bannersRes = await fetch(`${GATEWAY_URL}/banners`, {
                    headers: { 'x-store-id': storeId }
                });
                if (bannersRes.ok) {
                    const bannersData = await bannersRes.json();
                    const bannerList = Array.isArray(bannersData) ? bannersData : (bannersData.banners || []);
                    setBanners(bannerList.filter(b => b.isActive));
                }
            } catch (err) {
                console.error('Error fetching home page sections/banners:', err);
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
                <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-16 animate-fade-in">
                    <div className="w-full aspect-[21/9] animate-shimmer rounded-3xl"></div>
                    <div className="space-y-4">
                        <div className="w-48 h-8 animate-shimmer rounded-xl mx-auto"></div>
                        <div className="w-12 h-1 animate-shimmer rounded-full mx-auto"></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="w-full aspect-square animate-shimmer rounded-2xl"></div>
                                    <div className="w-3/4 h-5 animate-shimmer rounded-lg mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </StorefrontLayout>
        );
    }

    const hasBanners = banners.length > 0;

    return (    
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="space-y-0 animate-fade-in">
                {/* Render banners at the top of the homepage by default if not explicitly added in customized layout */}
                {hasBanners && !pageSections.some(s => s.type === 'banners') && (
                    <BannerSection storeId={storeId} />
                )}
                {pageSections.map((section, idx) => {
                    const { type, settings = {}, blocks = [] } = section;

                    switch (type) {
                        case 'hero':
                            if (hasBanners) return null;
                            const bannerImg = settings.backgroundImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80';
                            const headingBlock = blocks.find(b => b.type === 'heading');
                            const subheadingBlock = blocks.find(b => b.type === 'subheading');
                            const buttonBlock = blocks.find(b => b.type === 'button');

                            return (
                                <section 
                                    key={section.sectionId || idx}
                                    className="relative min-h-[550px] flex items-center justify-center bg-gray-900 overflow-hidden py-24 px-6 md:px-12 text-center animate-fade-in-up"
                                    style={{
                                        backgroundImage: `url(${bannerImg.startsWith('http') || bannerImg.startsWith('data:') ? bannerImg : `${ASSETS_BASE_URL}${bannerImg}`})`,
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
                                            className="px-8 py-3.5 text-white font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer hover:shadow-[var(--color-primary-semi)]"
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
                                <div key={section.sectionId || idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <CategorySection 
                                        settings={settings} 
                                        storeId={storeId} 
                                    />
                                </div>
                            );

                        case 'banners':
                            return (
                                <div key={section.sectionId || idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <BannerSection 
                                        settings={settings} 
                                        storeId={storeId} 
                                    />
                                </div>
                            );

                        case 'featured-products':
                            return (
                                <div key={section.sectionId || idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <FeaturedProductsSection 
                                        settings={settings} 
                                        storeId={storeId} 
                                        onAddToCart={onAddToCart}
                                    />
                                </div>
                            );

                        case 'testimonials':
                            const list = blocks.length > 0 ? blocks : (settings.testimonials || []);
                            return (
                                <section key={section.sectionId || idx} className="py-20 px-4 bg-transparent text-center">
                                    <div className="max-w-7xl mx-auto space-y-10">
                                        <div className="space-y-1 border-b border-zinc-200/65 pb-4 flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-black tracking-widest text-zinc-900 uppercase">{settings.title || 'What Our Customers Say'}</h2>
                                                <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                                                Testimonials
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                                            {list.map((item, bIdx) => (
                                                <div 
                                                    key={item.blockId || bIdx} 
                                                    className="p-7 bg-white border border-zinc-200/60 rounded-2xl flex flex-col justify-between space-y-5 card-premium text-left relative overflow-hidden"
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
                                    </div>
                                </section>
                            );

                        case 'newsletter':
                            return (
                                <section key={section.sectionId || idx} className="py-20 px-4 bg-transparent text-center border-t border-b border-zinc-200/50 max-w-4xl mx-auto rounded-3xl my-8 bg-white/40 backdrop-blur-sm shadow-sm">
                                    <div className="max-w-xl mx-auto space-y-4">
                                        <h2 className="text-xl font-black text-zinc-950 uppercase tracking-widest">
                                            {settings.title || 'Subscribe to our newsletter'}
                                        </h2>
                                        <p className="text-xs text-zinc-550 font-semibold max-w-sm mx-auto leading-relaxed">
                                            {settings.subtitle || 'Get weekly updates, promotions, and new product announcements.'}
                                        </p>
                                        <form onSubmit={handleSubscribeNewsletter} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto w-full pt-4 justify-center">
                                            <input 
                                                type="email" 
                                                required
                                                placeholder="Enter your email address"
                                                value={newsletterEmail}
                                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                                className="flex-grow px-4.5 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white shadow-sm transition-all focus:border-[var(--color-primary)] input-premium" 
                                                disabled={subscribing}
                                            />
                                            <button 
                                                type="submit"
                                                disabled={subscribing}
                                                className="px-7 py-3 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 btn-premium"
                                                style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                                            >
                                                {subscribing && (
                                                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                {subscribing ? 'Subscribing...' : 'Subscribe'}
                                            </button>
                                        </form>
                                        {newsletterMsg.text && (
                                            <div className="pt-2 animate-slide-down">
                                                <p className={`text-[10px] font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                                                    newsletterMsg.type === 'success' 
                                                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' 
                                                        : 'text-red-650 bg-red-50 border border-red-100'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${newsletterMsg.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    {newsletterMsg.text}
                                                </p>
                                            </div>
                                        )}
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
