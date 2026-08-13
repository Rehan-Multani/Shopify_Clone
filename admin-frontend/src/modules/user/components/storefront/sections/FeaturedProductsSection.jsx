import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStorePath } from '../storeUrlHelper';
import ThemeProductCard from '../themeEngine/ThemeProductCard';
import { useTheme } from '../themeEngine/ThemeContext';
import { filterProductsBySource, normalizeProductList } from '../themeEngine/productSource';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;

const FeaturedProductsSection = ({ settings = {}, storeId: propStoreId, onAddToCart, customer }) => {
    const { title = 'Featured Products', subtitle = '' } = settings;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    const storeId = propStoreId || localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';
    const sourceKey = [
        settings.source,
        settings.categoryId,
        settings.productIds,
        settings.limit,
    ].join('|');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (!storeId) return;
                const headers = { 'x-store-id': storeId };
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetch(`${CATALOG_API_URL}/products?storeId=${storeId}`, { headers });
                const data = await res.json();
                if (res.ok) {
                    const list = normalizeProductList(data);
                    setProducts(filterProductsBySource(list, {
                        ...settings,
                        source: settings.source || (settings.layout === 'carousel' ? 'latest' : 'featured'),
                    }));
                }
            } catch (err) {
                console.error('Error fetching featured products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [storeId, token, sourceKey]);

    const resolveResponsiveColumns = () => {
        const colsSetting = settings.columns;
        if (colsSetting && typeof colsSetting === 'object') {
            return {
                desktop: Math.min(6, Math.max(1, Number(colsSetting.desktop) || 4)),
                tablet: Math.min(6, Math.max(1, Number(colsSetting.tablet) || 3)),
                mobile: Math.min(4, Math.max(1, Number(colsSetting.mobile) || settings.mobileColumns || 2)),
            };
        }
        const desktop = Math.min(6, Math.max(2, parseInt(colsSetting, 10) || 0));
        const mobile = Math.min(3, Math.max(1, parseInt(settings.mobileColumns, 10) || 2));
        return desktop
            ? { desktop, tablet: Math.max(2, desktop - 1), mobile }
            : null;
    };

    const responsiveCols = resolveResponsiveColumns();
    const cardVariant = settings.cardVariant || settings.cardStyle || theme.productCardStyle;
    const isCarousel = theme.productCardStyle === 'large' || settings.layout === 'carousel';
    const cols = theme.collectionLayout === 'dense' || cardVariant === 'electronics'
        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
        : theme.productCardStyle === 'editorial' || theme.productCardStyle === 'luxury' || theme.productCardStyle === 'furniture'
            || settings.cardStyle === 'luxury' || settings.cardStyle === 'furniture'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

    if (loading) {
        return (
            <div className="py-16 max-w-7xl mx-auto w-full px-4 space-y-8">
                <div
                    className={`grid ${responsiveCols ? '' : cols} gap-4`}
                    style={responsiveCols ? {
                        gridTemplateColumns: `repeat(${responsiveCols.desktop}, minmax(0, 1fr))`,
                    } : undefined}
                >
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
            {responsiveCols && (
                <style>{`
                    .theme-resp-grid-${responsiveCols.mobile}-${responsiveCols.tablet}-${responsiveCols.desktop} {
                        display: grid;
                        gap: 1rem;
                        grid-template-columns: repeat(${responsiveCols.mobile}, minmax(0, 1fr));
                    }
                    @media (min-width: 640px) {
                        .theme-resp-grid-${responsiveCols.mobile}-${responsiveCols.tablet}-${responsiveCols.desktop} {
                            grid-template-columns: repeat(${responsiveCols.tablet}, minmax(0, 1fr));
                            gap: 1.25rem;
                        }
                    }
                    @media (min-width: 768px) {
                        .theme-resp-grid-${responsiveCols.mobile}-${responsiveCols.tablet}-${responsiveCols.desktop} {
                            grid-template-columns: repeat(${responsiveCols.desktop}, minmax(0, 1fr));
                            gap: 1.5rem;
                        }
                    }
                `}</style>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-center sm:text-left">
                <div className="space-y-3 mx-auto sm:mx-0">
                    <h2 className="text-2xl md:text-4xl font-medium tracking-tight" style={{ fontFamily: 'var(--heading-font, inherit)' }}>{title}</h2>
                    <div className="h-[2px] w-14 mx-auto sm:mx-0" style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }} />
                    {subtitle && <p className="text-sm text-zinc-500 font-medium max-w-lg">{subtitle}</p>}
                </div>
                <Link to={getStorePath(storeId, '/catalog')} className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                    View All →
                </Link>
            </div>

            {isCarousel ? (
                <div className="theme-product-grid flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
                    {products.map((product) => (
                        <div key={product._id} className="min-w-[220px] sm:min-w-[260px] snap-start">
                            <ThemeProductCard product={product} storeId={storeId} onAddToCart={onAddToCart} cardShape={settings.cardShape} customer={customer} cardVariant={cardVariant} />
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    className={`theme-product-grid ${responsiveCols ? `theme-resp-grid-${responsiveCols.mobile}-${responsiveCols.tablet}-${responsiveCols.desktop}` : `grid ${cols} gap-4 sm:gap-6`}`}
                >
                    {products.map((product) => (
                        <ThemeProductCard key={product._id} product={product} storeId={storeId} onAddToCart={onAddToCart} cardShape={settings.cardShape} customer={customer} cardVariant={cardVariant} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default FeaturedProductsSection;
