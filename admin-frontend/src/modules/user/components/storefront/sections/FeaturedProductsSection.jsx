import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStorePath } from '../storeUrlHelper';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const ASSETS_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const ProductCard = ({ product, storeId, onAddToCart, cardShape }) => {
    const [imageError, setImageError] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [adding, setAdding] = useState(false);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${ASSETS_BASE_URL}${cleanPath}`;
    };

    const imageUrl = product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : null;

    const getGradientClass = (name) => {
        const code = name.charCodeAt(0) || 0;
        const gradients = [
            'from-zinc-100 to-zinc-200/80',
            'from-neutral-50 to-neutral-200/90',
            'from-slate-100 to-slate-200/80',
            'from-stone-100 to-stone-200/85',
            'from-zinc-50 to-zinc-200'
        ];
        return gradients[code % gradients.length];
    };

    const handleAddClick = async () => {
        setAdding(true);
        if (onAddToCart) {
            await onAddToCart(product);
        }
        setTimeout(() => setAdding(false), 800);
    };

    const discountPercentage = product.actualPrice > product.sellingPrice 
        ? Math.round(((product.actualPrice - product.sellingPrice) / product.actualPrice) * 100)
        : 0;

    const shapeStyle = cardShape === 'square' ? { borderRadius: '0px' }
                     : cardShape === 'circle' ? { borderRadius: 'var(--border-radius)' }
                     : cardShape === 'pill' ? { borderRadius: '24px' }
                     : cardShape === 'curved' ? { borderRadius: '12px' }
                     : { borderRadius: 'var(--border-radius)' };

    const innerShapeStyle = cardShape === 'square' ? { borderRadius: '0px' }
                           : cardShape === 'circle' ? { borderRadius: '50%' }
                           : cardShape === 'pill' ? { borderRadius: '16px' }
                           : cardShape === 'curved' ? { borderRadius: '8px' }
                           : { borderRadius: 'calc(var(--border-radius) - 4px)' };

    return (
        <div 
            className="bg-white border border-zinc-200/60 overflow-hidden card-premium flex flex-col p-3 group relative transition-all duration-300"
            style={shapeStyle}
        >
            <div 
                className="aspect-square w-full overflow-hidden bg-[#fafafa] border border-zinc-100 flex items-center justify-center relative mb-3.5"
                style={innerShapeStyle}
            >
                {discountPercentage > 0 && (
                    <span 
                        className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white rounded-md shadow-sm"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        Save {discountPercentage}%
                    </span>
                )}

                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        setIsWishlisted(!isWishlisted);
                    }}
                    className="absolute top-2.5 right-2.5 z-10 w-7 h-7 bg-white hover:bg-zinc-50 border border-zinc-200/70 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all duration-200 active:scale-90 cursor-pointer shadow-sm"
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <svg 
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${isWishlisted ? 'fill-red-500 stroke-red-500 scale-110' : 'stroke-current fill-none'}`} 
                        strokeWidth="2.5" 
                        viewBox="0 0 24 24"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>

                <Link 
                    to={getStorePath(storeId, `/product/${product._id}`)} 
                    className="w-full h-full block"
                >
                    {!imageUrl || imageError ? (
                        <div className={`w-full h-full bg-gradient-to-br ${getGradientClass(product.name)} flex flex-col items-center justify-center p-4 relative`}>
                            <div className="w-10 h-10 rounded-xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/20">
                                <svg className="w-5 h-5 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            onError={() => setImageError(true)}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                        />
                    )}
                </Link>
            </div>

            <div className="flex-grow flex flex-col justify-between space-y-2.5 px-0.5">
                <div className="space-y-1">
                    <Link 
                        to={getStorePath(storeId, `/product/${product._id}`)} 
                        className="text-xs font-bold text-zinc-800 hover:text-[var(--color-primary)] transition-colors line-clamp-1 leading-snug uppercase tracking-tight"
                    >
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

                    {onAddToCart && (
                        <button
                            onClick={handleAddClick}
                            disabled={adding}
                            className={`w-full py-2 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 ${adding ? 'bg-emerald-600' : ''}`}
                            style={{ backgroundColor: adding ? '' : 'var(--color-primary)', borderRadius: 'calc(var(--border-radius) - 2px)' }}
                        >
                            {adding ? (
                                <>
                                    <svg className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Added!
                                </>
                            ) : (
                                <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Add to Cart
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const FeaturedProductsSection = ({ settings = {}, storeId: propStoreId, onAddToCart }) => {
    const { title = 'Featured Products', limit = 8 } = settings;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const storeId = propStoreId || localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (!storeId) return;
                const headers = { 'x-store-id': storeId };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
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

    if (loading) {
        return (
            <div className="py-16 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 space-y-8">
                <div className="space-y-3 flex flex-col items-center">
                    <div className="w-36 h-6 animate-shimmer rounded-xl"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-6">
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
                No featured products.
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
                <Link 
                    to={getStorePath(storeId, '/catalog')}
                    className="text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-900 flex items-center gap-1 hover:gap-1.5 transition-all py-1.5 pl-2"
                >
                    View All Catalog
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-6">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} storeId={storeId} onAddToCart={onAddToCart} cardShape={settings.cardShape} />
                ))}
            </div>
        </section>
    );
};

export default FeaturedProductsSection;
