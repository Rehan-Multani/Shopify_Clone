import React, { useState } from 'react';

const initialPlans = [
    {
        id: 'free', name: 'Free', price: 0, priceDisplay: '$0', period: '/mo',
        tagline: 'Get started for free', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB',
        subscribers: 124, revenue: '$0', pctChange: '+23',
        features: ['1 store', '25 products', 'Basic analytics', 'Community support', '2% transaction fee'],
        txFee: '2%', staffAccounts: 1, storage: '256MB',
    },
    {
        id: 'basic', name: 'Basic', price: 29, priceDisplay: '$29', period: '/mo',
        tagline: 'For growing businesses', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE',
        subscribers: 268, revenue: '$7,772', pctChange: '+8',
        features: ['2 stores', '500 products', 'Full analytics', 'Email support', '1.5% transaction fee', 'Custom domain'],
        txFee: '1.5%', staffAccounts: 3, storage: '2GB',
    },
    {
        id: 'advanced', name: 'Advanced', price: 79, priceDisplay: '$79', period: '/mo',
        tagline: 'For scaling merchants', color: '#14B8A6', bg: '#F0FDFA', border: '#99F6E4',
        subscribers: 312, revenue: '$24,648', pctChange: '+15',
        features: ['5 stores', 'Unlimited products', 'Advanced analytics', 'Priority support', '0.8% transaction fee', 'Custom domain', 'Team access (10)', 'API access'],
        txFee: '0.8%', staffAccounts: 10, storage: '20GB', popular: true,
    },
    {
        id: 'plus', name: 'Plus', price: 299, priceDisplay: '$299', period: '/mo',
        tagline: 'Enterprise-grade power', color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE',
        subscribers: 187, revenue: '$55,913', pctChange: '+22',
        features: ['Unlimited stores', 'Unlimited products', 'Enterprise analytics', '24/7 dedicated support', '0% transaction fee', 'Custom domain', 'Unlimited team access', 'Full API access', 'Custom integrations', 'SLA guarantee'],
        txFee: '0%', staffAccounts: 'Unlimited', storage: 'Unlimited',
    },
];

const billingHistory = [
    { date: '2026-05-01', period: 'May 2026', revenue: '$88,333', stores: 891, status: 'collected' },
    { date: '2026-04-01', period: 'Apr 2026', revenue: '$81,209', stores: 864, status: 'collected' },
    { date: '2026-03-01', period: 'Mar 2026', revenue: '$74,582', stores: 831, status: 'collected' },
    { date: '2026-02-01', period: 'Feb 2026', revenue: '$68,447', stores: 798, status: 'collected' },
    { date: '2026-01-01', period: 'Jan 2026', revenue: '$61,103', stores: 762, status: 'collected' },
];

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

const Toast = ({ msg, onDone }) => {
    React.useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
    return (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold" style={{ background: '#1a1c23' }}>
            <svg className="w-4 h-4 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {msg}
        </div>
    );
};

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const PlanForm = ({ plan, onSave, onCancel, isNew }) => {
    const [form, setForm] = useState(plan ? { ...plan } : {
        id: `plan_${Date.now()}`, name: '', price: 0, priceDisplay: '$0', period: '/mo',
        tagline: '', color: '#14B8A6', bg: '#F0FDFA', border: '#99F6E4',
        subscribers: 0, revenue: '$0', pctChange: '+0',
        features: [''], txFee: '1%', staffAccounts: 1, storage: '1GB',
    });

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {[['Plan Name', 'name', 'text', 'e.g. Growth'], ['Monthly Price ($)', 'price', 'number', '49'], ['Tagline', 'tagline', 'text', 'e.g. For mid-size teams'], ['Transaction Fee', 'txFee', 'text', '1%']].map(([label, key, type, ph]) => (
                    <div key={key}>
                        <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">{label}</label>
                        <input type={type} value={form[key]} onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                            placeholder={ph} className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                    </div>
                ))}
            </div>
            <div>
                <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Brand Color</label>
                <div className="flex items-center gap-3">
                    <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-[#d3d3d3] cursor-pointer p-0.5" />
                    <input type="text" value={form.color} onChange={e => set('color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                </div>
            </div>
            <div>
                <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Features (one per line)</label>
                <textarea value={form.features.join('\n')} onChange={e => set('features', e.target.value.split('\n'))}
                    rows={4} className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
            </div>
            <div className="flex gap-2 pt-1">
                <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={() => onSave({ ...form, priceDisplay: `$${form.price}` })}
                    className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#1a1c23' }}>
                    {isNew ? 'Create Plan' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

const PlansTab = () => {
    const [plans, setPlans] = useState(initialPlans);
    const [editingPlan, setEditingPlan] = useState(null);
    const [deletingPlan, setDeletingPlan] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState('');

    const totalRevenue = plans.reduce((a, p) => a + (parseFloat(p.revenue.replace(/[$,]/g, '')) || 0), 0);
    const totalSubs = plans.reduce((a, p) => a + p.subscribers, 0);

    const handleSave = (updated) => {
        setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        setEditingPlan(null);
        setToast('Plan updated successfully');
    };

    const handleCreate = (newPlan) => {
        setPlans(prev => [...prev, { ...newPlan, subscribers: 0, revenue: '$0', pctChange: '+0' }]);
        setShowCreate(false);
        setToast('New plan created successfully');
    };

    const handleDelete = (plan) => {
        setPlans(prev => prev.filter(p => p.id !== plan.id));
        setDeletingPlan(null);
        setToast(`Plan "${plan.name}" deleted`);
    };

    return (
        <div className="space-y-8">
            {toast && <Toast msg={toast} onDone={() => setToast('')} />}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Plans & Billing</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Manage subscription plans and track platform billing.</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all" style={{ background: '#1a1c23' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create Plan
                </button>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Monthly Subscription Revenue', val: `$${totalRevenue.toLocaleString()}`, sub: '+18.4% from last month' },
                    { label: 'Total Subscribers', val: totalSubs.toLocaleString(), sub: '+8.7% from last month' },
                    { label: 'Avg Revenue Per User', val: `$${totalSubs ? (totalRevenue / totalSubs).toFixed(0) : 0}`, sub: '+9.2% from last month' },
                ].map(s => (
                    <div key={s.label} className={`${card} p-5`}>
                        <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-2">{s.label}</p>
                        <p className="text-3xl font-black text-[#202223]">{s.val}</p>
                        <p className="text-xs font-semibold text-green-600 mt-1.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            {s.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* Plan Cards */}
            <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-[#9CA3AF] mb-4">Subscription Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {plans.map(plan => (
                        <div key={plan.id} className={`${card} p-5 relative overflow-hidden`} style={{ borderColor: plan.border }}>
                            {plan.popular && (
                                <div className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#14B8A6' }}>POPULAR</div>
                            )}
                            {/* Plan Header */}
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-sm font-black" style={{ background: plan.bg, color: plan.color }}>
                                {plan.name.charAt(0)}
                            </div>
                            <h3 className="text-base font-black text-[#202223]">{plan.name}</h3>
                            <p className="text-xs text-[#9CA3AF] mt-0.5 mb-3">{plan.tagline}</p>

                            {/* Price */}
                            <div className="mb-4 pb-4 border-b border-[#f0f0f0]">
                                <span className="text-2xl font-black text-[#202223]">{plan.priceDisplay}</span>
                                <span className="text-sm text-[#9CA3AF]">{plan.period}</span>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-2 mb-4">
                                {[['Subscribers', plan.subscribers], ['Monthly Rev', plan.revenue], ['Growth', plan.pctChange + '% MoM']].map(([l, v]) => (
                                    <div key={l} className="flex items-center justify-between">
                                        <span className="text-xs text-[#5c5f62]">{l}</span>
                                        <span className={`text-sm font-bold ${l === 'Growth' ? 'px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs' : ''}`}
                                            style={l === 'Monthly Rev' ? { color: plan.color } : l !== 'Growth' ? { color: '#202223' } : {}}>
                                            {v}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Features */}
                            <div className="space-y-1.5 mb-5">
                                {plan.features.slice(0, 4).map((f, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-[11px] text-[#5c5f62]">{f}</span>
                                    </div>
                                ))}
                                {plan.features.length > 4 && <span className="text-[11px] text-[#9CA3AF] pl-5">+{plan.features.length - 4} more</span>}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button onClick={() => setEditingPlan(plan)}
                                    className="flex-1 py-2 rounded-lg text-xs font-bold border transition-all hover:opacity-90"
                                    style={{ borderColor: plan.border, color: plan.color, background: plan.bg }}>
                                    Edit Plan
                                </button>
                                <button onClick={() => setDeletingPlan(plan)}
                                    className="px-3 py-2 rounded-lg text-xs font-bold border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-all">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Billing History */}
            <div className={card}>
                <div className="px-5 py-4 border-b border-[#e3e3e3]">
                    <h2 className="text-sm font-bold text-[#202223]">Billing History</h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">Monthly platform subscription collections</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#f0f0f0]">
                                {['Period', 'Collection Date', 'Active Stores', 'Revenue', 'Status', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-[#9CA3AF]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {billingHistory.map((b, i) => (
                                <tr key={i} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors">
                                    <td className="px-5 py-3.5 text-sm font-semibold text-[#202223]">{b.period}</td>
                                    <td className="px-5 py-3.5 text-sm text-[#5c5f62]">{b.date}</td>
                                    <td className="px-5 py-3.5 text-sm text-[#5c5f62]">{b.stores.toLocaleString()}</td>
                                    <td className="px-5 py-3.5 text-sm font-bold text-[#202223]">{b.revenue}</td>
                                    <td className="px-5 py-3.5">
                                        <span className="flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 w-fit">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Collected
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button onClick={() => setToast(`Invoice for ${b.period} downloaded`)}
                                            className="text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#14B8A6' }}>
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Plan Modal */}
            {editingPlan && (
                <Modal title={`Edit Plan — ${editingPlan.name}`} onClose={() => setEditingPlan(null)} width="max-w-lg">
                    <PlanForm plan={editingPlan} onSave={handleSave} onCancel={() => setEditingPlan(null)} />
                </Modal>
            )}

            {/* Create Plan Modal */}
            {showCreate && (
                <Modal title="Create New Plan" onClose={() => setShowCreate(false)} width="max-w-lg">
                    <PlanForm plan={null} onSave={handleCreate} onCancel={() => setShowCreate(false)} isNew />
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {deletingPlan && (
                <Modal title="Delete Plan" onClose={() => setDeletingPlan(null)}>
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm font-semibold text-red-800">
                                Are you sure you want to delete the <strong>{deletingPlan.name}</strong> plan?
                                This plan currently has <strong>{deletingPlan.subscribers} active subscribers</strong>.
                                Deleting it will require migrating them to another plan.
                            </p>
                        </div>
                        {deletingPlan.subscribers > 0 && (
                            <div>
                                <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Migrate subscribers to</label>
                                <select className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none bg-white">
                                    {plans.filter(p => p.id !== deletingPlan.id).map(p => (
                                        <option key={p.id} value={p.id}>{p.name} — {p.priceDisplay}/mo</option>
                                    ))}
                                </select>
                            </div>
                        )}
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
