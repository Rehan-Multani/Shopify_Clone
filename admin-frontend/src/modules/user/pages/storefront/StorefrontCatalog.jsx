import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';

const GATEWAY_URL = 'http://localhost:5000/api';

const StorefrontCatalog = ({ cartCount, onAddToCart, customer, onLogout, storeInfo }) => {
    const { storeId } = useParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                {/* Title */}
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Our Catalog</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Discover our full collection of products.</p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    {/* Search */}
                    <div className="relative md:w-80">
                        <input 
                            type="text" 
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50/50"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Categories Tabs */}
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                selectedCategory === 'All' 
                                ? 'bg-gray-900 text-white shadow-sm' 
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat._id}
                                onClick={() => setSelectedCategory(cat._id)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                    selectedCategory === cat._id 
                                    ? 'bg-gray-900 text-white shadow-sm' 
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div 
                                key={product._id}
                                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col p-4 group"
                            >
                                {/* Image Link */}
                                <Link to={`/store/${storeId}/product/${product._id}`} className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center relative mb-4">
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
                                </Link>

                                <div className="flex-grow flex flex-col justify-between space-y-2">
                                    <div>
                                        <Link to={`/store/${storeId}/product/${product._id}`} className="text-sm font-bold text-gray-800 hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
                                            {product.name}
                                        </Link>
                                        {product.brandName && (
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{product.brandName}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-sm font-black text-gray-900">₹{product.sellingPrice}</span>
                                        {product.actualPrice > product.sellingPrice && (
                                            <span className="text-xs text-gray-400 line-through font-semibold">₹{product.actualPrice}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onAddToCart(product)}
                                        className="w-full mt-2 py-2 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm hover:opacity-90"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
                        <span className="text-4xl">🔍</span>
                        <h3 className="text-lg font-black text-gray-700 mt-4">No Products Found</h3>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontCatalog;
