import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

/**
 * Authenticated theme preview shell — iframe uses dedicated short-lived preview tokens.
 * Merchant JWT is NEVER placed in the iframe URL.
 */
export default function ThemePreviewPage() {
    const { storeId: paramStoreId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const storeId = paramStoreId || localStorage.getItem('activeStoreId') || '';
    const merchantToken = localStorage.getItem('merchantToken') || '';

    const themeId = searchParams.get('themeId') || '';
    const folder = searchParams.get('folder') || '';
    const cleanPreview = searchParams.get('cleanPreview') === 'true';
    const [viewport, setViewport] = useState(searchParams.get('viewport') || 'desktop');
    const [previewToken, setPreviewToken] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(!cleanPreview);

    useEffect(() => {
        if (!merchantToken) {
            navigate('/admin/login', { replace: true });
        }
    }, [merchantToken, navigate]);

    useEffect(() => {
        if (!merchantToken || !storeId || cleanPreview) {
            setLoading(false);
            return undefined;
        }

        let cancelled = false;
        const mint = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${STORE_API_URL}/themes/preview-token`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${merchantToken}`,
                        'Content-Type': 'application/json',
                        'x-store-id': storeId,
                    },
                    body: JSON.stringify({ storeId, themeId }),
                });
                const json = await res.json();
                if (!res.ok || !json.token) {
                    throw new Error(json.message || 'Failed to mint preview token');
                }
                if (!cancelled) {
                    setPreviewToken(json.token);
                    setExpiresAt(json.expiresAt || '');
                }
            } catch (err) {
                if (!cancelled) setError(err.message || 'Preview token error');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        mint();
        return () => { cancelled = true; };
    }, [merchantToken, storeId, themeId, cleanPreview]);

    const iframeSrc = useMemo(() => {
        if (!storeId) return '';
        const q = new URLSearchParams();
        if (cleanPreview && folder) {
            q.set('cleanPreview', 'true');
            q.set('folder', folder);
            if (themeId) q.set('themeId', themeId);
            return `/store/${storeId}?${q.toString()}`;
        }
        if (!previewToken) return '';
        q.set('draft', 'true');
        q.set('previewToken', previewToken);
        if (themeId) q.set('themeId', themeId);
        if (folder) q.set('folder', folder);
        return `/store/${storeId}?${q.toString()}`;
    }, [storeId, themeId, folder, cleanPreview, previewToken]);

    const widthClass = viewport === 'mobile'
        ? 'max-w-[390px]'
        : viewport === 'tablet'
            ? 'max-w-[768px]'
            : 'max-w-full';

    const setVp = (vp) => {
        setViewport(vp);
        const next = new URLSearchParams(searchParams);
        next.set('viewport', vp);
        setSearchParams(next, { replace: true });
    };

    if (!merchantToken) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">
                Sign in required for draft theme preview.
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col bg-zinc-100">
            <header className="shrink-0 h-14 px-4 border-b border-zinc-200 bg-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-200 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060]"
                    >
                        Back
                    </button>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">Theme Preview</p>
                        <p className="text-[10px] text-zinc-500 truncate">
                            {cleanPreview ? 'Catalog preview (defaults)' : 'Secure draft preview — short-lived token'}
                            {folder ? ` · ${folder}` : ''}
                            {expiresAt ? ` · expires ${new Date(expiresAt).toLocaleTimeString()}` : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1" role="tablist" aria-label="Preview viewport">
                    {['desktop', 'tablet', 'mobile'].map((vp) => (
                        <button
                            key={vp}
                            type="button"
                            role="tab"
                            aria-selected={viewport === vp}
                            onClick={() => setVp(vp)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-lg border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060] ${
                                viewport === vp
                                    ? 'bg-zinc-900 text-white border-zinc-900'
                                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                            }`}
                        >
                            {vp}
                        </button>
                    ))}
                </div>
            </header>
            <div className="flex-1 overflow-auto p-4 flex justify-center">
                <div className={`w-full ${widthClass} h-full bg-white border border-zinc-200 shadow-sm overflow-hidden rounded-xl`}>
                    {loading && (
                        <div className="h-full flex items-center justify-center text-sm text-zinc-500">Minting preview token…</div>
                    )}
                    {error && !loading && (
                        <div className="h-full flex items-center justify-center text-sm text-red-600 px-6 text-center">{error}</div>
                    )}
                    {!loading && !error && iframeSrc ? (
                        <iframe
                            title="Storefront theme preview"
                            src={iframeSrc}
                            className="w-full h-full border-0"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
