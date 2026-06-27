import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} days ago`;
};

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const OverviewTab = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState('just now');

    const getAuthHeaders = () => {
        const info = JSON.parse(localStorage.getItem('masterAdminInfo') || '{}');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${info.token || ''}`
        };
    };

    const fetchOverview = async () => {
        try {
            setError(null);
            const res = await fetch(`${API_BASE_URL}/master-admin/overview`, {
                headers: getAuthHeaders()
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setOverview(result.data);
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                setLastUpdated(time);
            } else {
                setError(result.message || 'Failed to fetch overview data');
            }
        } catch (err) {
            console.error('Error fetching overview:', err);
            setError(err.message || 'Network error occurred while fetching overview stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-4 w-64 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="bg-white border border-[#e3e3e3] rounded-xl p-5 space-y-3">
                            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="h-16 bg-white border border-[#e3e3e3] rounded-xl animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="h-60 bg-white border border-[#e3e3e3] rounded-xl animate-pulse lg:col-span-2"></div>
                    <div className="h-60 bg-white border border-[#e3e3e3] rounded-xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl space-y-4 text-center max-w-xl mx-auto mt-10">
                <span className="text-3xl">⚠️</span>
                <h3 className="text-base font-bold text-red-800">Failed to load platform overview</h3>
                <p className="text-sm text-red-600 font-medium">{error}</p>
                <button 
                    onClick={fetchOverview}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow hover:bg-red-700 transition"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    const { kpi, quickStats, revenueTrend, planDist, recentSignups, activityFeed } = overview;

    const kpiCards = [
        {
            label: 'Total Active Stores',
            value: `${kpi.activeStores} / ${kpi.totalStores}`,
            change: `${Math.round((kpi.activeStores / (kpi.totalStores || 1)) * 100)}%`,
            positive: true,
            sub: 'active storefront ratio',
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
            color: '#14B8A6',
            bg: 'rgba(20,184,166,0.08)',
        },
        {
            label: 'Monthly Revenue (MRR)',
            value: formatCurrency(kpi.mrr),
            change: 'Live',
            positive: true,
            sub: 'recurring SaaS plans',
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            color: '#8B5CF6',
            bg: 'rgba(139,92,246,0.08)',
        },
        {
            label: 'Total Merchants',
            value: kpi.activeMerchants.toLocaleString('en-IN'),
            change: 'Active',
            positive: true,
            sub: 'registered platforms accounts',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            color: '#F59E0B',
            bg: 'rgba(245,158,11,0.08)',
        },
        {
            label: 'New Signups (30d)',
            value: kpi.newSignups30d.toString(),
            change: `${kpi.newSignupsChange >= 0 ? '+' : ''}${kpi.newSignupsChange}%`,
            positive: kpi.newSignupsChange >= 0,
            sub: 'vs prior 30 days',
            icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
            color: '#3B82F6',
            bg: 'rgba(59,130,246,0.08)',
        },
        {
            label: 'Open Tickets',
            value: quickStats.openTickets.toString(),
            change: quickStats.openTickets > 0 ? 'Pending' : 'Resolved',
            positive: quickStats.openTickets === 0,
            sub: 'support queue',
            icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
            color: '#ef4444',
            bg: 'rgba(239,68,68,0.08)',
        },
    ];

    const healthChecks = [
        { label: 'API Gateway', status: 'operational', latency: '24ms' },
        { label: 'Database Cluster', status: 'operational', latency: '9ms' },
        { label: 'CDN Edge Routing', status: 'operational', latency: '12ms' },
        { label: 'Billing Engine', status: 'operational', latency: '45ms' }
    ];

    const maxTrendVal = 100; // Unused but kept for reference

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Platform Overview</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Real-time snapshot of Storify's platform health and metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#5c5f62]">Last updated: {lastUpdated}</span>
                    <button 
                        onClick={fetchOverview}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-[#e3e3e3] text-[#202223] hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

        
            {/* Bottom Grid: Recent Stores + Activity + Platform Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Recent Store Signups */}
                <div className={`${card} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-[#202223]">Recent Signups</h2>
                        <Link to="/superadmin/stores" className="text-xs font-semibold hover:opacity-80" style={{ color: '#14B8A6' }}>View all</Link>
                    </div>
                    <div className="space-y-3">
                        {recentSignups.map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: '#1a1c23' }}>
                                    {s.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="text-sm font-semibold text-[#202223] truncate">{s.name}</p>
                                    <p className="text-xs text-[#9CA3AF] truncate">{s.owner} · {s.email}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-[#14B8A6] bg-[#14B8A6]/10">{s.plan}</span>
                                    <span className="text-[10px] text-[#9CA3AF]">{formatTimeAgo(s.time)}</span>
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
                        {activityFeed.map((a, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <span className="text-base flex-shrink-0 mt-0.5">{a.icon}</span>
                                <div className="flex-grow min-w-0">
                                    <p className="text-xs text-[#202223] leading-snug">{a.text}</p>
                                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{formatTimeAgo(a.time)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={`${card} p-6`}>
                    <div className="mb-4">
                        <h2 className="text-sm font-bold text-[#202223]">Quick Actions</h2>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">Common administrative tasks</p>
                    </div>
                    <div className="space-y-3">
                        <Link to="/superadmin/stores" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100/50 transition-all group">
                            <span className="text-lg">🏪</span>
                            <div className="flex-grow">
                                <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Manage Stores</p>
                                <p className="text-[10px] text-gray-400">View store details and billing states</p>
                            </div>
                        </Link>
                        
                        <Link to="/superadmin/support" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100/50 transition-all group">
                            <span className="text-lg">📣</span>
                            <div className="flex-grow">
                                <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Support Center</p>
                                <p className="text-[10px] text-gray-400">Reply to pending merchant tickets</p>
                            </div>
                        </Link>
                        
                        <Link to="/superadmin/analytics" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100/50 transition-all group">
                            <span className="text-lg">📊</span>
                            <div className="flex-grow">
                                <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Platform Analytics</p>
                                <p className="text-[10px] text-gray-400">Detailed subscription metrics & MRR</p>
                            </div>
                        </Link>

                        <button 
                            onClick={fetchOverview}
                            className="w-full flex items-center justify-center gap-2 p-2.5 bg-[#1a1c23] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" /></svg>
                            Refresh Live Dashboard
                        </button>
                    </div>
                </div>
            </div>
                {/* Plan Distribution */}
            <div className={`${card} p-6`}>
                <div className="mb-5">
                    <h2 className="text-sm font-bold text-[#202223]">Plan Distribution</h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">Active subscriber breakdown</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {planDist.map(p => (
                        <div key={p.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#202223]">{p.name}</span>
                                <span className="text-xs text-[#5c5f62]">{p.count} <span className="text-[#9CA3AF]">({p.pct}%)</span></span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: p.color }} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100">
                    <p className="text-xs text-[#9CA3AF]">Total stores: <strong className="text-[#202223]">{kpi.totalStores}</strong></p>
                </div>
            </div>

        </div>
    );
};

export default OverviewTab;
