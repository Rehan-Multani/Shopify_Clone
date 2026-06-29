import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;

const VendorsTabSingle = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deletingVendor, setDeletingVendor] = useState(null);
    const [toast, setToast] = useState(null);

    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
    };

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${CATALOG_API_URL}/vendors`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            const data = await res.json();
            if (res.ok) {
                setVendors(data);
            } else {
                showToast(data.message || 'Failed to fetch vendors', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to connect to server', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storeId) {
            fetchVendors();
        }
    }, [storeId]);

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`${CATALOG_API_URL}/vendors/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            const data = await res.json();
            if (res.ok) {
                setVendors(prev => prev.map(v => v._id === id ? { ...v, isActive: !currentStatus } : v));
                showToast(`Vendor status updated successfully`, 'success');
            } else {
                showToast(data.message || 'Failed to update vendor status', 'error');
            }
        } catch (err) {
            showToast('Failed to connect to server', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deletingVendor) return;
        try {
            const res = await fetch(`${CATALOG_API_URL}/vendors/${deletingVendor._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            const data = await res.json();
            if (res.ok) {
                setVendors(prev => prev.filter(v => v._id !== deletingVendor._id));
                showToast(`Vendor deleted successfully`, 'success');
            } else {
                showToast(data.message || 'Failed to delete vendor', 'error');
            }
        } catch (err) {
            showToast('Failed to connect to server', 'error');
        } finally {
            setDeletingVendor(null);
        }
    };

    // Filtered list
    const filteredVendors = vendors.filter(v => 
        (v.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.city || '').toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: vendors.length,
        active: vendors.filter(v => v.isActive).length,
        inactive: vendors.filter(v => !v.isActive).length
    };

    // Modal Component
    const DeleteModal = () => {
        if (!deletingVendor) return null;
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-6">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-base font-bold text-[#202223] mb-1.5">Delete Vendor</h3>
                        <p className="text-sm text-[#5c5f62]">Are you sure you want to delete the vendor <strong>{deletingVendor.name}</strong>? This action cannot be undone.</p>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 flex gap-2 justify-end border-t border-gray-100">
                        <button onClick={() => setDeletingVendor(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-[#5c5f62] hover:bg-gray-100 transition-all">Cancel</button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all">Delete Vendor</button>
                    </div>
                </div>
            </div>
        );
    };

    // Toast Component
    const Toast = () => {
        if (!toast) return null;
        setTimeout(() => setToast(null), 3000);
        return (
            <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#1a1c23]'}`}>
                {toast.type === 'success' ? (
                    <svg className="w-4 h-4 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                {toast.msg}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Toast />
            <DeleteModal />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Vendors</h1>
                    <p className="text-xs text-[#5c5f62] mt-0.5">Manage third party vendors, suppliers, and their commissions.</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/vendors/new')}
                    className="bg-[#1a1c23] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 shadow-md shadow-black/10 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Add Vendor
                </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Vendors', value: stats.total, color: '#202223' },
                    { label: 'Active', value: stats.active, color: '#15803d' },
                    { label: 'Inactive', value: stats.inactive, color: '#b91c1c' }
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
                        <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs font-semibold text-[#5c5f62] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* List and Filter Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-150 flex items-center justify-between gap-4 flex-wrap">
                    <h3 className="text-sm font-bold text-[#202223]">Vendor Directory</h3>
                    <div className="relative">
                        <svg className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search vendors..."
                            className="pl-9 pr-4 py-1.5 border border-[#d3d3d3] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white w-56" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-16 text-center text-sm text-[#9CA3AF]">
                            Loading vendors...
                        </div>
                    ) : filteredVendors.length === 0 ? (
                        <div className="py-16 text-center text-sm text-[#9CA3AF]">
                            No vendors found matching your search.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    {['Vendor Info', 'Mobile', 'City', 'Commission', 'Status', 'Joined Date', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredVendors.map(v => (
                                    <tr key={v._id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div>
                                                <p className="text-sm font-bold text-[#202223]">{v.name}</p>
                                                <p className="text-[11px] text-[#9CA3AF]">{v.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-[#5c5f62]">{v.mobile}</td>
                                        <td className="px-5 py-3.5 text-sm text-[#5c5f62]">{v.city || '-'}</td>
                                        <td className="px-5 py-3.5 text-sm font-bold text-[#202223]">{v.commission}%</td>
                                        <td className="px-5 py-3.5">
                                            <button 
                                                onClick={() => handleToggleStatus(v._id, v.isActive)}
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${
                                                    v.isActive 
                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${v.isActive ? 'bg-emerald-600' : 'bg-red-600'}`} />
                                                {v.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">
                                            {new Date(v.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => navigate(`/dashboard/vendors/edit/${v._id}`)}
                                                    className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                                                    title="Edit Vendor"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button 
                                                    onClick={() => setDeletingVendor(v)}
                                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Vendor"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorsTabSingle;
