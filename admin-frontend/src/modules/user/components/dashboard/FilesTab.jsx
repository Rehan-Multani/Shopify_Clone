import React from 'react';

const FilesTab = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#202223]">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6h8v2H6v-2zm0 4h5v2H6v-2z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Files</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1c23] text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-sm active:scale-95">
                        Upload files
                        <svg className="w-4 h-4 border-l border-white/20 pl-1 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Tab Utility Bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-[#fbfcff]">
                    <div className="flex items-center gap-1">
                        <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#202223] shadow-sm">
                            All
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <button className="p-1.5 hover:bg-gray-50 text-gray-500 border-r border-gray-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                            <button className="p-1.5 hover:bg-gray-50 text-gray-500 border-r border-gray-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            </button>
                        </div>
                        <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors bg-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-5 py-3 w-10">
                                    <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                                </th>
                                <th className="px-4 py-3">File name</th>
                                <th className="px-4 py-3">Alt text</th>
                                <th className="px-4 py-3">Date added</th>
                                <th className="px-4 py-3">Size</th>
                                <th className="px-4 py-3">References</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            <tr className="hover:bg-gray-50 group transition-colors cursor-pointer">
                                <td className="px-5 py-3">
                                    <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100")' }} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-[#202223] group-hover:text-blue-600 transition-colors truncate">cloth</h3>
                                            <p className="text-xs text-gray-400 font-medium">AVIF</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-400">—</td>
                                <td className="px-4 py-3 text-gray-600">Apr 18</td>
                                <td className="px-4 py-3 text-gray-600">24.49 KB</td>
                                <td className="px-4 py-3">
                                    <span className="text-blue-600 hover:underline cursor-pointer">1 product</span>
                                </td>
                            </tr>
                            
                            {/* Empty spacing rows to match min-height look */}
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="h-16">
                                    <td colSpan="6" className="px-4 py-3 border-none"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Link */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/30 text-center">
                    <a href="#" className="text-xs font-bold text-gray-500 hover:text-black transition-colors underline underline-offset-4">
                        Learn more about files
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FilesTab;
