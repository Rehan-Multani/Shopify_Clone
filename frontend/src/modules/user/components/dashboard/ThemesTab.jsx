import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL || 'http://localhost:5004/api';

const THEME_TEMPLATES = [
    {
        name: 'Dawn',
        description: 'Classic, clean, and elegant design optimized for conversions and quick setup.',
        primaryColor: '#121212',
        secondaryColor: '#ffffff',
        accentColor: '#334155',
        fontFamily: 'Inter',
        previewGradient: 'from-gray-900 to-gray-600'
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
