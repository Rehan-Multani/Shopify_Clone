import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SingleVendorProductsTab from './SingleVendorProductsTab';
import OrdersTab from './OrdersTab';
import CouponsTab from './CouponsTab';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;

const VendorProfileCard = ({ vendor }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 select-none">
            {/* Main Header summary within card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-4">
                    {vendor?.logo ? (
                        <img 
                            src={vendor.logo.startsWith('http') ? vendor.logo : `${CATALOG_API_URL.replace('/api', '')}${vendor.logo}`} 
                            alt={vendor.name} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm" 
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-lg font-bold text-zinc-600 border border-gray-200 shadow-sm">
                            {vendor?.name?.charAt(0).toUpperCase() || 'V'}
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-black text-[#202223] tracking-tight">{vendor?.name || 'Vendor Profile'}</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{vendor?.businessName || 'Business Info'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        vendor.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-red-50 text-red-700 border border-red-200/50'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${vendor.isActive ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="bg-zinc-50 border border-zinc-200 text-zinc-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                        Commission: {vendor.commission || 0}%
                    </span>
                </div>
            </div>

            {/* Profile Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* 1. Contact & Bio */}
                <div className="space-y-3.5">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 border-b border-gray-50 pb-1.5">📞 Contact Details</h4>
                    <div className="space-y-2 text-xs font-semibold text-zinc-650">
                        <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Email Address</p>
                            <p className="text-zinc-900 mt-0.5 font-bold">{vendor.email}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Mobile Number</p>
                            <p className="text-zinc-900 mt-0.5 font-bold">{vendor.mobile || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Business Description</p>
                            <p className="text-zinc-500 mt-0.5 leading-relaxed font-medium line-clamp-3" title={vendor.businessProfile}>
                                {vendor.businessProfile || 'No description provided.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Registered Address */}
                <div className="space-y-3.5 border-t md:border-t-0 md:border-x border-dashed border-zinc-200 px-0 md:px-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 border-b border-gray-50 pb-1.5">📍 Address details</h4>
                    <div className="space-y-2 text-xs font-semibold text-zinc-650">
                        <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Street Address</p>
                            <p className="text-zinc-900 mt-0.5 font-bold">{vendor.address || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Location Info</p>
                            <p className="text-zinc-900 mt-0.5 font-bold">
                                {vendor.city || '-'}, {vendor.state || '-'} - <span className="font-mono">{vendor.pincode || '-'}</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tax Registration (GST / PAN)</p>
                            <p className="text-zinc-800 mt-0.5 font-bold font-mono">
                                GST: {vendor.gstNumber || 'N/A'} • PAN: {vendor.panNumber || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Settlement Bank details */}
                <div className="space-y-3.5">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 border-b border-gray-50 pb-1.5">🏦 Bank Settlement Account</h4>
                    <div className="space-y-2 text-xs font-semibold text-zinc-650">
                        <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Account Holder Name</p>
                            <p className="text-zinc-900 mt-0.5 font-bold">{vendor.bankDetails?.accountHolderName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Bank Name</p>
                            <p className="text-zinc-900 mt-0.5 font-bold">{vendor.bankDetails?.bankName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Account & IFSC Info</p>
                            <p className="text-zinc-900 mt-0.5 font-bold font-mono">
                                A/C: {vendor.bankDetails?.accountNumber || '-'} • IFSC: {vendor.bankDetails?.ifscCode || '-'}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const VendorDetailWrapper = ({ vendorId }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products');
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    useEffect(() => {
        if (!vendorId || !storeId) return;

        const fetchVendor = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${CATALOG_API_URL}/vendors/${vendorId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-store-id': storeId
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    setVendor(data);
                }
            } catch (err) {
                console.error('Failed to fetch vendor info in wrapper:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVendor();
    }, [vendorId, storeId, token]);

    const tabs = [
        { id: 'products', label: 'Products', icon: '📦' },
        { id: 'orders', label: 'Orders', icon: '🛒' },
        { id: 'coupons', label: 'Coupons', icon: '🏷️' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-950"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 select-none">
            {/* Header top bar with back navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/dashboard/vendors')}
                        className="p-2.5 hover:bg-gray-150 rounded-xl transition-all mr-1 text-gray-500 hover:text-black cursor-pointer bg-white border border-gray-200/80 shadow-xs"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[#202223]">Vendor Details Summary</h1>
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">Comprehensive view of vendor assets, inventory, and settlements</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/dashboard/vendors/edit/${vendorId}`)}
                    className="px-4 py-2 bg-[#1a1c23] hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Details
                </button>
            </div>

            {/* Vendor Profile Card (Always at the top) */}
            {vendor && <VendorProfileCard vendor={vendor} />}

            {/* Horizontal Tabs Below Profile Section */}
            <div className="space-y-4">
                <div className="flex gap-1.5 border-b border-gray-200 pb-px overflow-x-auto">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer -mb-px ${
                                activeTab === t.id 
                                    ? 'border-zinc-950 text-zinc-950 font-black' 
                                    : 'border-transparent text-gray-500 hover:text-zinc-900 hover:border-gray-300'
                            }`}
                        >
                            <span>{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab content renderer */}
                <div className="pt-1 animate-in fade-in-50 duration-150">
                    {activeTab === 'products' && (
                        <SingleVendorProductsTab vendorId={vendorId} />
                    )}
                    {activeTab === 'orders' && (
                        <OrdersTab vendorId={vendorId} />
                    )}
                    {activeTab === 'coupons' && (
                        <CouponsTab vendorId={vendorId} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorDetailWrapper;
