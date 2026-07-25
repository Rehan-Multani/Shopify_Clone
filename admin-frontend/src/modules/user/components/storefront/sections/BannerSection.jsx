import React, { useState, useEffect } from 'react';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const ASSETS_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const BannerSection = ({ settings = {}, storeId: propStoreId }) => {
    const { title = 'Promotional Banners', height = '500px' } = settings;
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const storeId = propStoreId || localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${ASSETS_BASE_URL}${cleanPath}`;
    };

    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                if (!storeId) return;
                const headers = { 'x-store-id': storeId };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                const url = `${CATALOG_API_URL}/banners`;
                const res = await fetch(url, { headers });
                const data = await res.json();

                if (res.ok) {
                    const bannerList = Array.isArray(data) ? data : (data.banners || []);
                    const activeBanners = bannerList.filter(b => b.isActive);
                    setBanners(activeBanners);
                }
            } catch (err) {
                console.error('Error fetching banners for storefront banner section:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, [storeId, token]);

    useEffect(() => {
        if (banners.length <= 1 || isHovered) return;
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners, isHovered]);

    const handleNext = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
    };

    const handlePrev = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + banners.length) % banners.length);
    };

    if (loading) {
        return (
            <div className="w-full animate-shimmer bg-zinc-100 rounded-3xl" style={{ height }}></div>
        );
    }

    if (banners.length === 0) {
        const isCustomizer = window.location.pathname.includes('/dashboard');
        if (isCustomizer) {
            return (
                <div className="flex items-center justify-center bg-zinc-50 border border-dashed border-zinc-200 text-zinc-400 font-bold text-xs uppercase tracking-wider rounded-3xl" style={{ height }}>
                    Add banners in Banners panel
                </div>
            );
        }
        return null;
    }

    return (
        <section 
            className="relative overflow-hidden w-full group/banner animate-fade-in" 
            style={{ height }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {banners.map((banner, index) => (
                <div
                    key={banner._id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                        index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                    <img
                        src={getImageUrl(banner.image)}
                        alt={banner.title}
                        className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out scale-100 group-hover/banner:scale-[1.03]"
                    />
                    {/* Bottom-up dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 flex flex-col items-center justify-center text-center p-6 md:p-12">
                        <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider drop-shadow-md max-w-3xl leading-tight transform translate-y-1 animate-fade-in-up">
                            {banner.title}
                        </h2>
                    </div>
                </div>
            ))}

            {/* Slider Navigation Arrows */}
            {banners.length > 1 && (
                <>
                    <button 
                        onClick={handlePrev}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl bg-white/10 hover:bg-white text-white hover:text-zinc-900 border border-white/10 hover:border-white/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-0 group-hover/banner:opacity-100 scale-95 hover:scale-100 active:scale-95 cursor-pointer shadow-md"
                        aria-label="Previous Banner"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button 
                        onClick={handleNext}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl bg-white/10 hover:bg-white text-white hover:text-zinc-900 border border-white/10 hover:border-white/40 backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-0 group-hover/banner:opacity-100 scale-95 hover:scale-100 active:scale-95 cursor-pointer shadow-md"
                        aria-label="Next Banner"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Dots */}
            {banners.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`rounded-full transition-all duration-300 cursor-pointer ${
                                index === currentIndex 
                                    ? 'bg-white w-5 h-1.5 shadow-sm' 
                                    : 'bg-white/40 hover:bg-white/70 w-1.5 h-1.5'
                            }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default BannerSection;
