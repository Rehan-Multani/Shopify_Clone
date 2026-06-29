import React, { useState, useEffect } from 'react';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;

const VendorSettingsTab = ({ vendorId }) => {
    const token = localStorage.getItem('vendorToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    
    const [settings, setSettings] = useState({
        gstPercentage: 0,
        gstNumber: '',
        panNumber: '',
        paymentSettings: {
            razorpay: { enabled: false, keyId: '', keySecret: '' },
            cashfree: { enabled: false, appId: '', secretKey: '' },
            phonepe: { enabled: false, merchantId: '', saltKey: '', saltIndex: '1' },
            payu: { enabled: false, merchantKey: '', merchantSalt: '' },
            stripe: { enabled: false, publishableKey: '', secretKey: '' },
            cod: { enabled: false }
        }
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (!vendorId || !storeId || !token) return;

        const fetchVendorSettings = async () => {
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
                    setSettings({
                        gstPercentage: data.gstPercentage || 0,
                        gstNumber: data.gstNumber || '',
                        panNumber: data.panNumber || '',
                        paymentSettings: {
                            razorpay: {
                                enabled: data.paymentSettings?.razorpay?.enabled || false,
                                keyId: data.paymentSettings?.razorpay?.keyId || '',
                                keySecret: data.paymentSettings?.razorpay?.keySecret || ''
                            },
                            cashfree: {
                                enabled: data.paymentSettings?.cashfree?.enabled || false,
                                appId: data.paymentSettings?.cashfree?.appId || '',
                                secretKey: data.paymentSettings?.cashfree?.secretKey || ''
                            },
                            phonepe: {
                                enabled: data.paymentSettings?.phonepe?.enabled || false,
                                merchantId: data.paymentSettings?.phonepe?.merchantId || '',
                                saltKey: data.paymentSettings?.phonepe?.saltKey || '',
                                saltIndex: data.paymentSettings?.phonepe?.saltIndex || '1'
                            },
                            payu: {
                                enabled: data.paymentSettings?.payu?.enabled || false,
                                merchantKey: data.paymentSettings?.payu?.merchantKey || '',
                                merchantSalt: data.paymentSettings?.payu?.merchantSalt || ''
                            },
                            stripe: {
                                enabled: data.paymentSettings?.stripe?.enabled || false,
                                publishableKey: data.paymentSettings?.stripe?.publishableKey || '',
                                secretKey: data.paymentSettings?.stripe?.secretKey || ''
                            },
                            cod: {
                                enabled: data.paymentSettings?.cod?.enabled || false
                            }
                        }
                    });
                } else {
                    showToast(data.message || 'Failed to fetch vendor settings', 'error');
                }
            } catch (err) {
                showToast('Failed to connect to server', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchVendorSettings();
    }, [vendorId, storeId, token]);

    const handleToggleGateway = (gateway) => {
        setSettings(prev => ({
            ...prev,
            paymentSettings: {
                ...prev.paymentSettings,
                [gateway]: {
                    ...prev.paymentSettings[gateway],
                    enabled: !prev.paymentSettings[gateway].enabled
                }
            }
        }));
    };

    const handleFieldChange = (gateway, field, value) => {
        setSettings(prev => ({
            ...prev,
            paymentSettings: {
                ...prev.paymentSettings,
                [gateway]: {
                    ...prev.paymentSettings[gateway],
                    [field]: value
                }
            }
        }));
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${CATALOG_API_URL}/vendors/${vendorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify({
                    gstPercentage: Number(settings.gstPercentage),
                    gstNumber: settings.gstNumber,
                    panNumber: settings.panNumber,
                    paymentSettings: settings.paymentSettings
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Settings saved successfully!', 'success');
            } else {
                showToast(data.message || 'Failed to save settings', 'error');
            }
        } catch (err) {
            showToast('Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12 select-none">
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#1a1c23]'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Configuration Settings</h1>
                    <p className="text-xs text-zinc-500 font-semibold mt-1">Configure payment gateways, tax percentages, and store credentials</p>
                </div>
                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className={`px-5 py-2.5 bg-[#008060] hover:bg-[#006e52] disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow transition-all flex items-center gap-2 cursor-pointer`}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* GST & Tax Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-[#202223] border-b border-gray-100 pb-3 flex items-center gap-2">
                        <span>📋</span> GST & Taxes Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#202223] mb-1.5">GST Rate (%)</label>
                            <input 
                                type="number" 
                                value={settings.gstPercentage}
                                min="0"
                                max="100"
                                onChange={e => setSettings(prev => ({ ...prev, gstPercentage: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-semibold"
                                placeholder="e.g. 18" 
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Gateways Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
                    <h3 className="text-base font-bold text-[#202223] border-b border-gray-100 pb-3 flex items-center gap-2">
                        <span>💳</span> Payment Gateways Credentials
                    </h3>
                    
                    <div className="space-y-4">
                        
                        {/* 1. Razorpay */}
                        <div className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl space-y-4 transition-all">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">💳</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-800">Razorpay</h4>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Accept UPI, Netbanking, Credit Cards (India)</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleGateway('razorpay')}
                                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.paymentSettings.razorpay.enabled ? 'bg-emerald-600' : 'bg-zinc-200'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.paymentSettings.razorpay.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            
                            {settings.paymentSettings.razorpay.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dashed border-zinc-200">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Key ID</label>
                                        <input 
                                            type="text"
                                            value={settings.paymentSettings.razorpay.keyId}
                                            onChange={e => handleFieldChange('razorpay', 'keyId', e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none bg-white"
                                            placeholder="rzp_live_..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Key Secret</label>
                                        <input 
                                            type="password"
                                            value={settings.paymentSettings.razorpay.keySecret}
                                            onChange={e => handleFieldChange('razorpay', 'keySecret', e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none bg-white"
                                            placeholder="••••••••••••••••"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Cashfree */}
                        <div className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl space-y-4 transition-all">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">⚡</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-800">Cashfree Payments</h4>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Fast UPI & Cards Settlement Gateway</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleGateway('cashfree')}
                                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.paymentSettings.cashfree.enabled ? 'bg-emerald-600' : 'bg-zinc-200'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.paymentSettings.cashfree.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            
                            {settings.paymentSettings.cashfree.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dashed border-zinc-200">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">App ID</label>
                                        <input 
                                            type="text"
                                            value={settings.paymentSettings.cashfree.appId}
                                            onChange={e => handleFieldChange('cashfree', 'appId', e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none bg-white"
                                            placeholder="cf_app_..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Secret Key</label>
                                        <input 
                                            type="password"
                                            value={settings.paymentSettings.cashfree.secretKey}
                                            onChange={e => handleFieldChange('cashfree', 'secretKey', e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none bg-white"
                                            placeholder="••••••••••••••••"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Phonepe */}
                        <div className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl space-y-4 transition-all">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">🟣</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-800">PhonePe Gateway</h4>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Fastest Direct UPI payment experience</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleGateway('phonepe')}
                                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.paymentSettings.phonepe.enabled ? 'bg-emerald-600' : 'bg-zinc-200'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.paymentSettings.phonepe.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            
                            {settings.paymentSettings.phonepe.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-dashed border-zinc-200">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Merchant ID</label>
                                        <input 
                                            type="text"
                                            value={settings.paymentSettings.phonepe.merchantId}
                                            onChange={e => handleFieldChange('phonepe', 'merchantId', e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none bg-white"
                                            placeholder="MID..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Salt Key</label>
                                        <input 
                                            type="password"
                                            value={settings.paymentSettings.phonepe.saltKey}
                                            onChange={e => handleFieldChange('phonepe', 'saltKey', e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none bg-white"
                                            placeholder="••••••••••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Salt Index</label>
                                        <input 
                                            type="text"
                                            value={settings.paymentSettings.phonepe.saltIndex}
                                            onChange={e => handleFieldChange('phonepe', 'saltIndex', e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none bg-white"
                                            placeholder="1"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. PayU */}
                        <div className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl space-y-4 transition-all">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">🟢</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-800">PayU India</h4>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Secure enterprise billing & gateway</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleGateway('payu')}
                                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.paymentSettings.payu.enabled ? 'bg-emerald-600' : 'bg-zinc-200'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.paymentSettings.payu.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            
                            {settings.paymentSettings.payu.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dashed border-zinc-200">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Merchant Key</label>
                                        <input 
                                            type="text"
                                            value={settings.paymentSettings.payu.merchantKey}
                                            onChange={e => handleFieldChange('payu', 'merchantKey', e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none bg-white"
                                            placeholder="Merchant Key..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Merchant Salt</label>
                                        <input 
                                            type="password"
                                            value={settings.paymentSettings.payu.merchantSalt}
                                            onChange={e => handleFieldChange('payu', 'merchantSalt', e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none bg-white"
                                            placeholder="••••••••••••••••"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 5. Stripe */}
                        <div className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl space-y-4 transition-all">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">🌍</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-800">Stripe</h4>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Accept cards globally (International Payments)</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleGateway('stripe')}
                                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.paymentSettings.stripe.enabled ? 'bg-emerald-600' : 'bg-zinc-200'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.paymentSettings.stripe.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            
                            {settings.paymentSettings.stripe.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dashed border-zinc-200">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Publishable Key</label>
                                        <input 
                                            type="text"
                                            value={settings.paymentSettings.stripe.publishableKey}
                                            onChange={e => handleFieldChange('stripe', 'publishableKey', e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none bg-white"
                                            placeholder="pk_live_..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Secret Key</label>
                                        <input 
                                            type="password"
                                            value={settings.paymentSettings.stripe.secretKey}
                                            onChange={e => handleFieldChange('stripe', 'secretKey', e.target.value)}
                                            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold focus:outline-none bg-white"
                                            placeholder="sk_live_..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 6. Cash On Delivery */}
                        <div className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl space-y-4 transition-all">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xl">📦</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-zinc-800">Cash On Delivery (COD)</h4>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Pay with cash upon package delivery</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleToggleGateway('cod')}
                                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.paymentSettings.cod.enabled ? 'bg-emerald-600' : 'bg-zinc-200'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.paymentSettings.cod.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </form>
        </div>
    );
};

export default VendorSettingsTab;
