import React from 'react';
import { Link } from 'react-router-dom';

const CreateGiftCard = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 text-[#5c5f62]">
                <Link to="/dashboard/products/gift-cards" className="hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-[#202223]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center text-[#5c5f62]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-[#202223]">Create gift card</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Gift Card Details */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <h2 className="text-sm font-semibold text-[#202223]">Gift card details</h2>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-[#202223]">Gift card code</label>
                                <input 
                                    type="text" 
                                    defaultValue="ggr7bkyvwtqxw9t7" 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-[#5c5f62] font-mono cursor-not-allowed" 
                                    readOnly 
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-[#202223]">Initial value</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-sm">₹</span>
                                        </div>
                                        <input 
                                            type="text" 
                                            defaultValue="10.00" 
                                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-[#202223]">Expiry date</label>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 p-2 px-3 border border-gray-200 rounded-lg bg-gray-50/50 w-fit">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                            <span className="text-xs font-bold text-[#202223]">Doesn't expire</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium">Gift card expiration laws can vary by country</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Customer</h2>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search or create customer" 
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none placeholder:text-gray-400" 
                            />
                        </div>
                    </div>

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
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 flex items-center justify-end gap-3 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Link to="/dashboard/products/gift-cards" className="px-5 py-2 text-sm font-bold text-[#202223] hover:bg-gray-100 rounded-lg transition-all">
                    Discard
                </Link>
                <button className="bg-[#202223] text-white px-8 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95">
                    Save
                </button>
            </div>
        </div>
    );
};

export default CreateGiftCard;
