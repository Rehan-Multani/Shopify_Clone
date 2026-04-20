import React from 'react';

const AutomationsTab = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[600px] flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl border border-gray-200 shadow-sm p-12 lg:p-20 flex flex-col items-center text-center gap-8">
                {/* Custom Illustration */}
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#f6f6f7] rounded-full"></div>
                    <div className="relative z-10 grid grid-cols-2 gap-2 scale-90 lg:scale-100">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#2c9e90] rounded-xl shadow-sm -rotate-6"></div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#008060] rounded-xl shadow-lg translate-y-2 translate-x-1"></div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#f49342] rounded-xl shadow-sm rotate-12 -translate-x-1"></div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#de5e5e] rounded-xl shadow-sm -rotate-3"></div>
                    </div>
                    {/* The + icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white border border-gray-100 flex items-center justify-center rounded-xl shadow-xl">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-lg lg:text-xl font-bold text-[#202223]">You don't have this app installed</h2>
                    <p className="text-sm text-[#5c5f62]">Get Messaging and try again.</p>
                </div>

                {/* Shopify Messaging App Card */}
                <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-4 lg:p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#ff6cb5] to-[#9156ff] rounded-2xl flex items-center justify-center text-white shadow-inner">
                            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </div>
                        <div className="text-left space-y-0.5">
                            <h3 className="font-bold text-[#202223] text-sm lg:text-base">Shopify Messaging</h3>
                            <div className="flex items-center gap-1.5 text-xs text-[#5c5f62] font-medium">
                                <span>4.7</span>
                                <svg className="w-3 h-3 text-[#ffc844]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </div>
                            <p className="text-xs lg:text-sm text-[#5c5f62] line-clamp-1">Email tools made to grow your business—no coding required</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-3 lg:px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs lg:text-sm font-bold text-[#202223] transition-all whitespace-nowrap active:scale-95">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3" /></svg>
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutomationsTab;
