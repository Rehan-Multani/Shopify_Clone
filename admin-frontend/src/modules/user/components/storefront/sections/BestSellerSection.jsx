import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const ASSETS_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const BestSellerSection = ({ settings = {} }) => {
    const { title = 'Best Sellers', limit = 4 } = settings;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const storeId = localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (!storeId) return;
                const res = await fetch(`${CATALOG_API_URL}/products`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-store-id': storeId
                    }
                });
                const data = await res.json();
                if (res.ok && data.products) {
                    const sorted = [...data.products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
                    setProducts(sorted.slice(0, parseInt(limit)));
                }
            } catch (err) {
                console.error('Error fetching best seller products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [storeId, token, limit]);

    if (loading) {
        return (
            <div className="py-16 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
                <div className="space-y-3 flex flex-col items-center">
                    <div className="w-36 h-6 animate-shimmer rounded-xl"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-4 p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                            <div className="w-full aspect-square animate-shimmer rounded-xl"></div>
                            <div className="w-3/4 h-4 animate-shimmer rounded-lg"></div>
                            <div className="w-1/2 h-4 animate-shimmer rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="py-16 text-center text-zinc-400 font-bold text-xs uppercase tracking-wider">
                No best sellers.
            </div>
        );
    }

    return (
        <section className="py-16 px-4 sm:px-6 md:px-8 bg-transparent max-w-7xl mx-auto w-full space-y-10">
            <div className="space-y-1 border-b border-zinc-200/65 pb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-black tracking-widest text-zinc-900 uppercase">{title}</h2>
                    <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100 flex items-center gap-1">
                    🔥 Hot Deals
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product, idx) => {
                    const imageUrl = product.images && product.images.length > 0 
                        ? (product.images[0].startsWith('http') || product.images[0].startsWith('data:') ? product.images[0] : `${ASSETS_BASE_URL}${product.images[0]}`)
                        : null;
                    return (
                        <div 
                            key={product._id}
                            className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden card-premium flex flex-col p-3 group relative transition-all duration-300 animate-fade-in-up"
                            style={{ animationDelay: `${idx * 50}ms`, borderRadius: 'var(--border-radius)' }}
                        >
                            <Link 
                                to={`/store/${storeId}/product/${product._id}`} 
                                className="aspect-square w-full rounded-xl overflow-hidden bg-[#fafafa] border border-zinc-100 flex items-center justify-center relative mb-3.5"
                            >
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={product.name || product.title}
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
                                    <Link 
                                        to={`/store/${storeId}/product/${product._id}`} 
                                        className="text-xs font-bold text-zinc-800 hover:text-[var(--color-primary)] transition-colors line-clamp-1 leading-snug uppercase tracking-tight"
                                    >
                                        {product.name || product.title}
                                    </Link>
                                    {product.brandName && (
                                        <p className="text-[8px] text-zinc-400 font-extrabold uppercase tracking-widest leading-none">{product.brandName}</p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-zinc-900">₹{product.sellingPrice || product.price}</span>
                                    {(product.actualPrice || product.compareAtPrice) > (product.sellingPrice || product.price) && (
                                        <span className="text-[10px] text-zinc-400 line-through font-bold">
                                            ₹{product.actualPrice || product.compareAtPrice}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default BestSellerSection;
