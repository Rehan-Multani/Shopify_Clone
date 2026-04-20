import React from 'react';
import { Link } from 'react-router-dom';

const CreateCampaign = () => {
    const metrics = ['Sessions', 'Sales', 'Orders', 'Average order value'];
    const gridCards = [
        'Sessions by channel', 'Sales by channel',
        'Sessions by UTM parameters', 'Sales by UTM parameters',
        'Orders from new vs. returning customers', 'Sales by order',
        'Items sold by product', 'Sessions by device'
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard/marketing/campaigns" className="text-[#5c5f62] hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold text-xl">›</span>
                        <h1 className="text-xl font-bold text-[#202223]">Create campaign</h1>
                        <span className="px-2 py-0.5 bg-[#e4f1ff] text-[#005bd3] text-xs font-bold rounded-md">Draft</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-[#5c5f62] hover:bg-gray-100 rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                </div>
            </div>

            {/* Sub Header / Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-sm font-semibold text-gray-300 flex items-center gap-2 cursor-default">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Year to date
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-[#202223] flex items-center gap-2 hover:bg-gray-50 shadow-sm">
                        Last non-direct click
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left Column: Analytics Grid */}
                <div className="flex-1 space-y-4">
                    {/* Compact Metrics row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {metrics.map(metric => (
                            <div key={metric} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
                                <p className="text-xs font-medium text-[#5c5f62]">{metric}</p>
                                <p className="text-xs text-gray-400">No data for this date range</p>
                            </div>
                        ))}
                    </div>

                    {/* Chart Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gridCards.map(card => (
                            <div key={card} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[220px]">
                                <div className="p-4 border-b border-gray-50">
                                    <h3 className="text-xs font-bold text-[#5c5f62] border-b border-dotted border-gray-300 w-fit">{card}</h3>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-6">
                                    <p className="text-sm text-gray-300">No data for this date range</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Full width bottom card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[220px]">
                        <div className="p-4 border-b border-gray-50">
                            <h3 className="text-xs font-bold text-[#5c5f62] border-b border-dotted border-gray-300 w-fit">Sessions by location</h3>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-6">
                            <p className="text-sm text-gray-300">No data for this date range</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar Settings */}
                <div className="w-full lg:w-80 space-y-4 flex-shrink-0">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
                        <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-[#005bd3] focus-within:ring-offset-0 rounded-lg p-0.5 transition-all">
                             <input 
                                type="text" 
                                placeholder="Campaign name" 
                                className="w-full px-3 py-2 border border-[#005bd3] rounded-lg text-sm focus:outline-none placeholder:text-[#babfc3]"
                             />
                        </div>
                        <div className="px-1 text-xs text-[#5c5f62] flex flex-col gap-1">
                            <span className="font-bold">ID</span>
                            <span className="text-gray-400">7667be</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-[#202223]">Shareable links</h3>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                             <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 text-[#5c5f62] flex-shrink-0 mt-1">
                                     <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8-12v8h8V3h-8zm6 6h-4V5h4v4zm0 10h-2v2h2v-2zm-4-4h-2v2h2v-2zm4 0h-2v2h2v-2zm-6 4h-2v2h2v-2zm2 2h-2v2h2v-2zm2-2h-2v2h2v-2zm0-4h-2v2h2v-2z" /></svg>
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <p className="text-sm font-medium text-[#202223] truncate">/s/7667be</p>
                                    <p className="text-xs text-gray-400 truncate">/?utm_campaign=7667be&utm_s...</p>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-[#202223]">Auto-match rules</h3>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-[#5c5f62]">Create rules to automatically assign traffic</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-[#202223]">Campaign activities</h3>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-[#5c5f62]">Manually assign existing marketing traffic</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCampaign;
