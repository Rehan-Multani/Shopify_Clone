import React from 'react';
import { Link } from 'react-router-dom';

const CreateGiftCardProduct = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center justify-between">
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
                        <h1 className="text-xl font-bold text-[#202223]">Create gift card product</h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title and Description */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#202223] mb-1.5">Title</label>
                            <input 
                                type="text" 
                                placeholder="palak store gift card" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#202223] mb-1.5">Description</label>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                {/* Mock Rich Text Toolbar */}
                                <div className="bg-[#f6f6f7] border-b border-gray-200 p-2 flex flex-wrap gap-1">
                                    <button className="p-1 hover:bg-white rounded text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </button>
                                    <select className="bg-transparent text-xs font-bold px-2 py-1 outline-none text-gray-600">
                                        <option>Paragraph</option>
                                    </select>
                                    <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                                    <button className="p-1 hover:bg-white rounded text-gray-600 font-bold px-2">B</button>
                                    <button className="p-1 hover:bg-white rounded text-gray-600 italic px-2">I</button>
                                    <button className="p-1 hover:bg-white rounded text-gray-600 underline px-2">U</button>
                                    <button className="p-1 hover:bg-white rounded text-gray-600 flex items-center gap-1">
                                        A <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                    </button>
                                    <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                                    <button className="p-1 hover:bg-white rounded text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                    </button>
                                    <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                                    <button className="p-1 hover:bg-white rounded text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" /></svg>
                                    </button>
                                    <button className="p-1 hover:bg-white rounded text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </button>
                                    <button className="p-1 hover:bg-white rounded text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </button>
                                    <button className="p-1 hover:bg-white rounded text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </button>
                                    <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                                    <button className="p-1 hover:bg-white rounded text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                                    </button>
                                    <div className="flex-grow"></div>
                                    <button className="p-1 hover:bg-white rounded text-gray-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                    </button>
                                </div>
                                <textarea className="w-full h-48 px-4 py-3 text-sm focus:outline-none placeholder:text-gray-400 resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Media</h2>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center space-y-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                             <div className="flex gap-2">
                                <button className="bg-white px-4 py-1.5 rounded-lg border border-gray-200 shadow-sm text-xs font-bold text-[#202223] transition-all group-hover:border-gray-300 active:scale-95">
                                    Upload new
                                </button>
                                <button className="text-xs font-bold text-[#202223] hover:underline">
                                    Select existing
                                </button>
                             </div>
                             <p className="text-xs text-[#5c5f62]">Accepts images, videos, or 3D models</p>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Category</h2>
                        <div className="bg-[#f6f6f7] p-2 rounded-lg text-sm text-[#202223] font-medium flex items-center justify-between">
                            <span>Gift Cards</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Determines tax rates and adds metafields to improve search, filters, and cross-channel sales</p>
                    </div>

                    {/* Denominations */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Denominations</h2>
                        <div className="space-y-2">
                            {[10.00, 25.00, 50.00, 100.00].map((val, i) => (
                                <div key={i} className="flex items-center gap-2 group">
                                     <div className="flex-grow relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-sm">₹</span>
                                        </div>
                                        <input 
                                            type="text" 
                                            defaultValue={val.toFixed(2)} 
                                            className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-300"
                                        />
                                     </div>
                                     <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                     </button>
                                </div>
                            ))}
                        </div>
                        <button className="px-4 py-1.5 border border-gray-200 rounded-lg shadow-sm text-xs font-bold text-[#202223] hover:bg-gray-50 transition-all active:scale-95">
                            Add denomination
                        </button>
                    </div>

                    {/* SEO Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[#202223]">Search engine listing</h2>
                            <button className="text-gray-400 hover:text-black">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </div>
                        <p className="text-xs text-[#5c5f62]">Add a title and description to see how this product might appear in a search engine listing</p>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Status</h2>
                        <div className="relative">
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white">
                                <option>Active</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Publishing */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[#202223]">Publishing</h2>
                            <button className="text-gray-400 hover:text-black">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                             <div className="bg-[#f1f1f1] px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 group cursor-pointer transition-all hover:bg-[#e9e9e9]">
                                <span className="text-[#202223] font-medium">Online Store</span>
                                <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                             </div>
                             <div className="px-3 py-1.5 rounded-lg text-sm text-[#202223] font-medium hover:bg-[#f1f1f1] cursor-pointer transition-all">
                                Point of Sale
                             </div>
                        </div>
                    </div>

                    {/* Product Organization */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold text-[#202223]">Product organization</h2>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[#202223] mb-1.5 font-bold">Type</label>
                                <input type="text" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#202223] mb-1.5 font-bold">Vendor</label>
                                <input type="text" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#202223] mb-1.5 font-bold">Collections</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                    <input type="text" className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#202223] mb-1.5 font-bold">Tags</label>
                                <input type="text" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Theme template */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Theme template</h2>
                        <div className="relative">
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white">
                                <option>Default product</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Gift card template */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                         <h2 className="text-sm font-semibold text-[#202223]">Gift card template</h2>
                         <div className="relative">
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white">
                                <option>gift_card</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">This is what customers see when they redeem a gift card.</p>
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 flex items-center justify-end gap-3 z-40 transition-all">
                <button className="bg-gray-200 text-gray-500 cursor-not-allowed px-6 py-2 rounded-lg font-bold text-sm">
                    Save gift card product
                </button>
            </div>
        </div>
    );
};

export default CreateGiftCardProduct;
