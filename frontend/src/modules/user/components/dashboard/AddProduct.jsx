import React from 'react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 pb-32">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-2 mb-4">
                <button 
                    onClick={() => navigate('/dashboard/products')}
                    className="p-1 hover:bg-gray-200 rounded-md transition-all text-gray-600"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <div className="flex items-center gap-2">
                   <svg className="w-4 h-4 text-gray-400 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   <h1 className="text-xl font-bold text-[#202223]">Add product</h1>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column - Main Details */}
                <div className="flex-1 space-y-4">
                    
                    {/* Title & Description Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#202223]">Title</label>
                            <input 
                                type="text" 
                                placeholder="Short sleeve t-shirt"
                                className="w-full px-3 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008060] transition-all placeholder:text-gray-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#202223]">Description</label>
                            <div className="border border-[#d3d3d3] rounded-lg overflow-hidden">
                                {/* RTF Toolbar Mockup */}
                                <div className="bg-[#f9f9f9] border-b border-[#e3e3e3] p-1.5 flex flex-wrap items-center gap-1">
                                    <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2"/></svg>
                                    </button>
                                    <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                                    <button className="px-2 py-1 text-xs font-bold hover:bg-gray-200 rounded">Paragraph</button>
                                    <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                                    <button className="p-1.5 hover:bg-gray-200 rounded font-black">B</button>
                                    <button className="p-1.5 hover:bg-gray-200 rounded italic font-serif italic">I</button>
                                    <button className="p-1.5 hover:bg-gray-200 rounded underline decoration-2">U</button>
                                    <button className="p-1.5 hover:bg-gray-200 rounded text-red-500 font-bold">A</button>
                                    <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                                    <button className="p-1.5 hover:bg-gray-200 rounded">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h16" strokeWidth="2"/></svg>
                                    </button>
                                    <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                                    <button className="p-1.5 hover:bg-gray-200 rounded">🔗</button>
                                    <button className="p-1.5 hover:bg-gray-200 rounded">🖼️</button>
                                    <button className="p-1.5 hover:bg-gray-200 rounded">🎥</button>
                                    <button className="p-1.5 hover:bg-gray-200 rounded">📊</button>
                                    <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                                    <button className="p-1.5 hover:bg-gray-200 rounded">...</button>
                                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-400">{'</>'}</button>
                                </div>
                                <textarea 
                                    className="w-full p-4 text-sm bg-white outline-none min-h-[200px] resize-none"
                                    placeholder="Start typing your description..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Media Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-4">
                        <label className="text-sm font-medium text-[#202223]">Media</label>
                        <div className="border-2 border-dashed border-[#d3d3d3] rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-[#fbfbfb]">
                            <div className="flex gap-4">
                                <button className="bg-white border border-[#d3d3d3] px-4 py-2 rounded-lg text-sm font-bold text-[#202223] shadow-sm hover:bg-gray-50 transition-all">
                                    Upload new
                                </button>
                                <button className="text-sm font-bold text-[#202223] hover:underline">
                                    Select existing
                                </button>
                            </div>
                            <p className="text-xs text-[#5c5f62]">Accepts images, videos, or 3D models</p>
                        </div>
                    </div>

                    {/* Category Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#202223]">Category</label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#008060] transition-all">
                                    <option>Choose a product category</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                            </div>
                            <p className="text-xs text-[#5c5f62]">Determines tax rates and adds metafields to improve search, filters, and cross-channel sales</p>
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-6">
                        <h2 className="text-sm font-medium text-[#202223]">Pricing</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">Price</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center text-sm text-[#202223]">₹</span>
                                    <input 
                                        type="text" 
                                        defaultValue="0.00"
                                        className="w-full pl-8 pr-3 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008060] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-4 overflow-x-auto no-scrollbar">
                           <button className="px-3 py-1 bg-gray-100 text-[#202223] rounded-lg text-xs font-bold hover:bg-gray-200">Compare-at</button>
                           <button className="px-3 py-1 bg-gray-100 text-[#202223] rounded-lg text-xs font-bold hover:bg-gray-200">Unit price</button>
                           <button className="px-3 py-1 bg-gray-100 text-[#202223] rounded-lg text-xs font-bold hover:bg-gray-200">Charge tax <span className="text-gray-400 ml-1">Yes</span></button>
                           <button className="px-3 py-1 bg-gray-100 text-[#202223] rounded-lg text-xs font-bold hover:bg-gray-200">Cost per item</button>
                        </div>
                    </div>

                    {/* Inventory Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-[#202223]">Inventory</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Inventory tracked</span>
                                <div className="w-10 h-5 bg-[#008060] rounded-full relative p-1 cursor-pointer">
                                    <div className="w-3 h-3 bg-white rounded-full absolute right-1"></div>
                                </div>
                            </div>
                        </div>
                        <div className="border border-[#e3e3e3] rounded-lg overflow-hidden">
                            <div className="bg-[#f9f9f9] px-4 py-2 border-b border-[#e3e3e3] flex justify-between">
                                <span className="text-xs font-bold text-gray-500">Quantity</span>
                                <span className="text-xs font-bold text-gray-500">Quantity</span>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-sm text-[#202223]">Shop location</span>
                                <input 
                                    type="number" 
                                    defaultValue="0"
                                    className="w-20 px-3 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#008060]"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                           <button className="px-3 py-1 bg-gray-100 text-[#202223] rounded-lg text-xs font-bold hover:bg-gray-200">SKU</button>
                           <button className="px-3 py-1 bg-gray-100 text-[#202223] rounded-lg text-xs font-bold hover:bg-gray-200">Barcode</button>
                           <button className="px-3 py-1 bg-gray-100 text-[#202223] rounded-lg text-xs font-bold hover:bg-gray-200">Sell when out of stock <span className="text-gray-400 ml-1">Off</span></button>
                        </div>
                    </div>

                    {/* Shipping Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-[#202223]">Shipping</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Physical product</span>
                                <div className="w-10 h-5 bg-[#008060] rounded-full relative p-1 cursor-pointer">
                                    <div className="w-3 h-3 bg-white rounded-full absolute right-1"></div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-1">
                                    <label className="text-xs font-medium text-gray-500">Package</label>
                                    <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-[#d3d3d3] rounded-lg bg-[#fbfbfb] cursor-pointer hover:bg-gray-50">
                                   <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                                           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                       </div>
                                       <div>
                                           <p className="text-xs font-bold text-[#202223]">Store default</p>
                                           <p className="text-[10px] text-gray-500">Sample box - 22 x 13.7 x 4.2 cm, 0 kg</p>
                                       </div>
                                   </div>
                                   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                            </div>
                            <div className="space-y-1.5 w-full md:w-32">
                                <label className="text-xs font-medium text-gray-500">Product weight</label>
                                <div className="flex">
                                    <input type="text" defaultValue="0.0" className="w-full px-3 py-2 bg-white border border-[#d3d3d3] border-r-0 rounded-l-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#008060]" />
                                    <select className="px-2 py-2 bg-white border border-[#d3d3d3] rounded-r-lg text-sm appearance-none focus:outline-none">
                                        <option>kg</option>
                                        <option>lb</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-4">
                           <button className="px-3 py-1 bg-gray-100 text-[#202223] rounded-lg text-xs font-bold hover:bg-gray-200">Country of origin</button>
                           <button className="px-3 py-1 bg-gray-100 text-[#202223] rounded-lg text-xs font-bold hover:bg-gray-200">HS Code</button>
                        </div>
                    </div>

                    {/* Variants Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-4">
                        <h2 className="text-sm font-medium text-[#202223]">Variants</h2>
                        <button className="text-shopify text-sm font-bold flex items-center gap-2 hover:underline">
                            <span className="text-lg">+</span> Add options like size or color
                        </button>
                    </div>

                    {/* SEO Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-[#202223]">Search engine listing</h2>
                            <button className="text-gray-400 hover:text-shopify">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                        </div>
                        <p className="text-sm text-[#5c5f62]">Add a title and description to see how this product might appear in a search engine listing</p>
                    </div>

                </div>

                {/* Right Column - Sidebar */}
                <div className="w-full lg:w-80 space-y-4">
                    {/* Status Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-4">
                        <label className="text-sm font-medium text-[#202223]">Status</label>
                        <select className="w-full px-3 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#008060] transition-all">
                            <option>Active</option>
                            <option>Draft</option>
                        </select>
                    </div>

                    {/* Publishing Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-[#202223]">Publishing</h2>
                            <button className="text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2"/></svg>
                            </button>
                        </div>
                        <div className="space-y-3">
                           <div className="flex items-center justify-between text-sm">
                               <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-[#008060]"></div>
                                   <span className="text-[#202223]">Online Store</span>
                               </div>
                               <button className="text-gray-400 hover:text-shopify"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2"/></svg></button>
                           </div>
                           <div className="flex items-center justify-between text-sm">
                               <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-[#008060]"></div>
                                   <span className="text-[#202223]">Point of Sale</span>
                               </div>
                           </div>
                        </div>
                    </div>

                    {/* Organization Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-[#202223]">Product organization</h2>
                            <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">Type</label>
                                <input type="text" className="w-full px-3 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">Vendor</label>
                                <input type="text" className="w-full px-3 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">Collections</label>
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2"/></svg>
                                    <input type="text" className="w-full pl-9 pr-3 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500">Tags</label>
                                <input type="text" className="w-full px-3 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]" />
                            </div>
                        </div>
                    </div>

                    {/* Theme template Card */}
                    <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm p-6 space-y-4">
                        <label className="text-sm font-medium text-[#202223]">Theme template</label>
                        <select className="w-full px-3 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#008060] transition-all">
                            <option>Default product</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e3e3e3] py-4 px-6 z-50 flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <button 
                  onClick={() => navigate('/dashboard/products')}
                  className="px-4 py-2 text-sm font-bold text-[#202223] hover:bg-gray-100 rounded-lg transition-all"
                >
                    Discard
                </button>
                <button className="px-6 py-2 bg-[#f1f1f1] text-gray-400 rounded-lg text-sm font-bold cursor-not-allowed">
                    Save
                </button>
            </div>
        </div>
    );
};

export default AddProduct;
