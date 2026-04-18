import React from 'react';

const GiftCardsTab = () => {
    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#202223]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                    <h1 className="text-xl font-bold text-[#202223]">Gift cards</h1>
                </div>
                <button className="text-xs font-bold text-[#5c5f62] bg-[#f1f1f1] px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                    Export
                </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative">
                <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
                    {/* Empty State Illustration */}
                    <div className="relative w-48 h-48 mb-2 flex items-center justify-center">
                         <div className="w-40 h-28 bg-[#008060] rounded-xl relative shadow-lg flex items-center justify-center overflow-hidden">
                            {/* Bow/Design on card */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:10px_10px]"></div>
                            <div className="w-12 h-12 border-4 border-white/30 rounded-full flex items-center justify-center">
                                <div className="w-6 h-6 border-4 border-white/60 rounded-full"></div>
                            </div>
                         </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-base font-bold text-[#202223]">Start selling gift cards</h2>
                        <p className="text-sm text-[#5c5f62] leading-relaxed max-w-sm">
                            Add gift card products to sell or create gift cards and send them directly to your customers.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <button className="bg-white text-[#202223] border border-[#d3d3d3] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                            Create gift card
                        </button>
                        <button className="bg-[#1a1c23] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-sm active:scale-95">
                            Add gift card product
                        </button>
                    </div>

                    <p className="text-xs text-[#5c5f62]">
                        By using gift cards, you agree to our <button className="text-blue-600 hover:underline">Terms of Service</button>
                    </p>
                </div>

                {/* Footer link */}
                <div className="absolute bottom-4 left-0 right-0 p-4 flex justify-center">
                    <button className="text-sm font-semibold text-[#5c5f62] hover:text-black transition-colors border-b border-transparent hover:border-[#5c5f62]">
                        Learn more about gift cards
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GiftCardsTab;
