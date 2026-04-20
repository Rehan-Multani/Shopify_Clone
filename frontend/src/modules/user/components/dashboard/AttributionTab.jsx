import React from 'react';

const AttributionTab = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[#202223]">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <h1 className="text-xl font-bold">Attribution</h1>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-200 transition-all">
                        Channels
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                        Print
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                        Export
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-50 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Last 30 days
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-50 flex items-center gap-2">
                        Daily
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-50 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Last non-direct click
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                    </button>
                </div>
            </div>

            {/* Chart Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
                <div className="p-4 lg:p-6 border-b border-gray-50 flex items-center justify-between">
                    <button className="flex items-center gap-2 text-xs font-medium text-[#5c5f62] border-b border-dotted border-gray-300 hover:text-black">
                        Sessions by top 5 channels over time
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
                <div className="flex-1 p-6 relative">
                    {/* Simplified SVG Chart */}
                    <div className="w-full h-full min-h-[300px] flex flex-col">
                        <div className="flex-1 relative flex items-end">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[6, 4, 2, 0].map(val => (
                                    <div key={val} className="flex items-center gap-4 text-[10px] text-gray-400 w-full">
                                        <span className="w-4 text-right">{val}</span>
                                        <div className="flex-1 border-t border-gray-100"></div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* The Line */}
                            <svg className="absolute left-8 right-0 bottom-0 top-0 w-[calc(100%-32px)] h-full overflow-visible" preserveAspectRatio="none">
                                <path 
                                    d="M0 260 L 600 260 L 700 260 L 800 260 L 850 260 L 880 150 L 910 80 L 940 150 L 970 260 L 1000 260" 
                                    fill="none" 
                                    stroke="#3a6ff2" 
                                    strokeWidth="2" 
                                    className="scale-y-100"
                                />
                                <circle cx="680" cy="260" r="4" fill="#3a6ff2" />
                            </svg>
                        </div>
                        
                        {/* X-Axis labels */}
                        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-4 px-8">
                            {['Mar 21', 'Mar 23', 'Mar 25', 'Mar 27', 'Mar 29', 'Mar 31', 'Apr 2', 'Apr 4', 'Apr 6', 'Apr 8', 'Apr 10', 'Apr 12', 'Apr 14', 'Apr 16', 'Apr 18'].map(date => (
                                <span key={date}>{date}</span>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Legend */}
                <div className="p-4 border-t border-gray-50 flex justify-center">
                    <div className="flex items-center gap-2 text-xs text-[#202223] font-medium">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3a6ff2]"></div>
                        Direct
                    </div>
                </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-[#f1f8fc] border border-[#d8e9f5] rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white p-1">
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-sm text-[#202223]">
                        Cost, click, and impression metrics are now available for supported marketing apps. <button className="text-[#005bd3] underline font-medium">Learn more</button>
                    </p>
                </div>
                <button className="text-[#5c5f62] hover:text-[#202223] p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                        </button>
                    </div>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1400px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-50">
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Channel</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Type</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62] group cursor-pointer hover:text-black">
                                    <div className="flex items-center gap-1">
                                        Sessions
                                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Sales</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Orders</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Conversion rate</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Cost</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">ROAS</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">CPA</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">CTR</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">AOV</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Orders from new customers</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Orders from returning customers</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    </div>
                                    <span className="text-sm font-bold text-[#202223] border-b border-dotted border-gray-300">Direct</span>
                                </td>
                                <td className="p-4 text-sm text-[#5c5f62]">direct</td>
                                <td className="p-4 text-sm text-[#202223] font-medium">7</td>
                                <td className="p-4 text-sm text-[#202223] font-medium">₹0.00</td>
                                <td className="p-4 text-sm text-[#202223] font-medium">0</td>
                                <td className="p-4 text-sm text-[#202223] font-medium">0%</td>
                                <td className="p-4 text-sm text-[#5c5f62]">--</td>
                                <td className="p-4 text-sm text-[#5c5f62]">--</td>
                                <td className="p-4 text-sm text-[#5c5f62]">--</td>
                                <td className="p-4 text-sm text-[#5c5f62]">--</td>
                                <td className="p-4 text-sm text-[#5c5f62]">--</td>
                                <td className="p-4 text-sm text-[#202223] font-medium">0</td>
                                <td className="p-4 text-sm text-[#202223] font-medium">0</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttributionTab;
