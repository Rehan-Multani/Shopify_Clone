import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

const THEME_TEMPLATES = [
    {
        name: 'Dawn',
        description: 'Classic, clean, and elegant design optimized for conversions and quick setup.',
        primaryColor: '#121212',
        secondaryColor: '#ffffff',
        accentColor: '#334155',
        fontFamily: 'Inter',
        previewGradient: 'from-gray-900 to-gray-650'
    },
    {
        name: 'Modern',
        description: 'Vibrant and bold layout featuring smooth micro-animations and rounded corners.',
        primaryColor: '#6366f1',
        secondaryColor: '#0f172a',
        accentColor: '#10b981',
        fontFamily: 'Outfit',
        previewGradient: 'from-indigo-600 to-emerald-500'
    },
    {
        name: 'Minimal',
        description: 'Ultra-sleek, minimalist aesthetic focusing on large editorial typography and whitespace.',
        primaryColor: '#000000',
        secondaryColor: '#f4f4f5',
        accentColor: '#71717a',
        fontFamily: 'Playfair Display',
        previewGradient: 'from-zinc-900 to-zinc-400'
    },
    {
        name: 'Vogue',
        description: 'Luxury, high-fashion layout with serif headers, spacious image grids, and neutral tones.',
        primaryColor: '#8c7853',
        secondaryColor: '#faf8f5',
        accentColor: '#4a3f35',
        fontFamily: 'Playfair Display',
        previewGradient: 'from-amber-800 to-stone-500'
    },
    {
        name: 'Aura',
        description: 'A soft, calm pastel theme perfect for wellness, beauty, and organic product storefronts.',
        primaryColor: '#db2777',
        secondaryColor: '#fdf2f8',
        accentColor: '#ec4899',
        fontFamily: 'Poppins',
        previewGradient: 'from-pink-500 to-rose-300'
    },
    {
        name: 'Carbon',
        description: 'Deep dark mode theme designed for high-end tech, accessories, and modern gadgets.',
        primaryColor: '#0f172a',
        secondaryColor: '#1e293b',
        accentColor: '#38bdf8',
        fontFamily: 'Plus Jakarta Sans',
        previewGradient: 'from-slate-900 to-cyan-700'
    },
    {
        name: 'Nordic',
        description: 'Scandinavian-inspired architecture with crisp cool borders, subtle grays, and bold typography.',
        primaryColor: '#374151',
        secondaryColor: '#f9fafb',
        accentColor: '#4b5563',
        fontFamily: 'Inter',
        previewGradient: 'from-gray-700 to-slate-400'
    },
    {
        name: 'Monolith',
        description: 'Bold brutalist architecture with thick borders, monospaced text, and high contrast accents.',
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        accentColor: '#f59e0b',
        fontFamily: 'Roboto',
        previewGradient: 'from-black to-yellow-600'
    },
    {
        name: 'Amber',
        description: 'Warm earthy colors, heritage fonts, and soft shadows ideal for hand-made crafts and cafes.',
        primaryColor: '#d97706',
        secondaryColor: '#fffbeb',
        accentColor: '#b45309',
        fontFamily: 'Plus Jakarta Sans',
        previewGradient: 'from-amber-600 to-orange-400'
    },
    {
        name: 'Cyber',
        description: 'Futuristic look featuring glowing neon highlights, cyberpunk accents, and dark tech elements.',
        primaryColor: '#7c3aed',
        secondaryColor: '#090514',
        accentColor: '#06b6d4',
        fontFamily: 'Outfit',
        previewGradient: 'from-purple-900 to-cyan-500'
    }
];

const ThemesTab = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    const [currentTheme, setCurrentTheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [activeSubTab, setActiveSubTab] = useState('library');
    const [viewport, setViewport] = useState('desktop');
    const [iframeKey, setIframeKey] = useState(0);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchCurrentTheme = async () => {
        try {
            if (!storeId) return;
            const res = await fetch(`${STORE_API_URL}/themes`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            const data = await res.json();
            if (res.ok && data.success && data.theme) {
                setCurrentTheme(data.theme);
            }
        } catch (err) {
            console.error('Error fetching theme:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentTheme();
    }, [storeId, token]);

    const handlePublishTheme = async (template) => {
        setPublishing(true);
        try {
            const res = await fetch(`${STORE_API_URL}/themes`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify({
                    themeName: template.name,
                    primaryColor: template.primaryColor,
                    secondaryColor: template.secondaryColor,
                    accentColor: template.accentColor,
                    fontFamily: template.fontFamily
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setCurrentTheme(data.theme);
                showToast(`${template.name} theme published successfully!`, 'success');
            } else {
                showToast(data.message || 'Failed to publish theme.', 'error');
            }
        } catch (err) {
            console.error('Error publishing theme:', err);
            showToast('Failed to publish theme.', 'error');
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008060]"></div>
            </div>
        );
    }

    const activeThemeName = currentTheme?.themeName || 'Dawn';
    const activeTemplate = THEME_TEMPLATES.find(t => t.name === activeThemeName) || THEME_TEMPLATES[0];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#202223] tracking-tight">Themes</h1>
                        <p className="text-xs text-gray-500 font-medium">Manage and publish themes for your online store</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/dashboard/theme-customizer')}
                        className="px-6 py-2.5 bg-[#008060] hover:bg-[#006e52] text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                        Customize Theme
                    </button>
                </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex border-b border-gray-200 gap-2">
                <button
                    onClick={() => setActiveSubTab('library')}
                    className={`pb-3 px-2 font-bold text-sm border-b-2 transition-all ${
                        activeSubTab === 'library'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    Theme Library & Design
                </button>
                <button
                    onClick={() => setActiveSubTab('preview')}
                    className={`pb-3 px-2 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
                        activeSubTab === 'preview'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Live Storefront Preview
                </button>
            </div>

            {activeSubTab === 'library' ? (
                <>
                    {/* Current Active Theme */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-10 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-[#202223]">{activeThemeName}</h2>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                Live & Active
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">This is the style and layout your storefront visitors currently see.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard/theme-customizer')}
                        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95"
                    >
                        Customize
                    </button>
                </div>
                
                <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className={`aspect-[16/10] bg-gradient-to-br ${activeTemplate.previewGradient} rounded-2xl flex flex-col justify-between p-6 text-white shadow-inner relative overflow-hidden group`}>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        <div className="flex justify-between items-center relative z-10">
                            <span className="text-sm font-black tracking-widest uppercase">{activeThemeName} Preview</span>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                                <span className="text-xs">✨</span>
                            </div>
                        </div>
                        <div className="space-y-2 relative z-10">
                            <div className="w-16 h-1 bg-white/60 rounded"></div>
                            <h3 className="text-2xl font-black font-sans leading-none">{activeThemeName} Template</h3>
                            <p className="text-[10px] text-white/80 font-medium max-w-xs">{activeTemplate.description}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Configuration</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase">Primary Color</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-4 h-4 rounded border border-gray-200" style={{ backgroundColor: currentTheme?.primaryColor }}></div>
                                    <span className="text-xs font-semibold text-gray-700">{currentTheme?.primaryColor}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase">Font Family</span>
                                <span className="block text-xs font-bold text-gray-700 mt-1">{currentTheme?.fontFamily}</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase">Header Layout</span>
                                <span className="block text-xs font-bold text-gray-700 mt-1 uppercase">{currentTheme?.headerStyle || 'style1'}</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase">Footer Layout</span>
                                <span className="block text-xs font-bold text-gray-700 mt-1 uppercase">{currentTheme?.footerStyle || 'style1'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Theme Library / Theme Templates list */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#202223]">Theme Library</h3>
                    <p className="text-xs text-gray-500 font-bold">Switch theme to instantly transform storefront styles</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {THEME_TEMPLATES.map(template => {
                        const isCurrent = activeThemeName === template.name;
                        return (
                            <div key={template.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group">
                                <div className={`h-40 bg-gradient-to-br ${template.previewGradient} flex flex-col justify-end p-5 text-white relative`}>
                                    <h4 className="text-xl font-black">{template.name}</h4>
                                </div>
                                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">{template.description}</p>
                                    <div className="flex gap-2 items-center text-[11px] text-gray-400 font-bold border-t pt-3">
                                        <span>Font: {template.fontFamily}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        <div className="flex gap-1">
                                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: template.primaryColor }}></span>
                                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: template.secondaryColor }}></span>
                                        </div>
                                    </div>
                                    <button 
                                        disabled={publishing || isCurrent}
                                        onClick={() => handlePublishTheme(template)}
                                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all active:scale-[0.98] ${
                                            isCurrent 
                                            ? 'bg-gray-100 text-gray-400 cursor-default' 
                                            : 'bg-gray-900 text-white hover:bg-black'
                                        }`}
                                    >
                                        {isCurrent ? 'Published' : 'Publish'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    ) : (
                <div className="space-y-6">
                    {/* Viewport Control Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Device Toggles */}
                        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewport('desktop')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    viewport === 'desktop'
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-gray-500 hover:text-black'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Desktop
                            </button>
                            <button
                                onClick={() => setViewport('tablet')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    viewport === 'tablet'
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-gray-500 hover:text-black'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Tablet
                            </button>
                            <button
                                onClick={() => setViewport('mobile')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    viewport === 'mobile'
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-gray-500 hover:text-black'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Mobile
                            </button>
                        </div>

                        {/* Simulated Browser URL bar */}
                        <div className="flex-grow max-w-lg w-full flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-1.5 text-xs text-gray-500 font-mono select-all truncate">
                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="truncate">{window.location.origin}/store/{storeId}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIframeKey(prev => prev + 1)}
                                className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all hover:text-black"
                                title="Refresh Preview"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                                </svg>
                            </button>
                            <a
                                href={`/store/${storeId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Open Live Site
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Frame Container */}
                    <div className="w-full flex justify-center bg-gray-100/50 border border-gray-200/60 rounded-3xl p-6 md:p-10 shadow-inner min-h-[500px]">
                        <div
                            className={`bg-white rounded-2xl border-4 border-gray-900 shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
                                viewport === 'desktop'
                                    ? 'w-full h-[650px]'
                                    : viewport === 'tablet'
                                    ? 'w-[768px] h-[750px]'
                                    : 'w-[375px] h-[650px]'
                            }`}
                        >
                            {/* Device top bar indicator */}
                            <div className="bg-gray-900 px-4 py-2 flex items-center justify-between text-gray-500 text-[10px] font-mono border-b border-gray-800 flex-shrink-0">
                                <div className="flex gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                                </div>
                                <span className="text-gray-400 font-medium">Storefront Mockup</span>
                                <div className="w-6"></div>
                            </div>

                            {/* Live Storefront Iframe */}
                            <iframe
                                key={iframeKey}
                                src={`/store/${storeId}`}
                                title="Storefront Live Preview"
                                className="w-full flex-grow border-0"
                            />
                        </div>
                    </div>
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

export default ThemesTab;
