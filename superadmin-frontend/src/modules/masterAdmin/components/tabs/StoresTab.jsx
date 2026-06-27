import React, { useState, useEffect } from 'react';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

const PlanBadge = ({ plan }) => {
    const planName = plan || 'Single Vendor';
    const map = { 
        'Plus': ['#8B5CF6', '#F5F3FF'], 
        'Advanced': ['#14B8A6', '#F0FDFA'], 
        'Basic': ['#3B82F6', '#EFF6FF'],
        'Single Vendor': ['#10B981', '#ECFDF5'],
        'Multi Vendor': ['#8B5CF6', '#F5F3FF'],
        'Free': ['#6B7280', '#F9FAFB'] 
    };
    const [color, bg] = map[planName] || ['#6B7280', '#F9FAFB'];
    return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color, background: bg }}>{planName}</span>;
};

const StatusBadge = ({ status }) => {
    const map = { active: ['#15803d', '#F0FDF4'], trial: ['#B45309', '#FFFBEB'], suspended: ['#DC2626', '#FEF2F2'] };
    const [color, bg] = map[status] || ['#6B7280', '#F9FAFB'];
    return (
        <span className="flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full w-fit" style={{ color, background: bg }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const Modal = ({ title, onClose, children, width = 'max-w-md' }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div className={`bg-white rounded-2xl shadow-2xl w-full ${width} overflow-hidden`} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="px-6 py-4 border-b border-[#e3e3e3] flex items-center justify-between">
                <h3 className="text-base font-bold text-[#202223]">{title}</h3>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-[#9CA3AF] hover:text-[#202223]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

const Toast = ({ msg, onDone, type = 'success' }) => {
    useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
    return (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold" 
            style={{ background: type === 'error' ? '#DC2626' : '#1a1c23' }}>
            {type === 'success' ? (
                <svg className="w-4 h-4 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {msg}
        </div>
    );
};

const ITEMS_PER_PAGE = 8;
const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const StoresTab = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [merchantFilter, setMerchantFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [viewStore, setViewStore] = useState(null);
    const [messageStore, setMessageStore] = useState(null);
    const [suspendStore, setSuspendStore] = useState(null);
    const [msgText, setMsgText] = useState('');
    const [toast, setToast] = useState(null);

    const getAuthHeaders = () => {
        const info = JSON.parse(localStorage.getItem('masterAdminInfo') || '{}');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${info.token || ''}`
        };
    };

    const fetchStores = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${STORE_API_URL}/stores/admin/all`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (res.ok) {
                // Map API fields into UI-friendly structure
                const formatted = data.map(s => ({
                    id: s._id,
                    name: s.storeName,
                    owner: s.merchantId?.name || 'Unknown Merchant',
                    ownerId: s.merchantId?._id || '',
                    email: s.contactEmail || s.merchantId?.email || 'N/A',
                    phone: s.contactPhone || s.merchantId?.mobile || 'N/A',
                    plan: s.planType || 'Single Vendor',
                    status: s.isActive ? 'active' : 'suspended',
                    gmv: s.revenue || 0,
                    products: s.totalProducts || 0,
                    country: s.state || 'IN',
                    created: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A',
                    revenue: `₹${(s.revenue || 0).toLocaleString()}`,
                    orders: s.totalOrders || 0
                }));
                setStores(formatted);
            } else {
                setToast({ msg: data.message || 'Failed to fetch stores', type: 'error' });
            }
        } catch (err) {
            console.error('Error fetching stores:', err);
            setToast({ msg: 'Network error fetching stores', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    // Get unique list of merchants from fetched stores for the dropdown filter
    const uniqueMerchants = Array.from(
        new Map(
            stores
                .filter(s => s.ownerId)
                .map(s => [s.ownerId, { id: s.ownerId, name: s.owner }])
        ).values()
    );

    const filtered = stores.filter(s => {
        const q = search.toLowerCase();
        const matchSearch = s.name.toLowerCase().includes(q) || 
                            s.owner.toLowerCase().includes(q) || 
                            s.email.toLowerCase().includes(q);
        
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        const matchMerchant = merchantFilter === 'all' || s.ownerId === merchantFilter;
        
        return matchSearch && matchStatus && matchMerchant;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const counts = {
        all: stores.length,
        active: stores.filter(s => s.status === 'active').length,
        trial: stores.filter(s => s.status === 'trial').length,
        suspended: stores.filter(s => s.status === 'suspended').length,
    };

    const doSuspend = async (store) => {
        try {
            const nextActive = store.status === 'suspended';
            const res = await fetch(`${STORE_API_URL}/stores/${store.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ isActive: nextActive })
            });
            if (res.ok) {
                setStores(prev => prev.map(s => s.id === store.id ? { ...s, status: nextActive ? 'active' : 'suspended' } : s));
                setToast({ msg: `${store.name} ${nextActive ? 'reactivated' : 'suspended'} successfully` });
            } else {
                setToast({ msg: 'Failed to update store status', type: 'error' });
            }
        } catch (err) {
            console.error('Error suspending store:', err);
            setToast({ msg: 'Network error updating store status', type: 'error' });
        } finally {
            setSuspendStore(null);
        }
    };

    const doMessage = () => {
        setMessageStore(null);
        setMsgText('');
        setToast({ msg: `Message sent to ${messageStore.owner}` });
    };

    const doExport = () => setToast({ msg: 'CSV export downloaded successfully' });

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 w-64 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                    <div className="h-9 w-28 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>

                {/* KPI Grid Skeleton */}
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="bg-white border border-[#e3e3e3] rounded-xl p-5 space-y-3">
                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                    ))}
                </div>

                {/* Filter Bar Skeleton */}
                <div className="bg-white border border-[#e3e3e3] rounded-xl p-4 space-y-3">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="h-10 w-full md:w-80 bg-gray-200 animate-pulse rounded-lg"></div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
                            <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
                            <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
                        </div>
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="bg-white border border-[#e3e3e3] rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-4">
                        {[1, 2, 3, 4, 5, 6].map(n => (
                            <div key={n} className="h-4 flex-1 bg-gray-200 animate-pulse rounded"></div>
                        ))}
                    </div>
                    <div className="divide-y divide-gray-100">
                        {[1, 2, 3, 4, 5].map(row => (
                            <div key={row} className="p-4 flex gap-4 items-center">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse"></div>
                                    <div className="h-4 w-28 bg-gray-200 animate-pulse rounded"></div>
                                </div>
                                <div className="h-4 flex-1 bg-gray-200 animate-pulse rounded"></div>
                                <div className="h-4 flex-1 bg-gray-200 animate-pulse rounded"></div>
                                <div className="h-4 flex-1 bg-gray-200 animate-pulse rounded"></div>
                                <div className="h-4 flex-1 bg-gray-200 animate-pulse rounded"></div>
                                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Stores</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Manage all merchant stores on the platform.</p>
                </div>
                <button onClick={doExport} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95" style={{ background: '#1a1c23' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Stores', value: counts.all },
                    { label: 'Active', value: counts.active, color: '#15803d' },
                    { label: 'Trial', value: counts.trial, color: '#B45309' },
                    { label: 'Suspended', value: counts.suspended, color: '#DC2626' },
                ].map(s => (
                    <div key={s.label} className={`${card} p-4`}>
                        <p className="text-2xl font-black" style={{ color: s.color || '#202223' }}>{s.value}</p>
                        <p className="text-xs font-semibold text-[#5c5f62] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className={card}>
                <div className="px-5 py-4 border-b border-[#e3e3e3] flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        {/* Status Filters */}
                        <div className="flex items-center gap-1 bg-[#f6f6f7] rounded-lg p-1">
                            {['all', 'active', 'suspended'].map(f => (
                                <button key={f} onClick={() => { setStatusFilter(f); setPage(1); }}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${statusFilter === f ? 'bg-white shadow-sm text-[#202223]' : 'text-[#5c5f62] hover:text-[#202223]'}`}>
                                    {f === 'all' ? `All (${counts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f] || 0})`}
                                </button>
                            ))}
                        </div>

                        {/* Merchant Selector Dropdown Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">Merchant:</span>
                            <select 
                                value={merchantFilter} 
                                onChange={e => { setMerchantFilter(e.target.value); setPage(1); }}
                                className="px-3 py-1.5 border border-[#d3d3d3] rounded-lg text-xs font-semibold focus:outline-none bg-white min-w-[140px] cursor-pointer"
                            >
                                <option value="all">All Merchants</option>
                                {uniqueMerchants.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="relative">
                        <svg className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search stores..."
                            className="pl-9 pr-4 py-1.5 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white w-56" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#f0f0f0]">
                                {['Store', 'Owner', 'Plan', 'Status', 'Revenue', 'Orders', 'Created', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-[#9CA3AF]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((s, i) => (
                                <tr key={s.id} className={`border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors ${i === paginated.length - 1 ? 'border-0' : ''}`}>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: '#1a1c23' }}>
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#202223]">{s.name}</p>
                                                <p className="text-[11px] text-[#9CA3AF]">{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-[#5c5f62] font-medium">{s.owner}</td>
                                    <td className="px-5 py-3.5"><PlanBadge plan={s.plan} /></td>
                                    <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                                    <td className="px-5 py-3.5 text-sm font-bold text-[#202223]">{s.revenue}</td>
                                    <td className="px-5 py-3.5 text-sm text-[#5c5f62]">{s.orders}</td>
                                    <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">{s.created}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setViewStore(s)} title="View details"
                                                className="p-1.5 hover:bg-blue-50 rounded-lg transition-all text-[#9CA3AF] hover:text-blue-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button onClick={() => setMessageStore(s)} title="Message owner"
                                                className="p-1.5 hover:bg-green-50 rounded-lg transition-all text-[#9CA3AF] hover:text-green-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" /></svg>
                                            </button>
                                            <button onClick={() => setSuspendStore(s)} title={s.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                                className={`p-1.5 rounded-lg transition-all ${s.status === 'suspended' ? 'hover:bg-green-50 hover:text-green-600' : 'hover:bg-red-50 hover:text-red-500'} text-[#9CA3AF]`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {paginated.length === 0 && <div className="py-16 text-center"><p className="text-[#9CA3AF] text-sm">No stores match your search.</p></div>}
                </div>

                {totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-[#e3e3e3] flex items-center justify-between">
                        <p className="text-xs text-[#9CA3AF]">Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} stores</p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-[#e3e3e3] rounded-lg disabled:opacity-40 hover:bg-gray-50">
                                <svg className="w-4 h-4 text-[#5c5f62]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === page ? 'text-white' : 'text-[#5c5f62] hover:bg-gray-50 border border-[#e3e3e3]'}`}
                                    style={p === page ? { background: '#1a1c23' } : {}}>{p}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-[#e3e3e3] rounded-lg disabled:opacity-40 hover:bg-gray-50">
                                <svg className="w-4 h-4 text-[#5c5f62]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Store Details Modal */}
            {viewStore && (
                <Modal title="Store Details" onClose={() => setViewStore(null)} width="max-w-lg">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b border-[#f0f0f0]">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black text-white" style={{ background: '#1a1c23' }}>
                                {viewStore.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#202223]">{viewStore.name}</h3>
                                <p className="text-sm text-[#9CA3AF]">{viewStore.email}</p>
                                <div className="flex items-center gap-2 mt-1"><PlanBadge plan={viewStore.plan} /><StatusBadge status={viewStore.status} /></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ['Owner', viewStore.owner], ['Phone', viewStore.phone],
                                ['Total Orders', viewStore.orders], ['Total Revenue', viewStore.revenue],
                                ['Created', viewStore.created], ['Status', viewStore.status],
                            ].map(([k, v]) => (
                                <div key={k} className="bg-[#f6f6f7] rounded-lg p-3">
                                    <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">{k}</p>
                                    <p className="text-sm font-bold text-[#202223] mt-0.5 capitalize">{v}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => { setMessageStore(viewStore); setViewStore(null); }}
                                className="flex-1 py-2.5 rounded-lg text-sm font-bold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">
                                Message Owner
                            </button>
                            <button onClick={() => { setSuspendStore(viewStore); setViewStore(null); }}
                                className="px-4 py-2.5 rounded-lg text-sm font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all">
                                {viewStore.status === 'suspended' ? 'Reactivate Store' : 'Suspend Store'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Message Modal */}
            {messageStore && (
                <Modal title={`Message — ${messageStore.owner}`} onClose={() => setMessageStore(null)}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-[#f6f6f7] rounded-lg">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#1a1c23' }}>
                                {messageStore.owner.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#202223]">{messageStore.owner}</p>
                                <p className="text-xs text-[#9CA3AF]">{messageStore.email}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Subject</label>
                            <input type="text" placeholder="e.g. Action required on your store"
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Message</label>
                            <textarea value={msgText} onChange={e => setMsgText(e.target.value)} rows={4}
                                placeholder="Type your message to the merchant..."
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setMessageStore(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">Cancel</button>
                            <button onClick={doMessage} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all active:scale-95" style={{ background: '#1a1c23' }}>Send Message</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Suspend Confirmation Modal */}
            {suspendStore && (
                <Modal title={suspendStore.status === 'suspended' ? 'Reactivate Store' : 'Suspend Store'} onClose={() => setSuspendStore(null)}>
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${suspendStore.status === 'suspended' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <p className={`text-sm font-semibold ${suspendStore.status === 'suspended' ? 'text-green-800' : 'text-red-800'}`}>
                                {suspendStore.status === 'suspended'
                                    ? `Are you sure you want to reactivate "${suspendStore.name}"? The merchant's site will go online immediately.`
                                    : `Are you sure you want to suspend "${suspendStore.name}"? This will take the store storefront offline immediately.`}
                            </p>
                        </div>
                        {suspendStore.status !== 'suspended' && (
                            <div>
                                <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Reason for suspension</label>
                                <select className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none bg-white">
                                    <option>Payment failure</option>
                                    <option>Policy violation</option>
                                    <option>Fraud suspected</option>
                                    <option>Manual review</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button onClick={() => setSuspendStore(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">Cancel</button>
                            <button onClick={() => doSuspend(suspendStore)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all active:scale-95 ${suspendStore.status === 'suspended' ? 'bg-green-600' : 'bg-red-500'}`}
                                style={{ background: suspendStore.status === 'suspended' ? '#16a34a' : '#DC2626' }}>
                                {suspendStore.status === 'suspended' ? 'Yes, Reactivate' : 'Yes, Suspend'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default StoresTab;
