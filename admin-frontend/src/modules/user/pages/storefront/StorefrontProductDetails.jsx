import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';
import { getStorePath } from '../../components/storefront/storeUrlHelper';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL.replace('/api', '');

const StorefrontProductDetails = ({ cartCount, onAddToCart, customer, onLogout, storeInfo }) => {
    const { storeId: paramStoreId, productId } = useParams();
    const storeId = storeInfo?._id || paramStoreId;
    const [product, setProduct] = useState(null);
    const [activeImage, setActiveImage] = useState('');
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [addedToast, setAddedToast] = useState(false);

    useEffect(() => {
        if (!productId) return;
        const fetchProductDetails = async () => {
            try {
                const res = await fetch(`${GATEWAY_URL}/products/${productId}?storeId=${storeId}`);
                const data = await res.json();
                if (res.ok) {
                    setProduct(data);
                    if (data.images && data.images.length > 0) {
                        setActiveImage(data.images[0]);
                    }
                }
            } catch (err) {
                console.error('Error fetching product details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductDetails();
    }, [productId, storeId]);

    useEffect(() => {
        if (customer && customer._id && productId && storeId) {
            fetch(`${GATEWAY_URL}/customers/${customer._id}/wishlist`, {
                headers: { 'x-store-id': storeId }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.wishlist) {
                        const ids = data.wishlist.map(item => item._id || item);
                        setIsWishlisted(ids.includes(productId));
                    }
                })
                .catch(err => console.error('Error loading wishlist state:', err));
        }
    }, [customer, productId, storeId]);

    const handleWishlistToggle = async () => {
        if (!customer) {
            alert('Please login to add products to your wishlist!');
            return;
        }
        try {
            const nextState = !isWishlisted;
            setIsWishlisted(nextState);

            const res = await fetch(`${GATEWAY_URL}/customers/${customer._id}/wishlist`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-store-id': storeId
                },
                body: JSON.stringify({ productId })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const ids = data.wishlist.map(item => item._id || item);
                setIsWishlisted(ids.includes(productId));
            }
        } catch (err) {
            console.error('Error toggling wishlist:', err);
        }
    };

    const handleQuantityChange = (val) => {
        const next = Number(val);
        if (next < 1) return;
        setQty(next);
    };

    const handleAddToCartClick = async () => {
        if (onAddToCart && product) {
            await onAddToCart(product, qty);
            setAddedToast(true);
            setTimeout(() => setAddedToast(false), 3000);
        }
    };

    if (loading) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/50 shadow-sm">
                        {/* Images Section */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="w-full aspect-square animate-shimmer rounded-2xl"></div>
                            <div className="flex gap-3 overflow-x-auto py-1">
                                <div className="w-18 h-18 animate-shimmer rounded-xl flex-shrink-0"></div>
                                <div className="w-18 h-18 animate-shimmer rounded-xl flex-shrink-0"></div>
                            </div>
                        </div>

                        {/* Product Info Section */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="space-y-3">
                                <div className="w-20 h-5 animate-shimmer rounded-md"></div>
                                <div className="w-3/4 h-7 animate-shimmer rounded-lg"></div>
                                <div className="w-24 h-4 animate-shimmer rounded-md"></div>
                            </div>

                            <hr className="border-zinc-100" />

                            <div className="space-y-3">
                                <div className="w-full h-3.5 animate-shimmer rounded"></div>
                                <div className="w-11/12 h-3.5 animate-shimmer rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </StorefrontLayout>
        );
    }

    if (!product) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-md mx-auto py-20 text-center space-y-5 bg-white border border-zinc-200/60 p-8 rounded-3xl mt-12 shadow-sm animate-scale-in" style={{ borderRadius: 'var(--border-radius)' }}>
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-md font-black text-zinc-800 uppercase tracking-wider">Product Not Found</h2>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed font-semibold">The product you are trying to view is unavailable.</p>
                    <Link to={getStorePath(storeId, '/catalog')} className="inline-block px-6 py-2.5 bg-zinc-950 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-md active:scale-95">
                        Back to Catalog
                    </Link>
                </div>
            </StorefrontLayout>
        );
    }

    const discountPercentage = product.actualPrice > product.sellingPrice 
        ? Math.round(((product.actualPrice - product.sellingPrice) / product.actualPrice) * 100)
        : 0;

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in relative">
                {/* Breadcrumbs */}
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-6 flex flex-wrap items-center gap-1.5 pl-0.5">
                    <Link to={getStorePath(storeId, '/')} className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
                    <span className="text-zinc-300">/</span>
                    <Link to={getStorePath(storeId, '/catalog')} className="hover:text-[var(--color-primary)] transition-colors">Catalog</Link>
                    <span className="text-zinc-300">/</span>
                    <span className="text-zinc-650 truncate max-w-[120px] sm:max-w-xs">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-5 sm:p-8 rounded-3xl border border-zinc-200/60 shadow-sm relative">
                    {/* Media Gallery (Left) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="aspect-square bg-[#fafafa] rounded-2xl overflow-hidden border border-zinc-200/40 flex items-center justify-center shadow-sm relative group/image">
                            {/* Wishlist Button */}
                            <button 
                                onClick={handleWishlistToggle}
                                className="absolute top-4 right-4 z-10 w-9 h-9 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all cursor-pointer shadow-md"
                            >
                                <svg 
                                    className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 stroke-red-500 scale-110' : 'stroke-current fill-none'}`} 
                                    strokeWidth="2.5" 
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </button>

                            {activeImage ? (
                                <img 
                                    src={activeImage.startsWith('http') || activeImage.startsWith('data:') ? activeImage : `${ASSETS_BASE_URL}${activeImage}`} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover group-hover/image:scale-[1.02] transition-transform duration-700 ease-out"
                                />
                            ) : (
                                <svg className="w-16 h-16 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-1 storefront-scrollbar">
                                {product.images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-18 h-18 bg-white rounded-xl overflow-hidden border-2 cursor-pointer transition-premium flex-shrink-0 ${
                                            activeImage === img 
                                                ? 'scale-95 shadow-sm' 
                                                : 'border-zinc-200 hover:border-zinc-300 hover:scale-[1.01]'
                                        }`}
                                        style={{ 
                                            borderColor: activeImage === img ? 'var(--color-primary)' : '',
                                            borderRadius: 'var(--border-radius)'
                                        }}
                                    >
                                        <img 
                                            src={img.startsWith('http') || img.startsWith('data:') ? img : `${ASSETS_BASE_URL}${img}`} 
                                            alt="" 
                                            className="w-full h-full object-cover" 
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details (Right) */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            {/* Brand / Category */}
                            <div className="flex items-center gap-2">
                                {product.brandName && (
                                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                        {product.brandName}
                                    </span>
                                )}
                                {product.category && (
                                    <span className="text-[8px] bg-zinc-100 text-zinc-500 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md">
                                        {product.category.name || 'Category'}
                                    </span>
                                )}
                            </div>

                            {/* Name */}
                            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 leading-tight uppercase tracking-tight">
                                {product.name}
                            </h1>

                            {/* SKU */}
                            {product.sku && (
                                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest pl-0.5">SKU: {product.sku}</p>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline gap-3 pl-0.5">
                                <span className="text-2xl font-black text-zinc-900">₹{product.sellingPrice}</span>
                                {product.actualPrice > product.sellingPrice && (
                                    <>
                                        <span className="text-xs text-zinc-400 line-through font-bold">₹{product.actualPrice}</span>
                                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                                            Save {discountPercentage}%
                                        </span>
                                    </>
                                )}
                            </div>

                            <hr className="border-zinc-150/80" />

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Description</h3>
                                <p className="text-xs text-zinc-650 font-semibold leading-relaxed whitespace-pre-line">
                                    {product.description || 'No description provided for this product.'}
                                </p>
                            </div>
                        </div>

                        {/* Cart CTA Row */}
                        <div className="space-y-4.5 pt-6 border-t border-zinc-150/80">
                            {/* Qty Selector */}
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Quantity</span>
                                <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50">
                                    <button 
                                        type="button"
                                        onClick={() => handleQuantityChange(qty - 1)}
                                        className="px-3.5 py-2 text-zinc-500 hover:bg-zinc-150 active:scale-95 transition-all font-bold cursor-pointer"
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="number" 
                                        value={qty} 
                                        onChange={e => handleQuantityChange(e.target.value)}
                                        className="w-10 text-center text-xs font-black bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-800"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => handleQuantityChange(qty + 1)}
                                        className="px-3.5 py-2 text-zinc-500 hover:bg-zinc-150 active:scale-95 transition-all font-bold cursor-pointer"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Add to Cart CTA */}
                            <button
                                onClick={handleAddToCartClick}
                                className="w-full py-3.5 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 btn-premium cursor-pointer"
                                style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Add to Shopping Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Micro Toast added indicator */}
            {addedToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-zinc-800 text-white py-3 px-5 rounded-2xl shadow-xl flex items-center gap-3 animate-toast-in">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <svg className="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-200">Added to Cart</p>
                        <p className="text-[9px] font-semibold text-zinc-400 mt-0.5">{qty}x {product.name}</p>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
};

export default StorefrontProductDetails;
