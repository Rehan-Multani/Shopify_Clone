import React, { useState } from 'react';

const initialApps = [
    { id: 1, name: 'ShipTracker Pro', developer: 'LogiSoft Inc.', category: 'Shipping', status: 'pending', installs: 0, rating: null, desc: 'Real-time shipment tracking with carrier integrations for 50+ providers.', version: '2.1.0', submitted: '2026-05-05', icon: '🚚', price: 'Free + $9/mo' },
    { id: 2, name: 'ReviewBoost', developer: 'SocialStack', category: 'Marketing', status: 'approved', installs: 1842, rating: 4.8, desc: 'Automate review requests and display social proof to increase conversions.', version: '1.4.2', submitted: '2025-12-15', icon: '⭐', price: '$19/mo' },
    { id: 3, name: 'SmartInventory', developer: 'OptiFlow', category: 'Inventory', status: 'approved', installs: 3201, rating: 4.9, desc: 'AI-powered inventory forecasting and automatic reorder management.', version: '3.0.1', submitted: '2025-09-22', icon: '📦', price: '$29/mo' },
    { id: 4, name: 'TaxWizard', developer: 'FinTax Solutions', category: 'Finance', status: 'pending', installs: 0, rating: null, desc: 'Automated tax calculation and filing for 80+ countries.', version: '1.0.0', submitted: '2026-05-04', icon: '🧾', price: '$39/mo' },
    { id: 5, name: 'ChatBot AI', developer: 'ConversAI', category: 'Customer Support', status: 'approved', installs: 2156, rating: 4.6, desc: 'AI-powered customer support chatbot with natural language processing.', version: '2.2.0', submitted: '2025-07-08', icon: '🤖', price: '$49/mo' },
    { id: 6, name: 'AffiliateHub', developer: 'GrowthStack', category: 'Marketing', status: 'rejected', installs: 0, rating: null, desc: 'Affiliate marketing platform with tracking and commission management.', version: '1.1.0', submitted: '2026-04-20', icon: '🔗', price: '$25/mo', rejectReason: 'Violates marketplace guidelines: hidden fees in checkout flow not disclosed upfront.' },
    { id: 7, name: 'MultiCurrency', developer: 'FXPro', category: 'Finance', status: 'approved', installs: 4812, rating: 4.7, desc: 'Sell in 180+ currencies with real-time exchange rates.', version: '1.8.3', submitted: '2025-04-11', icon: '💱', price: '$15/mo' },
    { id: 8, name: 'ReturnDesk', developer: 'RetailFlow', category: 'Operations', status: 'approved', installs: 987, rating: 4.5, desc: 'Streamline returns and exchanges with automated workflows.', version: '1.3.0', submitted: '2026-02-14', icon: '↩️', price: '$19/mo' },
    { id: 9, name: 'BulkDiscount', developer: 'PriceLab', category: 'Sales', status: 'pending', installs: 0, rating: null, desc: 'Advanced bulk pricing rules and tiered discount management.', version: '1.0.0', submitted: '2026-05-06', icon: '🏷️', price: '$12/mo' },
];

const categoryColors = {
    Shipping: ['#3B82F6', '#EFF6FF'], Marketing: ['#EC4899', '#FDF2F8'], Inventory: ['#14B8A6', '#F0FDFA'],
    Finance: ['#8B5CF6', '#F5F3FF'], 'Customer Support': ['#F59E0B', '#FFFBEB'],
    Operations: ['#6B7280', '#F9FAFB'], Sales: ['#EF4444', '#FEF2F2'],
};

const StatusBadge = ({ status }) => {
    const map = { approved: ['#15803d', '#F0FDF4'], pending: ['#B45309', '#FFFBEB'], rejected: ['#DC2626', '#FEF2F2'] };
    const [color, bg] = map[status];
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
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-[#9CA3AF]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

const Toast = ({ msg, type = 'success', onDone }) => {
    React.useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
    return (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold" style={{ background: type === 'error' ? '#DC2626' : '#1a1c23' }}>
            <svg className="w-4 h-4" style={{ color: type === 'error' ? '#fca5a5' : '#14B8A6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {msg}
        </div>
    );
};

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const AppsTab = () => {
    const [apps, setApps] = useState(initialApps);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [reviewApp, setReviewApp] = useState(null);
    const [rejectApp, setRejectApp] = useState(null);
    const [viewApp, setViewApp] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [toast, setToast] = useState(null);

    const counts = {
        all: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        approved: apps.filter(a => a.status === 'approved').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
    };

    const filtered = apps.filter(a => {
        const matchFilter = filter === 'all' || a.status === filter;
        const q = search.toLowerCase();
        const matchSearch = a.name.toLowerCase().includes(q) || a.developer.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });

    const updateStatus = (id, status, extra = {}) => {
        setApps(prev => prev.map(a => a.id === id ? { ...a, status, ...extra } : a));
    };

    const handleApprove = (app) => {
        updateStatus(app.id, 'approved');
        setReviewApp(null);
        setToast({ msg: `"${app.name}" approved and published to marketplace`, type: 'success' });
    };

    const handleReject = () => {
        updateStatus(rejectApp.id, 'rejected', { rejectReason });
        setRejectApp(null);
        setRejectReason('');
        setToast({ msg: `"${rejectApp.name}" rejected`, type: 'success' });
    };

    const handleUnpublish = (app) => {
        updateStatus(app.id, 'rejected', { rejectReason: 'Unpublished by admin' });
        setViewApp(null);
        setToast({ msg: `"${app.name}" unpublished from marketplace`, type: 'success' });
    };

    return (
        <div className="space-y-6">
            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Apps Marketplace</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Review and manage apps available to merchants.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 transition-all" style={{ background: '#1a1c23' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add App Manually
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[{ label: 'Total Apps', value: counts.all }, { label: 'Approved', value: counts.approved, color: '#15803d' }, { label: 'Pending Review', value: counts.pending, color: '#B45309' }, { label: 'Rejected', value: counts.rejected, color: '#DC2626' }].map(s => (
                    <div key={s.label} className={`${card} p-4`}>
                        <p className="text-2xl font-black" style={{ color: s.color || '#202223' }}>{s.value}</p>
                        <p className="text-xs font-semibold text-[#5c5f62] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1 bg-white border border-[#e3e3e3] rounded-lg p-1">
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3.5 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${filter === f ? 'text-white shadow-sm' : 'text-[#5c5f62] hover:text-[#202223]'}`}
                            style={filter === f ? { background: '#1a1c23' } : {}}>
                            {f === 'all' ? `All (${counts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <svg className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search apps..."
                        className="pl-9 pr-4 py-1.5 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white w-56" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(app => {
                    const [catColor, catBg] = categoryColors[app.category] || ['#6B7280', '#F9FAFB'];
                    return (
                        <div key={app.id} className={`${card} p-5 hover:shadow-md transition-all`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-[#f6f6f7] border border-[#e3e3e3]">{app.icon}</div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#202223]">{app.name}</h3>
                                        <p className="text-xs text-[#9CA3AF]">by {app.developer}</p>
                                    </div>
                                </div>
                                <StatusBadge status={app.status} />
                            </div>

                            <p className="text-xs text-[#5c5f62] leading-relaxed mb-3">{app.desc}</p>

                            <div className="flex items-center gap-2 flex-wrap mb-4">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: catColor, background: catBg }}>{app.category}</span>
                                <span className="text-[11px] text-[#9CA3AF]">v{app.version}</span>
                                <span className="text-[11px] font-semibold text-[#5c5f62]">{app.price}</span>
                            </div>

                            <div className="flex items-center justify-between mb-4 py-3 border-t border-b border-[#f5f5f5]">
                                <div className="text-center">
                                    <p className="text-sm font-bold text-[#202223]">{app.installs.toLocaleString()}</p>
                                    <p className="text-[10px] text-[#9CA3AF]">Installs</p>
                                </div>
                                <div className="text-center">
                                    {app.rating ? (
                                        <>
                                            <div className="flex items-center gap-1 justify-center">
                                                <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                <span className="text-sm font-bold text-[#202223]">{app.rating}</span>
                                            </div>
                                            <p className="text-[10px] text-[#9CA3AF]">Rating</p>
                                        </>
                                    ) : <p className="text-xs text-[#9CA3AF]">No ratings</p>}
                                </div>
                                <div className="text-center">
                                    <p className="text-[11px] font-semibold text-[#5c5f62]">{app.submitted}</p>
                                    <p className="text-[10px] text-[#9CA3AF]">Submitted</p>
                                </div>
                            </div>

                            {app.status === 'pending' && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleApprove(app)} className="flex-1 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90 transition-all active:scale-95" style={{ background: '#008060' }}>Approve</button>
                                    <button onClick={() => setRejectApp(app)} className="flex-1 py-2 rounded-lg text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all">Reject</button>
                                    <button onClick={() => setReviewApp(app)} className="px-3 py-2 rounded-lg text-xs font-bold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">Review</button>
                                </div>
                            )}
                            {app.status === 'approved' && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setViewApp(app)} className="flex-1 py-2 rounded-lg text-xs font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">View Details</button>
                                    <button onClick={() => handleUnpublish(app)} className="px-3 py-2 rounded-lg text-xs font-bold text-red-600 border border-red-100 hover:bg-red-50 transition-all">Unpublish</button>
                                </div>
                            )}
                            {app.status === 'rejected' && (
                                <div className="space-y-2">
                                    {app.rejectReason && <p className="text-[11px] text-red-500 bg-red-50 px-2 py-1.5 rounded-lg border border-red-100">{app.rejectReason}</p>}
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setViewApp(app)} className="flex-1 py-2 rounded-lg text-xs font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">View</button>
                                        <button onClick={() => { updateStatus(app.id, 'pending', { rejectReason: undefined }); setToast({ msg: `"${app.name}" moved back to pending review`, type: 'success' }); }}
                                            className="flex-1 py-2 rounded-lg text-xs font-bold border hover:opacity-80 transition-all" style={{ color: '#14B8A6', borderColor: 'rgba(20,184,166,0.3)' }}>
                                            Re-review
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && <div className="py-20 text-center"><p className="text-[#9CA3AF] text-sm">No apps match your search.</p></div>}

            {/* Review Modal */}
            {reviewApp && (
                <Modal title={`Review App — ${reviewApp.name}`} onClose={() => setReviewApp(null)} width="max-w-lg">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-[#f6f6f7] rounded-xl">
                            <div className="text-3xl">{reviewApp.icon}</div>
                            <div>
                                <p className="font-bold text-[#202223]">{reviewApp.name}</p>
                                <p className="text-xs text-[#9CA3AF]">by {reviewApp.developer} · v{reviewApp.version}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-[#5c5f62] mb-1">Description</p>
                            <p className="text-sm text-[#202223]">{reviewApp.desc}</p>
                        </div>
                        {[['Category', reviewApp.category], ['Pricing', reviewApp.price], ['Submitted', reviewApp.submitted]].map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between py-2 border-b border-[#f0f0f0]">
                                <span className="text-xs font-semibold text-[#9CA3AF]">{k}</span>
                                <span className="text-sm font-semibold text-[#202223]">{v}</span>
                            </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => { setRejectApp(reviewApp); setReviewApp(null); }}
                                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all">Reject</button>
                            <button onClick={() => handleApprove(reviewApp)}
                                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#008060' }}>Approve & Publish</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Reject Modal */}
            {rejectApp && (
                <Modal title={`Reject — ${rejectApp.name}`} onClose={() => setRejectApp(null)}>
                    <div className="space-y-4">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-800">The developer will be notified with your reason for rejection. Please be specific.</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Reason for rejection</label>
                            <select className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm bg-white focus:outline-none mb-2">
                                <option>Policy violation</option>
                                <option>Misleading description</option>
                                <option>Security concerns</option>
                                <option>Incomplete functionality</option>
                                <option>Other</option>
                            </select>
                            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                                placeholder="Add detailed notes for the developer..."
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setRejectApp(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">Cancel</button>
                            <button onClick={handleReject} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#DC2626' }}>Confirm Rejection</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* View Details Modal */}
            {viewApp && (
                <Modal title="App Details" onClose={() => setViewApp(null)} width="max-w-lg">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b border-[#f0f0f0]">
                            <div className="text-4xl">{viewApp.icon}</div>
                            <div>
                                <h3 className="text-lg font-black text-[#202223]">{viewApp.name}</h3>
                                <p className="text-sm text-[#9CA3AF]">by {viewApp.developer}</p>
                                <StatusBadge status={viewApp.status} />
                            </div>
                        </div>
                        <p className="text-sm text-[#5c5f62]">{viewApp.desc}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[['Category', viewApp.category], ['Pricing', viewApp.price], ['Version', viewApp.version], ['Installs', viewApp.installs.toLocaleString()], ['Rating', viewApp.rating || 'N/A'], ['Submitted', viewApp.submitted]].map(([k, v]) => (
                                <div key={k} className="bg-[#f6f6f7] rounded-lg p-3">
                                    <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">{k}</p>
                                    <p className="text-sm font-bold text-[#202223] mt-0.5">{v}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setViewApp(null)} className="w-full py-2.5 rounded-lg text-sm font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">Close</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AppsTab;
