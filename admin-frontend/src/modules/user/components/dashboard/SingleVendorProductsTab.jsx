import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:5003/api';
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

    const token = localStorage.getItem('merchantToken');

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

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? p.isActive : !p.isActive);
        const matchesCategory = categoryFilter === 'all' || (p.category && p.category._id === categoryFilter);
        return matchesSearch && matchesStatus && matchesCategory;
    });

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
                    {['all', 'active', 'inactive'].map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${
                                statusFilter === f ? 'bg-[#1a1c23] text-white shadow-sm' : 'text-[#5c5f62] hover:bg-gray-50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
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
                                {filtered.map((product, idx) => {
                                    const discount = getDiscount(product.actualPrice, product.sellingPrice);
                                    return (
                                        <tr key={product._id} className={`group hover:bg-gray-50/80 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img src={`${API_URL.replace('/api', '')}${product.images[0]}`} alt={product.name} className="w-full h-full object-cover" />
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
                                                    <Link
                                                        to={`/dashboard/products/view/${product._id}`}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-black"
                                                        title="View Details"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
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
                    <div className="px-5 py-3 border-t border-gray-100 text-xs text-[#5c5f62] font-medium">
                        Showing {filtered.length} of {products.length} products
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
        </div>
    );
};

export default SingleVendorProductsTab;
