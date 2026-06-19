import React, { useState, useEffect } from 'react';

const ProfileTab = () => {
    const [storeName, setStoreName] = useState(localStorage.getItem('shopStoreName') || 'My Store');
    const [email, setEmail] = useState(localStorage.getItem('shopEmail') || 'merchant@storify.com');
    const [phone, setPhone] = useState(localStorage.getItem('shopPhone') || '9876543210');
    const [address, setAddress] = useState(localStorage.getItem('shopAddress') || '123 E-Commerce Way, Suite A');
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            localStorage.setItem('shopStoreName', storeName);
            localStorage.setItem('shopEmail', email);
            localStorage.setItem('shopPhone', phone);
            localStorage.setItem('shopAddress', address);
            setIsSaving(false);
            setSuccessMsg('Store profile updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        }, 800);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold text-[#202223]">Profile Settings</h1>
                <p className="text-xs text-[#5c5f62] mt-0.5">Manage your store details, contact information, and preferences.</p>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                    {successMsg}
                </div>
            )}

            <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-[#1a1c23] text-white flex items-center justify-center font-black text-xl uppercase">
                        {storeName.slice(0, 2)}
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-[#202223]">{storeName}</h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-blue-600 bg-blue-50">Single Vendor Merchant</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Store Name</label>
                        <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Contact Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Phone Number</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Store Address</label>
                        <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white resize-none" />
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                    <button onClick={handleSave} disabled={isSaving}
                        className="px-6 py-2.5 bg-[#1a1c23] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-50">
                        {isSaving ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
