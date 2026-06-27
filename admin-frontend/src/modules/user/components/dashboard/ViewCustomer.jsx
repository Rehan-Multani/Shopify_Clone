import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const API_URL = CATALOG_API_URL;

const ViewCustomer = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('merchantToken');

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Parse path to get customerId
    const pathParts = window.location.pathname.split('/');
    const customerId = pathParts.includes('view') ? pathParts[pathParts.indexOf('view') + 1] : null;

    useEffect(() => {
        if (!customerId) {
            setError('Customer ID is missing');
            setLoading(false);
            return;
        }

        const fetchCustomer = async () => {
            try {
                const storeId = localStorage.getItem('activeStoreId') || '';
                const res = await fetch(`${API_URL}/customers/${customerId}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
                });
                const data = await res.json();
                if (res.ok) {
                    setCustomer(data);
                } else {
                    setError(data.message || 'Failed to fetch customer details');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load customer data');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [customerId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard/customers')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-red-600">Error</h1>
                </div>
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-medium">
                    {error || 'Customer not found'}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard/customers')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]" title="Back">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Customer Profile</h1>
                </div>
                <Link
                    to={`/dashboard/customers/edit/${customer._id}`}
                    className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Customer
                </Link>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6 flex flex-col items-center text-center">
                {/* Photo */}
                <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shadow-inner">
                    {customer.image ? (
                        <img src={`${API_URL.replace('/api', '')}${customer.image}`} alt={customer.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-[#202223]">{customer.name}</h2>
                    <p className="text-sm text-gray-500">Customer since {new Date(customer.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                </div>

                {/* Details Grid */}
                <div className="w-full border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Email Address</span>
                        <span className="text-sm font-bold text-[#202223] mt-1 block">{customer.email}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Phone Number</span>
                        <span className="text-sm font-bold text-[#202223] mt-1 block">{customer.number}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewCustomer;
