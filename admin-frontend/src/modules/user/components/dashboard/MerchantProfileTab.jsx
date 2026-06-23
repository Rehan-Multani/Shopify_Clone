import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001/api/auth';

const MerchantProfileTab = () => {
    const token = localStorage.getItem('merchantToken');
    const storedInfo = JSON.parse(localStorage.getItem('merchantInfo') || '{}');
    const merchantId = storedInfo._id;

    const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' or 'security'

    const [merchant, setMerchant] = useState({
        name: storedInfo.name || '',
        email: storedInfo.email || '',
        mobile: storedInfo.mobile || '',
        address: storedInfo.address || '',
        planType: storedInfo.planType || 'Single Vendor',
        gstNumber: storedInfo.gstNumber || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    // Password visibility states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
    const [profileErrorMsg, setProfileErrorMsg] = useState('');
    const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
    const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

    const handleSaveProfile = async () => {
        setProfileErrorMsg('');
        setProfileSuccessMsg('');

        if (!merchant.name || !merchant.email || !merchant.mobile) {
            setProfileErrorMsg('Name, Email, and Mobile are required.');
            return;
        }

        setIsSavingProfile(true);

        try {
            const res = await fetch(`${API_BASE_URL}/merchants/${merchantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: merchant.name,
                    email: merchant.email,
                    mobile: merchant.mobile,
                    address: merchant.address,
                    gstNumber: merchant.gstNumber
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update merchant profile');
            }

            localStorage.setItem('merchantInfo', JSON.stringify(data));
            setProfileSuccessMsg('Merchant profile updated successfully!');
        } catch (err) {
            setProfileErrorMsg(err.message || 'Failed to save settings.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordErrorMsg('');
        setPasswordSuccessMsg('');

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
            setPasswordErrorMsg('All password fields are required.');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setPasswordErrorMsg('New passwords do not match.');
            return;
        }

        setIsSavingPassword(true);

        try {
            const res = await fetch(`${AUTH_API_URL}/merchant/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update password');
            }

            setPasswordSuccessMsg('Password updated successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
        } catch (err) {
            setPasswordErrorMsg(err.message || 'Failed to update password.');
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold text-[#202223]">Merchant Profile Settings</h1>
                <p className="text-xs text-[#5c5f62] mt-0.5">Manage your merchant account configurations, personal identity, and security credentials.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Left Side Sub-Tabs */}
                <div className="w-full md:w-64 flex md:flex-col gap-2 flex-shrink-0">
                    <button
                        onClick={() => setActiveSubTab('profile')}
                        className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all w-full text-left ${
                            activeSubTab === 'profile'
                                ? 'bg-[#1a1c23] text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveSubTab('security')}
                        className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all w-full text-left ${
                            activeSubTab === 'security'
                                ? 'bg-[#1a1c23] text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Security
                    </button>
                </div>

                {/* Right Side Content Area */}
                <div className="flex-grow w-full">
                    {activeSubTab === 'profile' && (
                        <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-6 space-y-5">
                            <h3 className="text-sm font-bold text-[#202223] pb-3 border-b border-gray-100">Personal Information</h3>

                            {profileSuccessMsg && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                                    {profileSuccessMsg}
                                </div>
                            )}

                            {profileErrorMsg && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold">
                                    {profileErrorMsg}
                                </div>
                            )}

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
                                            value={merchant.gstNumber} 
                                            onChange={e => setMerchant({ ...merchant, gstNumber: e.target.value.toUpperCase() })}
                                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                                            placeholder="22AAAAA0000A1Z5"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Plan Type</label>
                                        <input 
                                            type="text" 
                                            value={merchant.planType} 
                                            disabled
                                            className="w-full px-3 py-2 border border-[#e3e3e3] rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Address</label>
                                    <textarea 
                                        value={merchant.address} 
                                        onChange={e => setMerchant({ ...merchant, address: e.target.value })} 
                                        rows={3}
                                        className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white resize-none" 
                                    />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex justify-end">
                                <button 
                                    onClick={handleSaveProfile} 
                                    disabled={isSavingProfile}
                                    className="px-6 py-2.5 bg-[#1a1c23] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSavingProfile ? 'Saving Profile...' : 'Save Profile'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'security' && (
                        <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-6 space-y-5">
                            <h3 className="text-sm font-bold text-[#202223] pb-3 border-b border-gray-100">Security & Password</h3>

                            {passwordSuccessMsg && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                                    {passwordSuccessMsg}
                                </div>
                            )}

                            {passwordErrorMsg && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold">
                                    {passwordErrorMsg}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Current Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showCurrentPassword ? "text" : "password"} 
                                            value={passwordData.currentPassword} 
                                            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full px-3 py-2 pr-10 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showCurrentPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showNewPassword ? "text" : "password"} 
                                            value={passwordData.newPassword} 
                                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-3 py-2 pr-10 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showNewPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Confirm New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showConfirmNewPassword ? "text" : "password"} 
                                            value={passwordData.confirmNewPassword} 
                                            onChange={e => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                                            className="w-full px-3 py-2 pr-10 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showConfirmNewPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex justify-end">
                                <button 
                                    onClick={handleChangePassword} 
                                    disabled={isSavingPassword}
                                    className="px-6 py-2.5 bg-[#1a1c23] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSavingPassword ? 'Updating Password...' : 'Change Password'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MerchantProfileTab;
