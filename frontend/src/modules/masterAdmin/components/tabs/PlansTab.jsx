import React, { useState, useEffect } from 'react';

const MERCHANT_ADMIN_API_URL = import.meta.env.VITE_MERCHANT_ADMIN_API_URL || 'http://localhost:5002/api/admin';
const API_URL = MERCHANT_ADMIN_API_URL;

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

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const PlanForm = ({ plan, onSave, onCancel, isNew, isSaving }) => {
    const [form, setForm] = useState(plan ? {
        planName: plan.planName,
        planPrice: plan.planPrice,
        description: plan.description || '',
        features: plan.features || [''],
        isPopular: plan.isPopular || false,
        isRecommended: plan.isRecommended || false,
        planType: plan.planType || 'Single Vendor'
    } : {
        planName: '', planPrice: 0, description: '', features: [''], isPopular: false, isRecommended: false, planType: 'Single Vendor'
    });

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...form.features];
        newFeatures[index] = value;
        setForm(p => ({ ...p, features: newFeatures }));
    };

    const addFeature = () => {
        setForm(p => ({ ...p, features: [...p.features, ''] }));
    };

    const removeFeature = (index) => {
        const newFeatures = form.features.filter((_, i) => i !== index);
        setForm(p => ({ ...p, features: newFeatures }));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Plan Name</label>
                    <input type="text" value={form.planName} onChange={e => set('planName', e.target.value)}
                        placeholder="e.g. Basic" className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Monthly Price (₹)</label>
                    <input type="number" value={form.planPrice} onChange={e => set('planPrice', Number(e.target.value))}
                        placeholder="29" className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Plan Type</label>
                <select 
                    value={form.planType} 
                    onChange={e => {
                        const newType = e.target.value;
                        setForm(p => ({ ...p, planType: newType }));
                    }}
                    className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 appearance-none bg-white cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                    <option value="Single Vendor">Single Vendor</option>
                    <option value="Multi Vendor">Multi Vendor</option>
                </select>
            </div>

            <div>
                <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Short description of the plan" className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
            </div>



            <div>
                <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Features</label>
                <div className="space-y-2">
                    {form.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={feature} 
                                onChange={e => handleFeatureChange(idx, e.target.value)}
                                placeholder="Feature description" 
                                className="flex-1 px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" 
                            />
                            {form.features.length > 1 && (
                                <button type="button" onClick={() => removeFeature(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addFeature} className="text-xs text-[#14B8A6] font-semibold flex items-center gap-1 mt-1 hover:underline">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Feature
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isPopular} onChange={e => set('isPopular', e.target.checked)} className="w-4 h-4 text-[#14B8A6] rounded border-gray-300 focus:ring-[#14B8A6]" />
                    <span className="text-xs font-semibold text-[#5c5f62]">Mark as Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isRecommended} onChange={e => set('isRecommended', e.target.checked)} className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500" />
                    <span className="text-xs font-semibold text-[#5c5f62]">Mark as Recommended</span>
                </label>
            </div>

            <div className="flex gap-2 pt-1">
                <button onClick={onCancel} disabled={isSaving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
                <button onClick={() => onSave({ ...plan, ...form })}
                    disabled={isSaving || !form.planName || form.planPrice === ''}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${(isSaving || !form.planName || form.planPrice === '') ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`} 
                    style={{ background: '#1a1c23' }}>
                    {isSaving ? 'Saving...' : (isNew ? 'Create Plan' : 'Save Changes')}
                </button>
            </div>
        </div>
    );
};

const PlansTab = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [deletingPlan, setDeletingPlan] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('All');

    const getPlanCount = (type) => {
        if (type === 'All') return plans.length;
        return plans.filter(p => p.planType === type).length;
    };

    const getAuthHeaders = () => {
        const info = JSON.parse(localStorage.getItem('masterAdminInfo') || '{}');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${info.token || ''}`
        };
    };

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_URL}/plans`);
            const data = await res.json();
            if (res.ok) {
                setPlans(data);
            } else {
                showToast(data.message || 'Failed to fetch plans', 'error');
            }
        } catch (error) {
            showToast('Network error fetching plans', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const showToast = (msg, type = 'success') => setToast({ msg, type });

    const handleSave = async (updated) => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/plans/${updated._id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updated)
            });
            const data = await res.json();
            if (res.ok) {
                setPlans(prev => prev.map(p => p._id === data._id ? data : p));
                setEditingPlan(null);
                showToast('Plan updated successfully');
            } else {
                showToast(data.message || 'Update failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreate = async (newPlan) => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/plans`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newPlan)
            });
            const data = await res.json();
            if (res.ok) {
                setPlans(prev => [...prev, data]);
                setShowCreate(false);
                showToast('New plan created successfully');
            } else {
                showToast(data.message || 'Creation failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (plan) => {
        try {
            const res = await fetch(`${API_URL}/plans/${plan._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                setPlans(prev => prev.filter(p => p._id !== plan._id));
                setDeletingPlan(null);
                showToast(`Plan "${plan.planName}" deleted`);
            } else {
                const data = await res.json();
                showToast(data.message || 'Deletion failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        }
    };

    const filteredPlans = plans.filter(plan => {
        if (filter === 'All') return true;
        return plan.planType === filter;
    });

    return (
        <div className="space-y-8">
            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Stores Plans Configuration</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Manage subscription tiers for your platform.</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto" style={{ background: '#1a1c23' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create Plan
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-[#e3e3e3] gap-6">
                {[
                    { id: 'All', label: 'All Plans' },
                    { id: 'Single Vendor', label: 'Single Vendor' },
                    { id: 'Multi Vendor', label: 'Multi Vendor' }
                ].map(t => {
                    const count = getPlanCount(t.id);
                    const isActive = filter === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setFilter(t.id)}
                            className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 ${
                                isActive ? 'text-[#1a1c23]' : 'text-[#5c5f62] hover:text-[#202223]'
                            }`}
                        >
                            <span>{t.label}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                                isActive ? 'bg-[#1a1c23] text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {count}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#14B8A6] rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`${card} p-5 animate-pulse flex flex-col`}>
                            {/* Header */}
                            <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
                            <div className="h-3 bg-gray-100 rounded w-4/5 mb-4"></div>
                            {/* Price */}
                            <div className="mb-5 pb-5 border-b border-[#f0f0f0] flex items-end gap-2">
                                <div className="h-9 bg-gray-200 rounded w-20"></div>
                                <div className="h-4 bg-gray-100 rounded w-8 mb-1"></div>
                            </div>
                            {/* Limits */}
                            <div className="space-y-3 mb-5 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex justify-between">
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    <div className="h-3 bg-gray-200 rounded w-10"></div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-3 bg-gray-200 rounded w-14"></div>
                                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                                </div>
                            </div>
                            {/* Features */}
                            <div className="space-y-3 mb-6 flex-grow">
                                <div className="h-3 bg-gray-300 rounded w-20 mb-4"></div>
                                <div className="h-3 bg-gray-100 rounded w-full"></div>
                                <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                                <div className="h-3 bg-gray-100 rounded w-4/5"></div>
                            </div>
                            {/* Actions */}
                            <div className="flex gap-2 mt-auto border-t border-gray-100 pt-4">
                                <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
                                <div className="w-10 h-8 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPlans.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <p className="text-gray-500 font-medium">No plans found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPlans.map(plan => (
                        <div key={plan._id} className={`${card} p-5 relative flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${plan.isRecommended ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/10' : ''}`}>
                            {plan.isPopular && (
                                <div className="absolute top-0 right-4 -translate-y-1/2 text-[10px] font-black px-2.5 py-1 rounded-full text-white bg-[#14B8A6] tracking-wider z-10 shadow-sm">POPULAR</div>
                            )}
                            {plan.isRecommended && (
                                <div className="absolute top-0 left-4 -translate-y-1/2 text-[10px] font-black px-2.5 py-1 rounded-full text-white bg-blue-500 tracking-wider z-10 shadow-sm">RECOMMENDED</div>
                            )}
                            
                            {/* Plan Header */}
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="text-xl font-black text-[#202223]">{plan.planName}</h3>
                            </div>
                            <div className="mb-3">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${plan.planType === 'Multi Vendor' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {plan.planType === 'Multi Vendor' ? (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    ) : (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    )}
                                    {plan.planType}
                                </span>
                            </div>
                            <p className="text-xs text-[#5c5f62] mb-4 min-h-[32px] leading-relaxed">{plan.description}</p>

                            {/* Price */}
                            <div className="mb-4 pb-4 border-b border-[#f0f0f0] flex items-end">
                                <span className="text-3xl font-black text-[#202223] tracking-tight">₹{plan.planPrice}</span>
                                <span className="text-sm font-semibold text-[#9CA3AF] ml-1 mb-0.5">/mo</span>
                            </div>



                            {/* Features */}
                            <div className="space-y-2 mb-5 flex-grow">
                                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Included Features</p>
                                {plan.features && plan.features.length > 0 ? plan.features.map((f, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#14B8A6] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-xs font-medium text-[#4b4e52] leading-tight">{f}</span>
                                    </div>
                                )) : <span className="text-xs text-gray-400 italic">No features listed</span>}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                                <button onClick={() => setEditingPlan(plan)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-[#e3e3e3] text-[#202223] bg-white shadow-sm hover:bg-gray-50 transition-all hover:border-gray-300">
                                    <svg className="w-3.5 h-3.5 text-[#5c5f62]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit Plan
                                </button>
                                <button onClick={() => setDeletingPlan(plan)}
                                    className="px-3 py-2 rounded-lg border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-all shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Plan Modal */}
            {editingPlan && (
                <Modal title={`Edit Plan — ${editingPlan.planName}`} onClose={() => setEditingPlan(null)} width="max-w-lg">
                    <PlanForm plan={editingPlan} onSave={handleSave} onCancel={() => setEditingPlan(null)} isSaving={isSaving} />
                </Modal>
            )}

            {/* Create Plan Modal */}
            {showCreate && (
                <Modal title="Create New Plan" onClose={() => setShowCreate(false)} width="max-w-lg">
                    <PlanForm plan={null} onSave={handleCreate} onCancel={() => setShowCreate(false)} isNew isSaving={isSaving} />
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {deletingPlan && (
                <Modal title="Delete Plan" onClose={() => setDeletingPlan(null)}>
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm font-semibold text-red-800">
                                Are you sure you want to delete the <strong>{deletingPlan.planName}</strong> plan?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setDeletingPlan(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">Cancel</button>
                            <button onClick={() => handleDelete(deletingPlan)} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#DC2626' }}>
                                Delete Plan
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default PlansTab;
