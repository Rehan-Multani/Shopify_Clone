import React from 'react';

const MetaobjectsTab = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#202223]">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                    <h1 className="text-xl font-bold">Metaobjects</h1>
                </div>
                <button className="px-3 py-1.5 bg-[#1a1c23] border border-[#1a1c23] rounded-lg text-sm font-semibold text-white hover:bg-black transition-all shadow-sm active:scale-95">
                    Add definition
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
                     <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h2 className="text-lg font-bold text-[#202223]">Custom content with metaobjects</h2>
                <p className="text-sm text-[#5c5f62] max-w-sm">
                    Create your own structured data models to power your store's complex content needs.
                </p>
                <div className="pt-4">
                    <button className="text-sm font-bold text-[#005bd3] hover:underline">
                        Learn more about metaobjects
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MetaobjectsTab;
