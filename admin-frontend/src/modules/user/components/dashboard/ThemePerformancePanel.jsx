import React, { useEffect, useState } from 'react';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

/** Wave 6 — theme funnel + version comparison panel */
export default function ThemePerformancePanel({ storeId }) {
    const [themeDays, setThemeDays] = useState(30);
    const [themeAnalytics, setThemeAnalytics] = useState([]);
    const [compare, setCompare] = useState(null);
    const [compareForm, setCompareForm] = useState({ themeId: '', versionA: '', versionB: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const token = localStorage.getItem('merchantToken');
            if (!token || !storeId) return;
            setLoading(true);
            try {
                const themeRes = await fetch(`${STORE_API_URL}/themes/analytics/summary?days=${themeDays}`, {
                    headers: { Authorization: `Bearer ${token}`, 'x-store-id': storeId },
                });
                if (themeRes.ok) {
                    const themeJson = await themeRes.json();
                    const themes = themeJson.themes || [];
                    setThemeAnalytics(themes);
                    if (themes.length >= 1) {
                        const first = themes[0];
                        const versions = [...new Set(themes.filter((t) => t.themeId === first.themeId).map((t) => t.themeVersion))];
                        setCompareForm((prev) => prev.themeId ? prev : {
                            themeId: first.themeId || '',
                            versionA: versions[0] || '',
                            versionB: versions[1] || versions[0] || '',
                        });
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [storeId, themeDays]);

    const runCompare = async () => {
        const token = localStorage.getItem('merchantToken');
        if (!token || !compareForm.themeId || !compareForm.versionA || !compareForm.versionB) return;
        const q = new URLSearchParams({
            themeId: compareForm.themeId,
            versionA: compareForm.versionA,
            versionB: compareForm.versionB,
            days: String(themeDays),
        });
        const res = await fetch(`${STORE_API_URL}/themes/analytics/compare?${q}`, {
            headers: { Authorization: `Bearer ${token}`, 'x-store-id': storeId },
        });
        if (res.ok) setCompare(await res.json());
    };

    const funnelSource = themeAnalytics[0]?.funnel || null;

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Theme Performance</h2>
                <select
                    className="text-xs border border-zinc-200 rounded-lg px-2 py-1.5"
                    value={themeDays}
                    onChange={(e) => setThemeDays(Number(e.target.value))}
                >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                </select>
            </div>
            {loading ? (
                <p className="text-sm text-zinc-500">Loading theme metrics…</p>
            ) : themeAnalytics.length === 0 ? (
                <p className="text-sm text-zinc-500">No theme events yet for this range.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {themeAnalytics.map((t) => (
                        <div key={`${t.themeId}-${t.themeVersion}`} className="border border-zinc-100 rounded-xl p-3 bg-zinc-50/50">
                            <p className="text-sm font-bold text-zinc-900">{t.themeId || 'unknown'} <span className="text-[10px] text-zinc-400">v{t.themeVersion || '-'}</span></p>
                                <dl className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-zinc-600">
                                    <div><dt className="text-zinc-400">Visitors</dt><dd className="font-bold">{t.visitors}</dd></div>
                                    <div><dt className="text-zinc-400">Sessions</dt><dd className="font-bold">{t.sessions ?? 'N/A'}</dd></div>
                                    <div><dt className="text-zinc-400">Product views</dt><dd className="font-bold">{t.productViews}</dd></div>
                                    <div><dt className="text-zinc-400">Add to cart</dt><dd className="font-bold">{t.addToCart}</dd></div>
                                    <div><dt className="text-zinc-400">Checkout</dt><dd className="font-bold">{t.beginCheckout}</dd></div>
                                    <div><dt className="text-zinc-400">Purchases</dt><dd className="font-bold">{t.purchases}</dd></div>
                                    <div><dt className="text-zinc-400">Revenue</dt><dd className="font-bold">{t.revenue != null ? `₹${Number(t.revenue).toLocaleString()}` : 'N/A'}</dd></div>
                                    <div><dt className="text-zinc-400">Conversion</dt><dd className="font-bold">{t.conversionRate}%</dd></div>
                                </dl>
                        </div>
                    ))}
                </div>
            )}

            {funnelSource && (
                <div className="border-t border-zinc-100 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Theme Conversion Funnel</h3>
                    <ol className="space-y-2 text-sm">
                        {[
                            ['Visitors', funnelSource.visitors, null],
                            ['Product Views', funnelSource.productViews, funnelSource.rates?.viewRate],
                            ['Add To Cart', funnelSource.addToCart, funnelSource.rates?.cartRate],
                            ['Checkout', funnelSource.beginCheckout, funnelSource.rates?.checkoutRate],
                            ['Purchase', funnelSource.purchases, funnelSource.rates?.purchaseRate],
                        ].map(([label, count, rate]) => (
                            <li key={label} className="flex items-center justify-between border border-zinc-100 rounded-lg px-3 py-2">
                                <span className="font-semibold text-zinc-800">{label}</span>
                                <span className="text-zinc-600">
                                    {count == null ? 'N/A' : count}
                                    {rate != null ? ` · ${rate}%` : ''}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            <div className="border-t border-zinc-100 pt-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Compare Versions</h3>
                <div className="flex flex-wrap gap-2 items-end">
                    <label className="text-xs">
                        Theme
                        <input className="block mt-1 border border-zinc-200 rounded-lg px-2 py-1.5" value={compareForm.themeId} onChange={(e) => setCompareForm({ ...compareForm, themeId: e.target.value })} />
                    </label>
                    <label className="text-xs">
                        vA
                        <input className="block mt-1 border border-zinc-200 rounded-lg px-2 py-1.5 w-24" value={compareForm.versionA} onChange={(e) => setCompareForm({ ...compareForm, versionA: e.target.value })} />
                    </label>
                    <label className="text-xs">
                        vB
                        <input className="block mt-1 border border-zinc-200 rounded-lg px-2 py-1.5 w-24" value={compareForm.versionB} onChange={(e) => setCompareForm({ ...compareForm, versionB: e.target.value })} />
                    </label>
                    <button type="button" onClick={runCompare} className="px-3 py-1.5 text-xs font-bold bg-zinc-900 text-white rounded-lg">Compare</button>
                </div>
                {compare?.a && compare?.b && (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[10px] uppercase text-zinc-400 border-b">
                                <th className="py-2">Metric</th>
                                <th>v{compare.a.themeVersion}</th>
                                <th>v{compare.b.themeVersion}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['Visitors', 'visitors'],
                                ['Product Views', 'productViews'],
                                ['Add To Cart', 'addToCart'],
                                ['Purchases', 'purchases'],
                                ['Conversion', 'conversionRate'],
                            ].map(([label, key]) => (
                                <tr key={key} className="border-b border-zinc-50">
                                    <td className="py-1.5 font-semibold">{label}</td>
                                    <td>{key === 'conversionRate' ? `${compare.a[key]}%` : compare.a[key]}</td>
                                    <td>{key === 'conversionRate' ? `${compare.b[key]}%` : compare.b[key]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
