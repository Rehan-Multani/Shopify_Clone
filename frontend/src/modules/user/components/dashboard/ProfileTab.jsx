import React, { useState, useEffect } from 'react';

const ProfileTab = () => {
    const [merchant, setMerchant] = useState(() => {
        const stored = localStorage.getItem('merchantInfo');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing merchantInfo:', e);
            }
        }
        return {
            name: localStorage.getItem('shopStoreName') || 'Merchant Partner',
            email: localStorage.getItem('shopEmail') || 'merchant@storify.com',
            mobile: localStorage.getItem('shopPhone') || '9876543210',
            address: localStorage.getItem('shopAddress') || '123 E-Commerce Way, Suite A',
            planType: localStorage.getItem('adminPanelType') === 'multi' ? 'Multi Vendor' : 'Single Vendor',
            status: 'active',
            gstNumber: ''
        };
    });

    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            // Update local storage items
            localStorage.setItem('merchantInfo', JSON.stringify(merchant));
            localStorage.setItem('shopStoreName', merchant.name);
            localStorage.setItem('shopEmail', merchant.email);
            localStorage.setItem('shopPhone', merchant.mobile);
            localStorage.setItem('shopAddress', merchant.address);
            
            setIsSaving(false);
            setSuccessMsg('Merchant profile updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
            
            // Reload page to reflect store name changes in header/sidebar instantly
            window.location.reload();
        }, 800);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold text-[#202223]">Profile Settings</h1>
                <p className="text-xs text-[#5c5f62] mt-0.5">Manage your merchant account details, contact information, and business configurations.</p>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                    {successMsg}
                </div>
            )}

            <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-[#1a1c23] text-white flex items-center justify-center font-black text-xl uppercase">
                        {merchant.name.slice(0, 2)}
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-[#202223]">{merchant.name}</h2>
                        <div className="flex gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-blue-600 bg-blue-50">
                                {merchant.planType || 'Single Vendor'} Merchant
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${merchant.status === 'active' ? 'text-green-700 bg-green-50' : 'text-yellow-700 bg-yellow-50'}`}>
                                {merchant.status || 'Active'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Merchant Name</label>
                        <input 
                            type="text" 
                            value={merchant.name} 
                            onChange={e => setMerchant({ ...merchant, name: e.target.value })}
                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Email Address</label>
                            <input 
                                type="email" 
                                value={merchant.email} 
                                onChange={e => setMerchant({ ...merchant, email: e.target.value })}
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Mobile Number</label>
                            <input 
                                type="text" 
                                value={merchant.mobile} 
                                onChange={e => setMerchant({ ...merchant, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">GST Number (Optional)</label>
                            <input 
                                type="text" 
                                value={merchant.gstNumber || ''} 
                                onChange={e => setMerchant({ ...merchant, gstNumber: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                                placeholder="22AAAAA0000A1Z5"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Plan Type</label>
                            <input 
                                type="text" 
                                value={merchant.planType || 'Single Vendor'} 
                                disabled
                                className="w-full px-3 py-2 border border-[#e3e3e3] rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Business Address</label>
                        <textarea 
                            value={merchant.address || ''} 
                            onChange={e => setMerchant({ ...merchant, address: e.target.value })} 
                            rows={3}
                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white resize-none" 
                        />
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-[#1a1c23] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving Changes...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
