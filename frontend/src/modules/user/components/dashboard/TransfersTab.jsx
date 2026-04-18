import React from 'react';

const TransfersTab = () => {
    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-[#202223]">
                   <span><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg></span>
                   <h1 className="text-xl">Transfers</h1>
                </div>
                <button className="text-xs font-bold text-[#5c5f62] bg-[#f1f1f1] px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                    Transfers report
                </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative">
                <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
                    {/* Empty State Illustration */}
                    <div className="relative w-64 h-32 mb-4 flex items-center justify-center gap-8">
                         {/* Location Package 1 */}
                         <div className="w-16 h-20 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center p-2 relative">
                             <div className="w-8 h-8 rounded-full bg-blue-100/50 flex items-center justify-center mb-auto">
                                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /></svg>
                             </div>
                             <div className="text-xs font-black text-gray-400">6</div>
                         </div>
                         {/* Transfer Arrow */}
                         <div className="w-10 h-10 rounded-full bg-[#008060] flex items-center justify-center shadow-lg relative z-10">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                         </div>
                         {/* Location Package 2 */}
                         <div className="w-16 h-20 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center p-2 relative">
                             <div className="w-8 h-8 rounded-full bg-green-100/50 flex items-center justify-center mb-auto">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /></svg>
                             </div>
                             <div className="text-xs font-black text-gray-400">4</div>
                         </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-base font-bold text-[#202223]">Move inventory between locations</h2>
                        <p className="text-sm text-[#5c5f62] leading-relaxed max-w-sm">
                            Move and track inventory between your business locations.
                        </p>
                    </div>

                    <button className="bg-[#1a1c23] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-sm active:scale-95">
                        Create transfer
                    </button>
                </div>

                {/* Footer link */}
                <div className="absolute bottom-4 left-0 right-0 p-4 flex justify-center">
                    <button className="text-sm font-semibold text-[#5c5f62] hover:text-black transition-colors border-b border-transparent hover:border-[#5c5f62]">
                        Learn more about transfers
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransfersTab;
