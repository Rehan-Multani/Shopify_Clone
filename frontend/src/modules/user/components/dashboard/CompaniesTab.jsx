import React from 'react';

const CompaniesTab = () => {
    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#202223]">Companies</h1>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1c23] border border-[#1a1c23] rounded-lg text-sm font-semibold text-white hover:bg-black transition-all shadow-sm active:scale-95">
                    Add company
                </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative">
                <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
                    {/* Empty State Illustration */}
                    <div className="relative w-48 h-48 mb-2 flex items-center justify-center">
                         <div className="relative w-32 h-32 flex items-center justify-center">
                            {/* Building/Office icon */}
                            <svg className="w-20 h-20 text-[#202223] opacity-10" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 21h-4.29a2 2 0 01-1.41-.59l-3.3-3.3a2 2 0 01-.59-1.41V12a1 1 0 011-1h4v-1h-4a3 3 0 00-3 3v3.71l-1.3-1.3a1 1 0 00-1.41 1.41l3.3 3.3a3.98 3.98 0 002.82 1.18H19a1 1 0 001-1v-2a1 1 0 00-1-1zm-7-13a3 3 0 100-6 3 3 0 000 6z" />
                                <rect x="3" y="10" width="6" height="11" rx="1" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-12 h-12 text-[#202223] opacity-20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V5.25A2.25 2.25 0 0017.25 3H6.75A2.25 2.25 0 004.5 5.25V21m15 0h-15m15 0v-1.5a2.25 2.25 0 00-2.25-2.25h-10.5A2.25 2.25 0 004.5 19.5V21" />
                                </svg>
                            </div>
                         </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-base font-bold text-[#202223]">Selling to businesses (B2B)</h2>
                        <p className="text-sm text-[#5c5f62] leading-relaxed max-w-sm">
                            Manage your wholesale relationships by adding companies. You can assign price lists, payment terms, and multiple contacts to each company.
                        </p>
                    </div>

                    <button className="bg-[#1a1c23] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-sm active:scale-95">
                        Add company
                    </button>
                </div>

                {/* Footer link */}
                <div className="absolute bottom-4 left-0 right-0 p-4 flex justify-center">
                    <button className="text-sm font-semibold text-[#5c5f62] hover:text-black transition-colors border-b border-transparent hover:border-[#5c5f62]">
                        Learn more about B2B companies
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompaniesTab;
