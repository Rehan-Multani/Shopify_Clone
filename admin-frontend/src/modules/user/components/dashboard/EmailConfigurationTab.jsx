import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const STATUS_STYLES = {
    disabled: 'bg-zinc-100 text-zinc-600',
    configured: 'bg-amber-50 text-amber-700',
    verified: 'bg-emerald-50 text-emerald-700',
    error: 'bg-red-50 text-red-700'
};

const emptyForm = {
    provider: 'brevo',
    authMode: 'smtp',
    senderName: '',
    senderEmail: '',
    replyToEmail: '',
    smtpHost: 'smtp-relay.brevo.com',
    smtpPort: 587,
    smtpSecure: false,
    smtpUsername: '',
    smtpPassword: '',
    apiKey: ''
};

/**
 * Shared Email Configuration UI for Merchant and Vendor panels.
 * @param {'merchant'|'vendor'} mode
 */
const EmailConfigurationTab = ({ mode = 'merchant' }) => {
    const tokenKey = mode === 'vendor' ? 'vendorToken' : 'merchantToken';
    const token = localStorage.getItem(tokenKey);
    const storeId = localStorage.getItem('activeStoreId') || '';
    const endpoint = mode === 'vendor' ? `${API_BASE}/vendor/email-config` : `${API_BASE}/merchant/email-config`;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [meta, setMeta] = useState({
        status: 'disabled',
        verified: false,
        enabled: false,
        lastTestedAt: null,
        lastTestResult: null,
        passwordConfigured: false,
        apiKeyConfigured: false
    });
    const [toast, setToast] = useState(null);
    const [testOpen, setTestOpen] = useState(false);
    const [testEmail, setTestEmail] = useState('');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(storeId ? { 'x-store-id': storeId } : {})
    }), [token, storeId]);

    const loadConfig = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(endpoint, {
                headers: authHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load email configuration');
            const c = data.config || {};
            setForm({
                provider: c.provider || 'brevo',
                authMode: c.authMode || 'smtp',
                senderName: c.senderName || '',
                senderEmail: c.senderEmail || '',
                replyToEmail: c.replyToEmail || '',
                smtpHost: c.smtpHost || 'smtp-relay.brevo.com',
                smtpPort: c.smtpPort || 587,
                smtpSecure: !!c.smtpSecure,
                smtpUsername: c.smtpUsername || '',
                smtpPassword: c.smtpPasswordMasked || '',
                apiKey: c.apiKeyMasked || ''
            });
            setMeta({
                status: c.status || 'disabled',
                verified: !!c.verified,
                enabled: !!c.enabled,
                lastTestedAt: c.lastTestedAt,
                lastTestResult: c.lastTestResult,
                passwordConfigured: !!c.passwordConfigured,
                apiKeyConfigured: !!c.apiKeyConfigured
            });
        } catch (err) {
            showToast(err.message || 'Failed to load email configuration', 'error');
        } finally {
            setLoading(false);
        }
    }, [authHeaders, endpoint]);

    useEffect(() => {
        if (token) loadConfig();
    }, [token, loadConfig]);

    const payloadFromForm = () => {
        const body = {
            provider: form.provider,
            authMode: form.authMode,
            senderName: form.senderName,
            senderEmail: form.senderEmail,
            replyToEmail: form.replyToEmail,
            smtpHost: form.smtpHost,
            smtpPort: Number(form.smtpPort) || 587,
            smtpSecure: !!form.smtpSecure,
            smtpUsername: form.smtpUsername,
            enabled: true
        };
        if (form.smtpPassword && !String(form.smtpPassword).includes('•')) {
            body.smtpPassword = form.smtpPassword;
        }
        if (form.apiKey && !String(form.apiKey).includes('•')) {
            body.apiKey = form.apiKey;
        }
        return body;
    };

    const handleSave = async () => {
        if (!form.senderName?.trim() || !form.senderEmail?.trim()) {
            showToast('Sender name and email are required', 'error');
            return;
        }
        try {
            setSaving(true);
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify(payloadFromForm())
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save');
            showToast(data.message || 'Email configuration saved');
            if (data.config) {
                setMeta((m) => ({
                    ...m,
                    status: data.config.status,
                    verified: data.config.verified,
                    enabled: data.config.enabled,
                    passwordConfigured: data.config.passwordConfigured,
                    apiKeyConfigured: data.config.apiKeyConfigured
                }));
                if (data.config.smtpPasswordMasked) {
                    setForm((f) => ({ ...f, smtpPassword: data.config.smtpPasswordMasked }));
                }
                if (data.config.apiKeyMasked) {
                    setForm((f) => ({ ...f, apiKey: data.config.apiKeyMasked }));
                }
            }
        } catch (err) {
            showToast(err.message || 'Save failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDisable = async () => {
        try {
            setDisabling(true);
            const res = await fetch(`${endpoint}/disable`, {
                method: 'POST',
                headers: authHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to disable');
            showToast(data.message || 'Email configuration disabled');
            await loadConfig();
        } catch (err) {
            showToast(err.message || 'Disable failed', 'error');
        } finally {
            setDisabling(false);
        }
    };

    const handleTest = async () => {
        if (!testEmail?.trim()) {
            showToast('Enter a recipient email', 'error');
            return;
        }
        try {
            setTesting(true);
            const res = await fetch(`${endpoint}/test`, {
                method: 'POST',
                headers: authHeaders(),
                credentials: 'include',
                body: JSON.stringify({ ...payloadFromForm(), email: testEmail.trim() })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Authentication Failed');
            showToast(data.message || 'Email Sent Successfully');
            setTestOpen(false);
            await loadConfig();
        } catch (err) {
            showToast(err.message || 'Authentication Failed', 'error');
        } finally {
            setTesting(false);
        }
    };

    const handleReset = () => {
        setForm(emptyForm);
        showToast('Form reset — click Save to apply, or reload to restore saved values');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-zinc-500 text-sm">
                Loading email configuration…
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto w-full space-y-6">
            {toast && (
                <div
                    className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
                        toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                >
                    {toast.msg}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900">Email Configuration</h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        Customer emails will send from your sender when configured. Falls back to platform SMTP otherwise.
                    </p>
                </div>
                <span className={`inline-flex self-start px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[meta.status] || STATUS_STYLES.disabled}`}>
                    {meta.status || 'disabled'}
                    {meta.verified ? ' · Verified' : ''}
                </span>
            </div>

            {meta.lastTestedAt && (
                <p className="text-xs text-zinc-500">
                    Last tested:{' '}
                    {new Date(meta.lastTestedAt).toLocaleString()}
                    {meta.lastTestResult?.success === false && meta.lastTestResult?.message
                        ? ` — ${meta.lastTestResult.message}`
                        : meta.lastTestResult?.success
                            ? ' — Success'
                            : ''}
                </p>
            )}

            <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-zinc-800">Provider</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block text-sm">
                        <span className="text-zinc-600 mb-1 block">Email Provider</span>
                        <select
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm"
                            value={form.provider}
                            onChange={(e) => {
                                const provider = e.target.value;
                                setForm((f) => ({
                                    ...f,
                                    provider,
                                    smtpHost: provider === 'brevo' ? 'smtp-relay.brevo.com' : f.smtpHost,
                                    smtpPort: provider === 'brevo' ? 587 : f.smtpPort
                                }));
                            }}
                        >
                            <option value="brevo">Brevo</option>
                            <option value="smtp">Custom SMTP</option>
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="text-zinc-600 mb-1 block">Auth Mode</span>
                        <select
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm"
                            value={form.authMode}
                            onChange={(e) => setForm((f) => ({ ...f, authMode: e.target.value }))}
                        >
                            <option value="smtp">SMTP</option>
                            <option value="api">API Key</option>
                        </select>
                    </label>
                </div>
            </section>

            <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-zinc-800">Sender Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block text-sm sm:col-span-2">
                        <span className="text-zinc-600 mb-1 block">Sender Name *</span>
                        <input
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm"
                            value={form.senderName}
                            onChange={(e) => setForm((f) => ({ ...f, senderName: e.target.value }))}
                            placeholder="Rehan Fashion"
                        />
                    </label>
                    <label className="block text-sm">
                        <span className="text-zinc-600 mb-1 block">Sender Email *</span>
                        <input
                            type="email"
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm"
                            value={form.senderEmail}
                            onChange={(e) => setForm((f) => ({ ...f, senderEmail: e.target.value }))}
                            placeholder="orders@rehanfashion.com"
                        />
                    </label>
                    <label className="block text-sm">
                        <span className="text-zinc-600 mb-1 block">Reply-To Email</span>
                        <input
                            type="email"
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm"
                            value={form.replyToEmail}
                            onChange={(e) => setForm((f) => ({ ...f, replyToEmail: e.target.value }))}
                            placeholder="support@rehanfashion.com"
                        />
                    </label>
                </div>
            </section>

            {form.authMode === 'api' ? (
                <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-800">Brevo API</h3>
                    <label className="block text-sm">
                        <span className="text-zinc-600 mb-1 block">API Key</span>
                        <input
                            type="password"
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-mono"
                            value={form.apiKey}
                            onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                            placeholder={meta.apiKeyConfigured ? '••••••••••••' : 'xkeysib-...'}
                            autoComplete="new-password"
                        />
                        <span className="text-xs text-zinc-400 mt-1 block">
                            Leave masked value unchanged to keep the existing key.
                        </span>
                    </label>
                    <p className="text-xs text-zinc-500">
                        API mode uses Brevo SMTP relay with your API key as the password.
                    </p>
                </section>
            ) : (
                <section className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-800">SMTP Configuration</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <label className="block text-sm sm:col-span-2">
                            <span className="text-zinc-600 mb-1 block">SMTP Host</span>
                            <input
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm"
                                value={form.smtpHost}
                                onChange={(e) => setForm((f) => ({ ...f, smtpHost: e.target.value }))}
                                placeholder="smtp-relay.brevo.com"
                            />
                        </label>
                        <label className="block text-sm">
                            <span className="text-zinc-600 mb-1 block">Port</span>
                            <input
                                type="number"
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm"
                                value={form.smtpPort}
                                onChange={(e) => setForm((f) => ({ ...f, smtpPort: e.target.value }))}
                            />
                        </label>
                        <label className="block text-sm">
                            <span className="text-zinc-600 mb-1 block">Encryption</span>
                            <select
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm"
                                value={form.smtpSecure ? 'ssl' : 'tls'}
                                onChange={(e) => setForm((f) => ({ ...f, smtpSecure: e.target.value === 'ssl' }))}
                            >
                                <option value="tls">STARTTLS (587)</option>
                                <option value="ssl">SSL/TLS (465)</option>
                            </select>
                        </label>
                        <label className="block text-sm">
                            <span className="text-zinc-600 mb-1 block">Username</span>
                            <input
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm"
                                value={form.smtpUsername}
                                onChange={(e) => setForm((f) => ({ ...f, smtpUsername: e.target.value }))}
                                placeholder="apikey or SMTP login"
                                autoComplete="off"
                            />
                        </label>
                        <label className="block text-sm">
                            <span className="text-zinc-600 mb-1 block">Password</span>
                            <input
                                type="password"
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm font-mono"
                                value={form.smtpPassword}
                                onChange={(e) => setForm((f) => ({ ...f, smtpPassword: e.target.value }))}
                                placeholder={meta.passwordConfigured ? '••••••••••••' : 'SMTP password'}
                                autoComplete="new-password"
                            />
                        </label>
                    </div>
                </section>
            )}

            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold disabled:opacity-60"
                >
                    {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                    type="button"
                    onClick={() => setTestOpen(true)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-sm font-semibold text-zinc-800"
                >
                    Test Email
                </button>
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-sm font-medium text-zinc-600"
                >
                    Reset
                </button>
                {meta.enabled && (
                    <button
                        type="button"
                        onClick={handleDisable}
                        disabled={disabling}
                        className="px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-sm font-semibold text-red-700 disabled:opacity-60"
                    >
                        {disabling ? 'Disabling…' : 'Disable Configuration'}
                    </button>
                )}
            </div>

            {testOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-zinc-900">Send Test Email</h3>
                        <label className="block text-sm">
                            <span className="text-zinc-600 mb-1 block">Recipient Email</span>
                            <input
                                type="email"
                                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="admin@gmail.com"
                            />
                        </label>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setTestOpen(false)}
                                className="px-4 py-2 rounded-xl text-sm text-zinc-600 hover:bg-zinc-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleTest}
                                disabled={testing}
                                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold disabled:opacity-60"
                            >
                                {testing ? 'Sending…' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailConfigurationTab;
