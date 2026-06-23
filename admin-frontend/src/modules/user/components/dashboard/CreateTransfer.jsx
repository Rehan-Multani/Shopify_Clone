import React from 'react';
import { Link } from 'react-router-dom';

const CreateTransfer = () => {
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 text-[#5c5f62]">
                <Link to="/dashboard/products/transfers" className="hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-[#202223]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center text-[#5c5f62]">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-[#202223]">Create transfer</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Origin & Destination */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <label className="block text-sm font-semibold text-[#202223]">Origin</label>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div className="relative">
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none appearance-none bg-white text-gray-500">
                                        <option>Select origin</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <label className="block text-sm font-semibold text-[#202223]">Destination</label>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div className="relative">
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none appearance-none bg-white text-gray-500">
                                        <option>Select destination</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Products */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Add products</h2>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input type="text" placeholder="Search products" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                            </div>
                            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                                Browse
                            </button>
                            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                                Import
                            </button>
                            <button className="p-2 border border-gray-200 rounded-lg text-[#5c5f62] hover:bg-gray-50 transition-all shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Notes */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[#202223]">Notes</h2>
                            <button className="text-gray-400 hover:text-black">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </div>
                        <p className="text-sm text-[#5c5f62]">No notes</p>
                    </div>

                    {/* Transfer Details */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Transfer details</h2>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-[#202223]">Date created</label>
                                <div className="relative">
                                    <input type="text" value={today} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-[#202223]">Reference name</label>
                                    <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">0/255</span>
                                </div>
                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[#202223]">Tags</h2>
                            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">0/40</span>
                        </div>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 flex items-center justify-end gap-3 z-40">
                <Link to="/dashboard/products/transfers" className="px-4 py-2 text-sm font-bold text-[#202223] hover:bg-gray-100 rounded-lg transition-all">
                    Discard
                </Link>
                <button className="bg-[#202223] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95">
                    Save
                </button>
            </div>
        </div>
    );
};

export default CreateTransfer;
