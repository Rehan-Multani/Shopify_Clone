import React from 'react';
import { Link } from 'react-router-dom';

const PurchaseOrdersTab = () => {
    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#202223]">Purchase orders</h1>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative">
                <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
                    {/* Empty State Illustration */}
                    <div className="relative w-48 h-48 mb-2 flex items-center justify-center">
                         <div className="relative w-32 h-32">
                             {/* Box Illustration */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#e67e22] rounded-xl transform rotate-3 origin-center opacity-80"></div>
                             {/* Clipboard Illustration */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-22 h-26 bg-white border border-[#d3d3d3] rounded shadow-lg transform -rotate-6 z-10 p-2 space-y-2">
                                <div className="h-2 w-12 bg-gray-100 rounded"></div>
                                <div className="space-y-1.5 pt-2">
                                    <div className="h-1.5 w-full bg-gray-50 rounded"></div>
                                    <div className="h-1.5 w-10/12 bg-gray-50 rounded"></div>
                                    <div className="h-1.5 w-full bg-gray-50 rounded"></div>
                                </div>
                             </div>
                         </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-base font-bold text-[#202223]">Manage your purchase orders</h2>
                        <p className="text-sm text-[#5c5f62] leading-relaxed max-w-sm">
                            Track and receive inventory ordered from suppliers.
                        </p>
                    </div>

                    <Link 
                        to="/dashboard/products/purchase-orders/new"
                        className="bg-[#1a1c23] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95 inline-block"
                    >
                        Create purchase order
                    </Link>
                </div>

                {/* Footer link */}
                <div className="absolute bottom-4 left-0 right-0 p-4 flex justify-center">
                    <button className="text-sm font-semibold text-[#5c5f62] hover:text-black transition-colors border-b border-transparent hover:border-[#5c5f62]">
                        Learn more about purchase orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrdersTab;
