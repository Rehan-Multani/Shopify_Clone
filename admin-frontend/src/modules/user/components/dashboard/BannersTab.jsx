import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const API_URL = CATALOG_API_URL;

const BannersTab = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const token = localStorage.getItem('merchantToken');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const fetchBanners = async () => {
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/banners`, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
            });
            const data = await res.json();
            if (res.ok) setBanners(data);
        } catch (err) {
            console.error('Failed to fetch banners:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/banners/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                setBanners(prev => prev.map(b => b._id === id ? { ...b, isActive: !currentStatus } : b));
                showToast(`Banner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            }
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/banners/${deleteModal.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
            });
            if (res.ok) {
                setBanners(prev => prev.filter(b => b._id !== deleteModal.id));
                showToast('Banner deleted successfully');
            }
        } catch (err) {
            showToast('Failed to delete banner', 'error');
        }
        setDeleteModal({ open: false, id: null, title: '' });
    };

    const filtered = banners.filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? b.isActive : !b.isActive);
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
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-5 border-b border-gray-50 flex items-center gap-4">
                            <div className="w-16 h-10 rounded-lg bg-gray-200"></div>
                            <div className="h-4 w-48 bg-gray-200 rounded"></div>
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
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
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
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Banners</h1>
                    <p className="text-sm text-[#5c5f62] mt-1">Manage promotional banners for your store homepage</p>
                </div>
                <Link
                    to="/dashboard/banners/new"
                    className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Banner
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
                        placeholder="Search banners..."
                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
                    {['all', 'active', 'inactive'].map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${statusFilter === f ? 'bg-[#1a1c23] text-white shadow-sm' : 'text-[#5c5f62] hover:bg-gray-50'
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-[#202223] mb-1">No banners found</h3>
                    <p className="text-sm text-[#5c5f62] mb-4">Add your first promotional banner to display on your store</p>
                    <Link to="/dashboard/banners/new" className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Banner
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Banner</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Title</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Status</th>
                                    <th className="text-right text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedItems.map((banner, idx) => (
                                    <tr key={banner._id} className={`group hover:bg-gray-50/80 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                        <td className="px-5 py-3">
                                            <div className="w-24 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                {banner.image ? (
                                                    <img src={resolveMediaUrl(banner.image, API_URL)} alt={banner.title} className="w-full h-full object-cover" />
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
                                            <span className="font-bold text-sm text-[#202223]">{banner.title}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => handleToggleStatus(banner._id, banner.isActive)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${banner.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${banner.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                                {banner.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    to={`/dashboard/banners/edit/${banner._id}`}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-black"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModal({ open: true, id: banner._id, title: banner.title })}
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
                    <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal({ open: false, id: null, title: '' })}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-[#202223]">Delete Banner</h3>
                            <p className="text-sm text-[#5c5f62] mt-1">Are you sure you want to delete <strong>{deleteModal.title}</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal({ open: false, id: null, title: '' })} className="flex-1 px-4 py-2.5 bg-gray-100 text-[#202223] rounded-lg font-bold text-sm hover:bg-gray-200 transition-all">
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

export default BannersTab;
