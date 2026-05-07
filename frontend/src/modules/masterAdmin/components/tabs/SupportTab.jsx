import React, { useState } from 'react';

const tickets = [
    { id: 1082, subject: 'Payment gateway not processing refunds', store: 'TechGadgets Pro', merchant: 'James Wilson', priority: 'high', category: 'Payments', status: 'open', created: '2026-05-06 09:14', updated: '2h ago' },
    { id: 1081, subject: 'Theme customization editor crashes on save', store: 'FashionForward', merchant: 'Priya Patel', priority: 'medium', category: 'Theme', status: 'in_progress', created: '2026-05-05 16:32', updated: '5h ago' },
    { id: 1080, subject: 'Cannot add team member to store account', store: 'BeautyEssentials', merchant: 'Aisha Johnson', priority: 'low', category: 'Account', status: 'open', created: '2026-05-05 14:20', updated: '7h ago' },
    { id: 1079, subject: 'CSV product import failing for large files', store: 'ArtisanCrafts', merchant: 'Maria Santos', priority: 'medium', category: 'Products', status: 'resolved', created: '2026-05-04 11:05', updated: '1d ago' },
    { id: 1078, subject: 'Shipping rates not displaying at checkout', store: 'OutdoorAdventures', merchant: 'Mike Chen', priority: 'high', category: 'Shipping', status: 'in_progress', created: '2026-05-04 08:47', updated: '1d ago' },
    { id: 1077, subject: 'Analytics dashboard showing incorrect revenue', store: 'SportsElite', merchant: 'Carlos Rodriguez', priority: 'medium', category: 'Analytics', status: 'open', created: '2026-05-03 19:33', updated: '2d ago' },
    { id: 1076, subject: 'Domain connection not propagating', store: 'LuxuryWatches', merchant: 'Isabella Ferrari', priority: 'low', category: 'Domains', status: 'resolved', created: '2026-05-03 15:14', updated: '2d ago' },
    { id: 1075, subject: 'Discount code "SPRING25" not applying', store: 'HomeDecorBliss', merchant: 'Emma Thompson', priority: 'low', category: 'Discounts', status: 'resolved', created: '2026-05-02 12:08', updated: '3d ago' },
];

const priorityConfig = {
    high: { color: '#DC2626', bg: '#FEF2F2', label: 'High' },
    medium: { color: '#B45309', bg: '#FFFBEB', label: 'Medium' },
    low: { color: '#15803d', bg: '#F0FDF4', label: 'Low' },
};

const statusConfig = {
    open: { color: '#DC2626', bg: '#FEF2F2', label: 'Open' },
    in_progress: { color: '#B45309', bg: '#FFFBEB', label: 'In Progress' },
    resolved: { color: '#15803d', bg: '#F0FDF4', label: 'Resolved' },
};

const categoryColors = {
    Payments: ['#8B5CF6', '#F5F3FF'],
    Theme: ['#EC4899', '#FDF2F8'],
    Account: ['#6B7280', '#F9FAFB'],
    Products: ['#3B82F6', '#EFF6FF'],
    Shipping: ['#14B8A6', '#F0FDFA'],
    Analytics: ['#F59E0B', '#FFFBEB'],
    Domains: ['#6B7280', '#F9FAFB'],
    Discounts: ['#EF4444', '#FEF2F2'],
};

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const SupportTab = () => {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [reply, setReply] = useState('');

    const counts = {
        all: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
    };

    const filtered = tickets.filter(t => {
        const matchFilter = filter === 'all' || t.status === filter;
        const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
            t.store.toLowerCase().includes(search.toLowerCase()) ||
            t.merchant.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const selectedTicket = tickets.find(t => t.id === selected);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Support</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Manage and resolve merchant support tickets.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 transition-all" style={{ background: '#1a1c23' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create Ticket
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Tickets', value: counts.all },
                    { label: 'Open', value: counts.open, color: '#DC2626' },
                    { label: 'In Progress', value: counts.in_progress, color: '#B45309' },
                    { label: 'Resolved Today', value: 3, color: '#15803d' },
                ].map(s => (
                    <div key={s.label} className={`${card} p-4`}>
                        <p className="text-2xl font-black" style={{ color: s.color || '#202223' }}>{s.value}</p>
                        <p className="text-xs font-semibold text-[#5c5f62] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className={`${selected ? 'grid grid-cols-5 gap-5' : ''}`}>
                {/* Tickets List */}
                <div className={`${card} ${selected ? 'col-span-3' : ''}`}>
                    <div className="px-5 py-4 border-b border-[#e3e3e3] flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-1 bg-[#f6f6f7] rounded-lg p-1">
                            {[
                                { key: 'all', label: `All (${counts.all})` },
                                { key: 'open', label: `Open (${counts.open})` },
                                { key: 'in_progress', label: `In Progress (${counts.in_progress})` },
                                { key: 'resolved', label: `Resolved (${counts.resolved})` },
                            ].map(f => (
                                <button key={f.key} onClick={() => setFilter(f.key)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === f.key ? 'bg-white shadow-sm text-[#202223]' : 'text-[#5c5f62] hover:text-[#202223]'}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <svg className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search tickets..."
                                className="pl-9 pr-4 py-1.5 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white w-48" />
                        </div>
                    </div>

                    <div className="divide-y divide-[#f5f5f5]">
                        {filtered.map(t => {
                            const p = priorityConfig[t.priority];
                            const s = statusConfig[t.status];
                            const [catColor, catBg] = categoryColors[t.category] || ['#6B7280', '#F9FAFB'];
                            return (
                                <div key={t.id}
                                    onClick={() => setSelected(selected === t.id ? null : t.id)}
                                    className={`px-5 py-4 cursor-pointer transition-colors ${selected === t.id ? 'bg-[#f0fdfa]' : 'hover:bg-[#fafafa]'}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[11px] font-black text-[#9CA3AF]">#{t.id}</span>
                                                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: catColor, background: catBg }}>
                                                    {t.category}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-[#202223] truncate">{t.subject}</p>
                                            <p className="text-xs text-[#9CA3AF] mt-1">{t.store} · {t.merchant} · {t.updated}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: p.color, background: p.bg }}>
                                                {p.label}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: s.color, background: s.bg }}>
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                                                {s.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filtered.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-[#9CA3AF] text-sm">No tickets found.</p>
                        </div>
                    )}
                </div>

                {/* Ticket Detail Panel */}
                {selected && selectedTicket && (
                    <div className={`${card} col-span-2 flex flex-col`} style={{ maxHeight: 600 }}>
                        <div className="px-5 py-4 border-b border-[#e3e3e3] flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-[#9CA3AF]">Ticket #{selectedTicket.id}</p>
                                <p className="text-sm font-bold text-[#202223] mt-0.5">{selectedTicket.subject}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-[#9CA3AF]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="px-5 py-4 border-b border-[#e3e3e3] space-y-2">
                            {[
                                ['Store', selectedTicket.store],
                                ['Merchant', selectedTicket.merchant],
                                ['Category', selectedTicket.category],
                                ['Created', selectedTicket.created],
                            ].map(([l, v]) => (
                                <div key={l} className="flex items-center justify-between">
                                    <span className="text-xs text-[#9CA3AF]">{l}</span>
                                    <span className="text-xs font-semibold text-[#202223]">{v}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex-grow p-5 overflow-y-auto">
                            <div className="p-3 bg-[#f6f6f7] rounded-lg mb-3">
                                <p className="text-xs font-bold text-[#9CA3AF] mb-1">Merchant message</p>
                                <p className="text-sm text-[#202223]">Having issues with {selectedTicket.subject.toLowerCase()}. This has been happening since yesterday and it's affecting my sales. Please help urgently.</p>
                            </div>
                        </div>
                        <div className="px-5 pb-5 pt-3 border-t border-[#e3e3e3] space-y-2">
                            <textarea value={reply} onChange={e => setReply(e.target.value)}
                                placeholder="Type your reply..."
                                className="w-full border border-[#d3d3d3] rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
                                rows={3} />
                            <div className="flex items-center gap-2">
                                <button className="flex-1 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90 transition-all" style={{ background: '#1a1c23' }}>
                                    Send Reply
                                </button>
                                <button className="px-3 py-2 rounded-lg text-xs font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-all">
                                    Resolve
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportTab;
