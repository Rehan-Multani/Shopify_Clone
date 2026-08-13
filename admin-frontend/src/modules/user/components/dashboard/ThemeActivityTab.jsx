import React, { useEffect, useState } from 'react';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'published', label: 'Published' },
    { id: 'upgraded', label: 'Upgraded' },
    { id: 'rollback', label: 'Rollback' },
    { id: 'experiments', label: 'Experiments' },
];

const actionLabel = (action) => {
    const map = {
        THEME_INSTALLED: 'Theme installed',
        THEME_SELECTED: 'Theme selected',
        THEME_UPGRADED: 'Theme upgraded',
        THEME_MIGRATED: 'Theme migrated',
        THEME_PUBLISHED: 'Theme published',
        THEME_ROLLED_BACK: 'Theme rolled back',
        THEME_PREVIEWED: 'Theme previewed',
        EXPERIMENT_CREATED: 'Experiment created',
        EXPERIMENT_STARTED: 'Experiment started',
        EXPERIMENT_PAUSED: 'Experiment paused',
        EXPERIMENT_COMPLETED: 'Experiment completed',
        EXPERIMENT_CANCELLED: 'Experiment cancelled',
    };
    return map[action] || action;
};

export default function ThemeActivityTab() {
    const storeId = localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';
    const [filter, setFilter] = useState('all');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!storeId || !token) return;
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${STORE_API_URL}/themes/audit?filter=${filter}&limit=50`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'x-store-id': storeId,
                    },
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || 'Failed to load activity');
                setRows(json.data || []);
            } catch (err) {
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [storeId, token, filter]);

    return (
        <div className="space-y-5 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Theme Activity</h1>
                <p className="text-sm text-zinc-500 mt-1">Lifecycle audit for themes and experiments (no sensitive data).</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${filter === f.id ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-600'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {loading ? (
                <div className="py-16 text-center text-sm text-zinc-500">Loading activity…</div>
            ) : rows.length === 0 ? (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-sm text-zinc-500">No activity yet.</div>
            ) : (
                <div className="space-y-3">
                    {rows.map((row) => (
                        <div key={row._id} className="bg-white border border-zinc-200 rounded-2xl p-4">
                            <p className="text-[11px] text-zinc-400 font-semibold">
                                {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                            </p>
                            <p className="text-sm font-bold text-zinc-900 mt-1">{actionLabel(row.action)}</p>
                            {(row.themeId || row.metadata?.name) && (
                                <p className="text-xs text-zinc-600 mt-1">
                                    {row.metadata?.name || row.themeId}
                                    {row.previousVersion || row.themeVersion
                                        ? ` · ${row.previousVersion ? `${row.previousVersion} → ` : ''}${row.themeVersion || ''}`
                                        : ''}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
