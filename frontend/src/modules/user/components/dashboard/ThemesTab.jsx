import React from 'react';
import { Link } from 'react-router-dom';

const ThemesTab = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0B0F14] rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#202223] tracking-tight">Online Store</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                        View store
                    </button>
                    <div className="flex items-center">
                         <button className="px-4 py-2 bg-white border border-gray-200 rounded-l-lg text-sm font-bold text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                            Import theme
                        </button>
                        <button className="px-2 py-2 bg-white border border-gray-200 border-l-0 rounded-r-lg text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#202223]">Themes</h2>
            </div>

            {/* Main Theme Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-12 bg-[#f6f6f7] min-h-[350px] sm:min-h-[450px] relative overflow-hidden group">
                    {/* Desktop Mockup */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[90%] aspect-[16/10] bg-white rounded-t-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border border-gray-200 transition-all duration-700 group-hover:scale-[1.02]">
                        <div className="h-8 bg-[#f1f1f1] border-b border-gray-200 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                            <div className="ml-4 h-4 w-48 bg-white/50 rounded-full"></div>
                        </div>
                        <div className="p-6 sm:p-12 bg-white h-full relative overflow-hidden">
                             {/* Mock Theme Content */}
                             <div className="max-w-4xl mx-auto space-y-8 pt-8">
                                <div className="flex items-center justify-between text-[10px] sm:text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span className="text-[#202223]">My Store</span>
                                    <div className="flex gap-6">
                                        <span className="hover:text-black transition-colors cursor-pointer">Home</span>
                                        <span className="hover:text-black transition-colors cursor-pointer">Catalog</span>
                                        <span className="hover:text-black transition-colors cursor-pointer">Contact</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-4 h-4 border border-gray-200 rounded-full"></div>
                                        <div className="w-4 h-4 border border-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="space-y-6 pt-12 relative z-10">
                                    <div className="w-3/4 h-10 sm:h-16 bg-gradient-to-r from-gray-200 to-gray-50 rounded-2xl animate-pulse"></div>
                                    <h1 className="text-4xl sm:text-6xl font-black text-[#202223] leading-none tracking-tight">Browse our <br/>latest products</h1>
                                    <div className="w-32 h-12 bg-[#202223] rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-xl">
                                        Shop all
                                    </div>
                                </div>
                                
                                {/* Geometric Background decorators */}
                                <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-full blur-[80px] -z-10 opacity-60"></div>
                                
                                <div className="grid grid-cols-3 gap-6 pt-12">
                                     {[1,2,3].map(i => (
                                         <div key={i} className="aspect-[3/4] bg-gray-50 rounded-2xl border border-gray-100 flex flex-col p-4 space-y-4">
                                            <div className="flex-grow bg-white rounded-xl"></div>
                                            <div className="h-4 w-2/3 bg-gray-100 rounded-full"></div>
                                            <div className="h-4 w-1/3 bg-gray-100 rounded-full"></div>
                                         </div>
                                     ))}
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Mobile Mockup */}
                    <div className="absolute bottom-[-40px] right-[12%] w-[200px] sm:w-[260px] aspect-[1/2] bg-[#1a1c23] rounded-[3.5rem] border-[10px] border-[#1a1c23] shadow-2xl z-20 overflow-hidden hidden md:block group-hover:translate-y-[-20px] transition-transform duration-700 animate-in slide-in-from-right-12 delay-300">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-8 bg-[#1a1c23] rounded-b-2xl z-30 flex items-center justify-center">
                            <div className="w-12 h-1.5 bg-gray-800 rounded-full"></div>
                        </div>
                        <div className="p-5 bg-white h-full pt-12 flex flex-col">
                             <div className="flex items-center justify-between mb-8">
                                <div className="w-6 h-6 bg-gray-100 rounded"></div>
                                <span className="text-[10px] font-black uppercase">My Store</span>
                                <div className="flex gap-2">
                                    <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                                    <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                                </div>
                             </div>
                             <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl mb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[#202223]/5"></div>
                             </div>
                             <div className="space-y-3 mb-8">
                                <div className="h-8 w-full bg-[#202223] rounded-xl"></div>
                                <div className="h-4 w-2/3 bg-gray-100 rounded-full"></div>
                             </div>
                             <div className="grid grid-cols-2 gap-3 flex-grow">
                                  <div className="bg-gray-50 rounded-xl border border-gray-100"></div>
                                  <div className="bg-gray-50 rounded-xl border border-gray-100"></div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Password Banner */}
                <div className="bg-[#fff4e5] border-y border-[#ffe2bf] px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#bf7100]/10 rounded-full flex items-center justify-center text-[#bf7100]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <p className="text-sm font-semibold text-[#202223]">Password protected: to remove the password, pick a plan</p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <button className="text-sm font-bold text-[#005bd3] hover:underline px-2">Edit password</button>
                        <Link to="/dashboard/plan" className="bg-white border border-gray-200 px-5 py-2 rounded-xl text-sm font-bold text-[#202223] hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                            Pick a plan
                        </Link>
                    </div>
                </div>

                {/* Theme Info */}
                <div className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-8 bg-white">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-[#202223]">Horizon</h3>
                            <span className="px-3 py-1 bg-[#e4e3e6] rounded-full text-[10px] font-black text-[#5c5f62] uppercase tracking-wider">Current theme</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1 text-sm text-gray-500 font-medium">
                            <p>Added: Thursday at 12:28 pm</p>
                            <div className="hidden sm:block w-px h-3 bg-gray-200"></div>
                            <button className="flex items-center gap-2 hover:text-[#202223] transition-colors group">
                                Version 3.5.1
                                <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm group">
                            <svg className="w-6 h-6 text-[#202223] opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                        </button>
                        <button className="bg-[#202223] text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-xl active:scale-95 teal-glow-sm">
                            Edit theme
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Design Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 flex flex-col items-center text-center space-y-6 relative overflow-hidden group">
                 {/* Decorative background for AI section */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 
                 <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <div className="space-y-2 relative z-10">
                    <h3 className="text-2xl font-black text-[#202223] tracking-tight">Design your store in seconds ✨</h3>
                    <p className="text-sm text-[#5c5f62] max-w-lg mx-auto leading-relaxed font-semibold">Describe your business to create unique themes with personalized content</p>
                 </div>
                 <button className="w-fit bg-white border border-gray-200 px-8 py-3 rounded-xl font-black text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95 relative z-10">
                    Start designing
                 </button>
            </div>
        </div>
    );
};

export default ThemesTab;
