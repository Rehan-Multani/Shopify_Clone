import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreateOrder = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-2 mb-4">
                <button 
                    onClick={() => navigate('/dashboard/orders/drafts')}
                    className="p-1 hover:bg-gray-200 rounded-md transition-all text-gray-600"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <span className="text-gray-400 font-normal">›</span>
                <h1 className="text-lg font-bold text-[#202223]">Create order</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Column */}
                <div className="flex-1 space-y-4">
                    {/* Products Card */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-4 lg:p-6 space-y-4">
                        <h2 className="font-bold text-sm text-[#202223]">Products</h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-grow relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search products" 
                                    className="w-full pl-10 pr-4 py-1.5 bg-white border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008060] transition-all"
                                />
                            </div>
                            <button className="px-4 py-1.5 bg-white border border-[#d3d3d3] rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                                Browse
                            </button>
                            <button className="px-4 py-1.5 bg-white border border-[#d3d3d3] rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                                Add custom item
                            </button>
                        </div>
                    </div>

                    {/* Payment Card */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm overflow-hidden">
                        <div className="p-4 lg:p-6 space-y-4">
                            <h2 className="font-bold text-sm text-[#202223]">Payment</h2>
                            <div className="space-y-4 pr-2">
                                <div className="flex justify-between text-sm text-[#202223]">
                                    <span className="font-medium">Subtotal</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="flex justify-between text-sm text-[#5c5f62]">
                                    <button className="hover:underline text-left">Add discount</button>
                                    <span>—</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="flex justify-between text-sm text-[#5c5f62]">
                                    <button className="hover:underline text-left">Add shipping or delivery</button>
                                    <span>—</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="flex justify-between text-sm text-[#5c5f62]">
                                    <div className="flex items-center gap-1">
                                        <span>Estimated tax</span>
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M12 16v-4m0-4h.01" strokeWidth="2" strokeLinecap="round"/></svg>
                                    </div>
                                    <span>Not calculated</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-[#202223] pt-2">
                                    <span>Total</span>
                                    <span>₹0.00</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 lg:px-6 py-4 bg-[#f9f9f9] border-t border-[#e3e3e3]">
                            <p className="text-xs lg:text-sm text-[#5c5f62]">Add a product to calculate total and view payment options</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="w-full lg:w-80 space-y-4">
                    {/* Notes Card */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-sm text-[#202223]">Notes</h2>
                            <button className="text-gray-400 hover:text-[#202223] transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                        </div>
                        <p className="text-sm text-gray-500">No notes</p>
                    </div>

                    {/* Customer Card */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-4 space-y-3">
                        <h2 className="font-bold text-sm text-[#202223]">Customer</h2>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search or create a customer" 
                                className="w-full pl-10 pr-4 py-1.5 bg-white border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008060] transition-all"
                            />
                        </div>
                    </div>

                    {/* Markets Card */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-sm text-[#202223]">Markets</h2>
                            <button className="text-gray-400 hover:text-[#202223] transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/></svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-2 bg-[#f9f9f9] rounded-lg border border-transparent hover:border-[#d3d3d3] cursor-pointer transition-all">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                                </div>
                                <span className="text-sm text-[#202223]">India</span>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Currency</label>
                                <div className="relative">
                                    <select className="w-full bg-white border border-[#d3d3d3] rounded-lg py-1.5 px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#008060] transition-all">
                                        <option>Indian Rupee (INR ₹)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags Card */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-sm text-[#202223]">Tags</h2>
                            <button className="text-gray-400 hover:text-[#202223] transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                        </div>
                        <input 
                            type="text" 
                            className="w-full bg-white border border-[#d3d3d3] rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060] transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOrder;
