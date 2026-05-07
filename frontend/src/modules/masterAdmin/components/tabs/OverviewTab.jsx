import React from 'react';
import { Link } from 'react-router-dom';

const kpiCards = [
    {
        label: 'Total Active Stores',
        value: '1,247',
        change: '+12.3%',
        positive: true,
        sub: 'vs last month',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        color: '#14B8A6',
        bg: 'rgba(20,184,166,0.08)',
    },
    {
        label: 'Monthly Revenue',
        value: '$2.41M',
        change: '+18.4%',
        positive: true,
        sub: 'platform GMV',
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        color: '#8B5CF6',
        bg: 'rgba(139,92,246,0.08)',
    },
    {
        label: 'Active Merchants',
        value: '891',
        change: '+8.7%',
        positive: true,
        sub: 'paying accounts',
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.08)',
    },
    {
        label: 'New Signups (30d)',
        value: '124',
        change: '+23.1%',
        positive: true,
        sub: 'new registrations',
        icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
        color: '#3B82F6',
        bg: 'rgba(59,130,246,0.08)',
    },
];

const recentStores = [
    { name: 'NovaBotanics', owner: 'Clara Reid', plan: 'Basic', country: 'AU', time: '2h ago' },
    { name: 'UrbanThreads', owner: 'Ravi Kumar', plan: 'Advanced', country: 'IN', time: '5h ago' },
    { name: 'SwiftGadgets', owner: 'Thomas Müller', plan: 'Plus', country: 'DE', time: '9h ago' },
    { name: 'PeakOutdoors', owner: 'Sofia Alvarez', plan: 'Basic', country: 'MX', time: '14h ago' },
    { name: 'GlowSkinLab', owner: 'Ji-Young Park', plan: 'Advanced', country: 'KR', time: '1d ago' },
];

const recentActivity = [
    { icon: '🏪', text: 'TechGadgets Pro upgraded to Plus plan', time: '10m ago', type: 'upgrade' },
    { icon: '⚠️', text: 'GourmetKitchen suspended: payment failure', time: '1h ago', type: 'warn' },
    { icon: '🎉', text: 'LuxuryWatches reached $100k GMV milestone', time: '2h ago', type: 'success' },
    { icon: '📱', text: 'App "ReturnDesk" approved for marketplace', time: '3h ago', type: 'app' },
    { icon: '🔒', text: 'Security: 2 accounts locked — brute force', time: '4h ago', type: 'security' },
    { icon: '📣', text: 'Platform announcement sent to 891 merchants', time: '6h ago', type: 'announce' },
];

const revenueData = [
    { day: 'Mon', val: 68 }, { day: 'Tue', val: 75 }, { day: 'Wed', val: 55 },
    { day: 'Thu', val: 82 }, { day: 'Fri', val: 91 }, { day: 'Sat', val: 63 },
    { day: 'Sun', val: 79 },
];

const planDist = [
    { name: 'Plus', count: 187, pct: 21, color: '#8B5CF6' },
    { name: 'Advanced', count: 312, pct: 35, color: '#14B8A6' },
    { name: 'Basic', count: 268, pct: 30, color: '#3B82F6' },
    { name: 'Free', count: 124, pct: 14, color: '#6B7280' },
];

const healthChecks = [
    { label: 'API Gateway', status: 'operational', latency: '42ms' },
    { label: 'Database Cluster', status: 'operational', latency: '8ms' },
    { label: 'CDN', status: 'operational', latency: '11ms' },
    { label: 'Payment Gateway', status: 'operational', latency: '130ms' },
    { label: 'Email Service', status: 'degraded', latency: '820ms' },
];

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const OverviewTab = () => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Platform Overview</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Real-time snapshot of Storify's platform health and metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#5c5f62]">Last updated: just now</span>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-[#e3e3e3] text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((k) => (
                    <div key={k.label} className={`${card} p-5`}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: k.bg }}>
                                <svg className="w-5 h-5" style={{ color: k.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={k.icon} />
                                </svg>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${k.positive ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {k.change}
                            </span>
                        </div>
                        <p className="text-2xl font-black text-[#202223] leading-none">{k.value}</p>
                        <p className="text-xs text-[#5c5f62] mt-1 font-medium">{k.label}</p>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">{k.sub}</p>
                    </div>
                ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Open Tickets', value: '8', link: '/master-admin/support', color: '#ef4444' },
                    { label: 'Apps Pending Review', value: '3', link: '/master-admin/apps', color: '#F59E0B' },
                    { label: 'Trial Stores Expiring (7d)', value: '14', link: '/master-admin/stores', color: '#3B82F6' },
                ].map(q => (
                    <Link key={q.label} to={q.link} className={`${card} p-4 flex items-center justify-between hover:shadow-md transition-all group`}>
                        <span className="text-sm font-semibold text-[#5c5f62] group-hover:text-[#202223] transition-colors">{q.label}</span>
                        <span className="text-xl font-black" style={{ color: q.color }}>{q.value}</span>
                    </Link>
                ))}
            </div>

            {/* Middle Grid: Revenue Chart + Plan Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Revenue Trend */}
                <div className={`${card} p-6 lg:col-span-2`}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-sm font-bold text-[#202223]">Revenue Trend</h2>
                            <p className="text-xs text-[#9CA3AF] mt-0.5">Last 7 days — platform GMV</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            18.4% this week
                        </div>
                    </div>
                    <div className="flex items-end gap-3 h-32">
                        {revenueData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                <div
                                    className="w-full rounded-t-md transition-all"
                                    style={{
                                        height: `${d.val}%`,
                                        background: i === 4 ? 'linear-gradient(180deg, #14B8A6, #0F766E)' : '#E5E7EB',
                                        minHeight: 8
                                    }}
                                />
                                <span className="text-[10px] font-semibold text-[#9CA3AF]">{d.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#f0f0f0] flex items-center justify-between text-xs text-[#9CA3AF]">
                        <span>Peak day: <strong className="text-[#202223]">Friday — $487K</strong></span>
                        <Link to="/master-admin/analytics" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#14B8A6' }}>Full analytics →</Link>
                    </div>
                </div>

                {/* Plan Distribution */}
                <div className={`${card} p-6`}>
                    <div className="mb-5">
                        <h2 className="text-sm font-bold text-[#202223]">Plan Distribution</h2>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">Active subscriber breakdown</p>
                    </div>
                    <div className="space-y-4">
                        {planDist.map(p => (
                            <div key={p.name}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-[#202223]">{p.name}</span>
                                    <span className="text-xs text-[#5c5f62]">{p.count} <span className="text-[#9CA3AF]">({p.pct}%)</span></span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: p.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-[#f0f0f0]">
                        <p className="text-xs text-[#9CA3AF]">Total: <strong className="text-[#202223]">891 active</strong></p>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Recent Stores + Activity + Platform Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Recent Store Signups */}
                <div className={`${card} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-[#202223]">Recent Signups</h2>
                        <Link to="/master-admin/stores" className="text-xs font-semibold hover:opacity-80" style={{ color: '#14B8A6' }}>View all</Link>
                    </div>
                    <div className="space-y-3">
                        {recentStores.map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: '#1a1c23' }}>
                                    {s.name.charAt(0)}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="text-sm font-semibold text-[#202223] truncate">{s.name}</p>
                                    <p className="text-xs text-[#9CA3AF]">{s.owner} · {s.country}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-[#14B8A6] bg-[#14B8A6]/10">{s.plan}</span>
                                    <span className="text-[10px] text-[#9CA3AF]">{s.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className={`${card} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-[#202223]">Activity Feed</h2>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Live</span>
                    </div>
                    <div className="space-y-3">
                        {recentActivity.map((a, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <span className="text-base flex-shrink-0 mt-0.5">{a.icon}</span>
                                <div className="flex-grow min-w-0">
                                    <p className="text-xs text-[#202223] leading-snug">{a.text}</p>
                                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Platform Health */}
                <div className={`${card} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-[#202223]">Platform Health</h2>
                        <Link to="/master-admin/settings" className="text-xs font-semibold hover:opacity-80" style={{ color: '#14B8A6' }}>Details</Link>
                    </div>
                    <div className="space-y-3">
                        {healthChecks.map((h, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-[#f5f5f5] last:border-0">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${h.status === 'operational' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                    <span className="text-xs font-semibold text-[#202223]">{h.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-[#9CA3AF]">{h.latency}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${h.status === 'operational' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                        {h.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#f0f0f0]">
                        <p className="text-xs text-[#9CA3AF]">4/5 services <strong className="text-green-600">fully operational</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
