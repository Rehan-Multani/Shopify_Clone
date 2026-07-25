import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;
const BILLING_API_URL = import.meta.env.VITE_BILLING_API_URL;
const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL?.replace('/api', '') || 'http://localhost:5000';

const CATEGORIES = [
    'All Themes', 'Free', 'Premium', 'Fashion', 'Electronics', 'Beauty', 'Food',
    'Home & Living', 'Sports', 'Kids', 'Handmade', 'Luxury', 'General Store',
];

const SORT_OPTIONS = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'newest', label: 'Newest' },
    { id: 'free', label: 'Free First' },
    { id: 'premium', label: 'Premium' },
];

const Toast = ({ msg, onDone, type = 'success' }) => {
    useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
    return (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold"
            style={{ background: type === 'error' ? '#EF4444' : '#16A34A' }}>
            {msg}
        </div>
    );
};

const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    if (document.getElementById('razorpay-script')) {
        document.getElementById('razorpay-script').addEventListener('load', () => resolve(true));
        return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
});

export default function ThemesTab() {
    const navigate = useNavigate();
    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';
    const merchantInfo = JSON.parse(localStorage.getItem('merchantInfo') || '{}');

    const [activeTheme, setActiveTheme] = useState(null);
    const [installedThemes, setInstalledThemes] = useState([]);
    const [themeStore, setThemeStore] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All Themes');
    const [sort, setSort] = useState('recommended');
    const [viewTheme, setViewTheme] = useState(null);
    const [publishConfirm, setPublishConfirm] = useState(null);

    const showToast = (msg, type = 'success') => setToast({ msg, type });

    const authHeaders = {
        Authorization: `Bearer ${token}`,
        'x-store-id': storeId,
        'Content-Type': 'application/json',
    };

    const fetchThemeData = async () => {
        try {
            setLoading(true);
            const storeRes = await fetch(`${STORE_API_URL}/stores/${storeId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const storeJson = await storeRes.json();
            if (storeRes.ok && storeJson) {
                const storeObj = storeJson.store || storeJson.data || storeJson;
                if (storeObj) {
                    setActiveTheme(storeObj.activeTheme);
                    setInstalledThemes(storeObj.installedThemes || []);
                }
            }

            const storeThemesRes = await fetch(`${STORE_API_URL}/theme-store`, {
                headers: authHeaders,
            });
            const storeThemesJson = await storeThemesRes.json();
            if (storeThemesRes.ok && storeThemesJson.success) {
                setThemeStore(storeThemesJson.data || []);
            }

            const purchasesRes = await fetch(`${BILLING_API_URL}/themes/purchases`, {
                headers: authHeaders,
            });
            if (purchasesRes.ok) {
                setPurchases(await purchasesRes.json());
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to load theme data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storeId) fetchThemeData();
    }, [storeId]);

    const isPurchased = (themeId) => purchases.some((p) => String(p.themeId) === String(themeId));
    const isInstalled = (themeId) => installedThemes.some((t) => String(t.themeId) === String(themeId));
    const isActive = (themeId) => String(activeTheme?.themeId) === String(themeId);

    const filteredThemes = useMemo(() => {
        let list = [...themeStore];

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((t) =>
                (t.displayName || '').toLowerCase().includes(q) ||
                (t.shortDescription || '').toLowerCase().includes(q) ||
                (t.industry || '').toLowerCase().includes(q) ||
                (t.folder || '').toLowerCase().includes(q)
            );
        }

        if (category === 'Free') list = list.filter((t) => t.type === 'free');
        else if (category === 'Premium') list = list.filter((t) => t.type === 'paid');
        else if (category !== 'All Themes') {
            list = list.filter((t) =>
                (t.industry || '').toLowerCase() === category.toLowerCase() ||
                (t.industry || '').toLowerCase().includes(category.toLowerCase().split(' ')[0].toLowerCase())
            );
        }

        if (sort === 'free') list.sort((a, b) => (a.type === 'free' ? -1 : 1) - (b.type === 'free' ? -1 : 1));
        else if (sort === 'premium') list.sort((a, b) => (a.type === 'paid' ? -1 : 1) - (b.type === 'paid' ? -1 : 1));
        else if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        else if (sort === 'popular') list.sort((a, b) => (b.price || 0) - (a.price || 0));
        else list.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));

        return list;
    }, [themeStore, search, category, sort]);

    const thumbUrl = (theme) => {
        const t = theme?.thumbnail || '';
        if (!t) return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop';
        return t.startsWith('http') ? t : `${ASSETS_BASE_URL}${t}`;
    };

    const handleInstallTheme = async (theme) => {
        try {
            setBusyId(theme._id);
            const res = await fetch(`${STORE_API_URL}/themes/install`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    themeId: theme._id,
                    folder: theme.folder,
                    version: theme.version || '1.0.0',
                }),
            });
            const json = await res.json();
            if (res.ok && json.success) {
                showToast(`"${theme.displayName}" added to library & published`);
                setViewTheme(null);
                fetchThemeData();
            } else if (res.status === 402 || json.code === 'THEME_PURCHASE_REQUIRED') {
                showToast(json.message || 'Purchase required', 'error');
                await handlePurchaseTheme(theme);
            } else {
                showToast(json.message || 'Install failed', 'error');
            }
        } catch {
            showToast('Network error installing theme', 'error');
        } finally {
            setBusyId(null);
        }
    };

    const handlePurchaseTheme = async (theme) => {
        try {
            setBusyId(theme._id);
            const ready = await loadRazorpay();
            if (!ready) {
                showToast('Failed to load payment gateway', 'error');
                return;
            }

            const orderRes = await fetch(`${BILLING_API_URL}/themes/create-order`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ themeId: theme._id, storeId }),
            });
            const orderData = await orderRes.json();

            if (orderData.alreadyPurchased) {
                showToast('Theme already purchased — installing…');
                await handleInstallTheme(theme);
                return;
            }
            if (!orderRes.ok) {
                showToast(orderData.message || 'Failed to start purchase', 'error');
                return;
            }

            const paymentObject = new window.Razorpay({
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Storify Theme Store',
                description: `Premium theme: ${orderData.themeName}`,
                order_id: orderData.orderId,
                handler: async (response) => {
                    const verifyRes = await fetch(`${BILLING_API_URL}/themes/verify`, {
                        method: 'POST',
                        headers: authHeaders,
                        body: JSON.stringify({
                            ...response,
                            themeId: theme._id,
                            storeId,
                        }),
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyRes.ok) {
                        showToast('Purchase successful! Adding to library…');
                        await fetchThemeData();
                        await handleInstallTheme(theme);
                    } else {
                        showToast(verifyData.message || 'Payment verification failed', 'error');
                    }
                },
                prefill: {
                    name: merchantInfo.name || '',
                    email: merchantInfo.email || '',
                    contact: merchantInfo.mobile || '',
                },
                theme: { color: '#059669' },
            });
            paymentObject.open();
        } catch (err) {
            showToast('Purchase failed. Please try again.', 'error');
        } finally {
            setBusyId(null);
        }
    };

    const confirmPublish = async (theme) => {
        setPublishConfirm(null);
        await handleInstallTheme(theme);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const liveDetails = themeStore.find((t) => t.folder === activeTheme?.folder) || activeTheme;
    const libraryThemes = installedThemes.map((inst) => {
        const details = themeStore.find((t) => String(t._id) === String(inst.themeId) || t.folder === inst.folder);
        return { ...inst, details };
    });

    return (
        <div className="space-y-8 pb-10">
            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-950">Theme Store</h1>
                    <p className="text-sm text-zinc-500 mt-1">Choose a design that matches your brand</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {themeStore.filter((t) => t.type === 'free').length} Free
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                        {themeStore.filter((t) => t.type === 'paid').length} Premium
                    </span>
                </div>
            </div>

            {/* Live / Library */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Theme Library</h2>
                {activeTheme?.themeId ? (
                    <div className="flex flex-col lg:flex-row gap-5 mb-6 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                        <div className="w-full lg:w-56 h-36 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                            <img src={thumbUrl(liveDetails)} alt="" className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop'; }} />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">LIVE</span>
                                    <h3 className="text-lg font-bold text-zinc-900">{liveDetails?.displayName || activeTheme.folder}</h3>
                                </div>
                                <p className="text-xs text-zinc-500">{liveDetails?.shortDescription}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <button onClick={() => navigate(`/dashboard/theme-customizer?themeId=${activeTheme.themeId}`)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">Customize</button>
                                <a href={`/store/${storeId}?themeId=${activeTheme.themeId}`} target="_blank" rel="noreferrer"
                                    className="px-4 py-2 border border-zinc-200 bg-white text-zinc-700 rounded-xl text-xs font-semibold">Preview</a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-zinc-500 mb-4">No live theme yet — pick one from the store below.</p>
                )}

                {libraryThemes.filter((t) => !isActive(t.themeId)).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {libraryThemes.filter((t) => !isActive(t.themeId)).map((theme) => (
                            <div key={theme.themeId} className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                                <div className="h-28 bg-zinc-100">
                                    <img src={thumbUrl(theme.details)} alt="" className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop'; }} />
                                </div>
                                <div className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">INSTALLED</span>
                                        <h4 className="text-sm font-bold text-zinc-900">{theme.details?.displayName || theme.folder}</h4>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => setPublishConfirm(theme.details || theme)}
                                            className="flex-1 py-1.5 text-[11px] font-bold border border-zinc-200 rounded-lg hover:bg-emerald-50">Publish</button>
                                        <button onClick={() => navigate(`/dashboard/theme-customizer?themeId=${theme.themeId}`)}
                                            className="flex-1 py-1.5 text-[11px] font-bold bg-zinc-900 text-white rounded-lg">Customize</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search themes..."
                            className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                    </div>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}
                        className="px-3 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold bg-white">
                        {SORT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                </div>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                        <button key={c} onClick={() => setCategory(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                category === c
                                    ? 'bg-zinc-900 text-white border-zinc-900'
                                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                            }`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Theme cards */}
            {filteredThemes.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
                    <p className="text-zinc-500 text-sm font-medium">No themes match your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredThemes.map((theme) => {
                        const purchased = isPurchased(theme._id);
                        const installed = isInstalled(theme._id);
                        const active = isActive(theme._id);
                        const premium = theme.type === 'paid';

                        return (
                            <div key={theme._id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                                <div className="h-48 bg-zinc-100 relative overflow-hidden">
                                    <img src={thumbUrl(theme)} alt={theme.displayName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop'; }} />
                                    <div className="absolute top-3 right-3 flex gap-1.5">
                                        {active && <span className="px-2 py-0.5 text-[9px] font-bold text-white bg-emerald-500 rounded-md">LIVE</span>}
                                        <span className={`px-2 py-0.5 text-[9px] font-bold text-white rounded-md ${premium ? 'bg-amber-500' : 'bg-zinc-950'}`}>
                                            {premium ? `₹${theme.price}` : 'FREE'}
                                        </span>
                                    </div>
                                    {premium && (
                                        <div className="absolute top-3 left-3">
                                            <span className="px-2 py-0.5 text-[9px] font-bold text-amber-950 bg-amber-300 rounded-md">PREMIUM</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-zinc-900 text-lg">{theme.displayName}</h3>
                                    <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 mb-2">
                                        {theme.industry} • {premium ? 'Premium' : 'Free'}
                                    </p>
                                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed flex-1">{theme.shortDescription}</p>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <a href={`/store/${storeId}?themeId=${theme._id}&folder=${theme.folder}`} target="_blank" rel="noreferrer"
                                            className="px-3 py-2 border border-zinc-200 rounded-xl text-[11px] font-bold text-zinc-700 hover:bg-zinc-50">
                                            Live Preview
                                        </a>
                                        <button onClick={() => setViewTheme(theme)}
                                            className="px-3 py-2 border border-zinc-200 rounded-xl text-[11px] font-bold text-zinc-700 hover:bg-zinc-50">
                                            View Details
                                        </button>
                                        {active ? (
                                            <button onClick={() => navigate(`/dashboard/theme-customizer?themeId=${theme._id}`)}
                                                className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-xl text-[11px] font-bold">
                                                Customize
                                            </button>
                                        ) : premium && !purchased && !installed ? (
                                            <button onClick={() => handlePurchaseTheme(theme)} disabled={busyId === theme._id}
                                                className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold disabled:opacity-50">
                                                {busyId === theme._id ? '…' : `Purchase ₹${theme.price}`}
                                            </button>
                                        ) : (
                                            <button onClick={() => (installed ? setPublishConfirm(theme) : handleInstallTheme(theme))}
                                                disabled={busyId === theme._id}
                                                className="flex-1 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-[11px] font-bold disabled:opacity-50">
                                                {busyId === theme._id ? '…' : installed ? 'Publish' : 'Add to Library'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Details modal */}
            {viewTheme && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
                    onClick={(e) => e.target === e.currentTarget && setViewTheme(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="h-52 bg-zinc-100">
                            <img src={thumbUrl(viewTheme)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900">{viewTheme.displayName}</h3>
                                    <p className="text-xs text-zinc-400 font-bold uppercase mt-1">{viewTheme.industry}</p>
                                </div>
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${viewTheme.type === 'paid' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-700'}`}>
                                    {viewTheme.type === 'paid' ? `Premium · ₹${viewTheme.price}` : 'Free'}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-600 leading-relaxed">{viewTheme.shortDescription}</p>
                            {viewTheme.features?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {viewTheme.features.map((f) => (
                                        <span key={f} className="px-2 py-1 text-[10px] font-semibold bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-600">{f}</span>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setViewTheme(null)} className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold">Close</button>
                                {viewTheme.type === 'paid' && !isPurchased(viewTheme._id) && !isInstalled(viewTheme._id) ? (
                                    <button onClick={() => { setViewTheme(null); handlePurchaseTheme(viewTheme); }}
                                        className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold">Purchase</button>
                                ) : (
                                    <button onClick={() => { setViewTheme(null); handleInstallTheme(viewTheme); }}
                                        className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold">
                                        {isActive(viewTheme._id) ? 'Customize' : 'Add to Library'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Publish confirm */}
            {publishConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
                    onClick={(e) => e.target === e.currentTarget && setPublishConfirm(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-zinc-900">Publish this theme?</h3>
                        <p className="text-sm text-zinc-500">Your current live theme will be replaced by <strong>{publishConfirm.displayName || publishConfirm.folder}</strong>.</p>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setPublishConfirm(null)} className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold">Cancel</button>
                            <button onClick={() => confirmPublish(publishConfirm)} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold">Publish Theme</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
