import React from 'react';

const DashboardHeader = ({ isOpen, setIsOpen }) => {
    const storeName = localStorage.getItem('shopStoreName') || 'My Store';
    const storeInitials = storeName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <header className="h-14 bg-[#1a1c23] border-b border-white/5 flex items-center justify-between px-4 fixed top-0 right-0 left-0 lg:left-64 z-[40] transition-all duration-300 shadow-xl">
            {/* Mobile Menu Toggle */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 mr-2 text-gray-400 hover:bg-white/5 rounded-lg transition-all"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
            </button>

            {/* Search Bar */}
            <div className="flex-grow max-w-2xl px-4 lg:px-0">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search" 
                        className="block w-full bg-[#2f313a] border-none rounded-lg py-1.5 pl-10 pr-12 text-sm text-white placeholder-gray-400 focus:outline-none transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-black text-gray-500 tracking-widest uppercase">
                            <span>CTRL</span>
                            <span>K</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:bg-white/5 rounded-lg transition-all relative group">
                    <svg className="w-5 h-5 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a1c23]"></span>
                </button>
                <button className="p-2 text-gray-400 hover:bg-white/5 rounded-lg transition-all group">
                    <svg className="w-5 h-5 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21l-1.414-1.414A17.933 17.933 0 0112 17.24a17.933 17.933 0 011.414 2.346L12 21zm0 0v-5m0 0a5.333 5.333 0 01-5-5.333V5a5 5 0 0110 0v5.667A5.333 5.333 0 0112 16z" />
                    </svg>
                </button>
                
                <div className="h-8 w-px bg-white/10 mx-1"></div>

                <button className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-white/5 rounded-lg transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-[#00c04b] flex items-center justify-center text-[10px] font-black tracking-widest text-white shadow-lg transition-transform group-hover:scale-105 active:scale-95">
                        {storeInitials}
                    </div>
                    <span className="text-sm font-bold text-white group-hover:opacity-80 transition-opacity">{storeName}</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader;
