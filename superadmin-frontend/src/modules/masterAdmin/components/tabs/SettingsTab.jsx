import React, { useState, useEffect } from 'react';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL || 'http://localhost:5004/api';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001/api/auth';

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const Toggle = ({ enabled, onChange }) => (
    <button
        onClick={() => onChange(!enabled)}
        className="relative inline-flex h-5 w-10 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none border-transparent"
        style={{ background: enabled ? '#008060' : '#D1D5DB' }}
    >
        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const SectionHeader = ({ title, desc }) => (
    <div className="px-6 py-4 border-b border-[#e3e3e3]">
        <h2 className="text-sm font-bold text-[#202223]">{title}</h2>
        {desc && <p className="text-xs text-[#9CA3AF] mt-0.5">{desc}</p>}
    </div>
);

const SettingsTab = () => {
    const [activeSection, setActiveSection] = useState('platform');
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    const [platformConfig, setPlatformConfig] = useState({
        platformName: 'Storify',
        supportEmail: 'support@storify.com',
        adminEmail: 'admin@storify.com',
        maxStoresPerMerchant: '10',
        trialDays: '14',
        defaultCurrency: 'INR',
        maintenanceMode: false,
        expectedStoreIP: '76.76.21.21'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwError, setPwError] = useState('');
    const [pwSaving, setPwSaving] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const sections = [
        { id: 'platform', label: 'Platform Config', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
        { id: 'security', label: 'Security', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    ];

    const getAuthHeaders = () => {
        const info = JSON.parse(localStorage.getItem('masterAdminInfo') || '{}');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${info.token || ''}`
        };
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${STORE_API_URL}/stores/admin/settings`, {
                    headers: getAuthHeaders()
                });
                if (res.ok) {
                    const data = await res.json();
                    setPlatformConfig({
                        platformName: data.platformName || 'Storify',
                        supportEmail: data.supportEmail || 'support@storify.com',
                        adminEmail: data.adminEmail || 'admin@storify.com',
                        maxStoresPerMerchant: String(data.maxStoresPerMerchant || 10),
                        trialDays: String(data.trialDays || 14),
                        defaultCurrency: data.defaultCurrency || 'INR',
                        maintenanceMode: data.maintenanceMode || false,
                        expectedStoreIP: data.expectedStoreIP || '76.76.21.21'
                    });
                }
            } catch (err) {
                console.error('Error fetching settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            const res = await fetch(`${STORE_API_URL}/stores/admin/settings`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(platformConfig)
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err) {
            console.error('Error saving settings:', err);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwSuccess('');
        setPwError('');

        if (!passwordData.currentPassword || !passwordData.newPassword) {
            setPwError('Please fill in all fields');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPwError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPwError('New password must be at least 6 characters long');
            return;
        }

        setPwSaving(true);

        try {
            const info = JSON.parse(localStorage.getItem('masterAdminInfo') || '{}');
            const res = await fetch(`${AUTH_API_URL}/admin/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${info.token || ''}`,
                    'x-admin-id': info._id || ''
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                setPwSuccess('Password updated successfully!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPwError(data.message || 'Failed to update password');
            }
        } catch (err) {
            console.error('Password change error:', err);
            setPwError('Failed to change password. Please try again.');
        } finally {
            setPwSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Platform Settings</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Configure platform-wide settings and integrations.</p>
                </div>
                {saved && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Settings saved
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Nav */}
                <div className={`${card} p-3 h-fit`}>
                    <nav className="space-y-0.5">
                        {sections.map(s => (
                            <button key={s.id} onClick={() => setActiveSection(s.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${activeSection === s.id ? 'bg-[#f6f6f7] text-[#202223]' : 'text-[#5c5f62] hover:bg-[#f6f6f7] hover:text-[#202223]'}`}>
                                <svg className={`w-4 h-4 flex-shrink-0 ${activeSection === s.id ? 'text-[#14B8A6]' : 'text-[#9CA3AF]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={s.icon} />
                                </svg>
                                {s.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Platform Config */}
                    {activeSection === 'platform' && (
                        <div className={card}>
                            <SectionHeader title="Platform Configuration" desc="Core platform settings and global defaults" />
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { key: 'platformName', label: 'Platform Name' },
                                        { key: 'supportEmail', label: 'Support Email' },
                                        { key: 'adminEmail', label: 'Admin Email' },
                                        { key: 'expectedStoreIP', label: 'Expected Store A-Record IP' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">{f.label}</label>
                                            <input type="text" value={platformConfig[f.key] || ''}
                                                onChange={e => setPlatformConfig(prev => ({ ...prev, [f.key]: e.target.value }))}
                                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 font-semibold" />
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2">
                                    <button onClick={handleSave} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#1a1c23' }}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security - Password Change only */}
                    {activeSection === 'security' && (
                        <div className={card}>
                            <SectionHeader title="Security Settings" desc="Update your admin password for account security" />
                            <form onSubmit={handlePasswordChange} className="p-6 space-y-4 max-w-md">
                                {pwSuccess && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
                                        {pwSuccess}
                                    </div>
                                )}
                                {pwError && (
                                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl">
                                        {pwError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Current Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showCurrent ? "text" : "password"} 
                                            required
                                            value={passwordData.currentPassword}
                                            onChange={e => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            placeholder="••••••••"
                                            className="w-full pl-3 pr-10 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 font-mono" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showCurrent ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showNew ? "text" : "password"} 
                                            required
                                            value={passwordData.newPassword}
                                            onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            placeholder="••••••••"
                                            className="w-full pl-3 pr-10 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 font-mono" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showNew ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Confirm New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showConfirm ? "text" : "password"} 
                                            required
                                            value={passwordData.confirmPassword}
                                            onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            placeholder="••••••••"
                                            className="w-full pl-3 pr-10 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 font-mono" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showConfirm ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={pwSaving}
                                        className="px-6 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all bg-[#1a1c23] disabled:opacity-50"
                                    >
                                        {pwSaving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
