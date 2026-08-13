import React, { useCallback, useEffect, useMemo, useState } from 'react';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

const emptyVariant = (key, weight) => ({
    key,
    label: key === 'A' ? 'Control' : `Variant ${key}`,
    themeId: '',
    themeFolder: '',
    themeVersion: '',
    weight,
});

export default function ExperimentsTab() {
    const storeId = localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';
    const [list, setList] = useState([]);
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [selectedId, setSelectedId] = useState('');
    const [results, setResults] = useState(null);
    const [form, setForm] = useState({
        name: '',
        variants: [emptyVariant('A', 50), emptyVariant('B', 50)],
        startAt: '',
        endAt: '',
        startMode: 'now', // now | schedule
    });

    const headers = useMemo(() => ({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-store-id': storeId,
    }), [token, storeId]);

    const load = useCallback(async () => {
        if (!storeId || !token) return;
        setLoading(true);
        setError('');
        try {
            const [expRes, storeRes] = await Promise.all([
                fetch(`${STORE_API_URL}/themes/experiments`, { headers }),
                fetch(`${STORE_API_URL}/stores/${storeId}`, { headers }),
            ]);
            const expJson = await expRes.json();
            const storeJson = await storeRes.json();
            if (!expRes.ok) throw new Error(expJson.message || 'Failed to load experiments');
            setList(expJson.data || []);
            setThemes(storeJson.installedThemes || []);
        } catch (err) {
            setError(err.message || 'Load failed');
        } finally {
            setLoading(false);
        }
    }, [storeId, token, headers]);

    useEffect(() => { load(); }, [load]);

    const weightTotal = form.variants.reduce((s, v) => s + (Number(v.weight) || 0), 0);

    const applyThemeToVariant = (index, themeId) => {
        const t = themes.find((x) => String(x.themeId) === String(themeId));
        setForm((prev) => {
            const variants = [...prev.variants];
            variants[index] = {
                ...variants[index],
                themeId: t?.themeId || themeId,
                themeFolder: t?.folder || '',
                themeVersion: t?.version || t?.publishedThemeSettings?.themeVersion || '1.0.0',
            };
            return { ...prev, variants };
        });
    };

    const create = async () => {
        if (weightTotal !== 100) {
            setError('Traffic allocation must total 100%');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const body = {
                name: form.name,
                variants: form.variants,
                status: form.startMode === 'schedule' ? 'scheduled' : 'draft',
                startAt: form.startMode === 'schedule' ? form.startAt : undefined,
                endAt: form.endAt || undefined,
            };
            const res = await fetch(`${STORE_API_URL}/themes/experiments`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Create failed');
            setShowCreate(false);
            setStep(0);
            setForm({
                name: '',
                variants: [emptyVariant('A', 50), emptyVariant('B', 50)],
                startAt: '',
                endAt: '',
                startMode: 'now',
            });
            await load();
            if (form.startMode === 'now') {
                await transition(json.data._id, 'running');
            }
        } catch (err) {
            setError(err.message || 'Create failed');
        } finally {
            setSaving(false);
        }
    };

    const transition = async (id, status) => {
        setError('');
        try {
            const res = await fetch(`${STORE_API_URL}/themes/experiments/${id}/transition`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ status }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Transition failed');
            await load();
            if (selectedId === id) await loadResults(id);
        } catch (err) {
            setError(err.message || 'Transition failed');
        }
    };

    const loadResults = async (id) => {
        setSelectedId(id);
        setResults(null);
        try {
            const res = await fetch(`${STORE_API_URL}/themes/experiments/${id}/results`, { headers });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Results failed');
            setResults(json);
        } catch (err) {
            setError(err.message || 'Results failed');
        }
    };

    const applyWinner = async (id, variantKey) => {
        setError('');
        try {
            const res = await fetch(`${STORE_API_URL}/themes/experiments/${id}/apply-winner`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ variantKey }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Apply failed');
            setError('');
            alert(json.message || 'Winner applied to draft. Publish when ready.');
        } catch (err) {
            setError(err.message || 'Apply winner failed');
        }
    };

    if (loading) {
        return <div className="py-20 text-center text-sm text-zinc-500">Loading experiments…</div>;
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Theme Experiments</h1>
                    <p className="text-sm text-zinc-500 mt-1">A/B presentation tests only — never changes products, prices, or checkout.</p>
                </div>
                <button
                    type="button"
                    onClick={() => { setShowCreate(true); setStep(0); }}
                    className="px-4 py-2 text-sm font-bold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
                >
                    + Create Experiment
                </button>
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
            )}

            {showCreate && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700">
                            Create · Step {step + 1}/5
                        </h2>
                        <button type="button" className="text-xs text-zinc-500" onClick={() => setShowCreate(false)}>Cancel</button>
                    </div>

                    {step === 0 && (
                        <label className="block text-sm">
                            <span className="font-semibold text-zinc-700">Name</span>
                            <input
                                className="mt-1 w-full border border-zinc-200 rounded-xl px-3 py-2"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Homepage Theme Test"
                            />
                        </label>
                    )}

                    {step === 1 && (
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-zinc-700">Select control & variant themes</p>
                            {form.variants.map((v, i) => (
                                <div key={v.key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end border border-zinc-100 rounded-xl p-3">
                                    <div>
                                        <p className="text-[11px] uppercase text-zinc-400 font-bold">{v.label || v.key}</p>
                                        <select
                                            className="mt-1 w-full border border-zinc-200 rounded-lg px-2 py-2 text-sm"
                                            value={v.themeId}
                                            onChange={(e) => applyThemeToVariant(i, e.target.value)}
                                        >
                                            <option value="">Select installed theme</option>
                                            {themes.map((t) => (
                                                <option key={t.themeId} value={t.themeId}>
                                                    {t.folder || t.themeId} · v{t.version || t.publishedThemeSettings?.themeVersion || '1.0.0'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="text-xs text-zinc-500 md:col-span-2">
                                        {v.themeFolder ? `${v.themeFolder} @ ${v.themeVersion}` : 'Pick a theme version'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-zinc-700">Traffic allocation (must total 100%)</p>
                            {form.variants.map((v, i) => (
                                <label key={v.key} className="flex items-center gap-3 text-sm">
                                    <span className="w-24 font-bold text-zinc-700">{v.label || v.key}</span>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        className="w-24 border border-zinc-200 rounded-lg px-2 py-1.5"
                                        value={v.weight}
                                        onChange={(e) => {
                                            const variants = [...form.variants];
                                            variants[i] = { ...variants[i], weight: Number(e.target.value) };
                                            setForm({ ...form, variants });
                                        }}
                                    />
                                    <span className="text-zinc-400">%</span>
                                </label>
                            ))}
                            <p className={`text-xs font-bold ${weightTotal === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                Total: {weightTotal}%
                            </p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-3 text-sm">
                            <p className="font-semibold text-zinc-700">Schedule</p>
                            <div className="flex gap-2">
                                {['now', 'schedule'].map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setForm({ ...form, startMode: m })}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${form.startMode === m ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200'}`}
                                    >
                                        {m === 'now' ? 'Start after create' : 'Schedule'}
                                    </button>
                                ))}
                            </div>
                            {form.startMode === 'schedule' && (
                                <label className="block">
                                    Start at
                                    <input type="datetime-local" className="mt-1 w-full border border-zinc-200 rounded-xl px-3 py-2" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
                                </label>
                            )}
                            <label className="block">
                                End at (optional)
                                <input type="datetime-local" className="mt-1 w-full border border-zinc-200 rounded-xl px-3 py-2" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
                            </label>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-sm space-y-2 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                            <p><span className="text-zinc-400">Name:</span> <strong>{form.name || '—'}</strong></p>
                            {form.variants.map((v) => (
                                <p key={v.key}>{v.label}: {v.themeFolder || v.themeId || '—'} v{v.themeVersion || '—'} · {v.weight}%</p>
                            ))}
                            <p className="text-xs text-zinc-500">Variants only change theme presentation.</p>
                        </div>
                    )}

                    <div className="flex justify-between pt-2">
                        <button type="button" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="px-3 py-1.5 text-xs font-bold border border-zinc-200 rounded-lg disabled:opacity-40">Back</button>
                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={() => setStep((s) => s + 1)}
                                disabled={(step === 0 && !form.name) || (step === 1 && form.variants.some((v) => !v.themeId)) || (step === 2 && weightTotal !== 100)}
                                className="px-3 py-1.5 text-xs font-bold bg-zinc-900 text-white rounded-lg disabled:opacity-40"
                            >
                                Next
                            </button>
                        ) : (
                            <button type="button" disabled={saving} onClick={create} className="px-3 py-1.5 text-xs font-bold bg-[#008060] text-white rounded-lg disabled:opacity-40">
                                {saving ? 'Saving…' : form.startMode === 'now' ? 'Start Experiment' : 'Create Scheduled'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Active & recent</h2>
                {list.length === 0 && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-sm text-zinc-500">No experiments yet.</div>
                )}
                {list.map((exp) => {
                    const control = exp.variants?.[0];
                    const variant = exp.variants?.[1];
                    return (
                        <div key={exp._id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900">{exp.name}</h3>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Control: {control?.themeFolder || control?.themeId} v{control?.themeVersion} · Variant: {variant?.themeFolder || variant?.themeId} v{variant?.themeVersion}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Traffic: {(exp.variants || []).map((v) => `${v.weight}%`).join(' / ')}
                                    </p>
                                    <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-zinc-700">
                                        Status: <span className="text-[#008060]">{String(exp.status || '').toUpperCase()}</span>
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => loadResults(exp._id)} className="px-3 py-1.5 text-xs font-bold border border-zinc-200 rounded-lg hover:bg-zinc-50">View Results</button>
                                    {exp.status === 'draft' || exp.status === 'scheduled' || exp.status === 'paused' ? (
                                        <button type="button" onClick={() => transition(exp._id, 'running')} className="px-3 py-1.5 text-xs font-bold bg-zinc-900 text-white rounded-lg">Start</button>
                                    ) : null}
                                    {exp.status === 'running' ? (
                                        <button type="button" onClick={() => transition(exp._id, 'paused')} className="px-3 py-1.5 text-xs font-bold border border-zinc-200 rounded-lg">Pause</button>
                                    ) : null}
                                    {['running', 'paused'].includes(exp.status) ? (
                                        <button type="button" onClick={() => transition(exp._id, 'completed')} className="px-3 py-1.5 text-xs font-bold border border-zinc-200 rounded-lg">Complete</button>
                                    ) : null}
                                    {!['completed', 'cancelled', 'ended'].includes(exp.status) ? (
                                        <button type="button" onClick={() => transition(exp._id, 'cancelled')} className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-100 rounded-lg">Stop</button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {results && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider">Experiment Details · {results.experiment?.name}</h2>
                        <button type="button" className="text-xs text-zinc-500" onClick={() => setResults(null)}>Close</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><p className="text-[10px] uppercase text-zinc-400">Visitors</p><p className="font-bold">{results.totals?.visitors ?? 'N/A'}</p></div>
                        <div><p className="text-[10px] uppercase text-zinc-400">Unique sessions</p><p className="font-bold">{results.totals?.uniqueSessions ?? 'N/A'}</p></div>
                        <div><p className="text-[10px] uppercase text-zinc-400">Purchases</p><p className="font-bold">{results.totals?.purchases ?? 'N/A'}</p></div>
                        <div><p className="text-[10px] uppercase text-zinc-400">Conversion</p><p className="font-bold">{results.totals?.conversionRate != null ? `${results.totals.conversionRate}%` : 'N/A'}</p></div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] uppercase text-zinc-400 border-b border-zinc-100">
                                    <th className="py-2">Variant</th>
                                    <th>Theme</th>
                                    <th>Traffic</th>
                                    <th>Visitors</th>
                                    <th>Sessions</th>
                                    <th>Purchases</th>
                                    <th>Revenue</th>
                                    <th>Conversion</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(results.variants || []).map((v) => (
                                    <tr key={v.variantKey} className="border-b border-zinc-50">
                                        <td className="py-2 font-bold">{v.label || v.variantKey}</td>
                                        <td>{v.themeFolder || v.themeId} v{v.themeVersion}</td>
                                        <td>{v.trafficPercent != null ? `${v.trafficPercent}%` : 'N/A'}</td>
                                        <td>{v.visitors}</td>
                                        <td>{v.sessions ?? v.uniqueSessions ?? 'N/A'}</td>
                                        <td>{v.purchases}</td>
                                        <td>{v.revenue != null ? `₹${Number(v.revenue).toLocaleString()}` : 'N/A'}</td>
                                        <td>{v.conversionRate}%</td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => applyWinner(results.experiment._id, v.variantKey)}
                                                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-[#008060] text-white"
                                            >
                                                Apply Winner
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-[11px] text-zinc-400">{results.note}</p>
                </div>
            )}
        </div>
    );
}
