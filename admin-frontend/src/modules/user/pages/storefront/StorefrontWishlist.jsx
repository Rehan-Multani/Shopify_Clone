import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';
import { getStorePath } from '../../components/storefront/storeUrlHelper';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL.replace('/api', '');

const StorefrontWishlist = ({ cartCount, onAddToCart, customer, onLogout, storeInfo }) => {
    const { storeId: paramStoreId } = useParams();
    const storeId = storeInfo?._id || paramStoreId;

    const [likedProducts, setLikedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        if (!customer || !customer._id) return;
        try {
            const res = await fetch(`${GATEWAY_URL}/customers/${customer._id}/wishlist`, {
                headers: { 'x-store-id': storeId }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setLikedProducts(data.wishlist || []);
            }
        } catch (err) {
            console.error('Error fetching customer wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [customer, storeId]);

    const handleRemoveFromWishlist = async (productId) => {
        if (!customer) return;
        try {
            // Optimistic update
            setLikedProducts(prev => prev.filter(p => p._id !== productId));

            await fetch(`${GATEWAY_URL}/customers/${customer._id}/wishlist`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-store-id': storeId
                },
                body: JSON.stringify({ productId })
            });
        } catch (err) {
            console.error('Error removing product from wishlist:', err);
            fetchWishlist(); // Re-fetch on error
        }
    };

    if (loading) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                    <div className="space-y-2">
                        <div className="w-36 h-6 animate-shimmer bg-zinc-200 rounded-xl"></div>
                        <div className="w-48 h-3.5 animate-shimmer bg-zinc-200 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-4 p-4 bg-white border border-zinc-150 rounded-2xl shadow-sm">
                                <div className="w-full aspect-square animate-shimmer bg-zinc-200 rounded-xl"></div>
                                <div className="w-3/4 h-4 animate-shimmer bg-zinc-200 rounded-lg"></div>
                                <div className="w-1/2 h-4 animate-shimmer bg-zinc-200 rounded-lg"></div>
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
                    <h1 className="text-lg font-black tracking-widest text-zinc-900 uppercase">My Wishlist</h1>
                    <p className="text-xs text-zinc-450 font-semibold">Your curated selection of liked products.</p>
                    <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                </div>

                {likedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-6">
                        {likedProducts.map((product) => {
                            const imageUrl = product.images && product.images.length > 0 
                                ? (product.images[0].startsWith('http') || product.images[0].startsWith('data:') ? product.images[0] : `${ASSETS_BASE_URL}${product.images[0]}`)
                                : null;
                            const discount = product.actualPrice > product.sellingPrice 
                                ? Math.round(((product.actualPrice - product.sellingPrice) / product.actualPrice) * 100)
                                : 0;
                            return (
                                <div 
                                    key={product._id}
                                    className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-sm card-premium flex flex-col p-3 group relative transition-all duration-300"
                                    style={{ borderRadius: 'var(--border-radius)' }}
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

                                    {/* Remove button */}
                                    <button 
                                        onClick={() => handleRemoveFromWishlist(product._id)}
                                        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 bg-white hover:bg-zinc-50 border border-zinc-200/70 rounded-full flex items-center justify-center text-red-500 hover:scale-105 active:scale-90 cursor-pointer shadow-sm transition-all"
                                        title="Remove from wishlist"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
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
                                                    <span className="text-[10px] text-zinc-450 line-through font-bold">₹{product.actualPrice}</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onAddToCart(product)}
                                                className="w-full py-2 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 btn-premium"
                                                style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'calc(var(--border-radius) - 2px)' }}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
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
                    <div className="text-center py-20 bg-white border border-zinc-200/60 rounded-3xl shadow-sm space-y-5 max-w-md mx-auto">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500 shadow-sm border border-red-100/50">
                            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-zinc-800 uppercase tracking-wider">Your Wishlist is Empty</h3>
                            <p className="text-xs text-zinc-405 max-w-xs mx-auto leading-relaxed font-semibold">You haven't liked any products yet. Go find something you love!</p>
                        </div>
                        <Link 
                            to={getStorePath(storeId, '/catalog')} 
                            className="inline-block px-7 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md btn-premium"
                            style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                        >
                            Explore Catalog
                        </Link>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontWishlist;
