import React from 'react';
import { Link } from 'react-router-dom';

const ProductsTab = () => {
    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#202223]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h1 className="text-xl font-bold text-[#202223]">Products</h1>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                {/* Secondary Header / Tabs */}
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <button className="px-3 py-1.5 bg-[#f1f1f1] text-[#202223] text-sm font-semibold rounded-lg">All</button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4.5h18m-18 5h18m-18 5h18m-18 5h18" /></svg>
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        </button>
                    </div>
                </div>

                {/* Primary Section: Add your products */}
                <div className="flex-1 flex flex-col lg:flex-row items-center justify-between p-8 lg:p-12 gap-8 border-b border-gray-100">
                    <div className="max-w-md space-y-6 text-center lg:text-left">
                        <div className="space-y-3">
                            <h2 className="text-lg font-bold text-[#202223]">Add your products</h2>
                            <p className="text-sm text-[#5c5f62] leading-relaxed">
                                Start by stocking your store with products your customers will love.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                            <Link to="/dashboard/products/new" className="bg-[#1a1c23] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                Add product
                            </Link>
                            <button className="bg-white text-[#202223] border border-[#d3d3d3] px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 active:scale-95">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                Import
                            </button>
                        </div>
                    </div>

                    {/* Product Gallery Illustration */}
                    <div className="grid grid-cols-2 gap-3 max-w-[320px] w-full">
                        {/* Sneaker Card */}
                        <div className="bg-[#f7f7f7] rounded-xl p-4 aspect-square flex items-center justify-center border border-gray-50 shadow-sm transition-transform hover:scale-105 cursor-default">
                             <svg className="w-16 h-16 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M4 18l1-4a2 2 0 012-1.5h10a2 2 0 012 1.5l1 4M10 12l-1-7h3" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M4 18h16l-1 2H5l-1-2z" fill="currentColor" fillOpacity="0.1"/>
                             </svg>
                        </div>
                        {/* Vase Card */}
                        <div className="bg-[#f7f7f7] rounded-xl p-4 aspect-square flex items-center justify-center border border-gray-50 shadow-sm transition-transform hover:scale-105 cursor-default">
                            <div className="w-12 h-16 bg-[#004242] rounded-full relative opacity-90 overflow-hidden">
                                <div className="absolute top-0 w-full h-4 bg-black/10"></div>
                            </div>
                        </div>
                        {/* Tube Card */}
                        <div className="bg-[#f7f7f7] rounded-xl p-4 aspect-square flex items-center justify-center border border-gray-50 shadow-sm transition-transform hover:scale-105 cursor-default">
                            <div className="w-16 h-8 bg-[#c2876b] rounded-t-sm rounded-b-md relative shadow-sm">
                                <div className="absolute -left-1 top-2 w-2 h-4 bg-[#8a5d48] rounded-sm"></div>
                            </div>
                        </div>
                        {/* Sunglasses Card */}
                        <div className="bg-[#f7f7f7] rounded-xl p-4 aspect-square flex items-center justify-center border border-gray-50 shadow-sm transition-transform hover:scale-105 cursor-default">
                            <div className="flex gap-1.5 items-center">
                                <div className="w-8 h-8 bg-black rounded-full border-2 border-gray-400"></div>
                                <div className="w-4 h-1 bg-black rounded-full"></div>
                                <div className="w-8 h-8 bg-black rounded-full border-2 border-gray-400"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Section: Find products to sell */}
                <div className="p-8 lg:p-12 space-y-6 flex flex-col items-center lg:items-start">
                    <div className="space-y-3 text-center lg:text-left">
                        <h2 className="text-base font-bold text-[#202223]">Find products to sell</h2>
                        <p className="text-sm text-[#5c5f62] leading-relaxed max-w-xl">
                            Have dropshipping or print on demand products shipped directly from the supplier to your customer, and only pay for what you sell.
                        </p>
                    </div>
                    <button className="bg-white text-[#202223] border border-[#d3d3d3] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                        Browse product sourcing apps
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductsTab;
