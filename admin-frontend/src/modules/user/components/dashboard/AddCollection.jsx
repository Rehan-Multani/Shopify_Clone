import React from 'react';
import { Link } from 'react-router-dom';

const AddCollection = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 text-[#5c5f62]">
                <Link to="/dashboard/products/collections" className="hover:bg-gray-100 p-1 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-xl font-bold text-[#202223]">Add collection</h1>
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
                                placeholder="e.g., Summer collection, Under $100, Staff picks" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#202223] mb-1.5">Description</label>
                            <div className="border border-gray-300 rounded-lg overflow-hidden font-sans">
                                {/* Mock Rich Text Toolbar */}
                                <div className="bg-[#f6f6f7] border-b border-gray-200 p-2 flex flex-wrap gap-1">
                                    <select className="bg-transparent text-xs font-bold px-2 py-1 outline-none">
                                        <option>Paragraph</option>
                                    </select>
                                    <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                                    <button className="p-1 hover:bg-white rounded text-gray-600 font-serif font-black px-2">B</button>
                                    <button className="p-1 hover:bg-white rounded text-gray-600 font-serif italic px-2">I</button>
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
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
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

                    {/* Collection Type */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Collection type</h2>
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 group cursor-pointer">
                                <div className="mt-1">
                                    <input type="radio" name="collection-type" defaultChecked className="w-4 h-4 text-black border-gray-300 focus:ring-black" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#202223]">Manual</p>
                                    <p className="text-xs text-[#5c5f62]">Add products to this collection one by one. Learn more about <span className="text-blue-600 underline">manual collections</span>.</p>
                                </div>
                            </label>
                            <label className="flex items-start gap-3 group cursor-pointer text-[#babfc3]">
                                <div className="mt-1">
                                    <input type="radio" name="collection-type" className="w-4 h-4 border-gray-300 focus:ring-black" disabled />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Smart</p>
                                    <p className="text-xs">Existing and future products that match the conditions you set will automatically be added to this collection. Learn more about <span className="underline">smart collections</span>.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 space-y-4">
                            <h2 className="text-sm font-semibold text-[#202223]">Products</h2>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                    <input type="text" placeholder="Search products" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                                </div>
                                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                                    Browse
                                </button>
                                <div className="relative flex-grow sm:max-w-[200px]">
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none appearance-none bg-white">
                                        <option>Sort: Most relevant</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-[#202223]">There are no products in this collection.</p>
                                <p className="text-xs text-[#5c5f62]">Search or browse to add products.</p>
                            </div>
                        </div>
                    </div>

                    {/* SEO Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[#202223]">Search engine listing</h2>
                            <button className="text-gray-400 hover:text-black">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </div>
                        <p className="text-xs text-[#5c5f62]">Add a title and description to see how this collection might appear in a search engine listing</p>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Publishing */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[#202223]">Publishing</h2>
                            <button className="text-xs font-bold text-[#005bd3] hover:underline">Manage</button>
                        </div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sales channels</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full border border-gray-300"></div>
                                    <p className="text-sm text-[#202223]">Online Store</p>
                                </div>
                                <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full border border-gray-300"></div>
                                <p className="text-sm text-[#202223]">Point of Sale</p>
                            </div>
                        </div>
                    </div>

                    {/* Collection Image */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Image</h2>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center space-y-3 hover:bg-gray-50 transition-colors cursor-pointer group">
                            <button className="bg-white px-4 py-1.5 rounded-lg border border-gray-200 shadow-sm text-xs font-bold text-[#202223] transition-all active:scale-95 group-hover:border-gray-300">
                                Add image
                            </button>
                            <p className="text-xs text-[#5c5f62]">or drop an image to upload</p>
                        </div>
                    </div>

                    {/* Theme Template */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-[#202223]">Theme template</h2>
                        <div className="relative">
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none appearance-none bg-white">
                                <option>Default collection</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 4 4-4" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 flex items-center justify-end gap-3 z-40">
                <Link to="/dashboard/products/collections" className="px-4 py-2 text-sm font-bold text-[#202223] hover:bg-gray-100 rounded-lg transition-all">
                    Discard
                </Link>
                <button className="bg-[#202223] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95">
                    Save
                </button>
            </div>
        </div>
    );
};

export default AddCollection;
