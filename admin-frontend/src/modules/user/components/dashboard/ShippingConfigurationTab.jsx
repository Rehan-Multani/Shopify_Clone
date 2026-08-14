import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const STATUS_STYLES = {
    not_configured: 'bg-zinc-100 text-zinc-600',
    configured: 'bg-amber-50 text-amber-700',
    verified: 'bg-emerald-50 text-emerald-700',
    error: 'bg-red-50 text-red-700',
};

/**
 * Shiprocket credentials for Merchant or Vendor.
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
    const [platformEnabled, setPlatformEnabled] = useState(true);
    const [form, setForm] = useState({
        email: '',
        password: '',
        pickupLocation: 'Primary',
        pickupPincode: '',
        channelId: '',
        enabled: false,
    });
    const [meta, setMeta] = useState({
        status: 'not_configured',
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

    const loadConfig = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(endpoint, { headers: authHeaders(), credentials: 'include' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load shipping configuration');
            const c = data.config || {};
            setPlatformEnabled(data.platformEnabled !== false);
            setForm({
                email: c.credentials?.email || '',
                password: c.credentials?.password || '',
                pickupLocation: c.pickupLocation || 'Primary',
                pickupPincode: c.pickupPincode || '',
                channelId: c.channelId || '',
                enabled: !!c.enabled,
            });
            setMeta({
                status: c.status || 'not_configured',
                lastTestedAt: c.lastTestedAt,
                lastTestResult: c.lastTestResult,
                passwordConfigured: !!c.credentials?.passwordConfigured,
            });
        } catch (err) {
            showToast(err.message || 'Failed to load shipping configuration', 'error');
        } finally {
            setLoading(false);
        }
    }, [endpoint, authHeaders]);

    useEffect(() => {
        if (token) loadConfig();
    }, [token, loadConfig]);

    const handleSave = async (extra = {}) => {
        setSaving(true);
        try {
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    storeId: storeId || undefined,
                    pickupLocation: form.pickupLocation,
                    pickupPincode: form.pickupPincode,
                    channelId: form.channelId,
                    enabled: extra.enabled !== undefined ? extra.enabled : form.enabled,
                    credentials: {
                        email: form.email,
                        password: form.password,
                    },
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save');
            showToast(data.message || 'Shipping configuration saved');
            await loadConfig();
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
                body: JSON.stringify({ storeId: storeId || undefined }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Test connection failure');
            showToast(data.message || 'Connected');
            await loadConfig();
        } catch (err) {
            showToast(err.message, 'error');
            await loadConfig();
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">
            {toast && (
                <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {toast.msg}
                </div>
            )}

            <div>
                <h1 className="text-xl font-bold text-[#202223]">Shipping (Shiprocket)</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Configure your Shiprocket API user. If keys are missing or Shiprocket fails, orders continue on manual / COD shipping.
                </p>
            </div>

            {!platformEnabled && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Super Admin has disabled Shiprocket on the platform. Manual shipping remains available.
                </div>
            )}

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold">Shiprocket</p>
                        <span className={`inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[meta.status] || STATUS_STYLES.not_configured}`}>
                            {meta.status.replace('_', ' ')}
                        </span>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-semibold">
                        Enabled
                        <input
                            type="checkbox"
                            checked={form.enabled}
                            disabled={!platformEnabled}
                            onChange={(e) => {
                                const enabled = e.target.checked;
                                setForm((f) => ({ ...f, enabled }));
                                handleSave({ enabled });
                            }}
                        />
                    </label>
                </div>

                <div>
                    <label className="block text-xs font-bold text-zinc-600 mb-1">API email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm"
                        placeholder="Shiprocket API user email"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-600 mb-1">API password</label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm"
                        placeholder={meta.passwordConfigured ? '•••••••• (unchanged if blank)' : 'API password'}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-600 mb-1">Pickup location name</label>
                        <input
                            type="text"
                            value={form.pickupLocation}
                            onChange={(e) => setForm((f) => ({ ...f, pickupLocation: e.target.value }))}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm"
                            placeholder="Primary"
                        />
                        <p className="text-[11px] text-zinc-400 mt-1">Must match a pickup location in your Shiprocket dashboard.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-600 mb-1">Pickup pincode</label>
                        <input
                            type="text"
                            value={form.pickupPincode}
                            onChange={(e) => setForm((f) => ({ ...f, pickupPincode: e.target.value }))}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-600 mb-1">Channel ID (optional)</label>
                    <input
                        type="text"
                        value={form.channelId}
                        onChange={(e) => setForm((f) => ({ ...f, channelId: e.target.value }))}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm"
                    />
                </div>

                {meta.lastTestResult?.message && (
                    <p className={`text-xs ${meta.lastTestResult.success ? 'text-emerald-700' : 'text-red-600'}`}>
                        Last test: {meta.lastTestResult.message}
                    </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                    <button
                        type="button"
                        disabled={saving || !platformEnabled}
                        onClick={() => handleSave()}
                        className="px-4 py-2 rounded-xl bg-[#1a1c23] text-white text-xs font-bold disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                        type="button"
                        disabled={testing || !platformEnabled}
                        onClick={handleTest}
                        className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold disabled:opacity-50"
                    >
                        {testing ? 'Testing…' : 'Test connection'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShippingConfigurationTab;
