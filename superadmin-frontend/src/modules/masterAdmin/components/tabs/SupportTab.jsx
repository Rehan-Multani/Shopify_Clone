import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:5002/api/admin';

// Premium Color configurations matching theme
const priorityConfig = {
    high: { color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5', label: 'High Priority' },
    medium: { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', label: 'Medium Priority' },
    low: { color: '#047857', bg: '#D1FAE5', border: '#A7F3D0', label: 'Low Priority' },
};

const statusConfig = {
    open: { color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5', label: 'Open' },
    'in-progress': { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', label: 'In Progress' },
    resolved: { color: '#047857', bg: '#D1FAE5', border: '#A7F3D0', label: 'Resolved' },
    closed: { color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB', label: 'Closed' },
};

const Modal = ({ title, onClose, children }) => {
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-10 sm:pt-16 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transition-all duration-300 transform scale-100 flex flex-col">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50/20 to-transparent flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 text-[#0f766e] rounded-xl">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <p className="text-xs text-gray-500">Initiate a support issue on behalf of any merchant partner.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>,
        document.body
    );
};

const SupportTab = () => {
    const [tickets, setTickets] = useState([]);
    const [merchants, setMerchants] = useState([]);
    const [allStores, setAllStores] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reply, setReply] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({ merchantId: '', storeId: '', title: '', description: '', priority: 'medium' });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    let token = '';
    const masterAdminInfoStr = localStorage.getItem('masterAdminInfo');
    if (masterAdminInfoStr) {
        try {
            token = JSON.parse(masterAdminInfoStr).token || '';
        } catch (e) { }
    }
    if (!token) {
        token = localStorage.getItem('merchantToken') || '';
    }

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/support-tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTickets(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching admin tickets:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMerchants = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/merchants`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMerchants(data || []);
            }
        } catch (err) {
            console.error('Error fetching merchants for ticket selection:', err);
        }
    };

    const fetchStores = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/stores/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAllStores(data || []);
            }
        } catch (err) {
            console.error('Error fetching all stores:', err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTickets();
            fetchMerchants();
            fetchStores();
        }
    }, [token]);

    const fetchTicketDetails = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/support-tickets/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedTicket(data.data);
                setTickets(prev => prev.map(t => t._id === id ? data.data : t));
            }
        } catch (err) {
            console.error('Error fetching ticket details:', err);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        if (!form.merchantId || !form.title.trim() || !form.description.trim()) {
            setErrorMsg('All fields are required');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/support-tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg('Support ticket created for merchant successfully!');
                setForm({ merchantId: '', storeId: '', title: '', description: '', priority: 'medium' });
                setIsCreating(false);
                fetchTickets();
                setSelectedTicket(data.data);
                setTimeout(() => setSuccessMsg(''), 4000);
            } else {
                setErrorMsg(data.message || 'Failed to create support ticket');
            }
        } catch (err) {
            setErrorMsg('Network error. Please try again.');
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;

        try {
            const res = await fetch(`${API_BASE_URL}/support-tickets/${selectedTicket._id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: reply.trim() })
            });
            if (res.ok) {
                setReply('');
                fetchTicketDetails(selectedTicket._id);
            }
        } catch (err) {
            console.error('Error sending admin reply:', err);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/support-tickets/${selectedTicket._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchTicketDetails(selectedTicket._id);
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const counts = {
        all: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        'in-progress': tickets.filter(t => t.status === 'in-progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
    };

    const filtered = tickets.filter(t => {
        const matchFilter = filter === 'all' || t.status === filter;
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
            (t.merchantId && t.merchantId.name && t.merchantId.name.toLowerCase().includes(search.toLowerCase())) ||
            (t.merchantId && t.merchantId.businessName && t.merchantId.businessName.toLowerCase().includes(search.toLowerCase()));
        return matchFilter && matchSearch;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            {/* Header section with brand dark green gradient details */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-[#111827] tracking-tight">Merchant Support Hub</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor, assign, and resolve tickets submitted by merchants.</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => { setIsCreating(true); setSelectedTicket(null); }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md shadow-black/10 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                        style={{ background: '#1a1c23' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        New Support Ticket
                    </button>
                )}
            </div>

            {/* Notification Messages */}
            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-medium flex items-center gap-3 animate-fade-in shadow-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">✓</span>
                    {successMsg}
                </div>
            )}

            {isCreating && (
                <Modal title="Create Ticket for Merchant" onClose={() => setIsCreating(false)}>
                    {errorMsg && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleCreateTicket} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1.5">Select Merchant Partner *</label>
                                <div className="relative">
                                    <select
                                        value={form.merchantId}
                                        onChange={e => setForm({ ...form, merchantId: e.target.value, storeId: '' })}
                                        className="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] bg-white transition-all appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">-- Select a Merchant --</option>
                                        {merchants.map(m => (
                                            <option key={m._id} value={m._id}>{m.name} {m.businessName ? `(${m.businessName})` : '(No Business Name)'}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1.5">Select Associated Store (Optional)</label>
                                <div className="relative">
                                    <select
                                        value={form.storeId}
                                        onChange={e => setForm({ ...form, storeId: e.target.value })}
                                        className={`w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] bg-white transition-all appearance-none ${!form.merchantId ? 'bg-gray-50 opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                        disabled={!form.merchantId}
                                    >
                                        <option value="">-- General / Account Wide Ticket --</option>
                                        {allStores
                                            .filter(s => (s.merchantId?._id || s.merchantId) === form.merchantId)
                                            .map(s => (
                                                <option key={s._id} value={s._id}>{s.storeName}</option>
                                            ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-700 block mb-1.5">Subject / Title *</label>
                                <input
                                    type="text"
                                    placeholder="Briefly state the support topic"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] bg-white transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1.5">Priority Level</label>
                                <div className="relative">
                                    <select
                                        value={form.priority}
                                        onChange={e => setForm({ ...form, priority: e.target.value })}
                                        className="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] bg-white transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">High Priority</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1.5">Detailed Description *</label>
                            <textarea
                                rows="5"
                                placeholder="Describe the support request in detail..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] bg-white transition-all"
                                required
                            />
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-center"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 text-white text-sm font-bold py-3 rounded-xl hover:opacity-95 shadow-md shadow-black/10 transition-all active:scale-95 text-center"
                                style={{ background: '#1a1c23' }}
                            >
                                Create & Open Ticket
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Visual & Premium Statistic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    {
                        label: 'Total Tickets',
                        value: counts.all,
                        color: 'text-gray-900',
                        bg: 'bg-gray-50',
                        icon: (
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v8m-6-8v8m-3-12h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                            </svg>
                        )
                    },
                    {
                        label: 'Open Status',
                        value: counts.open,
                        color: 'text-red-600',
                        bg: 'bg-red-50',
                        icon: (
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )
                    },
                    {
                        label: 'In Progress',
                        value: counts['in-progress'],
                        color: 'text-amber-600',
                        bg: 'bg-amber-50',
                        icon: (
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )
                    },
                    {
                        label: 'Resolved Tickets',
                        value: counts.resolved,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50',
                        icon: (
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )
                    },
                ].map((s, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-200/70 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                            <p className={`text-3xl font-extrabold tracking-tight mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${s.bg}`}>
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                {/* Tickets List Card */}
                <div className={`bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden ${selectedTicket ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
                    {/* Filter Bar */}
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap bg-gray-50/50">
                        <div className="flex items-center gap-1 bg-gray-200/50 rounded-xl p-1">
                            {[
                                { key: 'all', label: `All (${counts.all})` },
                                { key: 'open', label: `Open (${counts.open})` },
                                { key: 'in-progress', label: `In Progress (${counts['in-progress']})` },
                                { key: 'resolved', label: `Resolved (${counts.resolved})` },
                            ].map(f => (
                                <button key={f.key} onClick={() => setFilter(f.key)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${filter === f.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-grow sm:flex-grow-0">
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by merchant, store or title..."
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 bg-white w-full sm:w-60 transition-all" />
                        </div>
                    </div>

                    {/* Ticket List Items */}
                    <div className="divide-y divide-gray-100">
                        {isLoading ? (
                            <div className="p-12 text-center text-sm text-gray-400">
                                <div className="animate-pulse flex flex-col items-center gap-3">
                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-48 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        ) : filtered.map(t => {
                            const p = priorityConfig[t.priority] || priorityConfig.medium;
                            const s = statusConfig[t.status] || statusConfig.open;
                            const isSelected = selectedTicket?._id === t._id;
                            return (
                                <div key={t._id}
                                    onClick={() => { setSelectedTicket(isSelected ? null : t); setIsCreating(false); }}
                                    className={`px-5 py-4 cursor-pointer transition-all duration-150 relative ${isSelected ? 'bg-teal-50/40 border-l-4 border-[#0f766e]' : 'hover:bg-gray-50/50 border-l-4 border-transparent'}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className="text-[10px] font-black text-gray-400 tracking-wider">#{t._id.slice(-6).toUpperCase()}</span>
                                                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-wider">
                                                    {t.createdBy === 'admin' ? 'Staff' : 'Merchant'}
                                                </span>
                                                {t.storeId?.storeName && (
                                                    <span className="text-[9px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                                                        🏬 {t.storeId.storeName}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm font-semibold text-gray-900 ${isSelected ? 'text-[#0f766e]' : ''} truncate`}>{t.title}</p>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-gray-700">{t.merchantId?.name || 'Unknown'}</span>
                                                <span>·</span>
                                                <span className="truncate max-w-[150px]">{t.merchantId?.email}</span>
                                                <span>·</span>
                                                <span>{new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border" style={{ color: p.color, background: p.bg, borderColor: p.border }}>
                                                {p.label}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border" style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                                                <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: s.color }} />
                                                {s.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {!isLoading && filtered.length === 0 && (
                        <div className="py-16 text-center">
                            <span className="text-3xl">📂</span>
                            <p className="text-gray-400 text-sm mt-3 font-semibold">No tickets match your filter criteria.</p>
                        </div>
                    )}
                </div>

                {/* Ticket Detail Panel (Modern Chat Thread Layout) */}
                {selectedTicket && (
                    <div className="bg-white border border-gray-200/80 rounded-2xl shadow-lg col-span-1 lg:col-span-2 flex flex-col h-[650px] overflow-hidden transition-all duration-300">
                        {/* Details Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50/30 to-transparent">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black text-gray-400">TICKET #{selectedTicket._id.slice(-6).toUpperCase()}</p>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                </div>
                                <p className="text-sm font-bold text-gray-900 truncate mt-0.5" title={selectedTicket.title}>{selectedTicket.title}</p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="p-1.5 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Meta Info Accordion/Grid */}
                        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-gray-600">
                            <div>
                                <span className="text-gray-400 font-medium block">Merchant Partner</span>
                                <span className="font-bold text-gray-800">{selectedTicket.merchantId?.name || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 font-medium block">Associated Store</span>
                                <span className="font-bold text-gray-800 truncate block">{selectedTicket.storeId?.storeName || selectedTicket.merchantId?.businessName || 'General Account'}</span>
                            </div>
                            <div className="col-span-2 border-t border-gray-100 pt-1.5 mt-1 flex items-center justify-between">
                                <div>
                                    <span className="text-gray-400 font-medium mr-2">Status:</span>
                                    <span className="font-black text-[#0f766e]">{selectedTicket.status.toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-gray-400 font-medium">Priority:</span>
                                    <span className="font-black text-amber-700 capitalize">{selectedTicket.priority}</span>
                                </div>
                            </div>
                        </div>

                        {/* Chat Conversation Area */}
                        <div className="flex-grow p-5 overflow-y-auto space-y-4 bg-[#f8fafc]">
                            {selectedTicket.messages.map((msg, i) => {
                                const isAdmin = msg.sender === 'admin';
                                return (
                                    <div
                                        key={i}
                                        className={`flex flex-col max-w-[85%] ${isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                                    >
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1 px-1">
                                            {isAdmin ? '🛡️ Support Staff' : `👤 Merchant (${selectedTicket.merchantId?.name || 'Partner'})`}
                                        </span>
                                        <div className={`p-3 rounded-2xl text-xs shadow-sm leading-relaxed ${isAdmin ? 'bg-gradient-to-r from-teal-800 to-teal-700 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                            {msg.message}
                                        </div>
                                        <span className="text-[9px] text-gray-400 mt-1 px-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Message Input / Resolution Controls */}
                        <div className="px-5 pb-5 pt-3.5 border-t border-gray-100 bg-white space-y-3">
                            {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' ? (
                                <>
                                    <textarea value={reply} onChange={e => setReply(e.target.value)}
                                        placeholder="Write a helpful response for the merchant..."
                                        className="w-full border border-gray-200 rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-teal-700/25 focus:border-[#0f766e] bg-white transition-all"
                                        rows={2} />
                                    <div className="flex items-center gap-3">
                                        <button onClick={handleSendReply} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-95 shadow-md shadow-black/10 transition-all" style={{ background: '#1a1c23' }}>
                                            Send Response
                                        </button>
                                        <button onClick={() => handleStatusUpdate('resolved')} className="px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center gap-1.5">
                                            <span className="text-sm">✓</span> Mark Resolved
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center bg-gray-50 border border-gray-100 rounded-xl py-4 flex flex-col items-center gap-1">
                                    <span className="text-base">🎉</span>
                                    <p className="text-xs font-bold text-gray-500">This support ticket is resolved and closed.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportTab;
