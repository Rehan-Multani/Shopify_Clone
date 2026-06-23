import React from 'react';
import { useNavigate } from 'react-router-dom';

const DiscountsTab = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const discountTypes = [
        {
            id: 'products',
            title: 'Amount off products',
            description: 'Discount specific products or collections of products',
            icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
        },
        {
            id: 'buy_x_get_y',
            title: 'Buy X get Y',
            description: 'Discount specific products or collections of products',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
        },
        {
            id: 'order',
            title: 'Amount off order',
            description: 'Discount the total order amount',
            icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z'
        },
        {
            id: 'shipping',
            title: 'Free shipping',
            description: 'Offer free shipping on an order',
            icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4l3 3v5h-2m1 1h-1m-4 0h-1m-4 0h1'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#202223]">
                    <svg className="w-6 h-6 text-[#5c5f62]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    <h1 className="text-xl font-bold">Discounts</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-semibold text-gray-400 cursor-default flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3" /></svg>
                        Export
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-1.5 bg-[#1a1c23] border border-[#1a1c23] rounded-lg text-sm font-semibold text-white hover:bg-black transition-all shadow-sm active:scale-95"
                    >
                        Create discount
                    </button>
                </div>
            </div>

            {/* Empty State Card */}
            <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8 text-center relative gap-8">
                {/* Custom Scissors Illustration */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <div className="absolute w-32 h-32 bg-[#f6f6f7] rounded-full"></div>
                    {/* Discount Tag */}
                    <div className="relative z-10 w-24 h-16 bg-[#ebad52] rounded-md shadow-md flex items-center justify-center p-2 -rotate-12 translate-x-4">
                        <div className="border-2 border-white/30 border-dashed w-full h-full rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">%</span>
                        </div>
                    </div>
                    {/* Scissors (simplified geometric version) */}
                    <div className="absolute z-20 inset-0 flex items-center justify-center">
                        <div className="relative w-32 h-32 scale-90">
                            {/* Blade 1 */}
                            <div className="absolute top-1/2 left-1/2 w-2 h-20 bg-[#2c7365] -translate-x-1/2 -translate-y-[80%] rotate-45 rounded-full origin-bottom"></div>
                            {/* Blade 2 */}
                            <div className="absolute top-1/2 left-1/2 w-2 h-20 bg-[#2c7365] -translate-x-1/2 -translate-y-[80%] -rotate-45 rounded-full origin-bottom"></div>
                            {/* Handles */}
                            <div className="absolute bottom-4 left-4 w-10 h-10 border-4 border-[#2c7365] rounded-full"></div>
                            <div className="absolute bottom-4 right-4 w-10 h-10 border-4 border-[#2c7365] rounded-full"></div>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-md space-y-3">
                    <h2 className="text-lg font-bold text-[#202223]">Manage discounts and promotions</h2>
                    <p className="text-sm text-[#5c5f62] leading-relaxed">
                        Add discount codes and automatic discounts that apply at checkout. <br />
                        You can also use discounts with <button className="text-blue-600 underline">compare at prices</button>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#1a1c23] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-sm active:scale-95"
                    >
                        Create discount
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center pt-4">
                <button className="text-sm font-medium text-[#5c5f62] hover:text-black transition-colors underline">
                    Learn more about discounts
                </button>
            </div>

            {/* Select discount type modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-base font-bold text-[#202223]">Select discount type</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-black p-1 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Discount Categories List */}
                        <div className="p-0">
                            {discountTypes.map((type) => (
                                <button 
                                    key={type.id}
                                    onClick={() => navigate(`/dashboard/discounts/new/${type.id}`)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-b-0"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-5 h-5 text-[#5c5f62] group-hover:text-black transition-colors">
                                            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} /></svg>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-[#202223]">{type.title}</p>
                                            <p className="text-xs text-[#5c5f62] line-clamp-1">{type.description}</p>
                                        </div>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-300 group-hover:text-black transition-all transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-[#202223] hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountsTab;
