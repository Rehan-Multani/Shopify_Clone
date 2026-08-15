import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const STATUS_STYLES = {
    not_configured: 'bg-zinc-100 text-zinc-600',
    configured: 'bg-amber-50 text-amber-700',
    verified: 'bg-emerald-50 text-emerald-700',
    error: 'bg-red-50 text-red-700',
};

const isMaskedValue = (value) =>
    typeof value === 'string' && (value.includes('•') || /^\*+$/.test(value.trim()));

/**
 * Shiprocket credentials — email-parity: Test & activate, owner-only, else COD/manual.
 * @param {'merchant'|'vendor'} mode
 */
const ShippingConfigurationTab = ({ mode = 'merchant' }) => {
    const tokenKey = mode === 'vendor' ? 'vendorToken' : 'merchantToken';
    const token = localStorage.getItem(tokenKey);
    const storeId = localStorage.getItem('activeStoreId') || '';
    const endpoint = mode === 'vendor' ? `${API_BASE}/vendor/shipping` : `${API_BASE}/merchant/shipping`;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [platformEnabled, setPlatformEnabled] = useState(true);
    const [form, setForm] = useState({
        email: '',
        password: '',
        pickupPincode: '',
    });
    const [meta, setMeta] = useState({
        status: 'not_configured',
        enabled: false,
        verified: false,
        lastTestedAt: null,
        lastTestResult: null,
        passwordConfigured: false,
    });
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(storeId ? { 'x-store-id': storeId } : {}),
    }), [token, storeId]);

    const applyConfig = (c = {}, platformOn = true) => {
        const rawPassword = c.credentials?.password || '';
        setPlatformEnabled(platformOn);
        setForm({
            email: c.credentials?.email || '',
            password: isMaskedValue(rawPassword) ? '' : rawPassword,
            pickupPincode: c.pickupPincode || '',
        });
        setMeta({
            status: c.status || 'not_configured',
            enabled: !!c.enabled,
            verified: !!c.verified || (c.status === 'verified' && !!c.enabled),
            lastTestedAt: c.lastTestedAt,
            lastTestResult: c.lastTestResult,
            passwordConfigured: !!c.credentials?.passwordConfigured || isMaskedValue(rawPassword),
        });
    };

    const loadConfig = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(endpoint, { headers: authHeaders(), credentials: 'include' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load shipping configuration');
            applyConfig(data.config || {}, data.platformEnabled !== false);
        } catch (err) {
            showToast(err.message || 'Failed to load shipping configuration', 'error');
        } finally {
            setLoading(false);
        }
    }, [endpoint, authHeaders]);

    useEffect(() => {
        if (token) loadConfig();
    }, [token, loadConfig]);

    const payloadCredentials = () => {
        const password = String(form.password || '').trim();
        return {
            email: form.email.trim(),
            ...(password && !isMaskedValue(password) ? { password } : {}),
        };
    };

    const handleSave = async () => {
        if (!form.email?.trim()) {
            showToast('Shiprocket API email is required', 'error');
            return;
        }
        const password = String(form.password || '').trim();
        if ((!password || isMaskedValue(password)) && !meta.passwordConfigured) {
            showToast('Shiprocket API password is required', 'error');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    storeId: storeId || undefined,
                    pickupLocation: 'Primary',
                    pickupPincode: form.pickupPincode,
                    channelId: '',
                    credentials: payloadCredentials(),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save');
            showToast(data.message || 'Shipping configuration saved');
            if (data.config) applyConfig(data.config, platformEnabled);
            else await loadConfig();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            const res = await fetch(`${endpoint}/test`, {
                method: 'POST',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    storeId: storeId || undefined,
                    pickupPincode: form.pickupPincode,
                    credentials: payloadCredentials(),
                }),
            });
            const data = await res.json();
            if (data.config) applyConfig(data.config, platformEnabled);
            if (!res.ok) throw new Error(data.message || 'Test connection failure');
            showToast(data.message || 'Verified and activated');
        } catch (err) {
            showToast(err.message, 'error');
            await loadConfig();
        } finally {
            setTesting(false);
        }
    };

    const handleDisable = async () => {
        setDisabling(true);
        try {
            const res = await fetch(`${endpoint}/disable`, {
                method: 'POST',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({ storeId: storeId || undefined }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to disable');
            showToast(data.message || 'Shiprocket disabled');
            await loadConfig();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setDisabling(false);
        }
    };

    const fieldClass =
        'w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm font-semibold bg-white text-[#202223] placeholder:text-zinc-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-zinc-50 disabled:text-zinc-400';
    const labelClass = 'block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5';
    const isLive = meta.enabled && meta.status === 'verified';
    const needsVerify = meta.status === 'configured' || meta.status === 'error' || (!isLive && meta.passwordConfigured);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-16">
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#1a1c23]'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="border-b border-zinc-200 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Settings</p>
                <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Shipping</h1>
                <p className="text-xs text-zinc-500 mt-1 max-w-xl">
                    {mode === 'vendor'
                        ? 'Connect your Shiprocket account for automated labels. If not verified, your orders stay on COD / manual shipping — merchant Shiprocket is never used.'
                        : 'Connect your Shiprocket account for automated labels. If not verified, orders stay on COD / manual shipping.'}
                </p>
            </div>

            {!platformEnabled && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
                    Super Admin has disabled Shiprocket on the platform. Orders use COD / manual shipping.
                </div>
            )}

            {platformEnabled && needsVerify && !isLive && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 leading-relaxed">
                    {meta.status === 'error'
                        ? 'Shiprocket failed verification or a live login. Fix credentials and use Test & activate. Until then, orders use COD / manual.'
                        : 'Settings saved but not active. Click Test & activate to enable Shiprocket. Until then, orders use COD / manual.'}
                </div>
            )}

            {platformEnabled && isLive && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900">
                    Verified and active. New orders will try Shiprocket with your account; failures fall back to COD / manual.
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-5 border-b border-zinc-100">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#1a1c23] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-black tracking-tight">
                            SR
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-[#202223]">Shiprocket</h2>
                            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">API shipping · AWB · tracking</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${STATUS_STYLES[meta.status] || STATUS_STYLES.not_configured}`}>
                                    {String(meta.status || 'not_configured').replace('_', ' ')}
                                    {isLive ? ' · live' : ''}
                                </span>
                                {meta.lastTestedAt && (
                                    <span className="text-[10px] text-zinc-400 font-medium">
                                        Tested {new Date(meta.lastTestedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-5 sm:px-6 py-5 space-y-6">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">API credentials</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className={labelClass}>API email *</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    disabled={!platformEnabled}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                    className={fieldClass}
                                    placeholder="api-user@example.com"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>API password *</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    disabled={!platformEnabled}
                                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                    className={fieldClass}
                                    placeholder={meta.passwordConfigured ? 'Leave blank to keep existing' : 'Shiprocket API password'}
                                    autoComplete="new-password"
                                />
                                {meta.passwordConfigured && !form.password && (
                                    <p className="text-[10px] text-zinc-400 mt-1.5">Password already saved. Enter a new value only to replace it.</p>
                                )}
                            </div>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-3 leading-relaxed">
                            Changing email or password requires a new successful Test &amp; activate before Shiprocket is used again.
                        </p>
                    </div>

                    <div className="border-t border-zinc-100 pt-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Pickup</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Pickup location</label>
                                <div className="w-full border border-zinc-200 bg-zinc-50 rounded-lg px-3.5 py-2.5 text-sm font-bold text-zinc-700">
                                    Primary
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-1.5">Must exist in your Shiprocket account.</p>
                            </div>
                            <div>
                                <label className={labelClass}>Pickup pincode</label>
                                <input
                                    type="text"
                                    value={form.pickupPincode}
                                    disabled={!platformEnabled}
                                    onChange={(e) => setForm((f) => ({ ...f, pickupPincode: e.target.value }))}
                                    className={fieldClass}
                                    placeholder="e.g. 110001"
                                />
                            </div>
                        </div>
                    </div>

                    {meta.lastTestResult?.message && (
                        <div className={`rounded-xl px-4 py-3 text-xs font-semibold ${meta.lastTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            Last test: {meta.lastTestResult.message}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-zinc-100 bg-zinc-50">
                    {isLive && (
                        <button
                            type="button"
                            onClick={handleDisable}
                            disabled={disabling || !platformEnabled}
                            className="mr-auto px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                            {disabling ? 'Disabling…' : 'Disable'}
                        </button>
                    )}
                    <button
                        type="button"
                        disabled={saving || !platformEnabled}
                        onClick={handleSave}
                        className="px-4 py-2.5 bg-white border border-zinc-200 hover:border-zinc-400 disabled:opacity-40 text-zinc-700 rounded-lg text-[11px] font-bold uppercase tracking-wider transition"
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                        type="button"
                        disabled={testing || !platformEnabled}
                        onClick={handleTest}
                        className="px-5 py-2.5 bg-[#008060] hover:bg-[#006e52] disabled:opacity-50 text-white rounded-lg text-[11px] font-black uppercase tracking-wider transition"
                    >
                        {testing ? 'Testing…' : 'Test & activate'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShippingConfigurationTab;
