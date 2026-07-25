import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStorePath } from '../storeUrlHelper';
import ThemeProductCard from '../themeEngine/ThemeProductCard';
import { useTheme } from '../themeEngine/ThemeContext';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;

const FeaturedProductsSection = ({ settings = {}, storeId: propStoreId, onAddToCart, customer }) => {
    const { title = 'Featured Products', limit = 8 } = settings;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    const storeId = propStoreId || localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (!storeId) return;
                const headers = { 'x-store-id': storeId };
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const res = await fetch(`${CATALOG_API_URL}/products?storeId=${storeId}`, { headers });
                const data = await res.json();
                if (res.ok && data.products) {
                    setProducts(data.products.slice(0, parseInt(limit)));
                } else if (res.ok && Array.isArray(data)) {
                    setProducts(data.slice(0, parseInt(limit)));
                }
            } catch (err) {
                console.error('Error fetching featured products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [storeId, token, limit]);

    const isCarousel = theme.productCardStyle === 'large' || settings.layout === 'carousel';
    const cols = theme.collectionLayout === 'dense'
        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
        : theme.productCardStyle === 'editorial' || theme.productCardStyle === 'luxury'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

    if (loading) {
        return (
            <div className="py-16 max-w-7xl mx-auto w-full px-4 space-y-8">
                <div className={`grid ${cols} gap-4`}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-square animate-pulse bg-zinc-200/70 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="py-16 text-center text-zinc-400 font-bold text-xs uppercase tracking-wider">
                No featured products.
            </div>
        );
    }

    return (
        <section className={`py-20 md:py-24 px-4 sm:px-6 md:px-10 lg:px-14 w-full ${theme.spacingScale === 'roomy' ? 'space-y-14' : 'space-y-12'}`}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-center sm:text-left">
                <div className="space-y-3 mx-auto sm:mx-0">
                    <h2 className="text-2xl md:text-4xl font-medium tracking-tight" style={{ fontFamily: 'var(--heading-font, inherit)' }}>{title}</h2>
                    <div className="h-[2px] w-14 mx-auto sm:mx-0" style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }} />
                </div>
                <Link to={getStorePath(storeId, '/catalog')} className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                    View All →
                </Link>
            </div>

            {isCarousel ? (
                <div className="theme-product-grid flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
                    {products.map((product) => (
                        <div key={product._id} className="min-w-[220px] sm:min-w-[260px] snap-start">
                            <ThemeProductCard product={product} storeId={storeId} onAddToCart={onAddToCart} cardShape={settings.cardShape} customer={customer} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className={`theme-product-grid grid ${cols} gap-4 sm:gap-6`}>
                    {products.map((product) => (
                        <ThemeProductCard key={product._id} product={product} storeId={storeId} onAddToCart={onAddToCart} cardShape={settings.cardShape} customer={customer} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default FeaturedProductsSection;
