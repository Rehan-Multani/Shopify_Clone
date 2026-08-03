import React, { useState, useEffect, useCallback } from 'react';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const FIELD_DEFS = {
    razorpay: [
        { key: 'keyId', label: 'Key ID', type: 'text' },
        { key: 'keySecret', label: 'Key Secret', type: 'password' },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' }
    ],
    stripe: [
        { key: 'publishableKey', label: 'Publishable Key', type: 'text' },
        { key: 'secretKey', label: 'Secret Key', type: 'password' },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' }
    ],
    payu: [
        { key: 'merchantKey', label: 'Merchant Key', type: 'text' },
        { key: 'merchantSalt', label: 'Merchant Salt', type: 'password' }
    ],
    cashfree: [
        { key: 'appId', label: 'App ID', type: 'text' },
        { key: 'secretKey', label: 'Secret Key', type: 'password' },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' }
    ]
};

const VendorSettingsTab = ({ vendorId }) => {
    const token = localStorage.getItem('vendorToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    const [loading, setLoading] = useState(true);
    const [savingTax, setSavingTax] = useState(false);
    const [savingGw, setSavingGw] = useState(null);
    const [testing, setTesting] = useState(null);
    const [toast, setToast] = useState(null);

    const [taxSettings, setTaxSettings] = useState({
        gstPercentage: 0,
        gstNumber: '',
        panNumber: ''
    });

    const [gateways, setGateways] = useState([]);
    const [forms, setForms] = useState({});

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const vendorHeaders = useCallback(() => ({
        Authorization: `Bearer ${token}`,
        'x-store-id': storeId,
        'Content-Type': 'application/json'
    }), [token, storeId]);

    const loadAll = useCallback(async () => {
        if (!vendorId || !storeId || !token) return;
        try {
            setLoading(true);
            const [vendorRes, gwRes] = await Promise.all([
                fetch(`${CATALOG_API_URL}/vendors/${vendorId}`, {
                    headers: { Authorization: `Bearer ${token}`, 'x-store-id': storeId }
                }),
                fetch(`${API_BASE}/vendor/payment-gateways`, {
                    headers: vendorHeaders(),
                    credentials: 'include'
                })
            ]);

            const vendorData = await vendorRes.json();
            if (vendorRes.ok) {
                setTaxSettings({
                    gstPercentage: vendorData.gstPercentage || 0,
                    gstNumber: vendorData.gstNumber || '',
                    panNumber: vendorData.panNumber || ''
                });
            }

            const gwData = await gwRes.json();
            if (gwRes.ok) {
                const permitted = (gwData.gateways || []).filter((g) => g.permitted !== false);
                setGateways(permitted);

                const nextForms = {};
                permitted.forEach((g) => {
                    nextForms[g.gateway] = {
                        environment: g.environment || 'sandbox',
                        currency: 'INR',
                        enabled: !!g.enabled,
                        credentials: { ...(g.credentials || {}) },
                        webhookSecret: g.credentials?.webhookSecret || ''
                    };
                });
                setForms(nextForms);
            } else {
                setGateways([]);
            }
        } catch (err) {
            showToast('Failed to connect to server', 'error');
        } finally {
            setLoading(false);
        }
    }, [vendorId, storeId, token, vendorHeaders]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleSaveTax = async (e) => {
        e.preventDefault();
        setSavingTax(true);
        try {
            const res = await fetch(`${CATALOG_API_URL}/vendors/${vendorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify({
                    gstPercentage: Number(taxSettings.gstPercentage),
                    gstNumber: taxSettings.gstNumber,
                    panNumber: taxSettings.panNumber
                })
            });
            const data = await res.json();
            if (res.ok) showToast('Tax settings saved', 'success');
            else showToast(data.message || 'Failed to save settings', 'error');
        } catch {
            showToast('Failed to save settings', 'error');
        } finally {
            setSavingTax(false);
        }
    };

    const updateForm = (gateway, patch) => {
        setForms((prev) => ({
            ...prev,
            [gateway]: { ...prev[gateway], ...patch }
        }));
    };

    const updateCredential = (gateway, key, value) => {
        setForms((prev) => ({
            ...prev,
            [gateway]: {
                ...prev[gateway],
                credentials: { ...prev[gateway]?.credentials, [key]: value },
                ...(key === 'webhookSecret' ? { webhookSecret: value } : {})
            }
        }));
    };

    const handleSaveGateway = async (gateway) => {
        setSavingGw(gateway);
        try {
            const form = forms[gateway] || {};
            const res = await fetch(`${API_BASE}/vendor/payment-gateways/${gateway}`, {
                method: 'PUT',
                headers: vendorHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    environment: form.environment,
                    currency: 'INR',
                    enabled: form.enabled,
                    credentials: form.credentials || {},
                    webhookSecret: form.webhookSecret
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save gateway');
            showToast(`${gateway} saved successfully`);
            await loadAll();
        } catch (err) {
            showToast(err.message || 'Failed to save gateway', 'error');
        } finally {
            setSavingGw(null);
        }
    };

    const handleTestGateway = async (gateway) => {
        setTesting(gateway);
        try {
            const res = await fetch(`${API_BASE}/vendor/payment-gateways/${gateway}/test`, {
                method: 'POST',
                headers: vendorHeaders(),
                credentials: 'include',
                body: JSON.stringify({})
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Test connection failure');
            showToast(data.message || 'Connection verified');
            await loadAll();
        } catch (err) {
            showToast(err.message || 'Test connection failure', 'error');
        } finally {
            setTesting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
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
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Payment Settings</h1>
                    <p className="text-xs text-zinc-500 font-semibold mt-1">Configure payment gateways and tax credentials</p>
                </div>
            </div>

            {/* GST */}
            <form onSubmit={handleSaveTax} className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-base font-bold text-[#202223]">GST & Taxes</h3>
                    <button
                        type="submit"
                        disabled={savingTax}
                        className="px-4 py-2 bg-[#008060] hover:bg-[#006e52] disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-wider"
                    >
                        {savingTax ? 'Saving…' : 'Save Tax'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#202223] mb-1.5">GST Rate (%)</label>
                        <input
                            type="number"
                            value={taxSettings.gstPercentage}
                            min="0"
                            max="100"
                            onChange={(e) => setTaxSettings((p) => ({ ...p, gstPercentage: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#202223] mb-1.5">GST Number</label>
                        <input
                            type="text"
                            value={taxSettings.gstNumber}
                            onChange={(e) => setTaxSettings((p) => ({ ...p, gstNumber: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#202223] mb-1.5">PAN Number</label>
                        <input
                            type="text"
                            value={taxSettings.panNumber}
                            onChange={(e) => setTaxSettings((p) => ({ ...p, panNumber: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold"
                        />
                    </div>
                </div>
            </form>

            {/* Payment Gateways */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-bold text-[#202223]">Payment Gateways</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                        Only gateways enabled by the merchant are shown. Secrets are encrypted and masked.
                    </p>
                </div>

                {!gateways.length ? (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600 font-semibold">
                        No payment gateways are available on the platform yet. Ask Super Admin to enable gateways.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {gateways.map((gw) => {
                            const form = forms[gw.gateway] || { credentials: {}, enabled: false, environment: 'sandbox', currency: 'INR' };
                            return (
                                <div key={gw.gateway} className="p-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl space-y-4">
                                    <div className="flex justify-between items-center gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-800">{gw.name}</h4>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                                {gw.status?.replace('_', ' ')} · {gw.environment}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => updateForm(gw.gateway, { enabled: !form.enabled })}
                                            className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.enabled ? 'bg-emerald-600' : 'bg-zinc-200'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${form.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Environment</label>
                                            <select
                                                value={form.environment}
                                                onChange={(e) => updateForm(gw.gateway, { environment: e.target.value })}
                                                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold bg-white"
                                            >
                                                <option value="sandbox">Sandbox</option>
                                                <option value="production">Production</option>
                                            </select>
                                            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Currency is fixed to INR</p>
                                        </div>
                                        {(FIELD_DEFS[gw.gateway] || []).map((field) => (
                                            <div key={field.key} className={field.key.includes('webhook') ? 'md:col-span-2' : ''}>
                                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{field.label}</label>
                                                <input
                                                    type={field.type}
                                                    value={
                                                        field.key === 'webhookSecret'
                                                            ? (form.webhookSecret || form.credentials?.webhookSecret || '')
                                                            : (form.credentials?.[field.key] || '')
                                                    }
                                                    onChange={(e) => updateCredential(gw.gateway, field.key, e.target.value)}
                                                    className="w-full border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold bg-white"
                                                    placeholder={field.type === 'password' ? '••••••••' : ''}
                                                    autoComplete="off"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <button
                                            type="button"
                                            disabled={savingGw === gw.gateway}
                                            onClick={() => handleSaveGateway(gw.gateway)}
                                            className="px-4 py-2 bg-[#008060] hover:bg-[#006e52] disabled:opacity-50 text-white rounded-lg text-[11px] font-black uppercase tracking-wider"
                                        >
                                            {savingGw === gw.gateway ? 'Saving…' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={gw.status === 'not_configured' || testing === gw.gateway}
                                            onClick={() => handleTestGateway(gw.gateway)}
                                            className="px-4 py-2 bg-white border border-zinc-200 hover:border-zinc-400 disabled:opacity-40 text-zinc-700 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                                        >
                                            {testing === gw.gateway ? 'Testing…' : 'Test Connection'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorSettingsTab;
