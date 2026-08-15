import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const BREVO_HOST = 'smtp-relay.brevo.com';
const BREVO_PORT = 587;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_STYLES = {
    disabled: 'bg-zinc-100 text-zinc-600',
    configured: 'bg-amber-50 text-amber-700',
    verified: 'bg-emerald-50 text-emerald-700',
    error: 'bg-red-50 text-red-700'
};

const emptyForm = {
    senderName: '',
    senderEmail: '',
    replyToEmail: '',
    smtpUsername: '',
    smtpPassword: '',
};

/**
 * Brevo SMTP only — Custom SMTP / other providers are not supported.
 * Save stores settings; Test Email verifies and activates live sending.
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
    });
    const [toast, setToast] = useState(null);
    const [testOpen, setTestOpen] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(storeId ? { 'x-store-id': storeId } : {})
    }), [token, storeId]);

    const applyConfigToState = (c = {}) => {
        setForm({
            senderName: c.senderName || '',
            senderEmail: c.senderEmail || '',
            replyToEmail: c.replyToEmail || '',
            smtpUsername: c.smtpUsername || '',
            smtpPassword: c.smtpPasswordMasked || '',
        });
        setMeta({
            status: c.status || 'disabled',
            verified: !!c.verified,
            enabled: !!c.enabled,
            lastTestedAt: c.lastTestedAt,
            lastTestResult: c.lastTestResult,
            passwordConfigured: !!c.passwordConfigured,
        });
    };

    const loadLogs = useCallback(async () => {
        try {
            setLogsLoading(true);
            const res = await fetch(`${endpoint}/logs?limit=15`, {
                headers: authHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setLogs(data.logs || []);
        } catch {
            /* ignore */
        } finally {
            setLogsLoading(false);
        }
    }, [authHeaders, endpoint]);

    const loadConfig = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(endpoint, {
                headers: authHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load email configuration');
            applyConfigToState(data.config || {});
            loadLogs();
        } catch (err) {
            showToast(err.message || 'Failed to load email configuration', 'error');
        } finally {
            setLoading(false);
        }
    }, [authHeaders, endpoint, loadLogs]);

    useEffect(() => {
        if (token) loadConfig();
    }, [token, loadConfig]);

    const validateForm = ({ forTest = false } = {}) => {
        if (!form.senderName?.trim()) return 'Sender name is required';
        if (!form.senderEmail?.trim()) return 'Sender email is required';
        if (!EMAIL_RE.test(form.senderEmail.trim())) return 'Sender email is invalid';
        if (form.replyToEmail?.trim() && !EMAIL_RE.test(form.replyToEmail.trim())) {
            return 'Reply-to email is invalid';
        }
        if (!form.smtpUsername?.trim()) return 'SMTP username is required';
        const hasNewPass = form.smtpPassword && !String(form.smtpPassword).includes('•');
        if (!hasNewPass && !meta.passwordConfigured) return 'SMTP password / key is required';
        if (forTest && testEmail?.trim() && !EMAIL_RE.test(testEmail.trim())) {
            return 'Recipient email is invalid';
        }
        return null;
    };

    const payloadFromForm = () => {
        const body = {
            provider: 'brevo',
            authMode: 'smtp',
            senderName: form.senderName.trim(),
            senderEmail: form.senderEmail.trim(),
            replyToEmail: form.replyToEmail.trim(),
            smtpHost: BREVO_HOST,
            smtpPort: BREVO_PORT,
            smtpSecure: false,
            smtpUsername: form.smtpUsername.trim(),
        };
        if (form.smtpPassword && !String(form.smtpPassword).includes('•')) {
            body.smtpPassword = form.smtpPassword.trim();
        }
        return body;
    };

    const handleSave = async () => {
        const errMsg = validateForm();
        if (errMsg) {
            showToast(errMsg, 'error');
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
            if (data.config) applyConfigToState(data.config);
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
        const formErr = validateForm({ forTest: true });
        if (formErr) {
            showToast(formErr, 'error');
            return;
        }
        if (!testEmail?.trim()) {
            showToast('Enter a recipient email', 'error');
            return;
        }
        if (!EMAIL_RE.test(testEmail.trim())) {
            showToast('Recipient email is invalid', 'error');
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
            if (data.config) applyConfigToState(data.config);
            if (!res.ok) throw new Error(data.message || 'Authentication Failed');
            showToast(data.message || 'Email Sent Successfully');
            setTestOpen(false);
        } catch (err) {
            showToast(err.message || 'Authentication Failed', 'error');
            await loadConfig();
        } finally {
            setTesting(false);
        }
    };

    const fieldClass =
        'w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm font-semibold bg-white text-[#202223] placeholder:text-zinc-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500';
    const labelClass = 'block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5';
    const needsVerify = meta.status === 'configured' || meta.status === 'error' || (meta.status !== 'verified' && meta.passwordConfigured);
    const isLive = meta.enabled && meta.verified && meta.status === 'verified';

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
                <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Email Configuration</h1>
                <p className="text-xs text-zinc-500 mt-1 max-w-xl">
                    {mode === 'vendor'
                        ? 'Connect Brevo SMTP for your order emails. Emails send only after a successful test. If not verified, emails are skipped — they will not use merchant or platform SMTP.'
                        : 'Connect Brevo SMTP for your store emails. Emails send only after a successful test. If not verified, store emails are skipped — they will not use platform SMTP.'}
                </p>
            </div>

            {needsVerify && !isLive && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 leading-relaxed">
                    {meta.status === 'error'
                        ? 'SMTP failed verification or a live send. Fix credentials and send a test email to reactivate.'
                        : 'Settings are saved but not active yet. Click Test email and send a message to verify and activate sending.'}
                </div>
            )}

            {isLive && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 leading-relaxed">
                    Verified and active. Store emails will send from your Brevo sender.
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-5 border-b border-zinc-100">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#0B996E] text-white flex items-center justify-center flex-shrink-0 text-xs font-black tracking-tight">
                            Brevo
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-[#202223]">Brevo SMTP</h2>
                            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">Only supported email connection</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${STATUS_STYLES[meta.status] || STATUS_STYLES.disabled}`}>
                                    {meta.status || 'disabled'}
                                    {meta.verified ? ' · verified' : ''}
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
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-[10px] font-bold">
                            {BREVO_HOST}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-[10px] font-bold">
                            Port {BREVO_PORT} · STARTTLS
                        </span>
                    </div>
                </div>

                <div className="px-5 sm:px-6 py-5 space-y-6">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Sender</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Sender name *</label>
                                <input
                                    className={fieldClass}
                                    value={form.senderName}
                                    onChange={(e) => setForm((f) => ({ ...f, senderName: e.target.value }))}
                                    placeholder="Your Store Name"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Sender email *</label>
                                <input
                                    type="email"
                                    className={fieldClass}
                                    value={form.senderEmail}
                                    onChange={(e) => setForm((f) => ({ ...f, senderEmail: e.target.value }))}
                                    placeholder="orders@yourstore.com"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Reply-to email</label>
                                <input
                                    type="email"
                                    className={fieldClass}
                                    value={form.replyToEmail}
                                    onChange={(e) => setForm((f) => ({ ...f, replyToEmail: e.target.value }))}
                                    placeholder="support@yourstore.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-100 pt-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Brevo SMTP login</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>SMTP username *</label>
                                <input
                                    className={fieldClass}
                                    value={form.smtpUsername}
                                    onChange={(e) => setForm((f) => ({ ...f, smtpUsername: e.target.value }))}
                                    placeholder="xxx@smtp-brevo.com"
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>SMTP password / key *</label>
                                <input
                                    type="password"
                                    className={fieldClass}
                                    value={form.smtpPassword}
                                    onChange={(e) => setForm((f) => ({ ...f, smtpPassword: e.target.value }))}
                                    placeholder={meta.passwordConfigured ? 'Leave blank to keep existing' : 'xsmtpsib-...'}
                                    autoComplete="new-password"
                                />
                                {meta.passwordConfigured && (!form.smtpPassword || String(form.smtpPassword).includes('•')) && (
                                    <p className="text-[10px] text-zinc-400 mt-1.5">Password already saved. Enter a new value only to replace it.</p>
                                )}
                            </div>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-3 leading-relaxed">
                            From Brevo → Settings → SMTP &amp; API: use the SMTP login and SMTP key (not the API v3 key).
                            Verify your sender email / domain in Brevo. Changing credentials requires a new successful test before emails send again.
                        </p>
                    </div>

                    {meta.lastTestResult?.message && (
                        <div className={`rounded-xl px-4 py-3 text-xs font-semibold ${meta.lastTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            Last test: {meta.lastTestResult.message}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-zinc-100 bg-zinc-50">
                    {meta.enabled && (
                        <button
                            type="button"
                            onClick={handleDisable}
                            disabled={disabling}
                            className="mr-auto px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                            {disabling ? 'Disabling…' : 'Disable'}
                        </button>
                    )}
                    <button
                        type="button"
                        disabled={saving}
                        onClick={handleSave}
                        className="px-4 py-2.5 bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-700 rounded-lg text-[11px] font-bold uppercase tracking-wider transition disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setTestOpen(true)}
                        className="px-5 py-2.5 bg-[#008060] hover:bg-[#006e52] text-white rounded-lg text-[11px] font-black uppercase tracking-wider transition"
                    >
                        Test &amp; activate
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-100">
                    <div>
                        <h3 className="text-sm font-bold text-[#202223]">Recent delivery logs</h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Sent, failed, and skipped emails for this account</p>
                    </div>
                    <button
                        type="button"
                        onClick={loadLogs}
                        disabled={logsLoading}
                        className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
                    >
                        {logsLoading ? 'Loading…' : 'Refresh'}
                    </button>
                </div>
                <div className="divide-y divide-zinc-100">
                    {!logs.length && (
                        <p className="px-5 py-6 text-xs text-zinc-400 font-medium">No delivery logs yet.</p>
                    )}
                    {logs.map((log) => (
                        <div key={log.id} className="px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#202223] truncate">{log.subject || log.event}</p>
                                <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                                    To {log.to}
                                    {log.fromEmail ? ` · From ${log.fromEmail}` : ''}
                                    {log.event ? ` · ${log.event}` : ''}
                                </p>
                                {log.error && (
                                    <p className="text-[11px] text-red-600 mt-1 font-medium">{log.error}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    log.status === 'sent' ? 'bg-emerald-50 text-emerald-700'
                                        : log.status === 'skipped' ? 'bg-amber-50 text-amber-700'
                                            : log.status === 'failed' ? 'bg-red-50 text-red-700'
                                                : 'bg-zinc-100 text-zinc-600'
                                }`}>
                                    {log.status}
                                </span>
                                {log.createdAt && (
                                    <span className="text-[10px] text-zinc-400">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {testOpen && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40" onClick={() => setTestOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-zinc-100">
                            <h3 className="text-base font-bold text-[#202223]">Test &amp; activate</h3>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                                A successful send verifies Brevo and turns on live email for this account.
                            </p>
                        </div>
                        <div className="px-5 py-4">
                            <label className={labelClass}>Recipient email *</label>
                            <input
                                type="email"
                                className={fieldClass}
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-zinc-100 bg-zinc-50">
                            <button type="button" onClick={() => setTestOpen(false)} className="px-4 py-2.5 text-xs font-bold text-zinc-600 rounded-lg hover:bg-zinc-100">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleTest}
                                disabled={testing}
                                className="px-5 py-2.5 bg-[#008060] hover:bg-[#006e52] disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-wider"
                            >
                                {testing ? 'Sending…' : 'Send test'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailConfigurationTab;
