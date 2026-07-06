import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;
const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL?.replace('/api', '') || 'http://localhost:5000';

const Toast = ({ msg, onDone, type = 'success' }) => {
    useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
    return (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-bounce"
            style={{ background: type === 'error' ? '#EF4444' : '#16A34A' }}>
            {type === 'success' ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {msg}
        </div>
    );
};

export default function ThemesTab() {
    const navigate = useNavigate();
    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    const [activeTheme, setActiveTheme] = useState(null);
    const [installedThemes, setInstalledThemes] = useState([]);
    const [themeStore, setThemeStore] = useState([]);
    const [loading, setLoading] = useState(true);
    const [installingId, setInstallingId] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => setToast({ msg, type });

    const fetchThemeData = async () => {
        try {
            setLoading(true);
            // Fetch active theme settings and installed themes
            const res = await fetch(`${STORE_API_URL}/themes/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            const json = await res.json();
            
            // Also fetch all installed themes from store details
            const storeRes = await fetch(`${STORE_API_URL}/stores/${storeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const storeJson = await storeRes.json();

            if (storeRes.ok && storeJson) {
                const storeObj = storeJson.store || storeJson.data || storeJson;
                if (storeObj) {
                    setActiveTheme(storeObj.activeTheme);
                    setInstalledThemes(storeObj.installedThemes || []);
                }
            }

            // Fetch Theme Store options
            const storeThemesRes = await fetch(`${STORE_API_URL}/theme-store`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            const storeThemesJson = await storeThemesRes.json();
            if (storeThemesRes.ok && storeThemesJson.success) {
                setThemeStore(storeThemesJson.data);
            }

        } catch (error) {
            console.error('Error fetching theme details:', error);
            showToast('Failed to load theme data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storeId) {
            fetchThemeData();
        }
    }, [storeId]);

    const handleInstallTheme = async (theme) => {
        try {
            setInstallingId(theme._id);
            const res = await fetch(`${STORE_API_URL}/themes/install`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify({
                    themeId: theme._id,
                    folder: theme.folder,
                    version: theme.version
                })
            });

            const json = await res.json();
            if (res.ok && json.success) {
                showToast(`Theme "${theme.displayName}" activated successfully!`);
                fetchThemeData();
            } else {
                showToast(json.message || 'Theme installation failed', 'error');
            }
        } catch (error) {
            showToast('Network error installing theme', 'error');
        } finally {
            setInstallingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const currentActiveDetails = themeStore.find(t => t.folder === activeTheme?.folder) || activeTheme;
    const inactiveInstalledThemes = installedThemes.filter(t => t.themeId !== activeTheme?.themeId);

    return (
        <div className="space-y-8">
            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-950">Themes & Storefront Customization</h1>
                <p className="text-sm text-zinc-500 mt-1">Install, configure, and publish themes for your shop.</p>
            </div>

            {/* Active Theme Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Current Active Theme
                </h2>

                {activeTheme && activeTheme.themeId ? (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-72 h-44 bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden shrink-0">
                            <img
                                src={currentActiveDetails?.thumbnail?.startsWith('http') ? currentActiveDetails.thumbnail : `${ASSETS_BASE_URL}${currentActiveDetails?.thumbnail}`}
                                alt={currentActiveDetails?.displayName || 'Theme thumbnail'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop";
                                }}
                            />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <h3 className="text-xl font-bold text-zinc-900">{currentActiveDetails?.displayName || activeTheme.folder}</h3>
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">v{activeTheme.version}</span>
                                </div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Industry: {currentActiveDetails?.industry || 'General'}</p>
                                <p className="text-sm text-zinc-650 line-clamp-2 max-w-xl">{currentActiveDetails?.shortDescription || 'Customize your store layout,Announcement bar, Banner, Colors & Fonts.'}</p>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-6">
                                <button
                                    onClick={() => navigate(`/dashboard/theme-customizer?themeId=${activeTheme.themeId}`)}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
                                >
                                    Customize Theme
                                </button>
                                <a
                                    href={`/store/${storeId}?themeId=${activeTheme.themeId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-5 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl text-sm font-semibold transition-all"
                                >
                                    Preview Storefront
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-10 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                        <p className="text-sm text-zinc-500 font-medium">No theme is currently active. Choose a theme below to install.</p>
                    </div>
                )}
            </div>

            {/* Installed Themes (Inactive list) */}
            {inactiveInstalledThemes.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-zinc-900">Installed Library</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inactiveInstalledThemes.map(theme => {
                            const details = themeStore.find(t => t.folder === theme.folder) || theme;
                            return (
                                <div key={theme.themeId} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                                    <div className="h-32 bg-zinc-100 relative">
                                        <img
                                            src={details?.thumbnail?.startsWith('http') ? details.thumbnail : `${ASSETS_BASE_URL}${details?.thumbnail}`}
                                            alt={details?.displayName || 'Theme'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop";
                                            }}
                                        />
                                    </div>
                                    <div className="p-4 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-zinc-900 text-base">{details?.displayName || theme.folder}</h3>
                                            <span className="text-[10px] text-zinc-400 font-medium">Installed version: v{theme.version}</span>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => handleInstallTheme(details)}
                                                className="flex-1 py-2 border border-zinc-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-zinc-700 font-semibold rounded-xl text-xs transition-all"
                                            >
                                                Activate Theme
                                            </button>
                                            <button
                                                onClick={() => navigate(`/dashboard/theme-customizer?themeId=${theme.themeId}`)}
                                                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl text-xs transition-all"
                                            >
                                                Customize
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Theme Store / Marketplace */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">Theme Store</h2>
                        <p className="text-xs text-zinc-500 mt-0.5">Explore free and premium built-in designs registered by administrators.</p>
                    </div>
                </div>

                {themeStore.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                        <p className="text-zinc-500 text-sm font-medium">No themes available in the store.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {themeStore.map(theme => {
                            const isInstalled = installedThemes.some(t => t.themeId === theme._id);
                            const isActive = activeTheme?.themeId === theme._id;

                            return (
                                <div key={theme._id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all">
                                    <div className="h-44 bg-zinc-50 relative overflow-hidden">
                                        <img
                                            src={theme.thumbnail?.startsWith('http') ? theme.thumbnail : `${ASSETS_BASE_URL}${theme.thumbnail}`}
                                            alt={theme.displayName}
                                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop";
                                            }}
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className="px-2 py-0.5 text-[9px] font-bold text-white bg-zinc-950 rounded-md">
                                                {theme.type === 'free' ? 'FREE' : `₹${theme.price}`}
                                            </span>
                                        </div>
                                        {isActive && (
                                            <div className="absolute top-3 left-3">
                                                <span className="px-2 py-0.5 text-[9px] font-bold text-white bg-emerald-500 rounded-md">
                                                    ACTIVE
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-zinc-900 text-base">{theme.displayName}</h3>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">{theme.industry}</p>
                                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{theme.shortDescription}</p>
                                        </div>

                                        <div className="mt-5">
                                            {isActive ? (
                                                <button
                                                    onClick={() => navigate(`/dashboard/theme-customizer?themeId=${theme._id}`)}
                                                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition-all border border-emerald-250"
                                                >
                                                    Customize Active Theme
                                                </button>
                                            ) : (
                                                <div className="flex gap-2 w-full">
                                                    <button
                                                        onClick={() => handleInstallTheme(theme)}
                                                        disabled={installingId === theme._id}
                                                        className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                                                    >
                                                        {installingId === theme._id ? 'Installing...' : isInstalled ? 'Activate Theme' : 'Install Theme'}
                                                    </button>
                                                    {isInstalled && (
                                                        <button
                                                            onClick={() => navigate(`/dashboard/theme-customizer?themeId=${theme._id}`)}
                                                            className="flex-1 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold rounded-xl text-xs transition-all"
                                                        >
                                                            Customize
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
