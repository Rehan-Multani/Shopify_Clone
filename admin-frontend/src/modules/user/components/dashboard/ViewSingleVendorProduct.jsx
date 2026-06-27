import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const API_URL = CATALOG_API_URL;

const ViewSingleVendorProduct = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('merchantToken');

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState('');

    // Parse path to get productId
    const pathParts = window.location.pathname.split('/');
    const productId = pathParts.includes('view') ? pathParts[pathParts.indexOf('view') + 1] : null;

    useEffect(() => {
        if (!productId) {
            setError('Product ID is missing');
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                const storeId = localStorage.getItem('activeStoreId') || '';
                const res = await fetch(`${API_URL}/products/${productId}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
                });
                const data = await res.json();
                if (res.ok) {
                    setProduct(data);
                    if (data.images && data.images.length > 0) {
                        setActiveImage(`${API_URL.replace('/api', '')}${data.images[0]}`);
                    }
                } else {
                    setError(data.message || 'Failed to fetch product details');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load product data');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

    const getDiscount = (actual, selling) => {
        if (actual <= 0 || selling >= actual) return null;
        return Math.round(((actual - selling) / actual) * 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard/products')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-red-600">Error</h1>
                </div>
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-medium">
                    {error || 'Product not found'}
                </div>
            </div>
        );
    }

    const discount = getDiscount(product.actualPrice, product.sellingPrice);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Top Bar / Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard/products')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]" title="Back to Products">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">{product.name}</h1>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                {product.isActive ? 'Active' : 'Draft/Inactive'}
                            </span>
                        </div>
                        {product.brandName && <p className="text-sm text-[#5c5f62] mt-0.5">by {product.brandName}</p>}
                    </div>
                </div>
                <Link
                    to={`/dashboard/products/edit/${product._id}`}
                    className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Product
                </Link>
            </div>

            {/* Product Overview Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Images Section */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-center aspect-square overflow-hidden">
                        {activeImage ? (
                            <img src={activeImage} alt={product.name} className="max-h-full max-w-full object-contain rounded-xl" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-medium">No images uploaded</span>
                            </div>
                        )}
                    </div>
                    
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-2.5 overflow-x-auto py-1 custom-scrollbar">
                            {product.images.map((img, idx) => {
                                const fullUrl = `${API_URL.replace('/api', '')}${img}`;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(fullUrl)}
                                        className={`w-16 h-16 rounded-lg border overflow-hidden flex-shrink-0 bg-white p-1 transition-all ${
                                            activeImage === fullUrl ? 'border-black ring-2 ring-black/5' : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                    >
                                        <img src={fullUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover rounded-md" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic & Pricing Info */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-black text-[#202223]">{formatPrice(product.sellingPrice)}</span>
                                    {discount && (
                                        <>
                                            <span className="text-sm text-gray-400 line-through font-medium">{formatPrice(product.actualPrice)}</span>
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{discount}% off</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="sm:text-right">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory</span>
                                <p className={`text-lg font-bold mt-1 ${product.stock > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-bold text-[#202223] mb-2">Description</h3>
                            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                                {product.description || <span className="text-gray-400 italic">No description provided</span>}
                            </div>
                        </div>

                        {/* Specifications Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</span>
                                <p className="text-sm font-bold text-[#202223] mt-1">
                                    {product.category?.name ? (
                                        product.category.name
                                    ) : (
                                        <span className="text-gray-400 italic font-normal">Not Categorized</span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU</span>
                                <p className="text-sm font-mono text-[#202223] mt-1 bg-gray-50 px-2 py-0.5 rounded inline-block border border-gray-100">
                                    {product.sku ? (
                                        product.sku
                                    ) : (
                                        <span className="text-gray-400 italic font-normal">No SKU</span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weight</span>
                                <p className="text-sm font-bold text-[#202223] mt-1">
                                    {product.weight ? (
                                        product.weight
                                    ) : (
                                        <span className="text-gray-400 italic font-normal">Not specified</span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Created Date</span>
                                <p className="text-sm font-bold text-[#202223] mt-1">
                                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tags & Metadata */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag, idx) => (
                                    <span key={idx} className="text-xs font-bold bg-[#f6f6f7] hover:bg-gray-100 transition-colors text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200/50">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewSingleVendorProduct;
