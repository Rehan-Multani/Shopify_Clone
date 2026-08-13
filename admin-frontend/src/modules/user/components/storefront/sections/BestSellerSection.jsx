import React, { useState, useEffect } from 'react';
import ThemeProductCard from '../themeEngine/ThemeProductCard';
import { filterProductsBySource, normalizeProductList } from '../themeEngine/productSource';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;

const BestSellerSection = ({ settings = {}, storeId: propStoreId, onAddToCart, customer }) => {
    const { title = 'Best Sellers', limit = 4 } = settings;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const storeId = propStoreId || localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';
    const sourceKey = [settings.source, settings.categoryId, settings.productIds, limit].join('|');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (!storeId) return;
                const headers = { 'x-store-id': storeId };
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetch(`${CATALOG_API_URL}/products?storeId=${storeId}`, { headers });
                const data = await res.json();
                const list = normalizeProductList(data);
                setProducts(filterProductsBySource(list, {
                    ...settings,
                    source: settings.source || 'best_sellers',
                    limit,
                }));
            } catch (err) {
                console.error('Error fetching best seller products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [storeId, token, sourceKey]);

    if (loading) {
        return (
            <div className="py-16 max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="aspect-square animate-pulse bg-zinc-200 rounded-xl" />)}
            </div>
        );
    }

    if (products.length === 0) {
        return <div className="py-16 text-center text-zinc-400 font-bold text-xs uppercase">No best sellers.</div>;
    }

    return (
        <section className="py-20 md:py-24 px-4 sm:px-6 md:px-10 lg:px-14 w-full space-y-12">
            <div className="text-center space-y-3">
                <h2 className="text-2xl md:text-4xl font-medium tracking-tight" style={{ fontFamily: 'var(--heading-font)' }}>{title}</h2>
                <div className="h-[2px] w-14 mx-auto" style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }} />
            </div>
            <div className="theme-product-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                    <ThemeProductCard key={product._id} product={product} storeId={storeId} onAddToCart={onAddToCart} customer={customer} />
                ))}
            </div>
        </section>
    );
};

export default BestSellerSection;
