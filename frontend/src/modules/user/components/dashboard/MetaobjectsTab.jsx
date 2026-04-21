import React from 'react';
import { Link } from 'react-router-dom';

const MetaobjectsTab = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#202223]">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h1 className="text-xl font-bold">Metaobjects</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-[#202223] hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                        Manage
                    </button>
                    <Link 
                        to="/dashboard/content/metaobjects/new"
                        className="px-4 py-2 bg-[#1a1c23] border border-[#1a1c23] rounded-lg text-sm font-bold text-white hover:bg-black transition-all shadow-sm active:scale-95 text-center"
                    >
                        Add definition
                    </Link>
                </div>
            </div>

            {/* Stats & Recent Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Mini Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                        <p className="text-xs font-bold text-[#202223] mb-1">Available on storefront</p>
                        <p className="text-xs text-[#5c5f62] mb-4">13 entries</p>
                        <div className="w-8 h-8 rounded-full bg-black"></div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                        <p className="text-xs font-bold text-[#202223] mb-1">Web pages</p>
                        <p className="text-xs text-[#5c5f62] mb-4">0 entries</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                        <p className="text-xs font-bold text-[#202223] mb-1">Active</p>
                        <p className="text-xs text-[#5c5f62] mb-4">13 entries</p>
                        <div className="w-8 h-8 rounded-full bg-black"></div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                        <p className="text-xs font-bold text-[#202223] mb-1">Draft</p>
                        <p className="text-xs text-[#5c5f62] mb-4">0 entries</p>
                    </div>
                </div>

                {/* Recent Entries Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
                    <h2 className="text-xs font-bold text-[#202223] mb-6">Recent entries</h2>
                    <div className="space-y-5 flex-grow">
                        {[
                            { name: 'Black', type: 'Color', color: '#000000' },
                            { name: 'Beige', type: 'Color', color: '#f5f5dc' },
                            { name: 'All ages', type: 'Age group', icon: '👤' },
                            { name: 'Male', type: 'Target gender', icon: '👕' }
                        ].map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    {entry.color ? (
                                        <div className="w-8 h-8 rounded-lg border border-black/5" style={{ backgroundColor: entry.color }}></div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-lg">
                                            {entry.icon}
                                        </div>
                                    )}
                                    <span className="text-xs font-bold text-[#202223] group-hover:underline">{entry.name}</span>
                                </div>
                                <span className="text-xs text-[#5c5f62]">{entry.type}</span>
                            </div>
                        ))}
                    </div>
                    <button className="text-xs font-bold text-[#202223] mt-6 hover:underline text-left">
                        View all 13 entries
                    </button>
                </div>
            </div>

            {/* Filter Bar & Table Section */}
            <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Secondary Nav */}
                    <div className="p-1 px-4 border-b border-gray-100 flex items-center justify-between bg-white relative">
                        <div className="flex items-center gap-1">
                            <button className="px-4 py-2 text-xs font-bold bg-gray-100 rounded-lg text-[#202223]">Custom</button>
                            <button className="px-4 py-2 text-xs font-bold text-[#5c5f62] hover:bg-gray-50 rounded-lg transition-all">Standard product attributes</button>
                            <button className="px-4 py-2 text-xs font-bold text-[#5c5f62] hover:bg-gray-50 rounded-lg transition-all">All</button>
                            <button className="p-2 text-gray-400 hover:text-black">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM12 11l2 2m0-2l-2 2" />
                                </svg>
                            </button>
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <div className="w-[1px] h-4 bg-gray-200 mx-2"></div>
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 11l5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                        </div>
                    </div>

                    {/* Empty State Table Area */}
                    <div className="min-h-[300px] flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-[#202223] mb-2 tracking-tight">No definitions found</h2>
                        <p className="text-sm text-[#5c5f62] mb-8 font-medium">Try changing the filters or search term</p>
                    </div>
                </div>

                <div className="flex justify-center pt-2">
                    <button className="text-xs font-bold text-[#202223] hover:underline decoration-1 flex items-center gap-1 underline underline-offset-4">
                        Learn more about metaobjects
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MetaobjectsTab;
