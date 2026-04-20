import React from 'react';
import { Link } from 'react-router-dom';

const CampaignsTab = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex items-center gap-2 text-[#202223] mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                <h1 className="text-xl font-bold">Campaigns</h1>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl border border-[#e3e3e3] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Internal Tabs/Filter Bar */}
                <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                        <button className="px-3 py-1 bg-[#f1f1f1] rounded-lg text-sm font-bold text-[#202223]">All</button>
                    </div>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                    </button>
                </div>

                {/* Top Section: Campaign Tracking */}
                <div className="p-6 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 flex-1">
                    <div className="max-w-xl space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-lg lg:text-xl font-bold text-[#202223]">Centralize your campaign tracking</h2>
                            <p className="text-sm text-[#5c5f62] leading-relaxed">
                                Create campaigns to evaluate how marketing initiatives drive business goals. Capture online and offline touchpoints, add campaign activities from multiple marketing channels, and monitor results.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link 
                                to="/dashboard/marketing/campaigns/new"
                                className="bg-[#1a1c23] text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-sm active:scale-95"
                            >
                                Create campaign
                            </Link>
                            <button className="bg-white text-[#202223] border border-gray-300 px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
                                Learn more
                            </button>
                        </div>
                    </div>

                    <div className="w-1/3 flex justify-end">
                        <div className="w-64 h-44 bg-[#3a6ff2] rounded-2xl shadow-2xl relative overflow-hidden flex items-center justify-center translate-y-2">
                             {/* Folder/Chart Illustration */}
                             <div className="w-24 h-24 rounded-full border-[10px] border-white/20 border-t-white relative flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white absolute top-0 -translate-y-1/2"></div>
                                <div className="w-12 h-4 bg-white/20 rounded-full relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white rounded-full w-2/3"></div>
                                </div>
                             </div>
                             <div className="absolute top-4 right-4 text-white/50">
                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Marketing Apps */}
                <div className="bg-[#f9fafb] border-t border-gray-100 p-6 lg:p-12 space-y-6">
                    <div className="max-w-xl space-y-2">
                        <h3 className="font-bold text-[#202223] text-base lg:text-lg">Generate traffic with marketing apps</h3>
                        <p className="text-sm text-[#5c5f62] leading-relaxed">
                            Grow your audience on social platforms, capture new leads with newsletter sign-ups, increase conversion with chat, and more.
                        </p>
                    </div>
                    <button className="bg-white text-[#202223] border border-gray-300 px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
                        Browse marketing apps
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignsTab;
