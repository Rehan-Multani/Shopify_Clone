import React, { useState } from 'react';

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const BillingTab = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [billingHistory, setBillingHistory] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalSubs, setTotalSubs] = useState(0);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Billing Overview</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Manage revenue and billing history.</p>
                </div>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={`summary-skel-${i}`} className={`${card} p-5 animate-pulse`}>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                        </div>
                    ))
                ) : (
                    [
                        { label: 'Monthly Subscription Revenue', val: `₹${totalRevenue.toLocaleString()}`, sub: '+18.4% from last month' },
                        { label: 'Total Subscribers', val: totalSubs.toLocaleString(), sub: '+8.7% from last month' },
                        { label: 'Avg Revenue Per User', val: `₹${totalSubs ? (totalRevenue / totalSubs).toFixed(0) : 0}`, sub: '+9.2% from last month' },
                    ].map(s => (
                        <div key={s.label} className={`${card} p-5`}>
                            <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-2">{s.label}</p>
                            <p className="text-3xl font-black text-[#202223]">{s.val}</p>
                            <p className="text-xs font-semibold text-green-600 mt-1.5 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                {s.sub}
                            </p>
                        </div>
                    ))
                )}
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
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={`bill-skel-${i}`} className="border-b border-[#f5f5f5] animate-pulse">
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-12"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                    </tr>
                                ))
                            ) : billingHistory.length > 0 ? billingHistory.map((b, i) => (
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
                                        <button className="text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#14B8A6' }}>
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-5 py-8 text-center text-sm text-gray-500 bg-gray-50/50">
                                        No billing history available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillingTab;
