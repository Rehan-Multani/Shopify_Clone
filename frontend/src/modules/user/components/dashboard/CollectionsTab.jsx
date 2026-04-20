import React from 'react';
import { Link } from 'react-router-dom';

const CollectionsTab = () => {
    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#202223]">Collections</h1>
                </div>
                <Link 
                    to="/dashboard/products/collections/new"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1c23] border border-[#1a1c23] rounded-lg text-sm font-bold text-white hover:bg-black transition-all shadow-lg active:scale-95"
                >
                    Add collection
                </Link>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Tabs / Filter bar */}
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

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f9f9f9] border-b border-gray-100">
                                <th className="p-3 w-10">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                </th>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-center w-24"></th>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Title</th>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Products</th>
                                <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Product conditions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                <td className="p-3">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                </td>
                                <td className="p-3 flex justify-center">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                </td>
                                <td className="p-3 text-sm font-bold text-[#202223]">Home page</td>
                                <td className="p-3 text-sm text-[#202223]">0</td>
                                <td className="p-3 text-sm text-[#5c5f62] italic">—</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="mt-auto p-4 flex justify-center">
                    <button className="text-sm font-semibold text-[#5c5f62] hover:text-black transition-colors flex items-center gap-1.5 border-b border-transparent hover:border-[#5c5f62] pb-0.5">
                        Learn more about collections
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CollectionsTab;
