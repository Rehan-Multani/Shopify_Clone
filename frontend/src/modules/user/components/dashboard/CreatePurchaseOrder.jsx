import React from 'react';
import { Link } from 'react-router-dom';

const CreatePurchaseOrder = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 text-[#5c5f62]">
                <Link to="/dashboard/products/purchase-orders" className="hover:bg-gray-100 p-1 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-[#202223]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center text-[#5c5f62]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-[#202223]">Create purchase order</h1>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="space-y-6">
                {/* Supplier & Destination Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-[#202223]">Supplier</label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none appearance-none bg-white text-gray-500">
                                    <option>Select supplier</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-[#202223]">Destination</label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none appearance-none bg-white font-medium text-[#202223]">
                                    <option>Shop location</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-[#202223]">Payment terms (optional)</label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none appearance-none bg-white text-[#202223]">
                                    <option>None</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-[#202223]">Supplier currency</label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none appearance-none bg-white text-[#202223]">
                                    <option>Indian Rupee (INR ₹)</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipment Details Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-[#202223]">Shipment details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-[#202223]">Estimated arrival</label>
                            <div className="relative">
                                <input type="text" placeholder="YYYY-MM-DD" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none placeholder:text-gray-400" />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <label className="block text-sm font-medium text-[#202223]">Shipping carrier</label>
                             <div className="relative">
                                <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none appearance-none bg-white">
                                    <option></option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#202223]">Tracking number</label>
                            <input type="text" className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                        </div>
                    </div>
                </div>

                {/* Add Products Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-[#202223]">Add products</h2>
                    <div className="flex gap-3">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input type="text" placeholder="Search products" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                        </div>
                        <button className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-bold text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                            Browse
                        </button>
                    </div>
                </div>

                {/* Additional Details & Cost Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Additional Details */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <h2 className="text-sm font-semibold text-[#202223]">Additional details</h2>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-[#202223] mb-1.5">Reference number</label>
                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                             </div>
                             <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-medium text-[#202223]">Note to supplier</label>
                                    <span className="text-[10px] text-gray-400 font-medium tracking-wider">0/5000</span>
                                </div>
                                <textarea className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none"></textarea>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-[#202223] mb-1.5">Tags</label>
                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                             </div>
                        </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-[#202223]">Cost summary</h2>
                            <button className="text-xs font-bold text-[#005bd3] hover:underline">Manage</button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#5c5f62]">Taxes (Included)</span>
                                <span className="text-sm font-medium text-[#202223]">₹0.00</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#202223]">Subtotal</span>
                                    <span className="text-[10px] text-gray-400">0 items</span>
                                </div>
                                <span className="text-sm font-medium text-[#202223]">₹0.00</span>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cost adjustments</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[#202223]">Shipping</span>
                                        <span className="text-sm font-medium text-[#202223]">₹0.00</span>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm font-black text-[#202223]">Total</span>
                                    <span className="text-sm font-black text-[#202223]">₹0.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 flex items-center justify-end gap-3 z-40">
                <Link to="/dashboard/products/purchase-orders" className="px-4 py-2 text-sm font-bold text-[#202223] hover:bg-gray-100 rounded-lg transition-all">
                    Discard
                </Link>
                <button className="bg-[#202223] text-white px-6 py-2 rounded-lg font-bold text-sm hover:group-bg-black transition-all shadow-lg active:scale-95">
                    Save
                </button>
            </div>
        </div>
    );
};

export default CreatePurchaseOrder;
