import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';
import ThemeProductCard from '../../components/storefront/themeEngine/ThemeProductCard';
import { useTheme } from '../../components/storefront/themeEngine/ThemeContext';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

const StorefrontCatalog = ({ cartCount, onAddToCart, customer, onLogout, storeInfo }) => {
    const { storeId: paramStoreId } = useParams();
    const storeId = storeInfo?._id || paramStoreId;
    const theme = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort') || 'featured';
    const maxPriceParam = Number(searchParams.get('maxPrice') || 0);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
    const [searchQuery, setSearchQuery] = useState(searchParam || '');
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState(sortParam);
    const [maxPrice, setMaxPrice] = useState(maxPriceParam);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    useEffect(() => {
        setSelectedCategory(categoryParam || 'All');
    }, [categoryParam]);

    useEffect(() => {
        if (searchParam) setSearchQuery(searchParam);
    }, [searchParam]);

    const handleCategoryChange = (catId) => {
        setSelectedCategory(catId);
        const newParams = new URLSearchParams(searchParams);
        if (catId === 'All') newParams.delete('category');
        else newParams.set('category', catId);
        setSearchParams(newParams);
    };

    const updateFilterParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'featured') next.delete(key);
        else next.set(key, value);
        setSearchParams(next);
    };

    useEffect(() => {
        if (!storeId) return;
        const fetchData = async () => {
            try {
                const catRes = await fetch(`${GATEWAY_URL}/categories?storeId=${storeId}`);
                const catData = await catRes.json();
                if (catRes.ok) setCategories(Array.isArray(catData) ? catData : (catData.categories || []));

                const prodRes = await fetch(`${GATEWAY_URL}/products?storeId=${storeId}`);
                const prodData = await prodRes.json();
                if (prodRes.ok) setProducts(Array.isArray(prodData) ? prodData : (prodData.products || []));
            } catch (err) {
                console.error('Error fetching catalog data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [storeId]);

    const filteredProducts = products.filter((product) => {
        const q = searchQuery.toLowerCase();
        const matchesCategory = selectedCategory === 'All' ||
            product.category?._id === selectedCategory ||
            product.category === selectedCategory;
        const matchesSearch = !q || product.name?.toLowerCase().includes(q) ||
            product.brandName?.toLowerCase().includes(q) ||
            product.sku?.toLowerCase().includes(q) ||
            product.category?.name?.toLowerCase().includes(q) ||
            (product.tags || []).some((tag) => String(tag).toLowerCase().includes(q));
        const matchesPrice = !maxPrice || Number(product.sellingPrice) <= maxPrice;
        return matchesCategory && matchesSearch && matchesPrice;
    }).sort((a, b) => {
        if (sortBy === 'price-low') return Number(a.sellingPrice) - Number(b.sellingPrice);
        if (sortBy === 'price-high') return Number(b.sellingPrice) - Number(a.sellingPrice);
        if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortBy === 'name') return String(a.name).localeCompare(String(b.name));
        return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
    });

    const gridClass = theme.collectionLayout === 'dense'
        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
        : theme.collectionLayout === 'editorial'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
            : theme.collectionLayout === 'masonry'
                ? 'columns-2 md:columns-3 gap-4'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-6';

    const showSidebar = theme.collectionLayout === 'sidebar';

    if (loading) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-7xl mx-auto px-4 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => <div key={i} className="aspect-square animate-pulse bg-zinc-200 rounded-xl" />)}
                    </div>
                </div>
            </StorefrontLayout>
        );
    }

    const filters = (
        <div className={`${showSidebar ? 'space-y-2' : 'flex flex-nowrap gap-2 overflow-x-auto pb-1'}`}>
            <button onClick={() => handleCategoryChange('All')}
                className={`px-3.5 py-2 text-[11px] font-semibold tracking-wide ${selectedCategory === 'All' ? 'text-white shadow-sm' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
                style={{ backgroundColor: selectedCategory === 'All' ? 'var(--color-primary)' : '', borderRadius: 'var(--border-radius)' }}>
                All
            </button>
            {categories.map((cat) => (
                <button key={cat._id} onClick={() => handleCategoryChange(cat._id)}
                    className={`px-3.5 py-2 text-[11px] font-semibold tracking-wide whitespace-nowrap ${selectedCategory === cat._id ? 'text-white shadow-sm' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
                    style={{ backgroundColor: selectedCategory === cat._id ? 'var(--color-primary)' : '', borderRadius: 'var(--border-radius)' }}>
                    {cat.name}
                </button>
            ))}
        </div>
    );

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
                <div className="text-center sm:text-left space-y-3">
                    <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900" style={{ fontFamily: 'var(--heading-font)' }}>Our Catalog</h1>
                    <div className="h-[2px] w-14 mx-auto sm:mx-0" style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }} />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-5 store-card" style={{ borderRadius: 'var(--border-radius, 14px)' }}>
                    <div className="relative md:w-80">
                        <input type="text" placeholder="Search products..." value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/80"
                            style={{ borderRadius: 'var(--border-radius, 10px)' }} />
                        <svg className="w-4 h-4 text-zinc-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                    {!showSidebar && filters}
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setMobileFiltersOpen(true)} className="md:hidden px-3 py-2 border border-zinc-200 text-[10px] font-bold uppercase tracking-wider" style={{ borderRadius: 'var(--border-radius)' }}>Filters</button>
                        <select
                            value={sortBy}
                            onChange={(event) => { setSortBy(event.target.value); updateFilterParam('sort', event.target.value); }}
                            aria-label="Sort products"
                            className="px-3 py-2.5 border border-zinc-200 text-[11px] font-semibold bg-white"
                            style={{ borderRadius: 'var(--border-radius)' }}
                        >
                            <option value="featured">Featured</option>
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name</option>
                        </select>
                    </div>
                </div>

                {(selectedCategory !== 'All' || maxPrice > 0 || searchQuery) && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{filteredProducts.length} results</span>
                        {selectedCategory !== 'All' && <button onClick={() => handleCategoryChange('All')} className="px-3 py-1.5 bg-zinc-100 rounded-full text-[10px] font-bold">Category ×</button>}
                        {maxPrice > 0 && <button onClick={() => { setMaxPrice(0); updateFilterParam('maxPrice', ''); }} className="px-3 py-1.5 bg-zinc-100 rounded-full text-[10px] font-bold">Under ₹{maxPrice} ×</button>}
                        <button onClick={() => { setSelectedCategory('All'); setMaxPrice(0); setSearchQuery(''); setSearchParams({}); }} className="text-[10px] font-black text-[var(--color-primary)]">Clear all</button>
                    </div>
                )}

                <div className={showSidebar ? 'grid grid-cols-1 lg:grid-cols-12 gap-8' : ''}>
                    {showSidebar && (
                        <aside className="lg:col-span-3 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">Categories</h3>
                            {filters}
                            <div className="pt-5 border-t border-zinc-200">
                                <label className="text-xs font-black uppercase tracking-wider text-zinc-500" htmlFor="desktop-price-filter">Maximum price</label>
                                <input id="desktop-price-filter" type="range" min="0" max="10000" step="250" value={maxPrice || 10000}
                                    onChange={(event) => { const value = Number(event.target.value); setMaxPrice(value === 10000 ? 0 : value); updateFilterParam('maxPrice', value === 10000 ? '' : String(value)); }}
                                    className="w-full mt-3 accent-[var(--color-primary)]" />
                                <span className="text-xs mt-1 block">{maxPrice ? `₹${maxPrice}` : 'Any price'}</span>
                            </div>
                        </aside>
                    )}
                    <div className={showSidebar ? 'lg:col-span-9' : ''}>
                        {filteredProducts.length > 0 ? (
                            theme.collectionLayout === 'masonry' ? (
                                <div className={gridClass}>
                                    {filteredProducts.map((product) => (
                                        <div key={product._id} className="break-inside-avoid mb-4">
                                            <ThemeProductCard product={product} storeId={storeId} onAddToCart={onAddToCart} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`grid ${gridClass}`}>
                                    {filteredProducts.map((product) => (
                                        <ThemeProductCard key={product._id} product={product} storeId={storeId} onAddToCart={onAddToCart} />
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="py-20 text-center text-zinc-400 text-sm font-semibold">No products found.</div>
                        )}
                    </div>
                </div>

                {mobileFiltersOpen && (
                    <div className="fixed inset-0 z-[70] bg-black/40 md:hidden" onClick={() => setMobileFiltersOpen(false)}>
                        <aside className="absolute inset-y-0 right-0 w-[88%] max-w-sm bg-white p-6 overflow-y-auto" onClick={(event) => event.stopPropagation()}>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-black">Filters</h2>
                                <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="w-10 h-10 rounded-full bg-zinc-100">×</button>
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-wider mb-3">Categories</h3>
                            {filters}
                            <label className="text-xs font-black uppercase tracking-wider mt-8 block" htmlFor="mobile-price-filter">Maximum price</label>
                            <input id="mobile-price-filter" type="range" min="0" max="10000" step="250" value={maxPrice || 10000}
                                onChange={(event) => setMaxPrice(Number(event.target.value) === 10000 ? 0 : Number(event.target.value))}
                                className="w-full mt-4 accent-[var(--color-primary)]" />
                            <button onClick={() => { updateFilterParam('maxPrice', maxPrice ? String(maxPrice) : ''); setMobileFiltersOpen(false); }} className="w-full mt-8 py-3 text-white font-black text-xs uppercase" style={{ background: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}>Show {filteredProducts.length} products</button>
                        </aside>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontCatalog;
