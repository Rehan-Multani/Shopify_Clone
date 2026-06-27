import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';
import { getStorePath } from '../../components/storefront/storeUrlHelper';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL.replace('/api', '');

const StorefrontCatalog = ({ cartCount, onAddToCart, customer, onLogout, storeInfo }) => {
    const { storeId: paramStoreId } = useParams();
    const storeId = storeInfo?._id || paramStoreId;
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
    const [searchQuery, setSearchQuery] = useState(searchParam || '');
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        setSelectedCategory(categoryParam || 'All');
    }, [categoryParam]);

    useEffect(() => {
        if (searchParam) {
            setSearchQuery(searchParam);
        }
    }, [searchParam]);

    const handleCategoryChange = (catId) => {
        setSelectedCategory(catId);
        const newParams = new URLSearchParams(searchParams);
        if (catId === 'All') {
            newParams.delete('category');
        } else {
            newParams.set('category', catId);
        }
        setSearchParams(newParams);
    };

    useEffect(() => {
        if (!storeId) return;
        const fetchData = async () => {
            try {
                // Fetch categories
                const catRes = await fetch(`${GATEWAY_URL}/categories?storeId=${storeId}`);
                const catData = await catRes.json();
                if (catRes.ok) {
                    setCategories(Array.isArray(catData) ? catData : (catData.categories || []));
                }

                // Fetch products
                const prodRes = await fetch(`${GATEWAY_URL}/products?storeId=${storeId}`);
                const prodData = await prodRes.json();
                if (prodRes.ok) {
                    setProducts(Array.isArray(prodData) ? prodData : (prodData.products || []));
                }
            } catch (err) {
                console.error('Error fetching catalog data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [storeId]);

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || 
            product.category?._id === selectedCategory || 
            product.category === selectedCategory;
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            product.brandName?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleWishlist = (id) => {
        if (wishlist.includes(id)) {
            setWishlist(wishlist.filter(item => item !== id));
        } else {
            setWishlist([...wishlist, id]);
        }
    };

    if (loading) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                    {/* Title Skeleton */}
                    <div className="space-y-2">
                        <div className="w-36 h-6 animate-shimmer rounded-xl"></div>
                        <div className="w-48 h-3.5 animate-shimmer rounded"></div>
                    </div>

                    {/* Filter bar Skeleton */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200/50 shadow-sm">
                        <div className="w-full md:w-80 h-10 animate-shimmer rounded-xl"></div>
                        <div className="flex gap-2">
                            <div className="w-16 h-8 animate-shimmer rounded-lg"></div>
                            <div className="w-20 h-8 animate-shimmer rounded-lg"></div>
                        </div>
                    </div>

                    {/* Products Grid Skeleton */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-4 p-4 bg-white border border-zinc-150 rounded-2xl shadow-sm">
                                <div className="w-full aspect-square animate-shimmer rounded-xl"></div>
                                <div className="w-3/4 h-4 animate-shimmer rounded-lg"></div>
                                <div className="w-1/2 h-4 animate-shimmer rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
                {/* Title */}
                <div className="space-y-1">
                    <h1 className="text-lg font-black tracking-widest text-zinc-900 uppercase">Our Catalog</h1>
                    <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-zinc-200/60 shadow-sm">
                    {/* Search */}
                    <div className="relative md:w-80">
                        <input 
                            type="text" 
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/50 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium"
                        />
                        <svg className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                    </div>

                    {/* Categories Tabs */}
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 max-w-full storefront-scrollbar">
                        <button
                            onClick={() => handleCategoryChange('All')}
                            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                selectedCategory === 'All' 
                                ? 'text-white shadow-sm' 
                                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-650'
                            }`}
                            style={{ 
                                backgroundColor: selectedCategory === 'All' ? 'var(--color-primary)' : '',
                                borderRadius: 'var(--border-radius)'
                            }}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat._id}
                                onClick={() => handleCategoryChange(cat._id)}
                                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                    selectedCategory === cat._id 
                                    ? 'text-white shadow-sm' 
                                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-655'
                                }`}
                                style={{ 
                                    backgroundColor: selectedCategory === cat._id ? 'var(--color-primary)' : '',
                                    borderRadius: 'var(--border-radius)'
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                        {filteredProducts.map((product, idx) => {
                            const imageUrl = product.images && product.images.length > 0 
                                ? (product.images[0].startsWith('http') || product.images[0].startsWith('data:') ? product.images[0] : `${ASSETS_BASE_URL}${product.images[0]}`)
                                : null;
                            const isWish = wishlist.includes(product._id);
                            const discount = product.actualPrice > product.sellingPrice 
                                ? Math.round(((product.actualPrice - product.sellingPrice) / product.actualPrice) * 100)
                                : 0;
                            return (
                                <div 
                                    key={product._id}
                                    className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-sm card-premium flex flex-col p-3 group relative transition-all duration-300 animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 40}ms`, borderRadius: 'var(--border-radius)' }}
                                >
                                    {/* Discount badge */}
                                    {discount > 0 && (
                                        <span 
                                            className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white rounded-md shadow-sm"
                                            style={{ backgroundColor: 'var(--color-primary)' }}
                                        >
                                            Save {discount}%
                                        </span>
                                    )}

                                    {/* Wishlist Button */}
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleWishlist(product._id);
                                        }}
                                        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 bg-white hover:bg-zinc-50 border border-zinc-200/70 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all duration-200 active:scale-90 cursor-pointer shadow-sm"
                                    >
                                        <svg 
                                            className={`w-3.5 h-3.5 transition-transform duration-300 ${isWish ? 'fill-red-500 stroke-red-500 scale-110' : 'stroke-current fill-none'}`} 
                                            strokeWidth="2.5" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                    </button>

                                    {/* Image Link */}
                                    <Link to={getStorePath(storeId, `/product/${product._id}`)} className="aspect-square w-full rounded-xl overflow-hidden bg-[#fafafa] border border-zinc-100 flex items-center justify-center relative mb-3.5">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </div>
                                        )}
                                    </Link>

                                    <div className="flex-grow flex flex-col justify-between space-y-2.5 px-0.5">
                                        <div className="space-y-1">
                                            <Link to={getStorePath(storeId, `/product/${product._id}`)} className="text-xs font-bold text-zinc-800 hover:text-[var(--color-primary)] transition-colors line-clamp-1 leading-snug uppercase tracking-tight">
                                                {product.name}
                                            </Link>
                                            {product.brandName && (
                                                <p className="text-[8px] text-zinc-400 font-extrabold uppercase tracking-widest leading-none">{product.brandName}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-zinc-900">₹{product.sellingPrice}</span>
                                                {product.actualPrice > product.sellingPrice && (
                                                    <span className="text-[10px] text-zinc-400 line-through font-bold">₹{product.actualPrice}</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onAddToCart(product)}
                                                className="w-full py-2 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 btn-premium"
                                                style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'calc(var(--border-radius) - 2px)' }}
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white border border-zinc-200/60 rounded-3xl shadow-sm space-y-4 max-w-md mx-auto">
                        <div className="w-12 h-12 bg-zinc-55 rounded-2xl flex items-center justify-center mx-auto text-zinc-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-zinc-800 uppercase tracking-wider">No Products Found</h3>
                            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed font-semibold">Try adjusting your filters or search query.</p>
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontCatalog;
