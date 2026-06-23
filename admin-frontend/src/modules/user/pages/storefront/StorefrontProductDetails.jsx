import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';

const GATEWAY_URL = 'http://localhost:5000/api';

const StorefrontProductDetails = ({ cartCount, onAddToCart, customer, onLogout, storeInfo }) => {
    const { storeId, productId } = useParams();
    const [product, setProduct] = useState(null);
    const [activeImage, setActiveImage] = useState('');
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);

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

    const handleQuantityChange = (val) => {
        const next = Number(val);
        if (next < 1) return;
        setQty(next);
    };

    if (loading) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            </StorefrontLayout>
        );
    }

    if (!product) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-xl mx-auto py-20 text-center space-y-4">
                    <span className="text-4xl">⚠️</span>
                    <h2 className="text-xl font-black text-gray-800">Product Not Found</h2>
                    <p className="text-sm text-gray-500">The product you are trying to view is unavailable or deleted.</p>
                    <Link to={`/store/${storeId}/catalog`} className="inline-block px-6 py-2.5 bg-gray-900 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-black transition-all">
                        Back to Catalog
                    </Link>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumbs */}
                <div className="text-xs font-bold text-gray-400 mb-6 flex items-center gap-1">
                    <Link to={`/store/${storeId}`} className="hover:text-emerald-700 transition-colors">Home</Link>
                    <span>/</span>
                    <Link to={`/store/${storeId}/catalog`} className="hover:text-emerald-700 transition-colors">Catalog</Link>
                    <span>/</span>
                    <span className="text-gray-600 truncate max-w-xs">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
                    {/* Media Gallery (Left) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-150 flex items-center justify-center">
                            {activeImage ? (
                                <img 
                                    src={activeImage.startsWith('http') || activeImage.startsWith('data:') ? activeImage : `http://localhost:5000${activeImage}`} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-1">
                                {product.images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0 ${
                                            activeImage === img ? 'border-emerald-600 scale-95 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <img 
                                            src={img.startsWith('http') || img.startsWith('data:') ? img : `http://localhost:5000${img}`} 
                                            alt="" 
                                            className="w-full h-full object-cover" 
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details (Right) */}
                    <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                        <div className="space-y-4">
                            {/* Brand / Category */}
                            <div className="flex items-center gap-2">
                                {product.brandName && (
                                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                                        {product.brandName}
                                    </span>
                                )}
                                {product.category && (
                                    <span className="text-xs font-bold text-gray-500">
                                        {product.category.name || 'Category'}
                                    </span>
                                )}
                            </div>

                            {/* Name */}
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                                {product.name}
                            </h1>

                            {/* SKU */}
                            {product.sku && (
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">SKU: {product.sku}</p>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-black text-gray-900">₹{product.sellingPrice}</span>
                                {product.actualPrice > product.sellingPrice && (
                                    <span className="text-sm text-gray-400 line-through font-semibold">₹{product.actualPrice}</span>
                                )}
                            </div>

                            <hr className="border-gray-100" />

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Description</h3>
                                <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                                    {product.description || 'No description provided for this product.'}
                                </p>
                            </div>
                        </div>

                        {/* Cart CTA Row */}
                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            {/* Qty Selector */}
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Quantity</span>
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                                    <button 
                                        onClick={() => handleQuantityChange(qty - 1)}
                                        className="px-3.5 py-2 text-gray-500 hover:bg-gray-100 active:scale-95 transition-all font-bold cursor-pointer"
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="number" 
                                        value={qty} 
                                        onChange={e => handleQuantityChange(e.target.value)}
                                        className="w-12 text-center text-sm font-bold bg-transparent border-0 focus:outline-none focus:ring-0"
                                    />
                                    <button 
                                        onClick={() => handleQuantityChange(qty + 1)}
                                        className="px-3.5 py-2 text-gray-500 hover:bg-gray-100 active:scale-95 transition-all font-bold cursor-pointer"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Add to Cart CTA */}
                            <button
                                onClick={() => onAddToCart(product, qty)}
                                className="w-full py-4 text-white text-sm font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Add to Shopping Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontProductDetails;
