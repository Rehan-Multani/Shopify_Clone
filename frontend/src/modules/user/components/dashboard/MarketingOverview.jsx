import React from 'react';
import { Link } from 'react-router-dom';

const MarketingOverview = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#202223]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    <h1 className="text-xl font-bold">Marketing</h1>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-50 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Last 30 days
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-50">
                        No comparison
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-50 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Last non-direct click
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
            </div>

            {/* Metrics Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors cursor-default">
                        <p className="text-xs font-medium text-[#5c5f62] border-b border-dotted border-gray-300 w-fit">Sessions</p>
                        <div className="flex items-end justify-between gap-2">
                            <span className="text-xl font-bold text-[#202223]">7</span>
                            <div className="w-16 h-8 text-blue-500">
                                <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                                    <path d="M0 35 Q 25 35, 50 35 T 75 35 T 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors cursor-default">
                        <p className="text-xs font-medium text-[#5c5f62] border-b border-dotted border-gray-300 w-fit whitespace-nowrap">Sales attributed to marketing</p>
                        <div className="flex items-end justify-between gap-2">
                            <span className="text-xl font-bold text-[#202223]">₹0</span>
                            <div className="w-16 h-8 text-blue-500">
                                <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                                    <path d="M0 35 Q 25 35, 50 35 T 75 35 T 100 35" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors cursor-default">
                        <p className="text-xs font-medium text-[#5c5f62] border-b border-dotted border-gray-300 w-fit whitespace-nowrap">Orders attributed to marketing</p>
                        <div className="flex items-end justify-between gap-2">
                            <span className="text-xl font-bold text-[#202223]">0</span>
                            <div className="w-16 h-8 text-blue-500">
                                <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                                    <path d="M0 35 Q 25 35, 50 35 T 75 35 T 100 35" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 space-y-3 hover:bg-gray-50/50 transition-colors cursor-default">
                        <p className="text-xs font-medium text-[#5c5f62] border-b border-dotted border-gray-300 w-fit">Conversion rate</p>
                        <div className="flex items-end justify-between gap-2">
                            <span className="text-xl font-bold text-[#202223]">0%</span>
                            <div className="w-16 h-8 text-blue-500">
                                <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                                    <path d="M0 35 Q 25 35, 50 35 T 75 35 T 100 35" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left/Right Navigation buttons inside metrics bar */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 disabled:opacity-30" disabled>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Top Marketing Channels Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-[#202223] text-sm lg:text-base">Top marketing channels</h2>
                    <button className="text-sm font-bold text-[#005bd3] hover:underline">View report</button>
                </div>

                {/* Alert Banner */}
                <div className="bg-[#f1f8fc] border-b border-[#d8e9f5] px-4 py-3 flex items-center justify-between gap-3">
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
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-50">
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Channel</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Type</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62] flex items-center gap-1">
                                    Sessions
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Sales</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Orders</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">Conversion rate</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">ROAS</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">CPA</th>
                                <th className="p-4 text-xs font-medium text-[#5c5f62]">CTR</th>
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
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Campaign Tracking Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="space-y-4 flex-1">
                    <h3 className="font-bold text-lg text-[#202223]">Centralize your campaign tracking</h3>
                    <p className="text-sm text-[#5c5f62] leading-relaxed max-w-xl">
                        Create campaigns to evaluate how marketing initiatives drive business goals. Capture online and offline touchpoints, add campaign activities from multiple marketing channels, and monitor results.
                    </p>
                    <button className="bg-white text-[#202223] border border-gray-300 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-50 transition-all">
                        Create campaign
                    </button>
                </div>
                <div className="w-1/3 flex justify-end">
                    <div className="w-56 h-40 bg-[#3a6ff2] rounded-2xl shadow-2xl relative overflow-hidden flex items-center justify-center">
                         {/* Circle Graph Illustration */}
                         <div className="w-24 h-24 rounded-full border-[10px] border-white/20 border-t-white relative flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white absolute top-0 -translate-y-1/2"></div>
                            <div className="w-12 h-4 bg-white/20 rounded-full relative">
                                <div className="absolute inset-0 bg-white rounded-full w-2/3"></div>
                            </div>
                         </div>
                         <div className="absolute top-2 left-2 flex gap-1">
                             <div className="w-2 h-2 rounded bg-white/20"></div>
                             <div className="w-2 h-2 rounded bg-white/20"></div>
                             <div className="w-2 h-2 rounded bg-white/20"></div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Generate Traffic Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="space-y-4 flex-1">
                    <h3 className="font-bold text-lg text-[#202223]">Generate traffic with marketing apps</h3>
                    <p className="text-sm text-[#5c5f62] leading-relaxed max-w-xl">
                        Grow your audience on social platforms, capture new leads with newsletter sign-ups, increase conversion with chat, and more.
                    </p>
                    <button className="bg-white text-[#202223] border border-gray-300 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-50 transition-all">
                        Explore marketing apps
                    </button>
                </div>
                <div className="w-1/3 flex justify-end">
                    <div className="w-48 h-48 bg-white border border-gray-100 rounded-full shadow-lg flex items-center justify-center relative scale-90">
                         {/* Apps connections illustration */}
                         <div className="absolute inset-0 border border-dotted border-gray-200 rounded-full scale-75 animate-spin-slow"></div>
                         <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl shadow-md z-10 flex flex-col gap-2 p-2">
                             <div className="w-full h-2 bg-gray-200 rounded"></div>
                             <div className="w-2/3 h-2 bg-gray-200 rounded"></div>
                         </div>
                         <div className="absolute top-8 left-8 w-6 h-6 bg-red-100 rounded-full shadow-sm"></div>
                         <div className="absolute bottom-8 right-8 w-8 h-8 bg-blue-100 rounded-lg shadow-sm"></div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center pt-4">
                <p className="text-xs text-[#5c5f62] text-center max-w-lg leading-relaxed">
                    Learn more about <button className="text-blue-600 underline">marketing campaigns</button> and how <button className="text-blue-600 underline">Shopify syncs report data.</button>
                </p>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            ` }} />
        </div>
    );
};

export default MarketingOverview;
