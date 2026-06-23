import React from 'react';
import { Link } from 'react-router-dom';

const InventoryTab = () => {
    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#202223]">Inventory</h1>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative">
                <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
                    {/* Empty State Illustration - Backpack */}
                    <div className="relative w-48 h-48 mb-2 flex items-center justify-center">
                         <div className="relative">
                            {/* Simple Backpack Representation */}
                            <div className="w-24 h-32 bg-[#8c6d5e] rounded-xl relative group">
                                <div className="absolute top-0 w-full h-8 bg-black/10 rounded-t-xl"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-6 bg-[#6d4c41] rounded shadow-inner"></div>
                            </div>
                            {/* Counter badge shown in image */}
                            <div className="absolute -bottom-2 -right-4 bg-white shadow-xl rounded-full px-4 py-1.5 flex items-center gap-2 border border-gray-100 animate-bounce">
                                <span className="text-gray-400 text-lg">−</span>
                                <span className="text-sm font-bold text-[#202223]">17</span>
                                <span className="text-gray-400 text-lg">+</span>
                            </div>
                         </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-base font-bold text-[#202223]">Keep track of your inventory</h2>
                        <p className="text-sm text-[#5c5f62] leading-relaxed max-w-sm">
                            When you enable inventory tracking on your products, you can view and adjust their inventory counts here.
                        </p>
                    </div>

                    <Link 
                        to="/dashboard/products"
                        className="bg-[#1a1c23] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-sm active:scale-95 inline-block"
                    >
                        Go to products
                    </Link>
                </div>

                {/* Footer link */}
                <div className="absolute bottom-4 left-0 right-0 p-4 flex justify-center">
                    <button className="text-sm font-semibold text-[#5c5f62] hover:text-black transition-colors border-b border-transparent hover:border-[#5c5f62]">
                        Learn more about managing inventory
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryTab;
