import React from 'react';
import { Link } from 'react-router-dom';

const AddCompany = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 text-[#5c5f62]">
                <Link to="/dashboard/customers/companies" className="hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-[#202223]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center text-[#202223]">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-[#202223]">New company</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Company Details Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#202223]">Company name</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                        <p className="text-xs text-[#5c5f62]">This will appear in customer accounts and at checkout.</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#202223]">Company ID</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                        <p className="text-xs text-[#5c5f62]">Add an existing external ID or create a unique ID.</p>
                    </div>
                </div>

                {/* Main Contact Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-[#202223]">Main contact</h2>
                    <div className="relative">
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                    </div>
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-sm font-semibold text-[#202223]">Location</h2>
                        <p className="text-xs text-[#5c5f62]">Add a location to this company. This is where you'll ship products to. Each location can have custom catalogs, checkout settings, and more. You can add more locations later.</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-[#202223]">Shipping address</h3>
                                <button className="text-sm font-bold text-[#005bd3] hover:underline">Clear</button>
                            </div>

                            <button className="w-full h-12 px-4 border border-gray-200 rounded-xl flex items-center justify-between group hover:bg-gray-50 transition-all font-bold text-sm text-[#202223]">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 flex items-center justify-center text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <span>Add address</span>
                                </div>
                                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>

                            <label className="flex items-center gap-3 group cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                                <span className="text-sm font-medium text-[#202223]">Billing address same as shipping address</span>
                            </label>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-[#202223]">Location ID</label>
                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                                <p className="text-xs text-[#5c5f62]">Add an existing external ID or create a unique ID.</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-semibold text-[#202223]">Markets</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-[#202223]">India</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 p-6 space-y-2">
                            <h3 className="text-sm font-semibold text-[#202223]">Catalogs</h3>
                            <p className="text-xs text-[#5c5f62]">No catalogs available. Go to Markets to add market catalogs.</p>
                        </div>
                    </div>
                </div>

                {/* Payment Terms Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-[#202223]">Payment terms</h2>
                    <div className="relative">
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white font-medium text-[#202223]">
                            <option>No payment terms</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Checkout Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <h2 className="text-sm font-semibold text-[#202223]">Checkout</h2>
                    <div className="space-y-4">
                         <div className="space-y-1">
                            <h4 className="text-xs font-bold text-[#202223]">Ship to address</h4>
                            <label className="flex items-start gap-3 group cursor-pointer">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                                <span className="text-sm text-[#202223]">Allow customers to ship to any one-time address</span>
                            </label>
                         </div>

                         <div className="space-y-3">
                            <h4 className="text-xs font-bold text-[#202223]">Order submission</h4>
                            <div className="space-y-2">
                                <label className="flex items-start gap-3 group cursor-pointer">
                                    <input type="radio" name="order-submission" defaultChecked className="mt-1 w-4 h-4 border-gray-300 text-black focus:ring-black" />
                                    <div>
                                        <p className="text-sm text-[#202223]">Automatically submit orders</p>
                                        <p className="text-xs text-[#5c5f62]">Orders without shipping addresses will be submitted as draft orders</p>
                                    </div>
                                </label>
                                <label className="flex items-start gap-3 group cursor-pointer">
                                    <input type="radio" name="order-submission" className="mt-1 w-4 h-4 border-gray-300 text-black focus:ring-black" />
                                    <p className="text-sm text-[#202223]">Submit all orders as drafts for review</p>
                                </label>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Tax Details Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <h2 className="text-sm font-semibold text-[#202223]">Tax details</h2>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#202223]">Tax ID</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#202223]">Tax settings</label>
                            <div className="relative">
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white font-medium text-[#202223]">
                                    <option>Collect tax</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 flex items-center justify-end gap-3 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Link to="/dashboard/customers/companies" className="px-5 py-2 text-sm font-bold text-[#202223] hover:bg-gray-100 rounded-lg transition-all">
                    Discard
                </Link>
                <button disabled className="bg-[#babfc3] text-white px-8 py-2 rounded-lg font-bold text-sm cursor-not-allowed transition-all shadow-sm">
                    Save
                </button>
            </div>
        </div>
    );
};

export default AddCompany;
