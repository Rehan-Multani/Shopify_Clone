    import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const API_URL = CATALOG_API_URL;

const CouponsTab = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, code: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const token = localStorage.getItem('merchantToken') || localStorage.getItem('vendorToken');
    const isVendor = window.location.pathname.startsWith('/vendor');
    const dashboardPrefix = isVendor ? '/vendor/dashboard' : '/dashboard';
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const fetchCoupons = async () => {
        try {
            const storeId = localStorage.getItem('activeStoreId');
            const res = await fetch(`${API_URL}/coupons`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            const data = await res.json();
            if (res.ok) setCoupons(data);
        } catch (err) {
            console.error('Failed to fetch coupons:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleApproveCoupon = async (id) => {
        try {
            const storeId = localStorage.getItem('activeStoreId');
            const res = await fetch(`${API_URL}/coupons/${id}/approve`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Coupon approved successfully');
                fetchCoupons();
            } else {
                showToast(data.message || 'Failed to approve coupon', 'error');
            }
        } catch (err) {
            showToast('Failed to approve coupon', 'error');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const storeId = localStorage.getItem('activeStoreId');
            const res = await fetch(`${API_URL}/coupons/${id}/toggle`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            const data = await res.json();
            if (res.ok) {
                setCoupons(prev => prev.map(c => c._id === id ? data : c));
                showToast(`Coupon ${data.isActive ? 'activated' : 'deactivated'}`);
            }
        } catch (err) {
            showToast('Failed to toggle status', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            const storeId = localStorage.getItem('activeStoreId');
            const res = await fetch(`${API_URL}/coupons/${deleteModal.id}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            if (res.ok) {
                setCoupons(prev => prev.filter(c => c._id !== deleteModal.id));
                showToast('Coupon deleted successfully');
            }
        } catch (err) {
            showToast('Failed to delete coupon', 'error');
        }
        setDeleteModal({ open: false, id: null, code: '' });
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getCouponStatus = (coupon) => {
        const now = new Date();
        if (coupon.isApproved === false) return { label: 'Pending Approval', color: 'orange' };
        if (!coupon.isActive) return { label: 'Inactive', color: 'gray' };
        if (coupon.endDate && new Date(coupon.endDate) < now) return { label: 'Expired', color: 'red' };
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { label: 'Exhausted', color: 'orange' };
        if (coupon.startDate && new Date(coupon.startDate) > now) return { label: 'Scheduled', color: 'blue' };
        return { label: 'Active', color: 'emerald' };
    };

    const filtered = coupons.filter(c => {
        const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase()) || (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
        if (statusFilter === 'all') return matchesSearch;
        const status = getCouponStatus(c);
        if (statusFilter === 'pending') return matchesSearch && c.isApproved === false;
        if (statusFilter === 'active') return matchesSearch && status.label === 'Active';
        if (statusFilter === 'inactive') return matchesSearch && (status.label === 'Inactive' || status.label === 'Expired' || status.label === 'Exhausted');
        return matchesSearch;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const statusColors = {
        emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80',
        gray: 'bg-gray-100 text-gray-500 hover:bg-gray-200/80',
        red: 'bg-red-50 text-red-600 hover:bg-red-100/80',
        orange: 'bg-amber-50 text-amber-700 hover:bg-amber-100/80',
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100/80'
    };

    const dotColors = {
        emerald: 'bg-emerald-500',
        gray: 'bg-gray-400',
        red: 'bg-red-500',
        orange: 'bg-amber-500',
        blue: 'bg-blue-500'
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-6 w-32 bg-gray-200 rounded-md"></div>
                        <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 flex-grow bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex gap-4">
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Coupons</h1>
                    <p className="text-sm text-[#5c5f62] mt-1">Create discount coupons for your products</p>
                </div>
                <Link
                    to={`${dashboardPrefix}/coupons/new`}
                    className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Coupon
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by coupon code..."
                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
                    {['all', 'pending', 'active', 'inactive'].map(f => (
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

            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-[#202223] mb-1">No coupons found</h3>
                    <p className="text-sm text-[#5c5f62] mb-4">Create your first coupon to offer discounts</p>
                    <Link to={`${dashboardPrefix}/coupons/new`} className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Coupon
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Code</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Discount</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3 hidden md:table-cell">Min Order</th>
                                    <th className="text-center text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3 hidden lg:table-cell">Usage</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3 hidden lg:table-cell">Validity</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Status</th>
                                    <th className="text-right text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedItems.map((coupon, idx) => {
                                    const status = getCouponStatus(coupon);
                                    return (
                                        <tr key={coupon._id} className={`group hover:bg-gray-50/80 transition-colors ${idx !== paginatedItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-sm text-[#202223] font-mono tracking-wide">{coupon.code}</span>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(coupon.code);
                                                                    showToast('Coupon code copied!');
                                                                }}
                                                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-black transition-all"
                                                                title="Copy Code"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        {coupon.description && <p className="text-xs text-[#5c5f62] truncate max-w-[140px]">{coupon.description}</p>}
                                                        {coupon.vendor && !isVendor && (
                                                            <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-teal-50 text-[9px] text-teal-600 rounded font-bold uppercase tracking-wider">
                                                                Vendor Coupon
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="font-bold text-sm text-[#202223]">
                                                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                                </span>
                                                <p className="text-[10px] text-gray-400 uppercase">{coupon.discountType}</p>
                                            </td>
                                            <td className="px-5 py-3 hidden md:table-cell">
                                                <span className="text-sm text-[#5c5f62]">
                                                    {coupon.minimumOrderAmount > 0 ? `₹${coupon.minimumOrderAmount.toLocaleString('en-IN')}` : 'None'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-center hidden lg:table-cell">
                                                <span className="text-sm font-bold text-[#202223]">{coupon.usedCount}</span>
                                                <span className="text-xs text-gray-400">/{coupon.usageLimit || '∞'}</span>
                                            </td>
                                            <td className="px-5 py-3 hidden lg:table-cell">
                                                <div className="text-xs text-[#5c5f62]">
                                                    <p>{formatDate(coupon.startDate)}</p>
                                                    <p className="text-gray-400">{coupon.endDate ? `to ${formatDate(coupon.endDate)}` : 'No expiry'}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <button
                                                    onClick={() => {
                                                        if (coupon.isApproved !== false && !isVendor) {
                                                            handleToggleStatus(coupon._id);
                                                        }
                                                    }}
                                                    disabled={coupon.isApproved === false || isVendor}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${statusColors[status.color]} ${coupon.isApproved === false ? 'cursor-not-allowed' : isVendor ? 'cursor-default' : ''}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${dotColors[status.color]}`}></div>
                                                    {status.label}
                                                </button>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {coupon.isApproved === false && !isVendor && (
                                                        <button
                                                            onClick={() => handleApproveCoupon(coupon._id)}
                                                            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                                            title="Approve Coupon"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Approve
                                                        </button>
                                                    )}
                                                    <Link
                                                        to={`${dashboardPrefix}/coupons/edit/${coupon._id}`}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-black"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, id: coupon._id, code: coupon.code })}
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

            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal({ open: false, id: null, code: '' })}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-[#202223]">Delete Coupon</h3>
                            <p className="text-sm text-[#5c5f62] mt-1">Are you sure you want to delete <strong className="font-mono">{deleteModal.code}</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal({ open: false, id: null, code: '' })} className="flex-1 px-4 py-2.5 bg-gray-100 text-[#202223] rounded-lg font-bold text-sm hover:bg-gray-200 transition-all">
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

export default CouponsTab;
