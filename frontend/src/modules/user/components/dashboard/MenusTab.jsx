import React from 'react';

const MenusTab = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#202223]">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    <h1 className="text-xl font-bold">Menus</h1>
                </div>
                <button className="px-3 py-1.5 bg-[#1a1c23] border border-[#1a1c23] rounded-lg text-sm font-semibold text-white hover:bg-black transition-all shadow-sm active:scale-95">
                    Add menu
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
                     <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </div>
                <h2 className="text-lg font-bold text-[#202223]">Navigation for your store</h2>
                <p className="text-sm text-[#5c5f62] max-w-sm">
                    Create and organize menus to help customers find what they're looking for on your online store.
                </p>
                <div className="pt-4">
                    <button className="bg-[#1a1c23] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-sm active:scale-95">
                        Add menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenusTab;
