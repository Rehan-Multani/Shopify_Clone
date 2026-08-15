import React, { useState, useEffect, useCallback } from 'react';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const GATEWAY_LOGOS = {
    razorpay: { bg: 'bg-[#072654]', label: 'rzp', color: 'text-white' },
    stripe: { bg: 'bg-[#635BFF]', label: 'stripe', color: 'text-white' },
    payu: { bg: 'bg-[#00ADEF]', label: 'PayU', color: 'text-white' },
    cashfree: { bg: 'bg-[#FF7A45]', label: 'CF', color: 'text-white' }
};

const FIELD_DEFS = {
    razorpay: [
        { key: 'keyId', label: 'Key ID', type: 'text', placeholder: 'rzp_live_...' },
        { key: 'keySecret', label: 'Key Secret', type: 'password', placeholder: '••••••••', secret: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'From Razorpay → Webhooks', secret: true },
    ],
    stripe: [
        { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...' },
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: '••••••••', secret: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...', secret: true },
    ],
    payu: [
        { key: 'merchantKey', label: 'Merchant Key', type: 'text', placeholder: 'Merchant Key' },
        { key: 'merchantSalt', label: 'Merchant Salt', type: 'password', placeholder: '••••••••', secret: true }
    ],
    cashfree: [
        { key: 'appId', label: 'App ID', type: 'text', placeholder: 'App ID' },
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: '••••••••', secret: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'Optional webhook secret', secret: true },
    ]
};

const STATUS_STYLES = {
    not_configured: 'bg-zinc-100 text-zinc-600',
    configured: 'bg-amber-50 text-amber-700',
    verified: 'bg-emerald-50 text-emerald-700',
    error: 'bg-red-50 text-red-700'
};

const isMaskedValue = (value) =>
    typeof value === 'string' && (value.includes('•') || /^\*+$/.test(value.trim()));

const VendorSettingsTab = ({ vendorId }) => {
    const token = localStorage.getItem('vendorToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    const [loading, setLoading] = useState(true);
    const [savingTax, setSavingTax] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(null);
    const [toast, setToast] = useState(null);

    const [taxSettings, setTaxSettings] = useState({
        gstPercentage: 0,
        gstNumber: '',
        panNumber: ''
    });

    const [gateways, setGateways] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
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
                setGateways((gwData.gateways || []).filter((g) => g.permitted !== false));
            } else {
                setGateways([]);
            }
        } catch {
            showToast('Failed to connect to server', 'error');
        } finally {
            setLoading(false);
        }
    }, [vendorId, storeId, token, vendorHeaders]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const openConfigure = (gw) => {
        const fields = FIELD_DEFS[gw.gateway] || [];
        const credentials = {};
        const configured = {};
        for (const field of fields) {
            const raw = gw.credentials?.[field.key] || '';
            if (field.key === 'webhookSecret') {
                configured[field.key] = !!gw.webhookSecretConfigured;
                credentials[field.key] = '';
                continue;
            }
            if (field.secret) {
                configured[field.key] = !!(
                    gw.credentials?.[`${field.key}Configured`]
                    || (raw && isMaskedValue(raw))
                );
                credentials[field.key] = '';
            } else {
                credentials[field.key] = isMaskedValue(raw) ? '' : raw;
            }
        }
        setEditing(gw.gateway);
        setForm({
            enabled: !!gw.enabled,
            credentials,
            configured,
        });
    };

    const closeConfigure = () => {
        setEditing(null);
        setForm({});
    };

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
            if (res.ok) showToast('Tax settings saved');
            else showToast(data.message || 'Failed to save settings', 'error');
        } catch {
            showToast('Failed to save settings', 'error');
        } finally {
            setSavingTax(false);
        }
    };

    const handleSaveGateway = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const credentials = {};
            for (const [key, value] of Object.entries(form.credentials || {})) {
                const str = String(value || '').trim();
                if (!str || isMaskedValue(str)) continue;
                credentials[key] = str;
            }
            const res = await fetch(`${API_BASE}/vendor/payment-gateways/${editing}`, {
                method: 'PUT',
                headers: vendorHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    environment: 'production',
                    currency: 'INR',
                    credentials,
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save gateway');
            showToast(data.message || 'Gateway saved. Use Test & activate next.');
            closeConfigure();
            await loadAll();
        } catch (err) {
            showToast(err.message || 'Failed to save gateway', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleEnable = async (gw, enabled) => {
        try {
            if (enabled) {
                if (gw.status !== 'verified') {
                    showToast('Use Test & activate after saving credentials', 'error');
                    return;
                }
                const res = await fetch(`${API_BASE}/vendor/payment-gateways/${gw.gateway}`, {
                    method: 'PUT',
                    headers: vendorHeaders(),
                    credentials: 'include',
                    body: JSON.stringify({
                        environment: 'production',
                        currency: 'INR',
                        enabled: true,
                        credentials: {},
                    })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to update');
                showToast(`${gw.name} enabled`);
            } else {
                const res = await fetch(`${API_BASE}/vendor/payment-gateways/${gw.gateway}/disable`, {
                    method: 'POST',
                    headers: vendorHeaders(),
                    credentials: 'include',
                    body: JSON.stringify({})
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to disable');
                showToast(data.message || `${gw.name} disabled`);
            }
            await loadAll();
        } catch (err) {
            showToast(err.message, 'error');
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
            showToast(data.message || 'Gateway verified and activated');
            await loadAll();
        } catch (err) {
            showToast(err.message || 'Test connection failure', 'error');
            await loadAll();
        } finally {
            setTesting(null);
        }
    };

    const editingGw = gateways.find((g) => g.gateway === editing);
    const fieldClass =
        'w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500';
    const labelClass = 'block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-16">
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#1a1c23]'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="border-b border-zinc-200 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Settings</p>
                <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Payment Gateways</h1>
                <p className="text-xs text-zinc-500 mt-1">
                    Save credentials, then Test &amp; activate. Only your verified gateway is used for your products — merchant keys are never used as fallback. Otherwise buyers pay with COD.
                </p>
            </div>

            {/* Gateway cards — same layout as merchant */}
            {!gateways.length ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-xs text-zinc-600 font-semibold">
                    No payment gateways are available yet. Ask Super Admin / merchant to enable gateways on the platform.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gateways.map((gw) => {
                        const logo = GATEWAY_LOGOS[gw.gateway] || { bg: 'bg-zinc-800', label: gw.gateway, color: 'text-white' };
                        return (
                            <div key={gw.gateway} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl ${logo.bg} ${logo.color} flex items-center justify-center text-xs font-black tracking-tight`}>
                                            {logo.label}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[#202223]">{gw.name}</h3>
                                            <p className="text-[10px] text-zinc-400 font-medium mt-0.5 line-clamp-2">
                                                {gw.description || 'Payment gateway'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleEnable(gw, !gw.enabled)}
                                        className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${gw.enabled ? 'bg-emerald-600' : 'bg-zinc-200'}`}
                                        aria-label={`Toggle ${gw.name}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${gw.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${STATUS_STYLES[gw.status] || STATUS_STYLES.not_configured}`}>
                                        {String(gw.status || 'not_configured').replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-50 text-violet-700">
                                        Production · INR
                                    </span>
                                    {gw.updatedAt && (
                                        <span className="text-[10px] text-zinc-400 ml-auto">
                                            Updated {new Date(gw.updatedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 mt-auto pt-1">
                                    <button
                                        type="button"
                                        onClick={() => openConfigure(gw)}
                                        className="px-3.5 py-2 bg-[#1a1c23] hover:bg-black text-white rounded-lg text-[11px] font-bold uppercase tracking-wider transition"
                                    >
                                        Configure
                                    </button>
                                    <button
                                        type="button"
                                        disabled={gw.status === 'not_configured' || testing === gw.gateway}
                                        onClick={() => handleTestGateway(gw.gateway)}
                                        className="px-3.5 py-2 bg-white border border-zinc-200 hover:border-zinc-400 disabled:opacity-40 text-zinc-700 rounded-lg text-[11px] font-bold uppercase tracking-wider transition"
                                    >
                                        {testing === gw.gateway ? 'Testing…' : 'Test & activate'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* GST — same settings card language */}
            <form onSubmit={handleSaveTax} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-5 border-b border-zinc-100">
                    <h3 className="text-sm font-bold text-[#202223]">GST & Taxes</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Used on invoices and vendor payouts</p>
                </div>
                <div className="px-5 sm:px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>GST rate (%)</label>
                        <input
                            type="number"
                            value={taxSettings.gstPercentage}
                            min="0"
                            max="100"
                            onChange={(e) => setTaxSettings((p) => ({ ...p, gstPercentage: e.target.value }))}
                            className={fieldClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>GST number</label>
                        <input
                            type="text"
                            value={taxSettings.gstNumber}
                            onChange={(e) => setTaxSettings((p) => ({ ...p, gstNumber: e.target.value }))}
                            className={fieldClass}
                            placeholder="22AAAAA0000A1Z5"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>PAN number</label>
                        <input
                            type="text"
                            value={taxSettings.panNumber}
                            onChange={(e) => setTaxSettings((p) => ({ ...p, panNumber: e.target.value }))}
                            className={fieldClass}
                            placeholder="ABCDE1234F"
                        />
                    </div>
                </div>
                <div className="flex justify-end px-5 sm:px-6 py-4 border-t border-zinc-100 bg-zinc-50">
                    <button
                        type="submit"
                        disabled={savingTax}
                        className="px-5 py-2.5 bg-[#008060] hover:bg-[#006e52] disabled:opacity-50 text-white rounded-lg text-[11px] font-black uppercase tracking-wider"
                    >
                        {savingTax ? 'Saving…' : 'Save tax'}
                    </button>
                </div>
            </form>

            {/* Configure modal — same as merchant */}
            {editing && editingGw && (
                <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px]" onClick={closeConfigure}>
                    <div
                        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-[#202223]">Configure {editingGw.name}</h3>
                                <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                                    Production · INR · Credentials encrypted at rest
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeConfigure}
                                className="w-8 h-8 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center text-lg leading-none"
                                aria-label="Close"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-[11px] font-bold uppercase tracking-wide">
                                    Production
                                </span>
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-600 text-[11px] font-bold uppercase tracking-wide">
                                    INR
                                </span>
                            </div>

                            {(FIELD_DEFS[editing] || []).map((field) => {
                                const value = form.credentials?.[field.key] || '';
                                const alreadySaved = !!form.configured?.[field.key];
                                const placeholder = alreadySaved && field.secret
                                    ? 'Leave blank to keep existing'
                                    : (field.placeholder || '');

                                return (
                                    <div key={field.key}>
                                        <label className={labelClass}>{field.label}</label>
                                        <input
                                            type={field.type === 'password' ? 'password' : 'text'}
                                            value={value}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setForm((f) => ({
                                                    ...f,
                                                    credentials: { ...f.credentials, [field.key]: val }
                                                }));
                                            }}
                                            className={fieldClass}
                                            placeholder={placeholder}
                                            autoComplete="new-password"
                                            spellCheck={false}
                                        />
                                        {field.secret && alreadySaved && !value && (
                                            <p className="text-[10px] text-zinc-400 mt-1">Secret already saved. Enter a new value only to replace it.</p>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 pt-1">
                                <p className="text-[11px] text-amber-900 font-semibold leading-relaxed">
                                    Save stores credentials only. Use <span className="font-bold">Test & activate</span> on the card to enable checkout. Changing keys turns the gateway off until you test again.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-zinc-100 bg-zinc-50 shrink-0">
                            <button
                                type="button"
                                onClick={closeConfigure}
                                className="px-4 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={handleSaveGateway}
                                className="px-5 py-2.5 bg-[#008060] hover:bg-[#006e52] disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-wider"
                            >
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorSettingsTab;
