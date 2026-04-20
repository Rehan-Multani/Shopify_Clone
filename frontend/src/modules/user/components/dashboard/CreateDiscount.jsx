import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CreateDiscount = () => {
    const location = useLocation();
    const typeId = location.pathname.split('/').pop();

    const typeConfigs = {
        products: {
            title: 'Amount off products',
            badge: 'Product discount',
            showAppliesTo: true,
        },
        buy_x_get_y: {
            title: 'Buy X get Y',
            badge: 'Buy X get Y',
            isSpecial: true,
        },
        order: {
            title: 'Amount off order',
            badge: 'Order discount',
            showAppliesTo: false,
        },
        shipping: {
            title: 'Free shipping',
            badge: 'Shipping discount',
            isShipping: true,
        }
    };

    const config = typeConfigs[typeId] || typeConfigs.products;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-3">
                <Link to="/dashboard/discounts" className="text-[#5c5f62] hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-bold text-xl">›</span>
                    <h1 className="text-xl font-bold text-[#202223]">{config.title}</h1>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Main Content: Discount Form */}
                <div className="flex-1 space-y-4 w-full">
                    {/* Primary Identity Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 lg:p-6 space-y-6">
                            <h2 className="font-bold text-[#202223] text-sm lg:text-base">{config.title}</h2>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#202223]">Method</label>
                                    <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                                        <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-sm font-bold text-[#202223]">Discount code</button>
                                        <button className="px-4 py-1.5 text-sm font-medium text-[#5c5f62] hover:text-black">Automatic discount</button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-[#202223]">Discount code</label>
                                        <button className="text-sm font-bold text-[#005bd3] hover:underline">Generate random code</button>
                                    </div>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005bd3]/20 focus:border-[#005bd3] transition-all"
                                        placeholder="e.g. SUMMER2024"
                                    />
                                    <p className="text-xs text-[#5c5f62]">Customers must enter this code at checkout.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Sections based on Type */}
                    {config.isSpecial ? (
                        <>
                            {/* Customer Buys Section */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 space-y-6">
                                <h2 className="font-bold text-[#202223] text-sm">Customer buys</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500">Minimum quantity of items</label>
                                            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue="1" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500">From</label>
                                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                                <option>Specific products</option>
                                                <option>Specific collections</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm font-bold text-[#005bd3] hover:bg-gray-50 transition-colors">
                                        Browse products
                                    </button>
                                </div>
                            </div>

                            {/* Customer Gets Section */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 space-y-6">
                                <h2 className="font-bold text-[#202223] text-sm">Customer gets</h2>
                                <p className="text-xs text-[#5c5f62]">Customers must add the quantity of items specified below to their cart.</p>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500">Quantity</label>
                                            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue="1" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500">From</label>
                                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                                <option>Specific products</option>
                                                <option>Specific collections</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-bold text-gray-500 block">At a discounted value</label>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="radio" name="value_type" defaultChecked className="w-4 h-4 text-[#008060]" />
                                                <span className="text-sm text-[#202223]">Percentage</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="radio" name="value_type" className="w-4 h-4 text-[#008060]" />
                                                <span className="text-sm text-[#202223]">Fixed amount</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="radio" name="value_type" className="w-4 h-4 text-[#008060]" />
                                                <span className="text-sm text-[#202223]">Free</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : config.isShipping ? (
                        <>
                            {/* Countries Section */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 space-y-4">
                                <h2 className="font-bold text-[#202223] text-sm">Countries</h2>
                                <div className="space-y-3 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="countries" defaultChecked className="w-4 h-4 text-[#008060]" />
                                        <span className="text-sm text-[#202223]">All countries</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="radio" name="countries" className="w-4 h-4 text-[#008060]" />
                                        <span className="text-sm text-[#202223]">Selected countries</span>
                                    </label>
                                </div>
                            </div>
                             {/* Shipping Rates Section */}
                             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 space-y-4">
                                <h2 className="font-bold text-[#202223] text-sm">Shipping rates</h2>
                                <label className="flex items-start gap-3 cursor-pointer pt-2 group">
                                    <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#008060]" />
                                    <div className="space-y-1">
                                        <span className="text-sm text-[#202223]">Exclude shipping rates over a certain amount</span>
                                        <input type="text" placeholder="₹0.00" className="w-32 block px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" />
                                    </div>
                                </label>
                            </div>
                        </>
                    ) : (
                        /* Default Value Card for Order or Products */
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 space-y-6">
                            <h2 className="font-bold text-[#202223] text-sm">Value</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none">
                                        <option>Percentage</option>
                                        <option>Fixed amount</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-8" placeholder="0" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                                </div>
                            </div>

                            {config.showAppliesTo && (
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#202223]">Applies to</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none">
                                            <option>Specific collections</option>
                                            <option>Specific products</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            </span>
                                            <input type="text" placeholder="Search collections" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                                        </div>
                                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-[#202223] hover:bg-gray-50 transition-all shadow-sm">
                                            Browse
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Common Sections for all types */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 space-y-4">
                        <h2 className="font-bold text-[#202223] text-sm">Eligibility</h2>
                        <p className="text-xs text-[#5c5f62]">Available on all sales channels</p>
                        <div className="space-y-3 pt-2">
                            {['All customers', 'Specific customer segments', 'Specific customers'].map(opt => (
                                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="radio" name="eligibility" defaultChecked={opt === 'All customers'} className="w-4 h-4 text-[#008060] focus:ring-[#008060]" />
                                    <span className="text-sm text-[#202223]">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 space-y-4">
                        <h2 className="font-bold text-[#202223] text-sm">Minimum purchase requirements</h2>
                        <div className="space-y-3 pt-2">
                            {['No minimum requirements', 'Minimum purchase amount (₹)', 'Minimum quantity of items'].map(opt => (
                                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="min_req" defaultChecked={opt === 'No minimum requirements'} className="w-4 h-4 text-[#008060]" />
                                    <span className="text-sm text-[#202223]">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 space-y-4">
                        <h2 className="font-bold text-[#202223] text-sm">Maximum discount uses</h2>
                        <div className="space-y-3 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#008060]" />
                                <span className="text-sm text-[#202223]">Limit number of times this discount can be used in total</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#008060]" />
                                <span className="text-sm text-[#202223]">Limit to one use per customer</span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 space-y-4">
                        <h2 className="font-bold text-[#202223] text-sm">Combinations</h2>
                        <div className="space-y-3 pt-2">
                            {['Product discounts', 'Order discounts', 'Shipping discounts'].map(opt => (
                                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#008060]" />
                                    <span className="text-sm text-[#202223]">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6 space-y-4">
                        <h2 className="font-bold text-[#202223] text-sm">Active dates</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                             <div className="space-y-2">
                                <label className="text-sm font-medium text-[#202223]">Start date</label>
                                <input type="date" defaultValue="2026-04-20" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-sm font-medium text-[#202223]">Start time (IST)</label>
                                <input type="time" defaultValue="16:20" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white" />
                             </div>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer pt-2">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#008060]" />
                            <span className="text-sm text-[#202223]">Set end date</span>
                        </label>
                    </div>
                </div>

                {/* Right Column: Summary & Metadata */}
                <div className="w-full lg:w-80 space-y-4 flex-shrink-0">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-6">
                        <div className="space-y-1">
                            <h3 className="font-bold text-[#202223] text-sm">Summary</h3>
                            <p className="text-xs text-gray-400">No discount code yet</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-[#202223] uppercase tracking-wider text-gray-400">Type</p>
                                <p className="text-sm font-bold text-[#202223] mt-1">{config.title}</p>
                                <p className="text-xs text-[#5c5f62] flex items-center gap-1.5 mt-1.5">
                                     <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                     {config.badge}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-[#202223] uppercase tracking-wider text-gray-400">Details</p>
                                <ul className="text-xs text-[#5c5f62] space-y-2 list-disc pl-4">
                                    <li>All customers</li>
                                    <li>For Online Store</li>
                                    <li>No minimum purchase requirement</li>
                                    <li>No usage limits</li>
                                    <li>Can't combine with other discounts</li>
                                    <li>Active from today</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Sales channel access</h3>
                        </div>
                        <div className="p-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#008060] mt-0.5" />
                                <p className="text-xs leading-relaxed text-[#5c5f62]">Allow discount to be featured on selected channels</p>
                            </label>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Tags</h3>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </span>
                            <input type="text" placeholder="Add tags" className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white transition-all focus:outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 right-0 left-0 lg:left-64 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-50 flex justify-end px-4 lg:px-8 shadow-2xl">
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-bold text-[#5c5f62] hover:text-black transition-colors">Discard</button>
                    <button className="bg-black text-white px-8 py-2 rounded-lg font-bold text-sm shadow-md active:scale-95 transition-all">
                        Save discount
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateDiscount;
