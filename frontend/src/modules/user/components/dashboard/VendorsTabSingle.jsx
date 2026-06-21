import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const VendorsTabSingle = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-xl font-bold text-[#202223]">Vendors</h1>
                <Link
                    to="/dashboard/vendors/new"
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black/80 transition-all shadow-sm active:scale-95"
                >
                    Add vendor
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#202223] mb-2">Manage your vendors</h3>
                    <p className="text-[#5c5f62] mb-6 max-w-md">Add and manage sub-vendors, suppliers or staff for your business.</p>
                    <Link
                        to="/dashboard/vendors/new"
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black/80 transition-all shadow-sm active:scale-95"
                    >
                        Add vendor
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VendorsTabSingle;
