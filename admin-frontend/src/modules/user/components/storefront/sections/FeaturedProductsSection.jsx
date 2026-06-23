import React, { useState, useEffect } from 'react';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:5003/api';

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
            <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="py-16 text-center text-gray-400 font-semibold">
                No products found. Add products to display them here.
            </div>
        );
    }

    return (
        <section className="py-16 px-6 md:px-12 bg-gray-50 max-w-7xl mx-auto w-full space-y-10 rounded-2xl my-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h2>
                <div className="w-12 h-1 bg-[var(--color-primary)] mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div 
                        key={product._id}
                        className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col p-4 group"
                    >
                        <a href={`/store/${storeId}/product/${product._id}`} className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center relative mb-4">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0].startsWith('http') || product.images[0].startsWith('data:') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                        </a>

                        <div className="flex-grow flex flex-col justify-between space-y-2">
                            <div>
                                <a href={`/store/${storeId}/product/${product._id}`} className="text-sm font-bold text-gray-800 hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">{product.name}</a>
                                {product.category && (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full inline-block mt-1">
                                        {product.category.name || 'Category'}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-sm font-black text-gray-900">₹{product.sellingPrice}</span>
                                {product.actualPrice > product.sellingPrice && (
                                    <span className="text-xs text-gray-400 line-through font-semibold">₹{product.actualPrice}</span>
                                )}
                            </div>
                            {onAddToCart && (
                                <button
                                    onClick={() => onAddToCart(product)}
                                    className="w-full mt-2 py-2 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm hover:opacity-90"
                                    style={{ backgroundColor: 'var(--color-primary)' }}
                                >
                                    Add to Cart
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedProductsSection;
