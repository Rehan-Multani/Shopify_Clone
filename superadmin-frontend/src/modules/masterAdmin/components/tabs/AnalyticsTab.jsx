import React, { useState, useEffect } from 'react';

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

const AnalyticsTab = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePlanTab, setActivePlanTab] = useState('single'); // 'single' or 'multi'

    const getAuthHeaders = () => {
        const info = JSON.parse(localStorage.getItem('masterAdminInfo') || '{}');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${info.token || ''}`
        };
    };

    const fetchAnalytics = async () => {
        try {
            setError(null);
            const res = await fetch(`${API_BASE_URL}/master-admin/analytics`, {
                headers: getAuthHeaders()
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setAnalytics(result.data);
            } else {
                setError(result.message || 'Failed to fetch analytics');
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err.message || 'Network error occurred while fetching analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
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
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="bg-white border border-[#e3e3e3] rounded-xl p-5 space-y-3">
                            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="h-40 bg-white border border-[#e3e3e3] rounded-xl animate-pulse"></div>
                <div className="h-60 bg-white border border-[#e3e3e3] rounded-xl animate-pulse"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl space-y-4 text-center max-w-xl mx-auto mt-10">
                <span className="text-3xl">⚠️</span>
                <h3 className="text-base font-bold text-red-800">Failed to load analytics</h3>
                <p className="text-sm text-red-600 font-medium">{error}</p>
                <button 
                    onClick={fetchAnalytics}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow hover:bg-red-700 transition"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    const { financials, merchantMetrics, ecosystemMetrics, recentRegistrations, singleVendorPlans, multiVendorPlans } = analytics;

    // Plans list selection based on selected tab
    const plansToDisplay = activePlanTab === 'single' ? (singleVendorPlans || []) : (multiVendorPlans || []);

    // Sum total purchases to calculate relative percentages
    const totalPurchases = (singleVendorPlans || []).reduce((acc, p) => acc + p.purchaseCount, 0) +
                           (multiVendorPlans || []).reduce((acc, p) => acc + p.purchaseCount, 0) || 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Platform Analytics</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Live platform performance and subscription metrics.</p>
                </div>
                <button 
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#14B8A6' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" /></svg>
                    Refresh Data
                </button>
            </div>

            {/* Core Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-[#e3e3e3] p-5 shadow-sm">
                    <p className="text-xs font-bold text-[#5c5f62] uppercase tracking-wider">Monthly Recurring Revenue (MRR)</p>
                    <p className="text-2xl font-black text-[#202223] mt-1">{formatCurrency(financials.mrr)}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-semibold">Active subscriptions monthly value</p>
                </div>
                <div className="bg-white rounded-xl border border-[#e3e3e3] p-5 shadow-sm">
                    <p className="text-xs font-bold text-[#5c5f62] uppercase tracking-wider">Total Merchants</p>
                    <p className="text-2xl font-black text-[#202223] mt-1">{merchantMetrics.totalMerchants}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-semibold">Registered merchant user accounts</p>
                </div>
                <div className="bg-white rounded-xl border border-[#e3e3e3] p-5 shadow-sm">
                    <p className="text-xs font-bold text-[#5c5f62] uppercase tracking-wider">Total Stores</p>
                    <p className="text-2xl font-black text-[#202223] mt-1">{merchantMetrics.totalStores}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-semibold">{merchantMetrics.activeStores} active storefronts</p>
                </div>
                <div className="bg-white rounded-xl border border-[#e3e3e3] p-5 shadow-sm">
                    <p className="text-xs font-bold text-[#5c5f62] uppercase tracking-wider">Total Plans</p>
                    <p className="text-2xl font-black text-[#202223] mt-1">{merchantMetrics.totalPlans}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-semibold">Configured subscription plans</p>
                </div>
            </div>

            {/* Plan Purchase Distribution Tabbed View */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-gray-100">
                    <div>
                        <h4 className="text-sm font-bold text-[#202223]">Plan Purchase Distribution</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Live store purchase count for single & multi-vendor tiers</p>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-0.5 w-fit">
                        <button
                            onClick={() => setActivePlanTab('single')}
                            className={`px-3 py-1.5 rounded-md text-xs font-black transition-all ${activePlanTab === 'single' ? 'bg-[#1a1c23] text-white shadow-sm' : 'text-[#5c5f62] hover:text-[#202223]'}`}
                        >
                            Single Vendor Plans ({singleVendorPlans?.length || 0})
                        </button>
                        <button
                            onClick={() => setActivePlanTab('multi')}
                            className={`px-3 py-1.5 rounded-md text-xs font-black transition-all ${activePlanTab === 'multi' ? 'bg-[#1a1c23] text-white shadow-sm' : 'text-[#5c5f62] hover:text-[#202223]'}`}
                        >
                            Multi Vendor Plans ({multiVendorPlans?.length || 0})
                        </button>
                    </div>
                </div>

                {plansToDisplay.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400 font-bold">
                        No active plans seeded or configured in this category.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plansToDisplay.map(p => {
                            const pct = Math.round((p.purchaseCount / totalPurchases) * 100);
                            return (
                                <div key={p.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200/50 space-y-3 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h5 className="font-extrabold text-gray-900 text-sm">{p.planName}</h5>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{p.planType}</p>
                                        </div>
                                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
                                            {formatCurrency(p.planPrice)}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold text-gray-600">
                                            <span>Active Purchases</span>
                                            <span className="text-gray-900 font-black">{p.purchaseCount} <span className="text-[10px] font-normal text-gray-400">({pct}%)</span></span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recent Merchant Registrations Table */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e3e3e3] bg-gradient-to-r from-gray-50/50 to-transparent">
                    <h3 className="text-sm font-bold text-[#202223]">Recent Merchant Registrations</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Most recent stores joined the platform</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-semibold">
                        <thead>
                            <tr className="bg-gray-50 border-b border-[#e3e3e3] text-gray-500 font-bold uppercase">
                                <th className="px-6 py-3">Store Name</th>
                                <th className="px-6 py-3">Owner / Email</th>
                                <th className="px-6 py-3">Plan Type</th>
                                <th className="px-6 py-3">Registered Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                            {recentRegistrations.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-400">No stores found</td>
                                </tr>
                            ) : (
                                recentRegistrations.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white bg-slate-800">
                                                    {m.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-gray-900 text-sm">{m.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-0.5">
                                                <p className="text-gray-900 font-bold">{m.owner}</p>
                                                <p className="text-gray-400 text-[10px]">{m.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
                                                ${m.plan.toLowerCase().includes('enterprise') || m.plan.toLowerCase().includes('plus') ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                  m.plan.toLowerCase().includes('advanced') ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                                                  m.plan.toLowerCase().includes('basic') ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                  'bg-gray-100 text-gray-600 border border-gray-200'}`}
                                            >
                                                {m.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {formatTimeAgo(m.joined)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;
