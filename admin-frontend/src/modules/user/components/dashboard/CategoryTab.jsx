import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const API_URL = CATALOG_API_URL;

const CategoryTab = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [viewMode, setViewMode] = useState(localStorage.getItem('viewMode_categories') || 'list');

    const token = localStorage.getItem('merchantToken');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const fetchCategories = async () => {
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/categories`, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
            });
            const data = await res.json();
            if (res.ok) setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                setCategories(prev => prev.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
                showToast(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            }
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/categories/${deleteModal.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
            });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c._id !== deleteModal.id));
                showToast('Category deleted successfully');
            }
        } catch (err) {
            showToast('Failed to delete category', 'error');
        }
        setDeleteModal({ open: false, id: null, name: '' });
    };

    const filtered = categories.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? c.isActive : !c.isActive);
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                <div className="flex gap-3">
                    <div className="h-10 flex-grow bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
                </div>
                {/* Table Skeleton */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex gap-4">
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded hidden md:block"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-5 border-b border-gray-50 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-4 w-64 bg-gray-200 rounded hidden md:block"></div>
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
            {/* Toast Notification */}
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
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Categories</h1>
                    <p className="text-sm text-[#5c5f62] mt-1">Manage your product categories</p>
                </div>
                <Link
                    to="/dashboard/category/new"
                    className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Category
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
                        placeholder="Search categories..."
                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                    />
                </div>
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

                {/* View Mode Toggle */}
                <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 sm:ml-auto">
                    <button
                        onClick={() => { setViewMode('list'); localStorage.setItem('viewMode_categories', 'list'); }}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#1a1c23] text-white shadow-sm' : 'text-[#5c5f62] hover:bg-gray-50'}`}
                        title="List View"
                    >
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => { setViewMode('card'); localStorage.setItem('viewMode_categories', 'card'); }}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-[#202223] mb-1">No categories found</h3>
                    <p className="text-sm text-[#5c5f62] mb-4">Create your first category to organize your products</p>
                    <Link to="/dashboard/category/new" className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Category
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
                                            <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Image</th>
                                            <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Name</th>
                                            <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3 hidden md:table-cell">Description</th>
                                            <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Status</th>
                                            <th className="text-right text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((cat, idx) => (
                                            <tr key={cat._id} className={`group hover:bg-gray-50/80 transition-colors ${idx !== paginatedItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                                <td className="px-5 py-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                        {cat.image ? (
                                                            <img src={`${API_URL.replace('/api', '')}${cat.image}`} alt={cat.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="font-bold text-sm text-[#202223]">{cat.name}</span>
                                                </td>
                                                <td className="px-5 py-3 hidden md:table-cell">
                                                    <span className="text-sm text-[#5c5f62] line-clamp-1 max-w-[200px]">{cat.description || '—'}</span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <button
                                                        onClick={() => handleToggleStatus(cat._id, cat.isActive)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                            cat.isActive 
                                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                                        {cat.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            to={`/dashboard/category/edit/${cat._id}`}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-black"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => setDeleteModal({ open: true, id: cat._id, name: cat.name })}
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedItems.map((cat) => {
                                const statusColor = cat.isActive 
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200';
                                return (
                                    <div key={cat._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                                        {/* Image Header */}
                                        <div className="aspect-video w-full bg-gray-50 border-b border-gray-100 overflow-hidden flex items-center justify-center relative">
                                            {cat.image ? (
                                                <img src={`${API_URL.replace('/api', '')}${cat.image}`} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="text-gray-400">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Category Body */}
                                        <div className="p-4 flex-grow flex flex-col space-y-3">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-sm text-[#202223] truncate">{cat.name}</h3>
                                                <p className="text-xs text-gray-500 line-clamp-2 h-8" title={cat.description}>
                                                    {cat.description || 'No description provided.'}
                                                </p>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                                                <button
                                                    onClick={() => handleToggleStatus(cat._id, cat.isActive)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${statusColor}`}
                                                >
                                                    <div className={`w-1 h-1 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                                    {cat.isActive ? 'Active' : 'Inactive'}
                                                </button>

                                                <div className="flex items-center gap-1">
                                                    <Link
                                                        to={`/dashboard/category/edit/${cat._id}`}
                                                        className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-black transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, id: cat._id, name: cat.name })}
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

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-[#202223]">Delete Category</h3>
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

export default CategoryTab;
