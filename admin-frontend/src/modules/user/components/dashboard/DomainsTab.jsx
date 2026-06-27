import React, { useState, useEffect } from 'react';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

const DomainsTab = () => {
    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    const [domain, setDomain] = useState('');
    const [savedDomain, setSavedDomain] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [checking, setChecking] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [dnsResult, setDnsResult] = useState(null);
    const [expectedIP, setExpectedIP] = useState('76.76.21.21');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    useEffect(() => {
        setDomain('');
        setSavedDomain('');
        setDnsResult(null);
        setChecking(false);
        setIsPublished(false);

        const fetchStoreDomain = async () => {
            if (!storeId || !token) {
                setLoading(false);
                return;
            }
            try {
                // Fetch expected IP
                try {
                    const ipRes = await fetch(`${STORE_API_URL}/stores/domain/expected-ip`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (ipRes.ok) {
                        const ipData = await ipRes.json();
                        if (ipData?.expectedIP) setExpectedIP(ipData.expectedIP);
                    }
                } catch (ipErr) {
                    console.error('Error fetching expected IP:', ipErr);
                }

                const res = await fetch(`${STORE_API_URL}/stores/${storeId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.customDomain) {
                        setSavedDomain(data.customDomain);
                        setDomain(data.customDomain);
                        setIsPublished(!!data.domainPublished);
                        verifyDNS(data.customDomain);
                    }
                }
            } catch (err) {
                console.error('Error fetching store domain:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStoreDomain();

        return () => {
            setDomain('');
            setSavedDomain('');
            setDnsResult(null);
            setChecking(false);
        };
    }, [storeId, token]);

    const handleSaveDomain = async () => {
        if (!domain.trim()) {
            showToast('Please enter a valid domain name.', 'error');
            return;
        }

        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
        const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split(':')[0].trim().toLowerCase();

        if (!domainRegex.test(cleanDomain)) {
            showToast('Please enter a valid domain (e.g., mystore.com).', 'error');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`${STORE_API_URL}/stores/${storeId}/domain`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ customDomain: cleanDomain })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSavedDomain(cleanDomain);
                setDomain(cleanDomain);
                setIsPublished(false); // Reset — need to re-verify and re-publish
                setDnsResult(null);
                showToast('Domain saved! Now check DNS to verify.', 'success');
            } else {
                showToast(data.message || 'Failed to save domain.', 'error');
            }
        } catch (err) {
            console.error('Error saving domain:', err);
            showToast('Failed to save domain.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnectDomain = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${STORE_API_URL}/stores/${storeId}/domain`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ customDomain: '' })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSavedDomain('');
                setDomain('');
                setDnsResult(null);
                setIsPublished(false);
                showToast('Domain disconnected successfully!', 'success');
            } else {
                showToast(data.message || 'Failed to disconnect domain.', 'error');
            }
        } catch (err) {
            console.error('Error disconnecting domain:', err);
            showToast('Failed to disconnect domain.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const verifyDNS = async (domainToCheck) => {
        setChecking(true);
        setDnsResult(null);
        try {
            const res = await fetch(`${STORE_API_URL}/stores/domain/dns-check?domain=${domainToCheck}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setDnsResult(data);
                if (data.resolved && data.isLinked) {
                    showToast('DNS verified successfully! You can now publish.', 'success');
                } else if (data.resolved) {
                    showToast('DNS points to wrong IP. Check instructions.', 'error');
                } else {
                    showToast('Domain could not be resolved.', 'error');
                }
            }
        } catch (err) {
            console.error('Error verifying DNS:', err);
            showToast('DNS check failed.', 'error');
        } finally {
            setChecking(false);
        }
    };

    const handlePublish = async () => {
        setPublishing(true);
        console.log(`[Frontend Publish] Triggering publish for storeId=${storeId} to target=${STORE_API_URL}/stores/${storeId}/domain/publish`);
        try {
            const res = await fetch(`${STORE_API_URL}/stores/${storeId}/domain/publish`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(`[Frontend Publish] HTTP Status received: ${res.status}`);
            const data = await res.json();
            console.log(`[Frontend Publish] Response body payload:`, data);
            
            if (res.ok && data.success) {
                setIsPublished(true);
                showToast(`🎉 Store is now LIVE on ${savedDomain}!`, 'success');
            } else {
                showToast(data.message || 'Failed to publish.', 'error');
            }
        } catch (err) {
            console.error('[Frontend Publish Exception] Details:', err);
            showToast('Failed to publish store.', 'error');
        } finally {
            setPublishing(false);
        }
    };

    const handleUnpublish = async () => {
        setPublishing(true);
        try {
            const res = await fetch(`${STORE_API_URL}/stores/${storeId}/domain/unpublish`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setIsPublished(false);
                showToast('Store unpublished from custom domain.', 'success');
            } else {
                showToast(data.message || 'Failed to unpublish.', 'error');
            }
        } catch (err) {
            console.error('Error unpublishing domain:', err);
            showToast('Failed to unpublish store.', 'error');
        } finally {
            setPublishing(false);
        }
    };

    // Derived states for UI flow
    const isDnsVerified = dnsResult?.resolved && dnsResult?.isLinked;
    const canPublish = savedDomain && isDnsVerified && !isPublished;
    const domainChanged = savedDomain && domain !== savedDomain;

    // Current step in the flow
    const getCurrentStep = () => {
        if (!savedDomain) return 1; // Enter domain
        if (!dnsResult && !checking) return 2; // Check DNS
        if (checking) return 2; // Checking...
        if (!isDnsVerified) return 2; // DNS failed — retry
        if (!isPublished) return 3; // Publish
        return 4; // Published / Live
    };
    const currentStep = getCurrentStep();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008060]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-[#202223] tracking-tight">Domains</h1>
                        <p className="text-xs text-gray-500 font-medium">Connect a custom domain and publish your storefront</p>
                    </div>
                </div>
                {isPublished && savedDomain && (
                    <a
                        href={`http://${savedDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-all"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Visit {savedDomain}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                )}
            </div>

            {/* ── STEP PROGRESS BAR ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between relative">
                    {/* Connector line */}
                    <div className="absolute top-5 left-[calc(16.66%)] right-[calc(16.66%)] h-0.5 bg-gray-200 z-0"></div>
                    <div className="absolute top-5 left-[calc(16.66%)] h-0.5 bg-emerald-500 z-[1] transition-all duration-500"
                        style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%', maxWidth: '66.66%' }}
                    ></div>

                    {[
                        { num: 1, label: 'Connect Domain', icon: '🔗' },
                        { num: 2, label: 'Verify DNS', icon: '🔍' },
                        { num: 3, label: 'Publish', icon: '🚀' }
                    ].map((step) => (
                        <div key={step.num} className="flex flex-col items-center relative z-10 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 
                                ${currentStep > step.num
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                    : currentStep === step.num
                                        ? 'bg-gray-900 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                                }`}
                            >
                                {currentStep > step.num ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <span>{step.icon}</span>
                                )}
                            </div>
                            <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${currentStep >= step.num ? 'text-gray-800' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── STEP 1: ENTER DOMAIN ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Step 1 — Connect Domain</h3>
                    {savedDomain && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">✓ Connected</span>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-grow space-y-1.5 w-full">
                        <label className="block text-xs font-bold text-gray-700 uppercase">Your Custom Domain</label>
                        <input
                            type="text"
                            placeholder="e.g. fashion.cloudedata.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            disabled={isPublished}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {(!savedDomain || domainChanged) && (
                            <button
                                onClick={handleSaveDomain}
                                disabled={saving || isPublished}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                            >
                                {saving ? (
                                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Saving...</>
                                ) : (
                                    'Connect Domain'
                                )}
                            </button>
                        )}
                        {savedDomain && !domainChanged && (
                            <button
                                onClick={handleDisconnectDomain}
                                disabled={saving}
                                className="flex-1 sm:flex-none px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── STEP 2: DNS VERIFICATION ── */}
            {savedDomain && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* DNS Instructions */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6 lg:col-span-7">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Step 2 — DNS Setup</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                            Go to your domain registrar (GoDaddy, Namecheap, Cloudflare) and add this A-record:
                        </p>

                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner">
                            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Name / Host</th>
                                        <th className="px-4 py-3">Points To</th>
                                        <th className="px-4 py-3">TTL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 font-semibold text-gray-700 bg-white">
                                    <tr>
                                        <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-black">A</span></td>
                                        <td className="px-4 py-3">@</td>
                                        <td className="px-4 py-3 font-mono text-emerald-700">{dnsResult?.expectedIP || expectedIP}</td>
                                        <td className="px-4 py-3">Automatic / 3600</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 text-xs font-semibold leading-relaxed">
                            <span className="text-base">⚠️</span>
                            <p>DNS changes can take up to 24-48 hours to propagate. If verification fails, try again later.</p>
                        </div>
                    </div>

                    {/* DNS Status + Actions */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-5 lg:col-span-5 flex flex-col">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">DNS Status</h3>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border">
                            <div className="space-y-1">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase">Target Domain</span>
                                <span className="block text-sm font-black text-gray-800">{savedDomain}</span>
                            </div>
                        </div>

                        {/* Check DNS Button */}
                        <button
                            onClick={() => verifyDNS(savedDomain)}
                            disabled={checking}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {checking ? (
                                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Checking DNS...</>
                            ) : (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Check DNS</>
                            )}
                        </button>

                        {/* DNS Result */}
                        {dnsResult && (
                            <div className="animate-in fade-in duration-200">
                                {!dnsResult.resolved ? (
                                    <div className="p-4 bg-gray-100 text-gray-700 rounded-xl border border-gray-200 text-xs space-y-2">
                                        <div className="flex items-center gap-2 font-black text-red-600">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                                            Unresolved / DNS Propagation Incomplete
                                        </div>
                                        <p className="font-semibold text-gray-500">
                                            Domain could not be resolved. Please check your registrar and ensure the A record is entered correctly.
                                        </p>
                                    </div>
                                ) : dnsResult.isLinked ? (
                                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs space-y-2">
                                        <div className="flex items-center gap-2 font-black text-emerald-700">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                            DNS Verified ✓
                                        </div>
                                        <p className="font-semibold">
                                            Domain correctly points to <strong className="font-mono text-emerald-700">{dnsResult.expectedIP}</strong>. Ready to publish!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs space-y-3">
                                        <div className="flex items-center gap-2 font-black text-red-700">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                            IP Mismatch
                                        </div>
                                        <p className="font-semibold text-red-600/90 leading-relaxed">
                                            Domain points to the wrong IP. Update your DNS A-Record.
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                                            <div className="p-2 bg-white rounded border">
                                                <span className="block text-gray-400 font-bold uppercase">Current IP</span>
                                                <span className="font-mono text-red-600 block mt-0.5">{dnsResult.addresses.join(', ')}</span>
                                            </div>
                                            <div className="p-2 bg-white rounded border">
                                                <span className="block text-gray-400 font-bold uppercase">Expected IP</span>
                                                <span className="font-mono text-emerald-600 block mt-0.5">{dnsResult.expectedIP}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Spacer */}
                        <div className="flex-grow"></div>

                        {/* ── STEP 3: PUBLISH BUTTON ── */}
                        {canPublish && (
                            <button
                                onClick={handlePublish}
                                disabled={publishing}
                                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {publishing ? (
                                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Publishing...</>
                                ) : (
                                    <>🚀 Publish Store</>
                                )}
                            </button>
                        )}

                        {/* Already Published */}
                        {isPublished && (
                            <div className="space-y-3">
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-black text-sm mb-1">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        LIVE
                                    </div>
                                    <p className="text-xs text-emerald-600 font-semibold">
                                        Your store is live at <a href={`http://${savedDomain}`} target="_blank" rel="noopener noreferrer" className="underline font-bold">{savedDomain}</a>
                                    </p>
                                </div>
                                <button
                                    onClick={handleUnpublish}
                                    disabled={publishing}
                                    className="w-full py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {publishing ? 'Processing...' : 'Unpublish Store'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* No Domain Connected placeholder */}
            {!savedDomain && (
                <div className="bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-10 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">🌐</div>
                    <p className="text-sm font-bold text-[#202223]">No Domain Connected</p>
                    <p className="text-xs text-gray-500 font-medium max-w-xs leading-relaxed">
                        Enter your custom domain above and click "Connect Domain" to get started. After DNS verification, you'll be able to publish your store.
                    </p>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-5 right-5 z-[100] animate-in slide-in-from-bottom-5 duration-300">
                    <div className={`px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-white font-bold text-sm
                        ${toast.type === 'success' ? 'bg-[#008060]' : 'bg-red-600'}`}
                    >
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        )}
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DomainsTab;
