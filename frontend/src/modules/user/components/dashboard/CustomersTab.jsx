import React from 'react';

const CustomersTab = () => {
    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#202223]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <h1 className="text-xl font-bold">Customers</h1>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Top Section: Everything customers-related */}
                <div className="flex-1 flex flex-col lg:flex-row items-center justify-between p-8 lg:p-12 gap-12 border-b border-gray-100">
                    <div className="max-w-md space-y-6 text-center lg:text-left">
                        <div className="space-y-3">
                            <h2 className="text-xl font-bold text-[#202223]">Everything customers-related in one place</h2>
                            <p className="text-[#5c5f62] leading-relaxed text-sm">
                                Manage customer details, see customer order history, and group customers into segments.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                            <button className="bg-[#1a1c23] text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95">
                                Add customer
                            </button>
                            <button className="bg-white text-[#202223] border border-[#d3d3d3] px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                                Import customers
                            </button>
                        </div>
                    </div>

                    {/* Customer Illustration */}
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        <div className="w-48 h-48 bg-[#f1f1f1] rounded-full relative overflow-hidden flex items-center justify-center shadow-inner">
                            {/* Profile Illustration Placeholder */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200"></div>
                            {/* Person vector representation */}
                            <div className="relative w-24 h-40 mt-8">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#2c1d18] rounded-full"></div> {/* Hair */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-16 bg-[#a67c52] rounded-[30%]"></div> {/* Face */}
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 h-40 bg-[#1a1c23] rounded-t-3xl"></div> {/* Body */}
                                {/* Abstract UI hint */}
                                <div className="absolute -top-4 -right-20 w-32 h-24 bg-white rounded-lg shadow-xl border border-gray-100 p-3 space-y-2 transform rotate-3">
                                    <div className="h-2 w-16 bg-gray-100 rounded"></div>
                                    <div className="h-1.5 w-12 bg-gray-50 rounded"></div>
                                    <div className="flex justify-end pt-2">
                                        <div className="h-3 w-8 bg-[#008060] rounded-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Get customers with apps */}
                <div className="p-8 lg:p-12 space-y-6 flex flex-col items-center lg:items-start bg-[#fcfcfc]/50">
                    <div className="space-y-3 text-center lg:text-left">
                        <h3 className="text-base font-bold text-[#202223]">Get customers with apps</h3>
                        <p className="text-sm text-[#5c5f62] leading-relaxed max-w-xl">
                            Grow your customer list by adding a lead capture form to your store and marketing.
                        </p>
                    </div>
                    <button className="bg-white text-[#202223] border border-[#d3d3d3] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                        See app recommendations
                    </button>
                </div>
            </div>

            {/* Support link */}
            <div className="flex justify-center pt-2">
                <button className="text-sm font-semibold text-[#5c5f62] hover:text-[#202223] transition-colors border-b border-transparent hover:border-[#5c5f62] pb-0.5">
                    Learn more about customers
                </button>
            </div>
        </div>
    );
};

export default CustomersTab;
