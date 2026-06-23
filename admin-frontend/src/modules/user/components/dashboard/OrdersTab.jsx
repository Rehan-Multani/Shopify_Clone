import React from 'react';
import { Link } from 'react-router-dom';

const OrdersTab = () => {
    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#202223]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h1 className="text-xl font-bold text-[#202223]">Orders</h1>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#ffffff] border border-[#d3d3d3] rounded-lg text-sm font-semibold text-[#202223] hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                    More actions
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
                    {/* Empty State Illustration */}
                    <div className="relative w-48 h-48 mb-2">
                        {/* Stacked Documents SVG */}
                        <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Background shadow/blob */}
                            <circle cx="100" cy="110" r="60" fill="#f1f1f1" />
                            
                            {/* Document 1 (Back) */}
                            <rect x="65" y="45" width="70" height="90" rx="4" fill="white" stroke="#e3e3e3" strokeWidth="1" />
                            <rect x="75" y="60" width="30" height="4" rx="2" fill="#e3e3e3" />
                            <rect x="75" y="70" width="50" height="4" rx="2" fill="#f5f5f5" />
                            
                            {/* Document 2 (Middle) */}
                            <rect x="55" y="55" width="70" height="90" rx="4" fill="white" stroke="#d3d3d3" strokeWidth="1" transform="rotate(-2, 90, 100)" />
                            
                            {/* Main Document (Front) */}
                            <g transform="translate(10, 0)">
                                <rect x="50" y="40" width="80" height="100" rx="6" fill="white" stroke="#e3e3e3" strokeWidth="1.5" />
                                {/* Blue Header on doc */}
                                <rect x="60" y="55" width="20" height="4" rx="2" fill="#4a90e2" />
                                
                                {/* Item 1 */}
                                <rect x="60" y="70" width="25" height="15" rx="3" fill="#e8f4f8" />
                                <rect x="90" y="70" width="30" height="4" rx="2" fill="#f1f1f1" />
                                <rect x="90" y="78" width="20" height="3" rx="1.5" fill="#f9f9f9" />
                                
                                {/* Item 2 */}
                                <rect x="60" y="95" width="15" height="20" rx="3" fill="#fff0ed" />
                                <rect x="85" y="95" width="35" height="4" rx="2" fill="#f1f1f1" />
                                <rect x="85" y="103" width="25" height="3" rx="1.5" fill="#f9f9f9" />
                                
                                {/* Tray/Box at bottom of doc */}
                                <path d="M50 120 C 50 120, 50 140, 50 140 L 130 140 L 130 120 H 115 L 110 125 H 70 L 65 120 H 50" fill="#2d9393" />
                            </g>
                        </svg>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-base font-bold text-[#202223]">Your orders will show here</h2>
                        <p className="text-sm text-[#5c5f62] leading-relaxed max-w-sm">
                            To get orders and accept payments from customers, you need to select a plan. 
                            You'll only be charged for your plan after your free trial ends.
                        </p>
                    </div>

                    <Link to="/dashboard/plan" className="bg-[#1a1c23] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95 block">
                        Select plan
                    </Link>
                </div>
            </div>

            {/* Link footer */}
            <div className="flex justify-center pt-2">
                <button className="text-sm font-semibold text-[#5c5f62] hover:text-black transition-colors flex items-center gap-1.5 border-b border-transparent hover:border-[#5c5f62] pb-0.5">
                    Learn more about orders
                </button>
            </div>
        </div>
    );
};

export default OrdersTab;
