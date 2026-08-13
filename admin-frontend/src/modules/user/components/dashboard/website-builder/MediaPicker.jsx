import React, { useEffect, useMemo, useState } from 'react';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE = GATEWAY_URL?.replace(/\/api\/?$/, '') || '';
const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;

const resolveUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${ASSETS_BASE}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Reusable media picker — upload + select from store banners/media URLs.
 * Persists URL/path only (never binary).
 */
export default function MediaPicker({ value = '', onChange, label = 'Select Image' }) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const storeId = localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';

    const preview = value ? resolveUrl(value) : '';

    const loadMedia = async () => {
        setLoading(true);
        setError('');
        try {
            const headers = { 'x-store-id': storeId };
            if (token) headers.Authorization = `Bearer ${token}`;
            const res = await fetch(`${CATALOG_API_URL || GATEWAY_URL}/banners`, { headers });
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.banners || []);
            const urls = list.map((b) => b.image).filter(Boolean);
            // Dedupe + include current value
            const unique = [...new Set([...(value ? [value] : []), ...urls])];
            setItems(unique);
        } catch (err) {
            console.error(err);
            setError('Failed to load media');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) loadMedia();
    }, [open]);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch(`${GATEWAY_URL}/banners/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok && data.url) {
                onChange(data.url);
                setItems((prev) => [data.url, ...prev.filter((u) => u !== data.url)]);
                setOpen(false);
            } else {
                setError(data.message || 'Upload failed');
            }
        } catch {
            setError('Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-2">
            {preview ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 bg-white">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 right-1.5 flex gap-1">
                        <button type="button" onClick={() => setOpen(true)} className="px-2 py-1 rounded-md bg-white/95 text-[9px] font-black uppercase border border-zinc-200 cursor-pointer">
                            Replace
                        </button>
                        <button type="button" onClick={() => onChange('')} className="px-2 py-1 rounded-md bg-red-500 text-white text-[9px] font-black uppercase cursor-pointer">
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="w-full py-6 border border-dashed border-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:border-[#008060] hover:text-[#008060] cursor-pointer"
                >
                    {label}
                </button>
            )}

            {open && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-700">Media Library</h4>
                            <button type="button" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-700 text-sm cursor-pointer">✕</button>
                        </div>
                        <div className="p-4 border-b border-zinc-100 flex gap-2">
                            <label className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-[#008060] text-white text-[10px] font-black uppercase tracking-wider cursor-pointer">
                                {uploading ? 'Uploading…' : 'Upload'}
                                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleUpload} />
                            </label>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {loading && <p className="text-[10px] text-zinc-400 font-semibold">Loading…</p>}
                            {error && <p className="text-[10px] text-red-500 font-bold mb-2">{error}</p>}
                            <div className="grid grid-cols-3 gap-2">
                                {items.map((url) => (
                                    <button
                                        key={url}
                                        type="button"
                                        onClick={() => { onChange(url); setOpen(false); }}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer ${value === url ? 'border-[#008060]' : 'border-zinc-200 hover:border-zinc-300'}`}
                                    >
                                        <img src={resolveUrl(url)} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                            {!loading && items.length === 0 && (
                                <p className="text-[10px] text-zinc-400 text-center py-8 font-semibold">No media yet. Upload an image.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Searchable product multi-select. Persists comma-separated IDs.
 */
export function ProductPicker({ value = '', onChange, multiple = true }) {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const storeId = localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';

    const selectedIds = useMemo(
        () => String(value || '').split(',').map((s) => s.trim()).filter(Boolean),
        [value]
    );

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            try {
                const headers = { 'x-store-id': storeId };
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetch(`${CATALOG_API_URL || GATEWAY_URL}/products?storeId=${storeId}`, { headers });
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data.products || []);
                if (!cancelled) setProducts(list);
            } catch {
                if (!cancelled) setProducts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [storeId, token]);

    const filtered = products.filter((p) => {
        const q = query.toLowerCase();
        if (!q) return true;
        return String(p.name || '').toLowerCase().includes(q)
            || String(p.brandName || '').toLowerCase().includes(q)
            || String(p.sku || '').toLowerCase().includes(q);
    }).slice(0, 40);

    const toggle = (id) => {
        const sid = String(id);
        if (!multiple) {
            onChange(sid);
            return;
        }
        const next = selectedIds.includes(sid)
            ? selectedIds.filter((x) => x !== sid)
            : [...selectedIds, sid];
        onChange(next.join(','));
    };

    const move = (id, dir) => {
        const idx = selectedIds.indexOf(String(id));
        if (idx < 0) return;
        const next = [...selectedIds];
        const swap = idx + dir;
        if (swap < 0 || swap >= next.length) return;
        [next[idx], next[swap]] = [next[swap], next[idx]];
        onChange(next.join(','));
    };

    const selectedProducts = selectedIds
        .map((id) => products.find((p) => String(p._id) === id))
        .filter(Boolean);

    return (
        <div className="space-y-2 border border-zinc-200 rounded-xl p-3 bg-zinc-50/50">
            {selectedProducts.length > 0 && (
                <div className="space-y-1.5 mb-2">
                    {selectedProducts.map((p) => (
                        <div key={p._id} className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-2 py-1.5">
                            <span className="flex-1 text-[11px] font-semibold text-zinc-800 truncate">{p.name}</span>
                            <button type="button" className="text-[9px] font-bold text-zinc-400 cursor-pointer" onClick={() => move(p._id, -1)}>↑</button>
                            <button type="button" className="text-[9px] font-bold text-zinc-400 cursor-pointer" onClick={() => move(p._id, 1)}>↓</button>
                            <button type="button" className="text-[9px] font-bold text-red-500 cursor-pointer" onClick={() => toggle(p._id)}>✕</button>
                        </div>
                    ))}
                </div>
            )}
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full px-2.5 py-2 border border-zinc-200 rounded-lg text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
            />
            <div className="max-h-40 overflow-y-auto space-y-1">
                {loading && <p className="text-[10px] text-zinc-400">Loading…</p>}
                {!loading && filtered.map((p) => {
                    const active = selectedIds.includes(String(p._id));
                    return (
                        <button
                            key={p._id}
                            type="button"
                            onClick={() => toggle(p._id)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer ${active ? 'bg-[#008060]/10 text-[#008060]' : 'hover:bg-white text-zinc-700'}`}
                        >
                            {p.name}{p.brandName ? ` · ${p.brandName}` : ''}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Searchable category selector. Persists category ID.
 */
export function CategoryPicker({ value = '', onChange }) {
    const [query, setQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const storeId = localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            try {
                const headers = { 'x-store-id': storeId };
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetch(`${CATALOG_API_URL || GATEWAY_URL}/categories?storeId=${storeId}`, { headers });
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data.categories || []);
                if (!cancelled) setCategories(list);
            } catch {
                if (!cancelled) setCategories([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [storeId, token]);

    const filtered = categories.filter((c) => {
        const q = query.toLowerCase();
        if (!q) return true;
        return String(c.name || '').toLowerCase().includes(q);
    });

    const selected = categories.find((c) => String(c._id) === String(value));

    return (
        <div className="space-y-2 border border-zinc-200 rounded-xl p-3 bg-zinc-50/50">
            {selected && (
                <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-lg px-2 py-1.5">
                    <span className="text-[11px] font-semibold">{selected.name}</span>
                    <button type="button" className="text-[9px] font-bold text-red-500 cursor-pointer" onClick={() => onChange('')}>Clear</button>
                </div>
            )}
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search category…"
                className="w-full px-2.5 py-2 border border-zinc-200 rounded-lg text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
            />
            <div className="max-h-36 overflow-y-auto space-y-1">
                {loading && <p className="text-[10px] text-zinc-400">Loading…</p>}
                {filtered.map((c) => (
                    <button
                        key={c._id}
                        type="button"
                        onClick={() => onChange(String(c._id))}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer ${String(c._id) === String(value) ? 'bg-[#008060]/10 text-[#008060]' : 'hover:bg-white text-zinc-700'}`}
                    >
                        {c.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
