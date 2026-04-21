import React from 'react';
import { Link } from 'react-router-dom';

const AddCustomer = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 text-[#5c5f62]">
                <Link to="/dashboard/customers" className="hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-[#202223]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center text-[#5c5f62]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-[#202223]">New customer</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Overview */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <h2 className="text-sm font-semibold text-[#202223]">Customer overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-[#202223]">First name</label>
                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-[#202223]">Last name</label>
                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#202223]">Language</label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white font-medium text-[#202223]">
                                    <option>English [Default]</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium tracking-tight">This customer will receive notifications in this language.</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#202223]">Email</label>
                            <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#202223]">Phone number</label>
                            <div className="flex gap-2">
                                <div className="relative w-24">
                                    <div className="w-full h-10 border border-gray-300 rounded-lg flex items-center justify-between px-2 bg-white cursor-pointer group hover:border-gray-400">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-3.5 bg-orange-100 border border-green-800/10 relative overflow-hidden rounded-[1px]">
                                                <div className="absolute inset-0 bg-white shadow-sm flex flex-col">
                                                    <div className="h-1/3 bg-orange-500"></div>
                                                    <div className="h-1/3 bg-white flex items-center justify-center">
                                                        <div className="w-1 h-1 bg-blue-900 rounded-full"></div>
                                                    </div>
                                                    <div className="h-1/3 bg-green-600"></div>
                                                </div>
                                            </span>
                                            <svg className="w-3 h-3 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <input type="text" className="flex-1 h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                            </div>
                        </div>
                        
                        <div className="space-y-4 pt-2">
                            <label className="flex items-start gap-3 group cursor-pointer">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                                <span className="text-sm font-medium text-[#202223]">Customer agreed to receive marketing emails.</span>
                            </label>
                            <label className="flex items-start gap-3 group cursor-pointer">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                                <span className="text-sm font-medium text-[#202223]">Customer agreed to receive SMS marketing text messages.</span>
                            </label>
                        </div>

                        <div className="bg-[#f6f6f7] p-4 rounded-xl">
                            <p className="text-xs text-[#5c5f62] leading-relaxed">
                                You should ask your customers for permission before you subscribe them to your marketing emails or SMS.
                            </p>
                        </div>
                    </div>

                    {/* Default Address */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-sm font-semibold text-[#202223]">Default address</h2>
                            <p className="text-xs text-[#5c5f62]">The primary address of this customer</p>
                        </div>
                        <button className="w-full h-12 px-4 border border-gray-200 rounded-xl flex items-center justify-between group hover:bg-gray-50 transition-all font-bold text-sm text-[#202223]">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 flex items-center justify-center text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <span>Add address</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    {/* Tax Details */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Tax details</h2>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#202223]">Tax settings</label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white font-medium text-[#202223]">
                                    <option>Collect tax</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                </div>
                            </div>
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
                        <p className="text-xs text-[#5c5f62] leading-relaxed">Notes are private and won't be shared with the customer.</p>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                         <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[#202223]">Tags</h2>
                            <button className="text-gray-400 hover:text-black">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </div>
                        <input type="text" className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 flex items-center justify-end gap-3 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Link to="/dashboard/customers" className="px-5 py-2 text-sm font-bold text-[#202223] hover:bg-gray-100 rounded-lg transition-all">
                    Discard
                </Link>
                <button className="bg-[#202223] text-white px-8 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95">
                    Save customer
                </button>
            </div>
        </div>
    );
};

export default AddCustomer;
