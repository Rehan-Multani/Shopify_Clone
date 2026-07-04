import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// We will call the gateway endpoints at /api/themes (which handles proxying to /api/admin/themes)
const THEMES_API_URL = `${API_BASE_URL}/themes`;

const Modal = ({ title, onClose, children, width = 'max-w-2xl' }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div className={`bg-white rounded-2xl shadow-2xl w-full ${width} overflow-hidden flex flex-col`} style={{ maxHeight: '90vh' }}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold text-gray-800">{title}</h3>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
    </div>
);

const Toast = ({ msg, onDone, type = 'success' }) => {
    useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
    return (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-bounce"
            style={{ background: type === 'error' ? '#EF4444' : '#1a1c23' }}>
            {type === 'success' ? (
                <svg className="w-4 h-4 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {msg}
        </div>
    );
};


const INDUSTRIES_LIST = [
    "Fashion",
    "Electronics",
    "Furniture",
    "Beauty",
    "Grocery"
];


const ThemeForm = ({ theme, onSave, onCancel, isNew, isSaving, availableFolders }) => {
    const [form, setForm] = useState(theme ? {
        folder: theme.folder,
        themeName: theme.themeName || '',
        displayName: theme.displayName,
        type: theme.type || 'free',
        price: theme.price || 0,
        industry: theme.industry || 'Fashion',
        thumbnail: theme.thumbnail || '',
        status: theme.status || 'published',
        version: theme.version || '1.0.0'
    } : {
        folder: '',
        themeName: '',
        displayName: '',
        type: 'free',
        price: 0,
        industry: 'Fashion',
        thumbnail: '',
        status: 'published',
        version: '1.0.0'
    });

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleFolderChange = async (folderName) => {
        set('folder', folderName);
        if (!folderName) {
            setForm(p => ({
                ...p,
                folder: '',
                themeName: '',
                displayName: '',
                version: '1.0.0',
                thumbnail: ''
            }));
            return;
        }

        try {
            const res = await fetch(`${THEMES_API_URL}/folders/${folderName}/manifest`);
            const json = await res.json();
            if (res.ok && json.success) {
                const manifest = json.data;
                setForm(p => ({
                    ...p,
                    folder: folderName,
                    themeName: manifest.name || '',
                    displayName: manifest.name || '',
                    version: manifest.version || '1.0.0',
                    industry: manifest.industry || p.industry,
                    type: manifest.type || p.type,
                    price: manifest.type === 'free' ? 0 : (manifest.price || p.price || 0),
                    thumbnail: manifest.thumbnail || p.thumbnail
                }));
            }
        } catch (error) {
            console.error("Error reading manifest:", error);
        }
    };

    const handleSaveClick = (selectedStatus) => {
        onSave({
            ...form,
            status: selectedStatus
        });
    };

    const isFormInvalid = !form.folder || !form.displayName || !form.thumbnail || (form.type === 'paid' && (!form.price || form.price <= 0));

    return (
        <div className="space-y-5">
            {/* Folder Selection */}
            <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Theme Folder *</label>
                {isNew ? (
                    <select
                        value={form.folder}
                        onChange={e => handleFolderChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500/30"
                    >
                        <option value="">Select Folder</option>
                        {availableFolders.map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        value={form.folder}
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                )}
            </div>

            {/* Display Name */}
            <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Display Name *</label>
                <input
                    type="text"
                    value={form.displayName}
                    onChange={e => set('displayName', e.target.value)}
                    placeholder="e.g. Modern Fashion"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/30"
                />
            </div>

            {/* Type & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Theme Type *</label>
                    <select
                        value={form.type}
                        onChange={e => {
                            const newType = e.target.value;
                            setForm(p => ({
                                ...p,
                                type: newType,
                                price: newType === 'free' ? 0 : p.price
                            }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500/30"
                    >
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Price (₹) *</label>
                    <input
                        type="number"
                        value={form.price}
                        onChange={e => set('price', Number(e.target.value))}
                        disabled={form.type === 'free'}
                        placeholder={form.type === 'free' ? "0" : "999"}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500/30 transition-all ${
                            form.type === 'free'
                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white border-gray-300 text-gray-800'
                        }`}
                    />
                </div>
            </div>

            {/* Industry */}
            <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Industry *</label>
                <select
                    value={form.industry}
                    onChange={e => set('industry', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500/30"
                >
                    {INDUSTRIES_LIST.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                    ))}
                </select>
            </div>

            {/* Thumbnail */}
            <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Thumbnail Image Path *</label>
                <input
                    type="text"
                    value={form.thumbnail}
                    onChange={e => set('thumbnail', e.target.value)}
                    placeholder="e.g. thumbnail.webp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/30"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-100 shrink-0">
                <button
                    onClick={onCancel}
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    onClick={() => handleSaveClick('draft')}
                    disabled={isSaving || isFormInvalid}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-800 text-gray-800 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    Save Draft
                </button>

                <button
                    onClick={() => handleSaveClick('published')}
                    disabled={isSaving || isFormInvalid}
                    className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
                    style={{ background: '#1a1c23' }}
                >
                    {isSaving ? 'Saving...' : 'Publish'}
                </button>
            </div>
        </div>
    );
};

const ThemesTab = () => {
    const [themes, setThemes] = useState([]);
    const [availableFolders, setAvailableFolders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingTheme, setEditingTheme] = useState(null);
    const [deletingTheme, setDeletingTheme] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('All');

    const showToast = (msg, type = 'success') => setToast({ msg, type });

    const getAuthHeaders = () => {
        const info = JSON.parse(localStorage.getItem('masterAdminInfo') || '{}');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${info.token || ''}`
        };
    };

    const fetchThemes = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(THEMES_API_URL);
            const json = await res.json();
            if (res.ok && json.success) {
                setThemes(json.data);
            } else {
                showToast(json.message || 'Failed to fetch registered themes', 'error');
            }
        } catch (error) {
            showToast('Network error fetching themes', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableFolders = async () => {
        try {
            const res = await fetch(`${THEMES_API_URL}/folders`);
            const json = await res.json();
            if (res.ok && json.success) {
                setAvailableFolders(json.data);
            }
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    };

    useEffect(() => {
        fetchThemes();
        fetchAvailableFolders();
    }, []);

    const handleSave = async (updated) => {
        setIsSaving(true);
        try {
            const res = await fetch(`${THEMES_API_URL}/${updated._id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updated)
            });
            const json = await res.json();
            if (res.ok && json.success) {
                setThemes(prev => prev.map(t => t._id === json.data._id ? json.data : t));
                setEditingTheme(null);
                showToast('Theme updated successfully');
            } else {
                showToast(json.message || 'Update failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreate = async (newTheme) => {
        setIsSaving(true);
        try {
            const res = await fetch(THEMES_API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newTheme)
            });
            const json = await res.json();
            if (res.ok && json.success) {
                setThemes(prev => [json.data, ...prev]);
                setShowCreate(false);
                showToast('Theme registered successfully');
                // Refresh list of available folders (remove registered folder from dropdown)
                fetchAvailableFolders();
            } else {
                showToast(json.message || 'Registration failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (theme) => {
        try {
            const res = await fetch(`${THEMES_API_URL}/${theme._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const json = await res.json();
            if (res.ok && json.success) {
                setThemes(prev => prev.filter(t => t._id !== theme._id));
                setDeletingTheme(null);
                showToast(`Theme "${theme.displayName}" unregistered`);
                fetchAvailableFolders();
            } else {
                showToast(json.message || 'Unregister failed', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        }
    };

    return (
        <div className="space-y-8">
            {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Themes Configuration</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Register and manage built-in themes for the Storefronts.</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto"
                    style={{ background: '#1a1c23' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Register Built-in Theme
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl border border-[#e3e3e3] p-5 animate-pulse flex flex-col h-80">
                            <div className="h-40 bg-gray-200 rounded-lg w-full mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-full mb-4"></div>
                            <div className="flex gap-2 mt-auto">
                                <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
                                <div className="w-10 h-8 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : themes.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <p className="text-gray-500 font-medium">No themes registered or configured yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {themes.map(theme => (
                        <div
                            key={theme._id}
                            className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group"
                        >
                            {/* Badges */}
                            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded text-white shadow-sm ${theme.status === 'published' ? 'bg-[#14B8A6]' : 'bg-amber-500'
                                    }`}>
                                    {theme.status}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded text-white bg-blue-500 shadow-sm">
                                    {theme.industry}
                                </span>
                            </div>

                            <div className="absolute top-3 right-3 z-10">
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded text-white bg-slate-900 shadow-sm">
                                    {theme.type === 'free' ? 'FREE' : `₹${theme.price}`}
                                </span>
                            </div>

                            {/* Thumbnail Area */}
                            <div className="h-44 bg-slate-100 border-b border-gray-100 overflow-hidden relative">
                                {theme.thumbnail ? (
                                    <img
                                        src={theme.thumbnail.startsWith('http') ? theme.thumbnail : `/uploads/${theme.thumbnail}`}
                                        alt={theme.displayName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop";
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                )}
                            </div>

                            {/* Text Area */}
                            <div className="p-4 flex-grow flex flex-col">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="text-base font-bold text-gray-800 leading-snug">{theme.displayName}</h3>
                                    <span className="text-xs text-gray-400 font-semibold shrink-0">v{theme.version}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Folder: /{theme.folder}</span>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">{theme.shortDescription || 'No description provided.'}</p>

                                {/* Features pill list */}
                                {theme.features && theme.features.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {theme.features.slice(0, 3).map(f => (
                                            <span key={f} className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium">{f}</span>
                                        ))}
                                        {theme.features.length > 3 && (
                                            <span className="px-2 py-0.5 rounded bg-gray-50 text-gray-400 text-[10px] font-medium">+{theme.features.length - 3} more</span>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => setEditingTheme(theme)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold border border-[#e3e3e3] text-gray-700 bg-white hover:bg-gray-50 transition-all hover:border-gray-300"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={() => setDeletingTheme(theme)}
                                        className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Theme Modal */}
            {showCreate && (
                <Modal title="Register Built-in Theme" onClose={() => setShowCreate(false)}>
                    <ThemeForm
                        theme={null}
                        onSave={handleCreate}
                        onCancel={() => setShowCreate(false)}
                        isNew
                        isSaving={isSaving}
                        availableFolders={availableFolders}
                    />
                </Modal>
            )}

            {/* Edit Theme Modal */}
            {editingTheme && (
                <Modal title={`Edit Configuration — ${editingTheme.displayName}`} onClose={() => setEditingTheme(null)}>
                    <ThemeForm
                        theme={editingTheme}
                        onSave={handleSave}
                        onCancel={() => setEditingTheme(null)}
                        isSaving={isSaving}
                        availableFolders={[]}
                    />
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {deletingTheme && (
                <Modal title="Unregister Theme" onClose={() => setDeletingTheme(null)} width="max-w-md">
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm font-semibold text-red-800">
                                Are you sure you want to unregister and delete the configuration for <strong>{deletingTheme.displayName}</strong>?
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setDeletingTheme(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                            <button onClick={() => handleDelete(deletingTheme)} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#DC2626' }}>
                                Unregister Theme
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ThemesTab;
