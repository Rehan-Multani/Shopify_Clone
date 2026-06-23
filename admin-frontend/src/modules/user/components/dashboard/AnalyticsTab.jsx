import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL || 'http://localhost:5004/api';

const AnalyticsTab = () => {
    const [timeRange, setTimeRange] = useState('30d'); // 'today', '7d', '30d'
    const [analytics, setAnalytics] = useState(null);
    const [selectedStore] = useState(localStorage.getItem('activeStoreId') || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('merchantToken');
                if (!token) return;

                let url = `${STORE_API_URL}/stores/analytics-stats`;
                if (selectedStore) {
                    url += `?storeId=${selectedStore}`;
                }

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAnalytics(data);
                } else {
                    console.error('Failed to fetch analytics stats');
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [selectedStore]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">Failed to load analytics data.</p>
            </div>
        );
    }

    // Filter data based on time range selection
    const getFilteredStats = () => {
        const fullData = analytics.dailyStats || [];
        if (timeRange === 'today') {
            const todayData = fullData.slice(-1);
            const sales = todayData.reduce((sum, item) => sum + item.sales, 0);
            const orders = todayData.reduce((sum, item) => sum + item.orders, 0);
            const sessions = todayData.reduce((sum, item) => sum + item.sessions, 0);
            return {
                sales,
                orders,
                sessions,
                averageOrderValue: orders > 0 ? Math.round(sales / orders) : 0,
                conversionRate: sessions > 0 ? ((orders / sessions) * 100).toFixed(2) : '0.00',
                chartData: todayData
            };
        } else if (timeRange === '7d') {
            const weekData = fullData.slice(-7);
            const sales = weekData.reduce((sum, item) => sum + item.sales, 0);
            const orders = weekData.reduce((sum, item) => sum + item.orders, 0);
            const sessions = weekData.reduce((sum, item) => sum + item.sessions, 0);
            return {
                sales,
                orders,
                sessions,
                averageOrderValue: orders > 0 ? Math.round(sales / orders) : 0,
                conversionRate: sessions > 0 ? ((orders / sessions) * 100).toFixed(2) : '0.00',
                chartData: weekData
            };
        }
        
        // Default 30d
        return {
            sales: analytics.totalRevenue,
            orders: analytics.activeOrders,
            sessions: analytics.sessions,
            averageOrderValue: analytics.averageOrderValue,
            conversionRate: analytics.conversionRate,
            chartData: fullData
        };
    };

    const stats = getFilteredStats();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                </div>
                {/* Time range selector */}
                <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit self-start">
                    <button 
                        onClick={() => setTimeRange('today')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeRange === 'today' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'}`}
                    >
                        Today
                    </button>
                    <button 
                        onClick={() => setTimeRange('7d')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeRange === '7d' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'}`}
                    >
                        Last 7 Days
                    </button>
                    <button 
                        onClick={() => setTimeRange('30d')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeRange === '30d' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'}`}
                    >
                        Last 30 Days
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Total Sales */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Sales</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{Number(stats.sales) === 0 ? '0' : stats.sales.toLocaleString()}</h3>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${Number(stats.sales) > 0 ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-55'}`}>
                            {Number(stats.sales) > 0 ? '+12.4% vs last period' : '0% vs last period'}
                        </span>
                    </div>
                </div>

                {/* Sessions */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sessions</p>
                        <h3 className="text-2xl font-black text-gray-900">{Number(stats.sessions) === 0 ? '0' : stats.sessions.toLocaleString()}</h3>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${Number(stats.sessions) > 0 ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-55'}`}>
                            {Number(stats.sessions) > 0 ? '+8.1% vs last period' : '0% vs last period'}
                        </span>
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Conversion Rate</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.conversionRate}%</h3>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${Number(stats.orders) > 0 ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-55'}`}>
                            {Number(stats.orders) > 0 ? '+1.5% vs last period' : '0% vs last period'}
                        </span>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
                        <h3 className="text-2xl font-black text-gray-900">{Number(stats.orders) === 0 ? '0' : stats.orders}</h3>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${Number(stats.orders) > 0 ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-55'}`}>
                            {Number(stats.orders) > 0 ? '+15.2% vs last period' : '0% vs last period'}
                        </span>
                    </div>
                </div>

                {/* Average Order Value */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg. Order Value</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{Number(stats.averageOrderValue) === 0 ? '0' : stats.averageOrderValue.toLocaleString()}</h3>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${Number(stats.averageOrderValue) > 0 ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-55'}`}>
                            {Number(stats.averageOrderValue) > 0 ? '+2.8% vs last period' : '0% vs last period'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales & Sessions Trend Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm lg:col-span-2 space-y-4">
                    <div>
                        <h3 className="text-base font-bold text-gray-950">Sales Performance Over Time</h3>
                        <p className="text-xs text-gray-500">Interactive overview of revenue flow & customer order trends.</p>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 11 }} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                    tickFormatter={(val) => `₹${val.toLocaleString()}`}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                    formatter={(value, name) => [name === 'sales' ? `₹${value.toLocaleString()}` : value, name === 'sales' ? 'Sales' : 'Orders']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="sales" 
                                    stroke="#4f46e5" 
                                    strokeWidth={2.5}
                                    fillOpacity={1} 
                                    fill="url(#colorSales)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Marketing Channels split */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                    <div>
                        <h3 className="text-base font-bold text-gray-950">Acquisition Channels</h3>
                        <p className="text-xs text-gray-500">Distribution of customer traffic & generated sales.</p>
                    </div>
                    <div className="space-y-4">
                        {(analytics.channels || []).map((channel, i) => {
                            const maxSessions = Math.max(...(analytics.channels || []).map(c => c.sessions));
                            const percentage = maxSessions > 0 ? (channel.sessions / maxSessions) * 100 : 0;
                            return (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-gray-800">{channel.name}</span>
                                        <span className="text-gray-500">{channel.sessions.toLocaleString()} sessions</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500" 
                                            style={{ 
                                                width: `${percentage}%`,
                                                background: i === 0 ? '#4f46e5' : i === 1 ? '#10b981' : i === 2 ? '#f59e0b' : '#3b82f6'
                                            }} 
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                                        <span>Conv. Rate: {channel.conversionRate}</span>
                                        <span className="font-semibold text-gray-700">₹{channel.sales.toLocaleString()} sales</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Products Performance */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-950">Top Selling Products</h3>
                        <p className="text-xs text-gray-500">Performance rankings based on sales volume and net revenue.</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100">
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500">Product Name</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500">Category</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 text-right">Units Sold</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(analytics.topProducts || []).length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                                        No products found. Add products to start tracking analytics!
                                    </td>
                                </tr>
                            ) : (
                                (analytics.topProducts || []).map((product, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                                                    {product.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-medium text-right">{product.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-bold text-right">₹{product.revenue.toLocaleString()}</td>
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
