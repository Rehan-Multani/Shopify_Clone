import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStorePath } from '../storeUrlHelper';
import { useTheme } from '../themeEngine/ThemeContext';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const ASSETS_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${ASSETS_BASE_URL}${cleanPath}`;
};

const SectionHeading = ({ title, align = 'center' }) => (
    <div className={`space-y-3 ${align === 'center' ? 'text-center' : 'text-left'}`}>
        <h2
            className="text-2xl md:text-4xl font-medium tracking-tight text-zinc-900"
            style={{ fontFamily: 'var(--heading-font)' }}
        >
            {title}
        </h2>
        <div
            className={`h-[2px] w-14 ${align === 'center' ? 'mx-auto' : ''}`}
            style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }}
        />
    </div>
);

const CategoryCard = ({ category, storeId, variant = 'showcase', cardShape, index = 0 }) => {
    const [imageError, setImageError] = useState(false);
    const imageUrl = getImageUrl(category.image);
    const radius = 'var(--border-radius, 14px)';

    if (variant === 'editorial') {
        return (
            <Link
                to={getStorePath(storeId, `/catalog?category=${category._id}`)}
                className="group relative block overflow-hidden bg-zinc-100 aspect-[3/4] store-card"
                style={{ borderRadius: radius }}
            >
                {imageUrl && !imageError ? (
                    <img
                        src={imageUrl}
                        alt={category.name}
                        onError={() => setImageError(true)}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-zinc-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="text-lg md:text-xl font-medium tracking-tight" style={{ fontFamily: 'var(--heading-font)' }}>
                        {category.name}
                    </h3>
                    <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        Shop collection →
                    </span>
                </div>
            </Link>
        );
    }

    if (variant === 'showcase') {
        const num = String(index + 1).padStart(2, '0');
        return (
            <Link
                to={getStorePath(storeId, `/catalog?category=${category._id}`)}
                className="group store-card bg-white overflow-hidden flex flex-col h-full transition-transform duration-300 hover:-translate-y-1.5"
                style={{ borderRadius: radius }}
            >
                <div className="relative aspect-[4/3] overflow-hidden m-2.5 mb-0" style={{ borderRadius: `calc(${radius} - 4px)` }}>
                    <span
                        className="absolute top-0 left-0 z-10 min-w-9 h-9 px-2 grid place-items-center text-[11px] font-bold text-white"
                        style={{ background: 'var(--color-accent, var(--color-primary))' }}
                    >
                        {num}
                    </span>
                    {imageUrl && !imageError ? (
                        <img
                            src={imageUrl}
                            alt={category.name}
                            onError={() => setImageError(true)}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-100 grid place-items-center text-zinc-400 text-xs font-bold uppercase tracking-widest">
                            {category.name.slice(0, 3)}
                        </div>
                    )}
                </div>
                <div className="p-4 pt-3 flex-1 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                        Collection
                    </span>
                    <h3
                        className="text-lg md:text-xl text-zinc-900 leading-snug italic"
                        style={{ fontFamily: 'var(--heading-font)' }}
                    >
                        {category.name}
                    </h3>
                </div>
            </Link>
        );
    }

    const shapeClass = cardShape === 'square' ? 'rounded-2xl'
        : cardShape === 'pill' ? 'rounded-3xl'
        : 'rounded-full';

    return (
        <Link
            to={getStorePath(storeId, `/catalog?category=${category._id}`)}
            className="group flex flex-col items-center space-y-3 cursor-pointer"
        >
            <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 ${shapeClass} overflow-hidden bg-zinc-100 relative shadow-md ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-[1.04] group-hover:shadow-lg`}>
                {imageUrl && !imageError ? (
                    <img
                        src={imageUrl}
                        alt={category.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {category.name.substring(0, 3)}
                    </div>
                )}
            </div>
            <h3 className="text-zinc-800 font-bold text-[11px] tracking-widest text-center uppercase">
                {category.name}
            </h3>
        </Link>
    );
};

const CategorySection = ({ settings = {}, storeId: propStoreId }) => {
    const { title = 'Shop by Category' } = settings;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    const storeId = propStoreId || localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';

    const layout = settings.layout
        || (['signature', 'atelier', 'prestige', 'monarch', 'aurora', 'craft'].includes(theme.themeSlug) ? 'editorial'
            : settings.cardShape === 'circle' ? 'circles'
                : 'showcase');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                if (!storeId) return;
                const headers = { 'x-store-id': storeId };
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetch(`${CATALOG_API_URL}/categories?storeId=${storeId}`, { headers });
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data.categories || []);
                setCategories(list.filter((c) => c.isActive !== false));
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [storeId, token]);

    if (loading) {
        return (
            <div className="py-16 px-6 grid grid-cols-2 md:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => <div key={i} className="aspect-[4/5] animate-shimmer bg-zinc-200 rounded-2xl" />)}
            </div>
        );
    }

    if (categories.length === 0) return null;

    if (layout === 'editorial') {
        return (
            <section className="py-20 md:py-28 w-full px-4 sm:px-6 md:px-10 lg:px-14 space-y-12">
                <SectionHeading title={title} align="left" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                    {categories.slice(0, 5).map((category) => (
                        <CategoryCard key={category._id} category={category} storeId={storeId} variant="editorial" />
                    ))}
                </div>
            </section>
        );
    }

    if (layout === 'circles') {
        return (
            <section className="py-16 md:py-20 px-4 sm:px-6 md:px-10 lg:px-14 w-full space-y-12">
                <SectionHeading title={title} />
                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {categories.slice(0, 8).map((category, index) => (
                        <CategoryCard
                            key={category._id}
                            category={category}
                            storeId={storeId}
                            cardShape="circle"
                            variant="chip"
                            index={index}
                        />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 md:py-24 w-full px-4 sm:px-6 md:px-10 lg:px-14 space-y-12">
            <SectionHeading title={title} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
                {categories.slice(0, 8).map((category, index) => (
                    <CategoryCard
                        key={category._id}
                        category={category}
                        storeId={storeId}
                        variant="showcase"
                        index={index}
                    />
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
