import React, { useState, useEffect } from 'react';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

const DomainsTab = () => {
    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    const [domain, setDomain] = useState('');
    const [savedDomain, setSavedDomain] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [checking, setChecking] = useState(false);
    const [dnsResult, setDnsResult] = useState(null);
    const [showInstructions, setShowInstructions] = useState(false);
    const [expectedIP, setExpectedIP] = useState('76.76.21.21');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };


    useEffect(() => {
        // Reset states to prevent data leakage between stores
        setDomain('');
        setSavedDomain('');
        setDnsResult(null);
        setChecking(false);

        const fetchStoreDomain = async () => {
            if (!storeId || !token) {
                setLoading(false);
                return;
            }
            try {
                // Fetch expected IP
                try {
                    const ipRes = await fetch(`${STORE_API_URL}/stores/domain/expected-ip`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (ipRes.ok) {
                        const ipData = await ipRes.json();
                        if (ipData && ipData.expectedIP) {
                            setExpectedIP(ipData.expectedIP);
                        }
                    }
                } catch (ipErr) {
                    console.error('Error fetching expected IP:', ipErr);
                }

                const res = await fetch(`${STORE_API_URL}/stores/${storeId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.customDomain) {
                        setSavedDomain(data.customDomain);
                        setDomain(data.customDomain);
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

        // Basic domain validation regex
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
                showToast('Custom domain saved successfully!', 'success');
                verifyDNS(cleanDomain);
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
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setDnsResult(data);
                if (data.resolved && data.isLinked) {
                    showToast('DNS verification successful!', 'success');
                } else if (data.resolved) {
                    showToast('DNS configured incorrectly. See instructions.', 'error');
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
                        <p className="text-xs text-gray-500 font-medium">Link and verify custom domains to point to your online storefront</p>
                    </div>
                </div>
            </div>

            {/* Custom Domain Input */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Configure Domain</h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-grow space-y-1.5 w-full">
                        <div className="flex items-center gap-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase">Your Custom Domain</label>
                            {dnsResult?.isLinked && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Connected & Active
                                </span>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="e.g. www.mycustombrand.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleSaveDomain}
                            disabled={saving}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {saving ? 'Saving...' : 'Connect Domain'}
                        </button>
                        {savedDomain && (
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

            {/* DNS Instructions & Verification Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Setup steps */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6 lg:col-span-7">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">DNS Setup Instructions</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                        Login to your domain registrar dashboard (like GoDaddy, Namecheap, Google Domains) and update your DNS records to point to our servers:
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
                        <p>
                            DNS changes can take anywhere from a few minutes up to 24-48 hours to propagate worldwide. If verification fails initially, please check back after some time.
                        </p>
                    </div>
                </div>

                {/* Verification Status */}
                {savedDomain ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6 lg:col-span-5 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">DNS Status</h3>
                                <button
                                    onClick={() => verifyDNS(savedDomain)}
                                    disabled={checking}
                                    className="text-xs font-bold text-emerald-700 hover:underline disabled:opacity-50"
                                >
                                    {checking ? 'Checking...' : 'Refresh Status'}
                                </button>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border">
                                <div className="space-y-1">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Target Domain</span>
                                    <span className="block text-sm font-black text-gray-800">{savedDomain}</span>
                                </div>
                            </div>

                            {/* Status logic */}
                            {dnsResult && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    {!dnsResult.resolved ? (
                                        <div className="p-4 bg-gray-100 text-gray-700 rounded-xl border border-gray-200 text-xs space-y-2">
                                            <div className="flex items-center gap-2 font-black text-red-600">
                                                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                                                Unresolved / DNS Propagation Incomplete
                                            </div>
                                            <p className="font-semibold text-gray-500">
                                                The domain name could not be resolved to any IP address. Please check your domain registrar and ensure the A record is entered correctly.
                                            </p>
                                        </div>
                                    ) : dnsResult.isLinked ? (
                                        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs space-y-2">
                                            <div className="flex items-center gap-2 font-black text-emerald-700">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                                DNS Verified & Linked Successfully
                                            </div>
                                            <p className="font-semibold">
                                                Everything looks perfect! The domain correctly points to our server IP: <strong className="font-mono text-emerald-700">{dnsResult.expectedIP}</strong>.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs space-y-3">
                                            <div className="flex items-center gap-2 font-black text-red-700">
                                                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                                IP Mismatch / Incorrect Routing
                                            </div>
                                            <p className="font-semibold text-red-600/90 leading-relaxed">
                                                Your domain currently points to an incorrect server. You must update your DNS A-Record to point to the correct IP.
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

                            {!dnsResult && !checking && (
                                <div className="text-center py-8 text-xs text-gray-400 font-bold">
                                    Click "Refresh Status" to test DNS records.
                                </div>
                            )}

                            {checking && (
                                <div className="text-center py-8 text-xs text-gray-400 font-bold flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                                    Resolving DNS records...
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-6 md:p-8 lg:col-span-5 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <p className="text-xs font-bold text-[#202223]">No Domain Connected Yet</p>
                        <p className="text-[11px] text-gray-500 font-medium max-w-[200px] leading-relaxed">
                            Enter your custom domain above and click "Connect Domain" to test and verify status.
                        </p>
                    </div>
                )}
            </div>

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
