import React, { useState, useEffect } from 'react';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

const ReportsTab = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReportsData();
    }, []);

    const fetchReportsData = async () => {
        try {
            setLoading(true);
            setError('');
            const isVendor = window.location.pathname.startsWith('/vendor');
            const token = isVendor ? localStorage.getItem('vendorToken') : (localStorage.getItem('merchantToken') || localStorage.getItem('vendorToken'));
            
            // Get selected store from localStorage if exists
            const activeStoreId = localStorage.getItem('activeStoreId') || '';
            const storeQuery = activeStoreId ? `?storeId=${activeStoreId}` : '';

            const res = await fetch(`${GATEWAY_URL}/stores/analytics-stats${storeQuery}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            } else {
                setError(data.message || 'Failed to fetch analytics reports.');
            }
        } catch (err) {
            console.error('Error fetching reports data:', err);
            setError('Network error while loading reports.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-2">
                <div className="h-6 bg-gray-200 rounded-lg w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-28 bg-gray-200 rounded-2xl"></div>
                    <div className="h-28 bg-gray-200 rounded-2xl"></div>
                    <div className="h-28 bg-gray-200 rounded-2xl"></div>
                </div>
                <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-sm">
                <p className="text-sm font-bold text-red-500">{error}</p>
                <button 
                    onClick={fetchReportsData} 
                    className="px-5 py-2.5 bg-zinc-900 text-white font-bold rounded-lg text-xs hover:bg-black transition-all active:scale-95 shadow-md"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    const maxSales = stats?.dailyStats?.length > 0 
        ? Math.max(...stats.dailyStats.map(d => d.sales), 1) 
        : 1;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Reports & Analytics</h1>
                    <p className="text-xs text-[#5c5f62] mt-1">Real-time performance review for your storefront.</p>
                </div>
                <button 
                    onClick={fetchReportsData} 
                    className="p-2 border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-all shadow-sm bg-white"
                    title="Refresh Data"
                >
                    <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Revenue card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Total Sales</span>
                            <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                Active
                            </span>
                        </div>
                        <p className="text-2xl lg:text-3xl font-black text-zinc-900">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="border-t border-zinc-100 pt-3.5 mt-4 text-[10px] text-zinc-450 font-bold flex justify-between">
                        <span>AOV: ₹{stats.averageOrderValue?.toLocaleString()}</span>
                        <span>Conv. Rate: {stats.conversionRate}%</span>
                    </div>
                </div>

                {/* Total Orders Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Total Orders</span>
                            <span className="text-blue-500 font-bold flex items-center gap-0.5">🛒 Order Book</span>
                        </div>
                        <p className="text-2xl lg:text-3xl font-black text-zinc-900">{stats.activeOrders.toLocaleString()}</p>
                    </div>
                    <div className="border-t border-zinc-100 pt-3.5 mt-4 text-[10px] text-zinc-450 font-bold flex justify-between">
                        <span>Live Catalog: {stats.totalProducts} items</span>
                        <span>Active Stores: {stats.totalStores}</span>
                    </div>
                </div>

                {/* Total Sessions Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Customer Traffic</span>
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">👥 Sessions</span>
                        </div>
                        <p className="text-2xl lg:text-3xl font-black text-zinc-900">{stats.sessions.toLocaleString()}</p>
                    </div>
                    <div className="border-t border-zinc-100 pt-3.5 mt-4 text-[10px] text-zinc-450 font-bold flex justify-between">
                        <span>Avg. Session Conversion: {stats.conversionRate}%</span>
                    </div>
                </div>
            </div>

            {/* Sales Chart Section */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-zinc-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="text-sm font-black text-zinc-800 uppercase tracking-wider">Sales Analytics</h2>
                        <p className="text-[10px] text-zinc-400 font-bold mt-0.5">Daily sales distribution trend for the last 30 days.</p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-full text-zinc-600">Last 30 Days</span>
                </div>

                {/* Beautiful custom SVG chart */}
                {stats.dailyStats && stats.dailyStats.length > 0 ? (
                    <div className="space-y-4">
                        <div className="w-full h-64 flex items-end justify-between gap-1.5 pt-4 pl-2 pr-2 border-b border-zinc-150">
                            {stats.dailyStats.map((item, idx) => {
                                const heightPercent = (item.sales / maxSales) * 100;
                                return (
                                    <div key={idx} className="flex-1 group flex flex-col items-center justify-end h-full">
                                        {/* Hover Tooltip */}
                                        <div className="absolute mb-24 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-xl -translate-y-2 pointer-events-none z-20 flex flex-col gap-0.5 border border-zinc-800">
                                            <span>{item.date}</span>
                                            <span className="text-emerald-400">Sales: ₹{item.sales.toLocaleString()}</span>
                                            <span>Orders: {item.orders}</span>
                                        </div>
                                        {/* Bar column */}
                                        <div 
                                            className="w-full bg-zinc-100 hover:bg-[var(--color-primary)] transition-all duration-300 rounded-t-sm cursor-pointer shadow-sm relative group-hover:scale-y-105" 
                                            style={{ 
                                                height: `${Math.max(4, heightPercent)}%`, 
                                                backgroundColor: item.sales > 0 ? '' : '#f4f4f5' 
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        {/* Timeline ends labeling */}
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-zinc-400 px-1">
                            <span>{stats.dailyStats[0]?.date}</span>
                            <span>{stats.dailyStats[Math.floor(stats.dailyStats.length / 2)]?.date}</span>
                            <span>{stats.dailyStats[stats.dailyStats.length - 1]?.date}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-center py-10 text-xs font-semibold text-zinc-400">No sufficient data to render graph</p>
                )}
            </div>

            {/* Bottom Grid: Products & Channels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Top Selling Products */}
                <div className="lg:col-span-6 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="border-b border-zinc-100 pb-3">
                        <h3 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Top Selling Products</h3>
                        <p className="text-[10px] text-zinc-400 font-bold mt-0.5">Top performers ordered by total revenue.</p>
                    </div>

                    <div className="space-y-4">
                        {stats.topProducts && stats.topProducts.length > 0 ? (
                            stats.topProducts.map((p, idx) => {
                                const maxProductRev = stats.topProducts[0]?.revenue || 1;
                                const barPercent = (p.revenue / maxProductRev) * 100;
                                return (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <div>
                                                <p className="text-zinc-800">{p.name}</p>
                                                <p className="text-[9px] text-zinc-400 font-bold uppercase">{p.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-zinc-900">₹{p.revenue.toLocaleString()}</p>
                                                <p className="text-[9px] text-zinc-400 font-bold">{p.quantity} units sold</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-zinc-50 border border-zinc-100 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-500" 
                                                style={{ width: `${barPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center py-10 text-xs font-bold text-zinc-400 uppercase tracking-wider">No products data available</p>
                        )}
                    </div>
                </div>

                {/* Traffic Channels */}
                <div className="lg:col-span-6 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="border-b border-zinc-100 pb-3">
                        <h3 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Acquisition Channels</h3>
                        <p className="text-[10px] text-zinc-400 font-bold mt-0.5">Source distribution for storefront traffic.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-zinc-100 text-left text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                                    <th className="pb-2">Channel</th>
                                    <th className="pb-2 text-right">Sessions</th>
                                    <th className="pb-2 text-right">Sales</th>
                                    <th className="pb-2 text-right">Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {stats.channels?.map((ch, idx) => (
                                    <tr key={idx} className="font-semibold text-zinc-650 hover:bg-zinc-50/50 transition-colors">
                                        <td className="py-3 text-zinc-800 font-bold">{ch.name}</td>
                                        <td className="py-3 text-right">{ch.sessions?.toLocaleString()}</td>
                                        <td className="py-3 text-right">₹{ch.sales?.toLocaleString()}</td>
                                        <td className="py-3 text-right text-emerald-600 font-bold">{ch.conversionRate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;
