import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getStorePath } from '../storeUrlHelper';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const ASSETS_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const CategoryCard = ({ category, storeId, cardShape }) => {
    const [imageError, setImageError] = useState(false);
    
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${ASSETS_BASE_URL}${cleanPath}`;
    };

    const imageUrl = getImageUrl(category.image);

    // Premium subtle color palettes for gradients
    const getGradientClass = (name) => {
        const code = name.charCodeAt(0) || 0;
        const gradients = [
            'from-zinc-100 to-zinc-200/80 text-zinc-800',
            'from-neutral-50 to-neutral-200/90 text-neutral-800',
            'from-slate-100 to-slate-200/80 text-slate-800',
            'from-stone-100 to-stone-200/85 text-stone-800',
            'from-zinc-50 to-zinc-200 text-zinc-900'
        ];
        return gradients[code % gradients.length];
    };

    const shapeClass = cardShape === 'square' ? 'rounded-none'
                     : cardShape === 'circle' ? 'rounded-full'
                     : cardShape === 'pill' ? 'rounded-3xl'
                     : 'rounded-2xl'; // default curved

    return (
        <Link 
            to={getStorePath(storeId, `/catalog?category=${category._id}`)}
            className="group flex flex-col items-center space-y-3 cursor-pointer"
        >
            {!imageUrl || imageError ? (
                <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 ${shapeClass} bg-gradient-to-br ${getGradientClass(category.name)} flex items-center justify-center relative overflow-hidden border border-zinc-200/50 group-hover:border-[var(--color-primary)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)]`}>
                    <span className="text-[10px] font-black uppercase px-2 text-center truncate w-full tracking-widest">
                        {category.name.substring(0, 3)}
                    </span>
                </div>
            ) : (
                <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 ${shapeClass} overflow-hidden border border-zinc-250/70 group-hover:border-[var(--color-primary)] bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)] relative`}>
                    <img
                        src={imageUrl}
                        alt={category.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                </div>
            )}
            <h3 className="text-zinc-800 font-extrabold text-[10px] tracking-widest text-center group-hover:text-[var(--color-primary)] transition-colors uppercase max-w-full leading-tight">
                {category.name}
            </h3>
        </Link>
    );
};

const CategorySection = ({ settings = {}, storeId: propStoreId }) => {
    const { title = 'Shop by Category' } = settings;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const storeId = propStoreId || localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                if (!storeId) return;
                const headers = { 'x-store-id': storeId };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                const res = await fetch(`${CATALOG_API_URL}/categories?storeId=${storeId}`, { headers });
                const data = await res.json();
                if (res.ok && data.categories) {
                    setCategories(data.categories);
                } else if (res.ok && Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (err) {
                console.error('Error fetching categories for storefront category section:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [storeId, token]);

    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const scrollAmount = clientWidth * 0.6;
            scrollContainerRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (categories.length <= 4) return;
        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                const maxScrollLeft = scrollWidth - clientWidth;
                const nextScrollLeft = scrollLeft + 160;
                
                if (scrollLeft >= maxScrollLeft - 10) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainerRef.current.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
                }
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [categories]);

    if (loading) {
        return (
            <div className="py-12 text-center flex items-center justify-center">
                <div className="w-8 h-8 animate-shimmer rounded-full"></div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="py-16 text-center text-zinc-400 font-bold text-xs uppercase tracking-wider">
                No categories found.
            </div>
        );
    }

    return (
        <section className="py-20 px-4 sm:px-6 md:px-8 bg-transparent max-w-7xl mx-auto w-full space-y-10 relative">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            
            <div className="flex items-center justify-between border-b border-zinc-200/60 pb-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-black tracking-widest text-zinc-900 uppercase">{title}</h2>
                    <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                </div>
                
                <div className="flex items-center gap-1.5">
                    <button 
                        onClick={() => scroll('left')} 
                        className="w-8 h-8 rounded-xl bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] active:scale-95 transition-all cursor-pointer"
                        aria-label="Scroll Left"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => scroll('right')} 
                        className="w-8 h-8 rounded-xl bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] active:scale-95 transition-all cursor-pointer"
                        aria-label="Scroll Right"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="relative">
                {/* Categories Wrapper */}
                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-7 pb-2 hide-scrollbar scroll-smooth"
                >
                    {categories.map((category) => (
                        <div key={category._id} className="flex-shrink-0 w-16 sm:w-20 md:w-24 flex flex-col items-center">
                            <CategoryCard category={category} storeId={storeId} cardShape={settings.cardShape} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
