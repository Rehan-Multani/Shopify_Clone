import React, { useState, useEffect } from 'react';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:5003/api';

const BannerSection = ({ settings = {} }) => {
    const { title = 'Promotional Banners', height = '300px' } = settings;
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const storeId = localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                if (!storeId) return;
                const res = await fetch(`${CATALOG_API_URL}/banners`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-store-id': storeId
                    }
                });
                const data = await res.json();
                if (res.ok && data.banners) {
                    setBanners(data.banners.filter(b => b.isActive));
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
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners]);

    if (loading) {
        return (
            <div className="flex items-center justify-center bg-gray-100" style={{ height }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (banners.length === 0) {
        return (
            <div className="flex items-center justify-center bg-gray-100 text-gray-400 font-semibold" style={{ height }}>
                Add banners in your Banners panel to display them here.
            </div>
        );
    }

    return (
        <section className="relative overflow-hidden w-full" style={{ height }}>
            {banners.map((banner, index) => (
                <div
                    key={banner._id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                        index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                    <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                        <h2 className="text-white text-2xl md:text-4xl font-bold tracking-tight">
                            {banner.title}
                        </h2>
                    </div>
                </div>
            ))}

            {/* Dots */}
            {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                                index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                            }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default BannerSection;
