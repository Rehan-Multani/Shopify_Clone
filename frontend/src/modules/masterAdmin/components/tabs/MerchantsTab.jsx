import React, { useState } from 'react';

const allMerchants = [
    { id: 1, name: 'James Wilson', email: 'james@techgadgets.com', stores: 2, plan: 'Advanced', status: 'active', location: 'New York, US', joined: '2024-03-15', revenue: '$62,400' },
    { id: 2, name: 'Priya Patel', email: 'priya@fashionforward.in', stores: 3, plan: 'Plus', status: 'active', location: 'Mumbai, IN', joined: '2023-11-20', revenue: '$134,700' },
    { id: 3, name: 'Emma Thompson', email: 'emma@homedecor.co.uk', stores: 1, plan: 'Basic', status: 'trial', location: 'London, UK', joined: '2025-01-02', revenue: '$4,200' },
    { id: 4, name: 'Carlos Rodriguez', email: 'carlos@sportselite.mx', stores: 1, plan: 'Advanced', status: 'active', location: 'Mexico City, MX', joined: '2024-07-08', revenue: '$31,500' },
    { id: 5, name: 'Sophie Martin', email: 'sophie@gourmetkitchen.fr', stores: 1, plan: 'Basic', status: 'suspended', location: 'Paris, FR', joined: '2023-08-12', revenue: '$0' },
    { id: 6, name: 'Aisha Johnson', email: 'aisha@beautyessentials.com', stores: 2, plan: 'Plus', status: 'active', location: 'Los Angeles, US', joined: '2023-05-30', revenue: '$89,200' },
    { id: 7, name: 'Mike Chen', email: 'mike@outdooradventures.ca', stores: 1, plan: 'Advanced', status: 'active', location: 'Toronto, CA', joined: '2024-01-19', revenue: '$29,400' },
    { id: 8, name: 'Laura Vance', email: 'laura@digitalnomad.io', stores: 1, plan: 'Basic', status: 'trial', location: 'Sydney, AU', joined: '2025-04-10', revenue: '$1,850' },
    { id: 9, name: 'Kevin Park', email: 'kevin@petlovers.kr', stores: 2, plan: 'Advanced', status: 'active', location: 'Seoul, KR', joined: '2024-09-05', revenue: '$44,800' },
    { id: 10, name: 'Maria Santos', email: 'maria@artisancrafts.br', stores: 1, plan: 'Plus', status: 'active', location: 'São Paulo, BR', joined: '2023-12-01', revenue: '$41,200' },
    { id: 11, name: 'Tom Anderson', email: 'tom@ecofriendly.com', stores: 3, plan: 'Basic', status: 'active', location: 'Seattle, US', joined: '2024-06-22', revenue: '$26,700' },
    { id: 12, name: 'Isabella Ferrari', email: 'isabella@luxurywatches.it', stores: 1, plan: 'Plus', status: 'active', location: 'Milan, IT', joined: '2023-02-14', revenue: '$112,400' },
    { id: 13, name: 'Yuki Tanaka', email: 'yuki@japancraft.jp', stores: 2, plan: 'Advanced', status: 'active', location: 'Tokyo, JP', joined: '2024-04-01', revenue: '$58,900' },
    { id: 14, name: 'Ahmed Hassan', email: 'ahmed@digitalshop.ae', stores: 1, plan: 'Basic', status: 'trial', location: 'Dubai, AE', joined: '2025-03-18', revenue: '$2,300' },
    { id: 15, name: 'Nina Johansson', email: 'nina@scandinavian.se', stores: 2, plan: 'Plus', status: 'active', location: 'Stockholm, SE', joined: '2023-09-07', revenue: '$76,500' },
];

const PlanBadge = ({ plan }) => {
    const map = { Plus: ['#8B5CF6', '#F5F3FF'], Advanced: ['#14B8A6', '#F0FDFA'], Basic: ['#3B82F6', '#EFF6FF'], Free: ['#6B7280', '#F9FAFB'] };
    const [color, bg] = map[plan] || ['#6B7280', '#F9FAFB'];
    return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color, background: bg }}>{plan}</span>;
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

const avatarColors = ['#14B8A6', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#10B981'];

const ITEMS_PER_PAGE = 8;
const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const MerchantsTab = () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);

    const filtered = allMerchants.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            m.location.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || m.status === filter;
        return matchSearch && matchFilter;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const counts = {
        all: allMerchants.length,
        active: allMerchants.filter(m => m.status === 'active').length,
        trial: allMerchants.filter(m => m.status === 'trial').length,
        suspended: allMerchants.filter(m => m.status === 'suspended').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Merchants</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Manage all merchant accounts on the platform.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-[#e3e3e3] text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-all hover:opacity-90" style={{ background: '#1a1c23' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Merchants', value: counts.all },
                    { label: 'Active', value: counts.active, color: '#15803d' },
                    { label: 'In Trial', value: counts.trial, color: '#B45309' },
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
                    <div className="flex items-center gap-1 bg-[#f6f6f7] rounded-lg p-1">
                        {['all', 'active', 'trial', 'suspended'].map(f => (
                            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${filter === f ? 'bg-white shadow-sm text-[#202223]' : 'text-[#5c5f62] hover:text-[#202223]'}`}>
                                {f === 'all' ? `All (${counts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
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
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#f0f0f0]">
                                {['Merchant', 'Location', 'Stores', 'Plan', 'Status', 'Total Revenue', 'Joined', ''].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-[#9CA3AF]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((m, i) => (
                                <tr key={m.id} className={`border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors ${i === paginated.length - 1 ? 'border-0' : ''}`}>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                                                style={{ background: avatarColors[m.id % avatarColors.length] }}>
                                                {m.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#202223]">{m.name}</p>
                                                <p className="text-[11px] text-[#9CA3AF]">{m.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-[#5c5f62]">{m.location}</td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm font-bold text-[#202223]">{m.stores}</span>
                                        <span className="text-xs text-[#9CA3AF] ml-1">{m.stores === 1 ? 'store' : 'stores'}</span>
                                    </td>
                                    <td className="px-5 py-3.5"><PlanBadge plan={m.plan} /></td>
                                    <td className="px-5 py-3.5"><StatusBadge status={m.status} /></td>
                                    <td className="px-5 py-3.5 text-sm font-bold text-[#202223]">{m.revenue}</td>
                                    <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">{m.joined}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1">
                                            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-[#9CA3AF] hover:text-[#202223]" title="View profile">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </button>
                                            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-[#9CA3AF] hover:text-[#202223]" title="Send message">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </button>
                                            <button className="p-1.5 hover:bg-red-50 rounded-lg transition-all text-[#9CA3AF] hover:text-red-500" title="Suspend account">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {paginated.length === 0 && (
                        <div className="py-16 text-center">
                            <p className="text-[#9CA3AF] text-sm">No merchants found.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
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
        </div>
    );
};

export default MerchantsTab;
