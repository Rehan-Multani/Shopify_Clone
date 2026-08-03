import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const GATEWAY_LOGOS = {
    razorpay: { bg: 'bg-[#072654]', label: 'rzp', color: 'text-white' },
    stripe: { bg: 'bg-[#635BFF]', label: 'stripe', color: 'text-white' },
    payu: { bg: 'bg-[#00ADEF]', label: 'PayU', color: 'text-white' },
    cashfree: { bg: 'bg-[#FF7A45]', label: 'CF', color: 'text-white' }
};

const FIELD_DEFS = {
    razorpay: [
        { key: 'keyId', label: 'Key ID', type: 'text', placeholderSandbox: 'rzp_test_...', placeholderLive: 'rzp_live_...' },
        { key: 'keySecret', label: 'Key Secret', type: 'password', placeholder: '••••••••', secret: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'Optional', secret: true, optional: true }
    ],
    stripe: [
        { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholderSandbox: 'pk_test_...', placeholderLive: 'pk_live_...' },
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: '••••••••', secret: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...', secret: true, optional: true }
    ],
    payu: [
        { key: 'merchantKey', label: 'Merchant Key', type: 'text', placeholder: 'Merchant Key' },
        { key: 'merchantSalt', label: 'Merchant Salt', type: 'password', placeholder: '••••••••', secret: true }
    ],
    cashfree: [
        { key: 'appId', label: 'App ID', type: 'text', placeholder: 'App ID' },
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: '••••••••', secret: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'Optional', secret: true, optional: true }
    ]
};

const STATUS_STYLES = {
    not_configured: 'bg-zinc-100 text-zinc-600',
    configured: 'bg-amber-50 text-amber-700',
    verified: 'bg-emerald-50 text-emerald-700',
    error: 'bg-red-50 text-red-700'
};

const PaymentGatewaysTab = () => {
    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';
    const merchantInfo = JSON.parse(localStorage.getItem('merchantInfo') || '{}');
    const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

    const [loading, setLoading] = useState(true);
    const [storePlanType, setStorePlanType] = useState(() => {
        const panel = localStorage.getItem('adminPanelType');
        if (panel === 'multi') return 'Multi Vendor';
        return merchantInfo?.plan?.planType || merchantInfo?.planType || 'Single Vendor';
    });
    const isMultiVendor = storePlanType === 'Multi Vendor';

    const [gateways, setGateways] = useState([]);
    const [meta, setMeta] = useState({});
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(storeId ? { 'x-store-id': storeId } : {})
    }), [token, storeId]);

    // Resolve Multi vs Single from the active store (source of truth for this screen)
    useEffect(() => {
        if (!storeId || !token || !STORE_API_URL) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${STORE_API_URL}/stores/${storeId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: 'include'
                });
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;
                if (data.planType) {
                    setStorePlanType(data.planType);
                    localStorage.setItem('adminPanelType', data.planType === 'Multi Vendor' ? 'multi' : 'single');
                }
            } catch {
                // keep fallback from localStorage
            }
        })();
        return () => { cancelled = true; };
    }, [storeId, token, STORE_API_URL]);

    const fetchGateways = useCallback(async () => {
        try {
            setLoading(true);
            const qs = storeId ? `?storeId=${storeId}` : '';
            const res = await fetch(`${API_BASE}/merchant/payment-gateways${qs}`, {
                headers: authHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load gateways');
            setGateways(data.gateways || []);
            if (data.meta) setMeta(data.meta);
        } catch (err) {
            showToast(err.message || 'Failed to load payment gateways', 'error');
        } finally {
            setLoading(false);
        }
    }, [authHeaders, storeId]);

    useEffect(() => {
        if (token) fetchGateways();
    }, [token, fetchGateways]);

    const openConfigure = (gw) => {
        setEditing(gw.gateway);
        setForm({
            environment: gw.environment || 'sandbox',
            currency: 'INR',
            enabled: !!gw.enabled,
            isDefault: !!gw.isDefault,
            credentials: { ...(gw.credentials || {}) },
            webhookSecret: gw.credentials?.webhookSecret || ''
        });
    };

    const closeConfigure = () => {
        setEditing(null);
        setForm({});
    };

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const payload = {
                storeId: storeId || undefined,
                environment: form.environment,
                currency: 'INR',
                enabled: form.enabled,
                isDefault: form.isDefault,
                credentials: { ...form.credentials },
                webhookSecret: form.webhookSecret || form.credentials?.webhookSecret
            };
            const res = await fetch(`${API_BASE}/merchant/payment-gateways/${editing}`, {
                method: 'PUT',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save');
            showToast(data.message || 'Gateway saved');
            closeConfigure();
            await fetchGateways();
        } catch (err) {
            showToast(err.message || 'Failed to save gateway', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleEnable = async (gw, enabled) => {
        try {
            if (gw.status === 'not_configured' && enabled) {
                openConfigure(gw);
                showToast('Configure credentials before enabling', 'error');
                return;
            }
            const res = await fetch(`${API_BASE}/merchant/payment-gateways/${gw.gateway}`, {
                method: 'PUT',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    storeId: storeId || undefined,
                    enabled,
                    environment: gw.environment,
                    currency: 'INR',
                    credentials: {}
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update');
            showToast(enabled ? `${gw.name} enabled` : `${gw.name} disabled`);
            await fetchGateways();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleTest = async (gateway) => {
        setTesting(gateway);
        try {
            const res = await fetch(`${API_BASE}/merchant/payment-gateways/${gateway}/test`, {
                method: 'POST',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({ storeId: storeId || undefined })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Test connection failure');
            showToast(data.message || 'Connection verified');
            await fetchGateways();
        } catch (err) {
            showToast(err.message || 'Test connection failure', 'error');
            await fetchGateways();
        } finally {
            setTesting(null);
        }
    };

    const editingGw = gateways.find((g) => g.gateway === editing);

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

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-zinc-200 pb-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Settings</p>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Payment Gateways</h1>
                    <p className="text-xs text-zinc-500 mt-1">
                        Configure Razorpay, Stripe, PayU and Cashfree for{' '}
                        {isMultiVendor ? 'your marketplace' : 'your store'}. Secrets are encrypted and never shown in full.
                    </p>
                </div>
                <Link
                    to="/dashboard/store-profile"
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                    Store COD / Online toggles →
                </Link>
            </div>

            {/* Gateway cards */}
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
                                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5 line-clamp-2">{gw.description}</p>
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
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${gw.environment === 'production' ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700'}`}>
                                    {gw.environment || 'sandbox'}
                                </span>
                                {gw.isDefault && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                                        Default
                                    </span>
                                )}
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
                                    onClick={() => handleTest(gw.gateway)}
                                    className="px-3.5 py-2 bg-white border border-zinc-200 hover:border-zinc-400 disabled:opacity-40 text-zinc-700 rounded-lg text-[11px] font-bold uppercase tracking-wider transition"
                                >
                                    {testing === gw.gateway ? 'Testing…' : 'Test Connection'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Multi Vendor note — vendors configure gateways themselves in Vendor Portal */}
            {isMultiVendor && (
                <div className="bg-teal-50/60 border border-teal-100 rounded-2xl px-5 py-4">
                    <p className="text-xs text-teal-900 font-semibold leading-relaxed">
                        Multi Vendor mode: Vendors apna payment gateway <span className="font-bold">Vendor Portal → Settings</span> se khud configure karte hain.
                        Order pe pehle vendor ka gateway use hoga; agar vendor ne configure nahi kiya to aapka merchant gateway fallback rahega.
                    </p>
                </div>
            )}

            {/* Configure modal */}
            {editing && editingGw && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]" onClick={closeConfigure}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-[#202223]">Configure {editingGw.name}</h3>
                                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
                                    Credentials are encrypted at rest
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

                        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Environment</label>
                                    <select
                                        value={form.environment}
                                        onChange={(e) => setForm((f) => ({ ...f, environment: e.target.value }))}
                                        className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        <option value="sandbox">Sandbox</option>
                                        <option value="production">Production</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Currency</label>
                                    <div className="w-full border border-zinc-100 bg-zinc-50 rounded-lg px-3 py-2.5 text-sm font-bold text-zinc-700">
                                        INR
                                    </div>
                                </div>
                            </div>

                            {(FIELD_DEFS[editing] || []).map((field) => {
                                const rawValue = field.key === 'webhookSecret'
                                    ? (form.webhookSecret || form.credentials?.webhookSecret || '')
                                    : (form.credentials?.[field.key] || '');
                                const isMasked = typeof rawValue === 'string' && rawValue.includes('•');
                                const displayValue = isMasked && field.secret ? '' : rawValue;
                                const placeholder = form.environment === 'production'
                                    ? (field.placeholderLive || field.placeholder || '')
                                    : (field.placeholderSandbox || field.placeholder || '');

                                return (
                                    <div key={field.key}>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">
                                            {field.label}
                                            {field.optional && <span className="ml-1 font-medium normal-case text-zinc-400">(optional)</span>}
                                        </label>
                                        <input
                                            type={field.type}
                                            value={displayValue}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (field.key === 'webhookSecret') {
                                                    setForm((f) => ({
                                                        ...f,
                                                        webhookSecret: val,
                                                        credentials: { ...f.credentials, webhookSecret: val }
                                                    }));
                                                } else {
                                                    setForm((f) => ({
                                                        ...f,
                                                        credentials: { ...f.credentials, [field.key]: val }
                                                    }));
                                                }
                                            }}
                                            className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                            placeholder={isMasked ? 'Leave blank to keep existing' : placeholder}
                                            autoComplete="off"
                                        />
                                        {field.secret && isMasked && (
                                            <p className="text-[10px] text-zinc-400 mt-1">Secret already saved. Enter a new value only to replace it.</p>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 divide-y divide-zinc-100">
                                <label className="flex items-center justify-between gap-3 px-3.5 py-3 cursor-pointer">
                                    <div>
                                        <p className="text-xs font-bold text-zinc-800">Enable gateway</p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">Make this gateway available at checkout</p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={!!form.enabled}
                                        onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
                                        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${form.enabled ? 'bg-emerald-600' : 'bg-zinc-300'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${form.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </label>
                                <label className="flex items-center justify-between gap-3 px-3.5 py-3 cursor-pointer">
                                    <div>
                                        <p className="text-xs font-bold text-zinc-800">Set as default</p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">Preferred gateway when multiple are enabled</p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={!!form.isDefault}
                                        onClick={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
                                        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${form.isDefault ? 'bg-emerald-600' : 'bg-zinc-300'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${form.isDefault ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </label>
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
                                onClick={handleSave}
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

export default PaymentGatewaysTab;
