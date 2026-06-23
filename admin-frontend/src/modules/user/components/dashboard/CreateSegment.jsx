import React from 'react';
import { Link } from 'react-router-dom';

const CreateSegment = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#5c5f62]">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#202223]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div className="flex items-center gap-1.5">
                         <span className="text-gray-400 font-bold text-xl">›</span>
                         <h1 className="text-xl font-bold text-[#202223]">New segment</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button disabled className="px-4 py-1.5 bg-[#f1f1f1] text-[#babfc3] rounded-lg font-bold text-sm cursor-not-allowed">
                        Duplicate
                    </button>
                    <button className="px-4 py-1.5 bg-white border border-gray-300 text-[#202223] rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-1">
                        More actions
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div className="flex items-center">
                        <button disabled className="px-4 py-1.5 bg-[#f1f1f1] text-[#babfc3] border border-gray-200 border-r-0 rounded-l-lg font-bold text-sm cursor-not-allowed">
                            Use segment
                        </button>
                        <button disabled className="px-2 py-1.5 bg-[#f1f1f1] text-[#babfc3] border border-gray-200 rounded-r-lg font-bold text-sm cursor-not-allowed">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Segment Definition Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between group focus-within:ring-2 focus-within:ring-black/5 transition-all">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-[#6127d1] flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Describe your segment" 
                        className="bg-transparent border-none outline-none w-full text-base font-medium text-[#202223] placeholder:text-gray-400"
                    />
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg transition-all text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            {/* Main Empty State Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-16 px-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                <h2 className="text-xl font-bold text-[#202223]">You have no customers</h2>
                <p className="text-[#5c5f62] max-w-md leading-relaxed">
                    Once you've added customers and they meet this segment's definition, they will appear here.
                </p>
            </div>

            {/* Footer */}
            <div className="flex justify-center pt-2">
                <button className="text-sm font-semibold text-[#5c5f62] hover:text-[#202223] transition-colors border-b border-transparent hover:border-[#5c5f62] pb-0.5">
                    Learn more about segments
                </button>
            </div>
        </div>
    );
};

export default CreateSegment;
