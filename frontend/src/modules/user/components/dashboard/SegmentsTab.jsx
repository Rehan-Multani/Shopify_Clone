import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const SegmentsTab = () => {
    const [activeSegmentId, setActiveSegmentId] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveSegmentId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const segments = [
        { id: 1, name: "Customers who have purchased at least once", percentage: "0%", activity: "Created at 4:33 pm", createdBy: "Storify" },
        { id: 2, name: "Email subscribers", percentage: "0%", activity: "Created at 4:33 pm", createdBy: "Storify" },
        { id: 3, name: "Abandoned checkouts in the last 30 days", percentage: "0%", activity: "Created at 4:33 pm", createdBy: "Storify" },
        { id: 4, name: "Customers who have purchased more than once", percentage: "0%", activity: "Created at 4:33 pm", createdBy: "Storify" },
        { id: 5, name: "Customers who haven't purchased", percentage: "0%", activity: "Created at 4:33 pm", createdBy: "Storify" }
    ];

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#202223]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    <h1 className="text-xl font-bold">Segments</h1>
                </div>
                <Link 
                    to="/dashboard/customers/segments/new"
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1c23] border border-[#1a1c23] rounded-lg text-sm font-semibold text-white hover:bg-black transition-all shadow-sm active:scale-95"
                >
                    Create segment
                </Link>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100 flex items-center relative group">
                    <svg className="w-4 h-4 text-gray-400 absolute left-8 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                        type="search" 
                        placeholder="Search segments" 
                        className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1 pb-48">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100">
                                <th className="p-4 w-10">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 pointer-events-none" />
                                </th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">% of customers</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 group cursor-pointer hover:text-[#202223]">
                                    Last activity
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                </th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Created by</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {segments.map((segment) => (
                                <tr key={segment.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-4">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                    </td>
                                    <td className="p-4 text-sm font-bold text-[#202223]">{segment.name}</td>
                                    <td className="p-4 text-sm text-gray-600 text-right font-medium">{segment.percentage}</td>
                                    <td className="p-4 text-sm text-gray-600">{segment.activity}</td>
                                    <td className="p-4 text-sm text-gray-700 font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-[#008060] rounded flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2L4 5v14l8 3 8-3V5l-8-3z" />
                                                </svg>
                                            </div>
                                            {segment.createdBy}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center relative">
                                        <button 
                                            onClick={() => setActiveSegmentId(activeSegmentId === segment.id ? null : segment.id)}
                                            className="text-gray-400 hover:text-gray-600 p-1 transition-opacity"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                        </button>

                                        {activeSegmentId === segment.id && (
                                            <div 
                                                ref={dropdownRef}
                                                className="absolute right-4 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                                            >
                                                <button className="w-full px-4 py-2 text-left text-sm text-[#202223] font-medium hover:bg-gray-50 flex items-center gap-3">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Use segment
                                                </button>
                                                <button className="w-full px-4 py-2 text-left text-sm text-[#202223] font-medium hover:bg-gray-50 flex items-center gap-3">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                                    Duplicate
                                                </button>
                                                <button className="w-full px-4 py-2 text-left text-sm text-[#202223] font-medium hover:bg-gray-50 flex items-center gap-3">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                    Export
                                                </button>
                                                <button className="w-full px-4 py-2 text-left text-sm text-[#202223] font-medium hover:bg-gray-50 flex items-center gap-3">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    Rename
                                                </button>
                                                <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                                <button className="w-full px-4 py-2 text-left text-sm text-red-600 font-bold hover:bg-red-50 flex items-center gap-3">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer link */}
                <div className="p-6 border-t border-gray-50 flex justify-center">
                    <button className="text-sm font-semibold text-[#5c5f62] hover:text-[#202223] transition-colors border-b border-transparent hover:border-[#5c5f62] pb-0.5">
                        Learn more about segments
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SegmentsTab;
