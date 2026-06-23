import React from 'react';
import { useNavigate } from 'react-router-dom';

const AddVendorSingle = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/dashboard/vendors')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-[#202223]">Add Vendor</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#202223] mb-1">Vendor Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" placeholder="e.g. Acme Supplier Co." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#202223] mb-1">Vendor Email</label>
                        <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" placeholder="vendor@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#202223] mb-1">Phone Number</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" placeholder="+1 (555) 000-0000" />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
                    <button onClick={() => navigate('/dashboard/vendors')} className="px-4 py-2 font-bold text-sm text-[#202223] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                        Cancel
                    </button>
                    <button onClick={() => navigate('/dashboard/vendors')} className="px-4 py-2 font-bold text-sm text-white bg-black rounded-lg hover:bg-black/80 transition-all shadow-sm">
                        Save vendor
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddVendorSingle;
