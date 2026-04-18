import React from 'react';

const AbandonedTab = () => {
    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#202223]">Abandoned checkouts</h1>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
                    {/* Empty State Illustration */}
                    <div className="relative w-48 h-48 mb-2">
                        <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="110" r="60" fill="#f1f1f1" />
                            {/* Shopping Cart / Recovery Illustration */}
                            <path d="M60 70 L80 70 L90 120 L140 120 L150 90 L85 90" stroke="#e3e3e3" strokeWidth="2" fill="none" />
                            <circle cx="95" cy="135" r="5" fill="#e3e3e3" />
                            <circle cx="135" cy="135" r="5" fill="#e3e3e3" />
                            <path d="M120 60 L140 80 M140 60 L120 80" stroke="#d3d3d3" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-base font-bold text-[#202223]">Abandoned checkouts will show here</h2>
                        <p className="text-sm text-[#5c5f62] leading-relaxed max-w-sm">
                            When customers leave checkouts without paying, you'll see them here. You can then recover them with automated emails.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="bg-[#1a1c23] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-sm active:scale-95">
                            Check settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Link footer */}
            <div className="flex justify-center pt-2">
                <button className="text-sm font-semibold text-[#5c5f62] hover:text-black transition-colors flex items-center gap-1.5 border-b border-transparent hover:border-[#5c5f62] pb-0.5">
                    Learn more about abandoned checkouts
                </button>
            </div>
        </div>
    );
};

export default AbandonedTab;
