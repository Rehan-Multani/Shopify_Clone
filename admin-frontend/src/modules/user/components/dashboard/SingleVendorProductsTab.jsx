import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const API_URL = CATALOG_API_URL;

const SingleVendorProductsTab = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [viewMode, setViewMode] = useState(localStorage.getItem('viewMode_products') || 'list');
    const [previewProduct, setPreviewProduct] = useState(null);
    const [previewActiveImg, setPreviewActiveImg] = useState('');

    const token = localStorage.getItem('merchantToken');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, categoryFilter]);

    const fetchData = async () => {
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const [productsRes, categoriesRes] = await Promise.all([
                fetch(`${API_URL}/products`, { headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId } }),
                fetch(`${API_URL}/categories`, { headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId } })
            ]);
            const productsData = await productsRes.json();
            const categoriesData = await categoriesRes.json();
            if (productsRes.ok) setProducts(productsData);
            if (categoriesRes.ok) setCategories(categoriesData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                setProducts(prev => prev.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
                showToast(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
            }
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/products/${deleteModal.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
            });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p._id !== deleteModal.id));
                showToast('Product deleted successfully');
            }
        } catch (err) {
            showToast('Failed to delete product', 'error');
        }
        setDeleteModal({ open: false, id: null, name: '' });
    };

    const getFilterCount = (filter) => {
        if (filter === 'all') return products.length;
        if (filter === 'active') return products.filter(p => p.isActive).length;
        if (filter === 'inactive') return products.filter(p => !p.isActive).length;
        if (filter === 'featured') return products.filter(p => p.isFeatured || (p.tags && p.tags.includes('featured'))).length;
        return 0;
    };

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
        
        let matchesStatus = true;
        if (statusFilter === 'active') {
            matchesStatus = p.isActive;
        } else if (statusFilter === 'inactive') {
            matchesStatus = !p.isActive;
        } else if (statusFilter === 'featured') {
            matchesStatus = p.isFeatured || (p.tags && p.tags.includes('featured'));
        }
        
        const matchesCategory = categoryFilter === 'all' || (p.category && p.category._id === categoryFilter);
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenPreview = (product) => {
        setPreviewProduct(product);
        if (product.images && product.images.length > 0) {
            setPreviewActiveImg(`${API_URL.replace('/api', '')}${product.images[0]}`);
        } else {
            setPreviewActiveImg('');
        }
    };

    const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

    const getDiscount = (actual, selling) => {
        if (actual <= 0 || selling >= actual) return null;
        return Math.round(((actual - selling) / actual) * 100);
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-6 w-32 bg-gray-200 rounded-md"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                </div>
                {/* Filter Skeleton */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="h-10 flex-grow bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
                </div>
                {/* Table Skeleton */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex gap-4">
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-5 border-b border-gray-50 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                            <div className="space-y-2 flex-grow">
                                <div className="h-4 w-48 bg-gray-200 rounded"></div>
                                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                            <div className="ml-auto flex gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                                <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-300 ${
                    toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {toast.type === 'success'
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        }
                    </svg>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Products</h1>
                    <p className="text-sm text-[#5c5f62] mt-1">{products.length} products total</p>
                </div>
                <Link
                    to="/dashboard/products/new"
                    className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or SKU..."
                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/10 cursor-pointer"
                >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
                <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
                    {['all', 'active', 'inactive', 'featured'].map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all capitalize flex items-center gap-1.5 ${
                                statusFilter === f ? 'bg-[#1a1c23] text-white shadow-sm' : 'text-[#5c5f62] hover:bg-gray-50'
                            }`}
                        >
                            <span>{f}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                statusFilter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {getFilterCount(f)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 sm:ml-auto">
                    <button
                        onClick={() => { setViewMode('list'); localStorage.setItem('viewMode_products', 'list'); }}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#1a1c23] text-white shadow-sm' : 'text-[#5c5f62] hover:bg-gray-50'}`}
                        title="List View"
                    >
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => { setViewMode('card'); localStorage.setItem('viewMode_products', 'card'); }}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-[#1a1c23] text-white shadow-sm' : 'text-[#5c5f62] hover:bg-gray-50'}`}
                        title="Cards View"
                    >
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-[#202223] mb-1">No products found</h3>
                    <p className="text-sm text-[#5c5f62] mb-4">Add your first product to start selling</p>
                    <Link to="/dashboard/products/new" className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {viewMode === 'list' ? (
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Product</th>
                                            <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3 hidden lg:table-cell">Category</th>
                                            <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3 hidden md:table-cell">SKU</th>
                                            <th className="text-right text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Price</th>
                                            <th className="text-center text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3 hidden md:table-cell">Stock</th>
                                            <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Status</th>
                                            <th className="text-right text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((product, idx) => {
                                            const discount = getDiscount(product.actualPrice, product.sellingPrice);
                                            return (
                                                <tr key={product._id} className={`group hover:bg-gray-50/80 transition-colors ${idx !== paginatedItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                                {product.images && product.images.length > 0 ? (
                                                                    <img src={`${API_URL.replace('/api', '')}${product.images[0]}`} alt={product.name} className="w-full h-full object-contain p-0.5 bg-white" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-sm text-[#202223] truncate">{product.name}</p>
                                                                {product.brandName && <p className="text-xs text-[#5c5f62] truncate">{product.brandName}</p>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 hidden lg:table-cell">
                                                        <span className="text-sm text-[#5c5f62]">{product.category?.name || '—'}</span>
                                                    </td>
                                                    <td className="px-5 py-3 hidden md:table-cell">
                                                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-[#5c5f62]">{product.sku || '—'}</span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2 flex-wrap">
                                                            <span className="font-bold text-sm text-[#202223]">{formatPrice(product.sellingPrice)}</span>
                                                            {discount && (
                                                                <>
                                                                    <span className="text-xs text-gray-400 line-through">{formatPrice(product.actualPrice)}</span>
                                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{discount}% off</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-center hidden md:table-cell">
                                                        <span className={`text-sm font-bold ${product.stock > 0 ? 'text-[#202223]' : 'text-red-500'}`}>
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <button
                                                            onClick={() => handleToggleStatus(product._id, product.isActive)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                                product.isActive
                                                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                                            {product.isActive ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleOpenPreview(product)}
                                                                className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-black"
                                                                title="View Details"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                            <Link
                                                                to={`/dashboard/products/edit/${product._id}`}
                                                                className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-black"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </Link>
                                                            <button
                                                                onClick={() => setDeleteModal({ open: true, id: product._id, name: product.name })}
                                                                className="p-2 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-500"
                                                                title="Delete"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedItems.map((product) => {
                                const discount = getDiscount(product.actualPrice, product.sellingPrice);
                                const statusColor = product.isActive 
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200';
                                return (
                                    <div key={product._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                                        {/* Image Container */}
                                        <div className="aspect-[4/3] bg-gray-50/50 relative overflow-hidden flex items-center justify-center p-3 border-b border-gray-100/50">
                                            {product.images && product.images.length > 0 ? (
                                                <img src={`${API_URL.replace('/api', '')}${product.images[0]}`} alt={product.name} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="text-gray-400">
                                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            
                                            {/* Discount Badge */}
                                            {discount && (
                                                <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide uppercase">
                                                    {discount}% OFF
                                                </span>
                                            )}

                                            {/* Featured Badge */}
                                            {(product.isFeatured || (product.tags && product.tags.includes('featured'))) && (
                                                <span className="absolute top-3 right-3 bg-teal-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide uppercase flex items-center gap-0.5 shadow-sm">
                                                    ★ Featured
                                                </span>
                                            )}
                                        </div>

                                        {/* Content Body */}
                                        <div className="p-4 flex-grow flex flex-col space-y-3.5">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-sm text-[#202223] line-clamp-1 group-hover:text-black transition-colors" title={product.name}>
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center justify-between text-xs text-gray-400">
                                                    <span>{product.brandName || 'No Brand'}</span>
                                                    {product.sku && <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{product.sku}</span>}
                                                </div>
                                            </div>

                                            {/* Category */}
                                            <div>
                                                <span className="inline-flex items-center bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    {product.category?.name || 'Uncategorized'}
                                                </span>
                                            </div>

                                            {/* Price and Stock */}
                                            <div className="flex items-baseline justify-between pt-1">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="font-extrabold text-base text-[#202223]">{formatPrice(product.sellingPrice)}</span>
                                                    {discount && <span className="text-xs text-gray-400 line-through">{formatPrice(product.actualPrice)}</span>}
                                                </div>
                                                <div>
                                                    {product.stock > 10 ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                                            {product.stock} in stock
                                                        </span>
                                                    ) : product.stock > 0 ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                                                            <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                                                            Only {product.stock} left
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                            <div className="w-1 h-1 rounded-full bg-red-400"></div>
                                                            Out of stock
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                                                <button
                                                    onClick={() => handleToggleStatus(product._id, product.isActive)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${statusColor}`}
                                                >
                                                    <div className={`w-1 h-1 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                                
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleOpenPreview(product)}
                                                        className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-teal-600 transition-colors"
                                                        title="Quick View"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <Link
                                                        to={`/dashboard/products/edit/${product._id}`}
                                                        className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-black transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, id: product._id, name: product.name })}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Unified Pagination Footer */}
                    <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <div className="text-xs text-[#5c5f62] font-medium">
                            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            currentPage === i + 1
                                                ? 'bg-[#1a1c23] text-white shadow-sm'
                                                : 'text-[#5c5f62] hover:bg-gray-50 border border-transparent'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-[#202223]">Delete Product</h3>
                            <p className="text-sm text-[#5c5f62] mt-1">Are you sure you want to delete <strong>{deleteModal.name}</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal({ open: false, id: null, name: '' })} className="flex-1 px-4 py-2.5 bg-gray-100 text-[#202223] rounded-lg font-bold text-sm hover:bg-gray-200 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Quick View Modal */}
            {previewProduct && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewProduct(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100" onClick={e => e.stopPropagation()}>
                        
                        {/* Image Panel */}
                        <div className="sm:w-1/2 p-6 flex flex-col justify-center items-center bg-gray-50/50 rounded-t-3xl sm:rounded-t-none sm:rounded-l-3xl">
                            <div className="w-full aspect-square bg-white border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center p-4 relative shadow-sm">
                                {previewActiveImg ? (
                                    <img src={previewActiveImg} alt={previewProduct.name} className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <div className="text-gray-400 flex flex-col items-center gap-2">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs">No images</span>
                                    </div>
                                )}

                                {/* Featured Badge */}
                                {(previewProduct.isFeatured || (previewProduct.tags && previewProduct.tags.includes('featured'))) && (
                                    <span className="absolute top-3 right-3 bg-teal-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide uppercase shadow-sm">
                                        ★ Featured
                                    </span>
                                )}
                            </div>

                            {/* Thumbnail strip */}
                            {previewProduct.images && previewProduct.images.length > 1 && (
                                <div className="flex gap-2 mt-4 overflow-x-auto max-w-full py-1">
                                    {previewProduct.images.map((img, idx) => {
                                        const fullUrl = `${API_URL.replace('/api', '')}${img}`;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setPreviewActiveImg(fullUrl)}
                                                className={`w-12 h-12 rounded-lg border bg-white p-0.5 transition-all flex-shrink-0 ${
                                                    previewActiveImg === fullUrl ? 'border-black ring-2 ring-black/5' : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                            >
                                                <img src={fullUrl} alt="" className="w-full h-full object-contain rounded-md" />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Details Panel */}
                        <div className="sm:w-1/2 p-6 flex flex-col relative">
                            {/* Close Button */}
                            <button
                                onClick={() => setPreviewProduct(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="space-y-4 pr-6 flex-grow">
                                <div>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                        {previewProduct.category?.name || 'Uncategorized'}
                                    </span>
                                    <h2 className="font-bold text-xl text-[#202223] mt-2 tracking-tight leading-snug">{previewProduct.name}</h2>
                                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                                        <span>Brand: <strong>{previewProduct.brandName || 'No Brand'}</strong></span>
                                        <span>•</span>
                                        <span>SKU: <strong className="font-mono bg-gray-50 px-1 py-0.5 rounded">{previewProduct.sku || '—'}</strong></span>
                                    </div>
                                </div>

                                <div className="border-t border-b border-gray-50 py-3 flex items-baseline justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-xs text-gray-400 font-medium">Selling Price</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-extrabold text-2xl text-black">{formatPrice(previewProduct.sellingPrice)}</span>
                                            {getDiscount(previewProduct.actualPrice, previewProduct.sellingPrice) && (
                                                <span className="text-sm text-gray-400 line-through">{formatPrice(previewProduct.actualPrice)}</span>
                                            )}
                                        </div>
                                    </div>

                                    {getDiscount(previewProduct.actualPrice, previewProduct.sellingPrice) && (
                                        <span className="bg-red-500 text-white font-black text-[10px] tracking-wide uppercase px-2 py-1 rounded-lg">
                                            {getDiscount(previewProduct.actualPrice, previewProduct.sellingPrice)}% OFF
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-medium">Status</span>
                                        <span className={`font-bold flex items-center gap-1 ${previewProduct.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${previewProduct.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                            {previewProduct.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-medium">Stock Availability</span>
                                        <span className={`font-bold ${previewProduct.stock > 0 ? 'text-[#202223]' : 'text-red-500'}`}>
                                            {previewProduct.stock > 0 ? `${previewProduct.stock} items left` : 'Out of Stock'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Description</p>
                                    <p className="text-xs text-gray-600 leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
                                        {previewProduct.description || 'No description provided for this product.'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                                <Link
                                    to={`/dashboard/products/edit/${previewProduct._id}`}
                                    className="flex-1 text-center py-2.5 border border-gray-200 text-[#202223] rounded-xl font-bold text-xs hover:bg-gray-50 transition-all"
                                >
                                    Edit Details
                                </Link>
                                <button
                                    onClick={() => setPreviewProduct(null)}
                                    className="flex-1 py-2.5 bg-[#1a1c23] text-white rounded-xl font-bold text-xs hover:bg-black transition-all"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleVendorProductsTab;
