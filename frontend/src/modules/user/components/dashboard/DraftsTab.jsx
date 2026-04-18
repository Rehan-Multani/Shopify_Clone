import React from 'react';
import { Link } from 'react-router-dom';

const DraftsTab = () => {
    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#202223]">Draft orders</h1>
                </div>
                <Link to="/dashboard/orders/new" className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1c23] border border-[#1a1c23] rounded-lg text-sm font-semibold text-white hover:bg-black transition-all shadow-sm active:scale-95 block">
                    Create order
                </Link>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
                    {/* Empty State Illustration */}
                    <div className="relative w-48 h-48 mb-2">
                        <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="110" r="60" fill="#f1f1f1" />
                            {/* Paper/Pencil Illustration */}
                            <rect x="65" y="50" width="70" height="90" rx="4" fill="white" stroke="#e3e3e3" strokeWidth="1.5" />
                            <path d="M100 80 L130 50 L145 65 L115 95 Z" fill="#f8f9fa" stroke="#d3d3d3" strokeWidth="1.5" />
                            <rect x="80" y="70" width="40" height="3" rx="1.5" fill="#f1f1f1" />
                            <rect x="80" y="80" width="30" height="3" rx="1.5" fill="#f1f1f1" />
                            <rect x="80" y="90" width="45" height="3" rx="1.5" fill="#f1f1f1" />
                        </svg>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-base font-bold text-[#202223]">Orders you start will show here</h2>
                        <p className="text-sm text-[#5c5f62] leading-relaxed max-w-sm">
                            Use draft orders to take orders over the phone, email invoices to customers, and collect payments.
                        </p>
                    </div>

                    <Link to="/dashboard/orders/new" className="bg-white text-[#1a1c23] border border-[#d3d3d3] px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95 block">
                        Create order
                    </Link>
                </div>
            </div>

            {/* Link footer */}
            <div className="flex justify-center pt-2">
                <button className="text-sm font-semibold text-[#5c5f62] hover:text-black transition-colors flex items-center gap-1.5 border-b border-transparent hover:border-[#5c5f62] pb-0.5">
                    Learn more about draft orders
                </button>
            </div>
        </div>
    );
};

export default DraftsTab;
