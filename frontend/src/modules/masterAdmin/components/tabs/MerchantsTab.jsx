import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Modal = ({ title, onClose, children, width = 'max-w-md' }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div className={`bg-white rounded-2xl shadow-2xl w-full ${width} overflow-hidden`} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="px-6 py-4 border-b border-[#e3e3e3] flex items-center justify-between">
                <h3 className="text-base font-bold text-[#202223]">{title}</h3>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-[#9CA3AF]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

const Toast = ({ msg, onDone, type = 'success' }) => {
    useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
    return (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold" 
             style={{ background: type === 'error' ? '#EF4444' : '#1a1c23' }}>
            {type === 'success' ? (
                <svg className="w-4 h-4 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {msg}
        </div>
    );
};

const PlanBadge = ({ plan }) => {
    if (!plan) return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-gray-500 bg-gray-100">No Plan</span>;
    
    const planName = typeof plan === 'object' ? plan.planName : plan;
    const map = { Plus: ['#8B5CF6', '#F5F3FF'], Advanced: ['#14B8A6', '#F0FDFA'], Basic: ['#3B82F6', '#EFF6FF'], Free: ['#6B7280', '#F9FAFB'] };
    const [color, bg] = map[planName] || ['#8B5CF6', '#F5F3FF']; // Default to nice custom styles if not matching basic ones
    return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color, background: bg }}>{planName}</span>;
};

const StatusBadge = ({ status }) => {
    const map = { active: ['#15803d', '#F0FDF4'], trial: ['#B45309', '#FFFBEB'], suspended: ['#DC2626', '#FEF2F2'] };
    const [color, bg] = map[status] || ['#6B7280', '#F9FAFB'];
    return (
        <span className="flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full w-fit" style={{ color, background: bg }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : ''}
        </span>
    );
};

const avatarColors = ['#14B8A6', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#10B981'];

const ITEMS_PER_PAGE = 8;
const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const MerchantForm = ({ merchant, plans, onSave, onCancel, isNew, isSaving }) => {
    const [form, setForm] = useState(merchant ? {
        name: merchant.name,
        email: merchant.email,
        mobile: merchant.mobile,
        profile: merchant.profile || '',
        address: merchant.address || '',
        plan: merchant.plan ? (typeof merchant.plan === 'object' ? merchant.plan._id : merchant.plan) : '',
        status: merchant.status || 'active',
        revenue: merchant.revenue || 0,
        gstNumber: merchant.gstNumber || ''
    } : {
        name: '', email: '', mobile: '', profile: '', address: '', plan: '', status: 'active', revenue: 0, gstNumber: ''
    });

    const initialPlanType = merchant?.plan && typeof merchant.plan === 'object' 
        ? merchant.plan.planType 
        : (plans.find(p => p._id === merchant?.plan)?.planType || 'Single Vendor');

    const [planType, setPlanType] = useState(initialPlanType);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const filteredPlans = plans.filter(p => p.planType === planType);

    return (
        <div className="space-y-5">
            {/* Profile Upload & Preview Area */}
            <div className="flex flex-col items-center justify-center pb-4 border-b border-gray-100">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-md bg-gray-50 flex items-center justify-center">
                    {form.profile ? (
                        <img src={form.profile.startsWith('http') || form.profile.startsWith('data:') ? form.profile : `${API_URL.replace('/api', '')}${form.profile}`} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-bold">
                        <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {form.profile ? 'Change' : 'Upload'}
                        <input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            
                            const formData = new FormData();
                            formData.append('profile', file);
                            
                            try {
                                const info = JSON.parse(localStorage.getItem('masterAdminInfo') || '{}');
                                const res = await fetch(`${API_URL}/merchants/upload`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${info.token || ''}`
                                    },
                                    body: formData
                                });
                                const data = await res.json();
                                if (res.ok) {
                                    set('profile', data.url);
                                } else {
                                    alert(data.message || 'Upload failed');
                                }
                            } catch (err) {
                                alert('Error uploading file');
                            }
                        }} className="hidden" />
                    </label>
                </div>
                <p className="text-[11px] font-semibold text-gray-400 mt-2">Merchant Avatar (WebP auto-conversion)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Merchant Name</label>
                    <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                        placeholder="e.g. John Doe" className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Email Address</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                        placeholder="e.g. john@store.com" className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'border-red-500 focus:ring-red-500/20' : 'border-[#d3d3d3] focus:ring-[#14B8A6]/30'}`} />
                    {form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                        <p className="text-[10px] text-red-500 mt-1 font-semibold">Please enter a valid email address</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Mobile Number</label>
                    <input type="text" value={form.mobile} onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        set('mobile', val);
                    }}
                        placeholder="10-digit mobile number" className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${form.mobile && form.mobile.length !== 10 ? 'border-red-500 focus:ring-red-500/20' : 'border-[#d3d3d3] focus:ring-[#14B8A6]/30'}`} />
                    {form.mobile && form.mobile.length !== 10 && (
                        <p className="text-[10px] text-red-500 mt-1 font-semibold">Must be exactly 10 digits</p>
                    )}
                </div>
                <div>
                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Plan Type</label>
                    <select value={planType} onChange={e => {
                        setPlanType(e.target.value);
                        set('plan', ''); // Clear selected plan when plan type changes
                    }}
                        className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white cursor-pointer appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                        <option value="Single Vendor">Single Vendor</option>
                        <option value="Multi Vendor">Multi Vendor</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Plan</label>
                    <select value={form.plan} onChange={e => set('plan', e.target.value)}
                        className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white cursor-pointer appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                        <option value="">No Plan</option>
                        {filteredPlans.map(p => (
                            <option key={p._id} value={p._id}>{p.planName} (₹{p.planPrice}/mo)</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">GST Number</label>
                    <input type="text" value={form.gstNumber} onChange={e => set('gstNumber', e.target.value.toUpperCase())}
                        placeholder="e.g. 22AAAAA0000A1Z5" className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Address</label>
                <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2}
                    placeholder="e.g. 123 Main St, New York, US" className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 resize-none" />
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100 mt-2">
                <button onClick={onCancel} disabled={isSaving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
                <button onClick={() => onSave({ ...merchant, ...form })}
                    disabled={isSaving || !form.name.trim() || !form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !form.mobile || form.mobile.length !== 10}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${(isSaving || !form.name.trim() || !form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !form.mobile || form.mobile.length !== 10) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`} 
                    style={{ background: '#1a1c23' }}>
                    {isSaving ? 'Saving...' : (isNew ? 'Create Merchant' : 'Save Changes')}
                </button>
            </div>
        </div>
    );
};

const MerchantsTab = () => {
    const [merchants, setMerchants] = useState([]);
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [editingMerchant, setEditingMerchant] = useState(null);
    const [deletingMerchant, setDeletingMerchant] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [changingPasswordMerchant, setChangingPasswordMerchant] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [toast, setToast] = useState(null);

    const handleChangePassword = async () => {
        if (!newPassword.trim()) {
            showToast('Password cannot be empty', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/merchants/${changingPasswordMerchant._id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ password: newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setMerchants(prev => prev.map(m => m._id === data._id ? data : m));
                setChangingPasswordMerchant(null);
                setNewPassword('');
                showToast('Password updated successfully');
            } else {
                showToast(data.message || 'Failed to change password', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const getAuthHeaders = () => {
        const info = JSON.parse(localStorage.getItem('masterAdminInfo') || '{}');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${info.token || ''}`
        };
    };

    const [viewingMerchant, setViewingMerchant] = useState(null);
    const showToast = (msg, type = 'success') => setToast({ msg, type });

    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_URL}/plans`);
            const data = await res.json();
            if (res.ok) {
                setPlans(data);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    const fetchMerchants = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_URL}/merchants`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (res.ok) {
                setMerchants(data);
            } else {
                showToast(data.message || 'Failed to fetch merchants', 'error');
            }
        } catch (error) {
            showToast('Network error fetching merchants', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
        fetchMerchants();
    }, []);

    const handleCreate = async (newMerchant) => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/merchants`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newMerchant)
            });
            const data = await res.json();
            if (res.ok) {
                setMerchants(prev => [...prev, data]);
                setShowCreate(false);
                showToast('Merchant created successfully');
            } else {
                showToast(data.message || 'Creation failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async (updated) => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/merchants/${updated._id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updated)
            });
            const data = await res.json();
            if (res.ok) {
                setMerchants(prev => prev.map(m => m._id === data._id ? data : m));
                setEditingMerchant(null);
                showToast('Merchant updated successfully');
            } else {
                showToast(data.message || 'Update failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (merchant) => {
        try {
            const res = await fetch(`${API_URL}/merchants/${merchant._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setMerchants(prev => prev.filter(m => m._id !== merchant._id));
                setDeletingMerchant(null);
                showToast(`Merchant "${merchant.name}" deleted`);
            } else {
                const data = await res.json();
                showToast(data.message || 'Deletion failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        }
    };

    const handleToggleStatus = async (merchant) => {
        const nextStatus = merchant.status === 'active' ? 'suspended' : 'active';
        try {
            const res = await fetch(`${API_URL}/merchants/${merchant._id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: nextStatus })
            });
            const data = await res.json();
            if (res.ok) {
                setMerchants(prev => prev.map(m => m._id === data._id ? data : m));
                showToast(`Merchant status changed to ${nextStatus}`);
            } else {
                showToast(data.message || 'Status update failed', 'error');
            }
        } catch (error) {
            showToast('Network error updating status', 'error');
        }
    };

    const getPlanType = (m) => {
        if (!m.plan) return 'Single Vendor';
        if (typeof m.plan === 'object') {
            return m.plan.planType || 'Single Vendor';
        }
        const found = plans.find(p => p._id === m.plan);
        return found ? found.planType : 'Single Vendor';
    };

    const counts = {
        all: merchants.length,
        singleVendor: merchants.filter(m => getPlanType(m) === 'Single Vendor').length,
        multiVendor: merchants.filter(m => getPlanType(m) === 'Multi Vendor').length,
        suspended: merchants.filter(m => m.status === 'suspended').length,
    };

    const filtered = merchants.filter(m => {
        const matchSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (m.address || '').toLowerCase().includes(search.toLowerCase());
        
        let matchFilter = true;
        if (filter === 'singleVendor') {
            matchFilter = getPlanType(m) === 'Single Vendor';
        } else if (filter === 'multiVendor') {
            matchFilter = getPlanType(m) === 'Multi Vendor';
        } else if (filter === 'suspended') {
            matchFilter = m.status === 'suspended';
        }
        
        return matchSearch && matchFilter;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const filterOptions = [
        { key: 'all', label: 'All', countKey: 'all' },
        { key: 'singleVendor', label: 'Single Vendor', countKey: 'singleVendor' },
        { key: 'multiVendor', label: 'Multi Vendor', countKey: 'multiVendor' },
        { key: 'suspended', label: 'Suspended', countKey: 'suspended' }
    ];

    return (
        <div className="space-y-6">
            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Merchants</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Manage all merchant accounts on the platform.</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all" style={{ background: '#1a1c23' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create Merchant
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className={`${card} p-4 animate-pulse`}>
                            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-24"></div>
                        </div>
                    ))
                ) : (
                    [
                        { label: 'Total Merchants', value: counts.all, color: '#202223', filterKey: 'all' },
                        { label: 'Single Vendor', value: counts.singleVendor, color: '#3B82F6', filterKey: 'singleVendor' },
                        { label: 'Multi Vendor', value: counts.multiVendor, color: '#8B5CF6', filterKey: 'multiVendor' },
                        { label: 'Suspended', value: counts.suspended, color: '#DC2626', filterKey: 'suspended' },
                    ].map(s => (
                        <div key={s.label} onClick={() => { setFilter(s.filterKey); setPage(1); }} 
                             className={`${card} p-4 cursor-pointer hover:border-[#1a1c23] hover:shadow-md transition-all duration-200 ${filter === s.filterKey ? 'border-[#1a1c23] bg-gray-50/50' : ''}`}>
                            <p className="text-2xl font-black" style={{ color: s.color || '#202223' }}>{s.value}</p>
                            <p className="text-xs font-semibold text-[#5c5f62] mt-0.5">{s.label}</p>
                        </div>
                    ))
                )}
            </div>

            <div className={card}>
                <div className="px-5 py-4 border-b border-[#e3e3e3] flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-1 bg-[#f6f6f7] rounded-lg p-1">
                        {filterOptions.map(f => (
                            <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === f.key ? 'bg-white shadow-sm text-[#202223]' : 'text-[#5c5f62] hover:text-[#202223]'}`}>
                                {f.label} ({counts[f.countKey]})
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <svg className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search merchants..."
                            className="pl-9 pr-4 py-1.5 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white w-56" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#f0f0f0]">
                                    {['Merchant', 'Mobile', 'Plan', 'Status', 'Total Revenue', 'Joined At', 'Actions'].map(h => (
                                        <th key={h} className={`px-5 py-3 text-[11px] font-black uppercase tracking-widest text-[#9CA3AF] ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="border-b border-[#f5f5f5] animate-pulse">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                    <div className="h-3 bg-gray-100 rounded w-32"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="h-5 bg-gray-200 rounded-full w-12"></div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="h-3 bg-gray-100 rounded w-16"></div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-end gap-1.5">
                                                <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
                                                <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
                                                <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
                                                <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#f0f0f0]">
                                    {['Merchant', 'Mobile', 'Plan', 'Status', 'Total Revenue', 'Joined At', 'Actions'].map(h => (
                                        <th key={h} className={`px-5 py-3 text-[11px] font-black uppercase tracking-widest text-[#9CA3AF] ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((m, i) => (
                                    <tr key={m._id} className={`border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors ${i === paginated.length - 1 ? 'border-0' : ''}`}>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                {m.profile ? (
                                                    <img src={m.profile.startsWith('http') || m.profile.startsWith('data:') ? m.profile : `${API_URL.replace('/api', '')}${m.profile}`} alt={m.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" 
                                                        onError={(e) => { e.target.src = ''; e.target.onerror = null; }} />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                                                        style={{ background: avatarColors[m.name.length % avatarColors.length] }}>
                                                        {m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-[#202223]">{m.name}</p>
                                                    <p className="text-[11px] text-[#9CA3AF]">{m.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-[#5c5f62] text-center">{m.mobile}</td>
                                        <td className="px-5 py-3.5 text-center"><div className="flex justify-center"><PlanBadge plan={m.plan} /></div></td>
                                        <td className="px-5 py-3.5 text-center"><div className="flex justify-center"><StatusBadge status={m.status} /></div></td>
                                        <td className="px-5 py-3.5 text-sm font-bold text-[#202223] text-center">₹{(m.revenue || 0).toLocaleString()}</td>
                                        <td className="px-5 py-3.5 text-xs text-[#9CA3AF] text-center">
                                            {m.createdAt ? new Date(m.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button onClick={() => setViewingMerchant(m)} 
                                                    className="p-1.5 hover:bg-blue-50 rounded-lg transition-all text-[#9CA3AF] hover:text-blue-600" 
                                                    title="View Profile Details">
                                                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                </button>
                                                <button onClick={() => setChangingPasswordMerchant(m)} 
                                                    className="p-1.5 hover:bg-teal-50 rounded-lg transition-all text-[#9CA3AF] hover:text-teal-600" 
                                                    title="Change Password">
                                                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                                <button onClick={() => handleToggleStatus(m)} 
                                                    className={`p-1.5 rounded-lg transition-all ${m.status === 'active' ? 'hover:bg-amber-50 text-amber-500 hover:text-amber-600' : 'hover:bg-green-50 text-green-500 hover:text-green-600'}`} 
                                                    title={m.status === 'active' ? 'Deactivate Merchant' : 'Activate Merchant'}>
                                                    {m.status === 'active' ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    )}
                                                </button>
                                                <button onClick={() => setEditingMerchant(m)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-[#9CA3AF] hover:text-[#202223]" title="Edit profile">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => setDeletingMerchant(m)} className="p-1.5 hover:bg-red-50 rounded-lg transition-all text-[#9CA3AF] hover:text-red-500" title="Delete merchant">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {!isLoading && paginated.length === 0 && (
                        <div className="py-16 text-center">
                            <p className="text-[#9CA3AF] text-sm">No merchants found.</p>
                        </div>
                    )}
                </div>

                {!isLoading && totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-[#e3e3e3] flex items-center justify-between">
                        <p className="text-xs text-[#9CA3AF]">Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} merchants</p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-[#e3e3e3] rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-all">
                                <svg className="w-4 h-4 text-[#5c5f62]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === page ? 'text-white' : 'text-[#5c5f62] hover:bg-gray-50 border border-[#e3e3e3]'}`}
                                    style={p === page ? { background: '#1a1c23' } : {}}>
                                    {p}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-[#e3e3e3] rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-all">
                                <svg className="w-4 h-4 text-[#5c5f62]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Merchant Modal */}
            {showCreate && (
                <Modal title="Create New Merchant" onClose={() => setShowCreate(false)}>
                    <MerchantForm merchant={null} plans={plans} onSave={handleCreate} onCancel={() => setShowCreate(false)} isNew isSaving={isSaving} />
                </Modal>
            )}

            {/* Edit Merchant Modal */}
            {editingMerchant && (
                <Modal title={`Edit Merchant — ${editingMerchant.name}`} onClose={() => setEditingMerchant(null)}>
                    <MerchantForm merchant={editingMerchant} plans={plans} onSave={handleSave} onCancel={() => setEditingMerchant(null)} isSaving={isSaving} />
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {deletingMerchant && (
                <Modal title="Delete Merchant" onClose={() => setDeletingMerchant(null)}>
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm font-semibold text-red-800">
                                Are you sure you want to delete the merchant <strong>{deletingMerchant.name}</strong>?
                                This will remove their record from the platform permanently.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setDeletingMerchant(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">Cancel</button>
                            <button onClick={() => handleDelete(deletingMerchant)} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#DC2626' }}>
                                Delete Merchant
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Change Password Modal */}
            {changingPasswordMerchant && (
                <Modal title={`Change Password — ${changingPasswordMerchant.name}`} onClose={() => setChangingPasswordMerchant(null)}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">New Password</label>
                            <input 
                                type="password" 
                                value={newPassword} 
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Enter new password" 
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            />
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <button onClick={() => { setChangingPasswordMerchant(null); setNewPassword(''); }} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">Cancel</button>
                            <button onClick={handleChangePassword} disabled={isSaving || !newPassword.trim()} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1a1c23] hover:opacity-90 transition-all disabled:opacity-50">
                                {isSaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* View Merchant Details Modal */}
            {viewingMerchant && (
                <Modal title="Merchant Profile Details" onClose={() => setViewingMerchant(null)} width="max-w-lg">
                    <div className="space-y-6">
                        {/* Profile Header */}
                        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                            {viewingMerchant.profile ? (
                                <img src={viewingMerchant.profile.startsWith('http') || viewingMerchant.profile.startsWith('data:') ? viewingMerchant.profile : `${API_URL.replace('/api', '')}${viewingMerchant.profile}`} alt={viewingMerchant.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 shadow-sm" />
                            ) : (
                                <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-sm"
                                    style={{ background: avatarColors[viewingMerchant.name.length % avatarColors.length] }}>
                                    {viewingMerchant.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-black text-[#202223]">{viewingMerchant.name}</h2>
                                <p className="text-sm font-semibold text-[#5c5f62]">{viewingMerchant.email}</p>
                                <div className="mt-2 flex gap-2 flex-wrap">
                                    <StatusBadge status={viewingMerchant.status} />
                                    <PlanBadge plan={viewingMerchant.plan} />
                                </div>
                            </div>
                        </div>

                        {/* Detail Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider block mb-1">Mobile</span>
                                <span className="text-sm font-bold text-[#202223]">{viewingMerchant.mobile}</span>
                            </div>
                            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider block mb-1">Total Revenue</span>
                                <span className="text-sm font-black text-[#15803d]">₹{(viewingMerchant.revenue || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        {viewingMerchant.gstNumber && (
                            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider block mb-1">GST Number</span>
                                <span className="text-sm font-bold text-[#202223] tracking-wide">{viewingMerchant.gstNumber}</span>
                            </div>
                        )}

                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                            <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider block">Registered Address</span>
                            <span className="text-sm font-semibold text-[#202223] leading-relaxed block">{viewingMerchant.address || 'No registered address'}</span>
                        </div>

                        {/* Subscription Info */}
                        {viewingMerchant.plan && typeof viewingMerchant.plan === 'object' && (
                            <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-100 space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-blue-50">
                                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Active Tier Details</span>
                                    <span className="text-sm font-black text-[#202223]">₹{viewingMerchant.plan.planPrice || 0}/mo</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-[#5c5f62] font-semibold">Plan Name:</span>
                                        <span className="text-[#202223] font-bold ml-1">{viewingMerchant.plan.planName}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#5c5f62] font-semibold">Plan Type:</span>
                                        <span className="text-[#202223] font-bold ml-1">{viewingMerchant.plan.planType}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#5c5f62] font-semibold">Products Limit:</span>
                                        <span className="text-[#202223] font-bold ml-1">{viewingMerchant.plan.productsCount === 0 ? 'Unlimited' : viewingMerchant.plan.productsCount}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#5c5f62] font-semibold">Vendors Limit:</span>
                                        <span className="text-[#202223] font-bold ml-1">{viewingMerchant.plan.vendorsLimit === 0 ? 'Unlimited' : viewingMerchant.plan.vendorsLimit}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 text-[10px] font-semibold text-[#9CA3AF] pt-2">
                            <div>Joined At: <span className="text-[#202223] font-bold ml-0.5">{viewingMerchant.createdAt ? new Date(viewingMerchant.createdAt).toLocaleString() : '-'}</span></div>
                            <div>Last Update: <span className="text-[#202223] font-bold ml-0.5">{viewingMerchant.updatedAt ? new Date(viewingMerchant.updatedAt).toLocaleString() : '-'}</span></div>
                        </div>

                        <button onClick={() => setViewingMerchant(null)} className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 mt-2" style={{ background: '#1a1c23' }}>Close Details</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default MerchantsTab;
