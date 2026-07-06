import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// We will call the gateway endpoints at /api/themes (which handles proxying to /api/admin/themes)
const THEMES_API_URL = `${API_BASE_URL}/themes`;
const ASSETS_BASE_URL = API_BASE_URL.replace('/api', '');

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

    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState('');

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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        setUploadError('');

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${THEMES_API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const json = await res.json();
            if (res.ok && json.success) {
                setForm(p => ({ ...p, thumbnail: json.url }));
            } else {
                setUploadError(json.message || 'Failed to upload image');
            }
        } catch (err) {
            setUploadError('Network error uploading image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSaveClick = (selectedStatus) => {
        onSave({
            ...form,
            status: selectedStatus
        });
    };

    const isFormInvalid = !form.folder || !form.displayName || !form.thumbnail || (form.type === 'paid' && (!form.price || form.price <= 0)) || uploadingImage;

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
                <label className="text-xs font-bold text-gray-700 block mb-2">Theme Thumbnail *</label>
                
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Live Preview Block */}
                    <div className="w-full md:w-44 h-28 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden relative flex items-center justify-center shrink-0">
                        {form.thumbnail ? (
                            <img
                                src={form.thumbnail.startsWith('http') ? form.thumbnail : `${ASSETS_BASE_URL}${form.thumbnail.startsWith('/') ? '' : '/'}${form.thumbnail}`}
                                alt="Thumbnail Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop";
                                }}
                            />
                        ) : (
                            <div className="text-center text-gray-400 p-2">
                                <svg className="w-8 h-8 mx-auto mb-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-[10px] font-medium">No Preview</span>
                            </div>
                        )}
                        {uploadingImage && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Upload / Input Actions */}
                    <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-6 h-6 mb-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    <p className="text-xs text-gray-500"><span className="font-semibold text-teal-600">Click to upload</span> or drag and drop</p>
                                    <p className="text-[10px] text-gray-400">PNG, JPG or WEBP (Max 5MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                />
                            </label>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-xs font-semibold">URL:</span>
                            </div>
                            <input
                                type="text"
                                value={form.thumbnail}
                                onChange={e => set('thumbnail', e.target.value)}
                                placeholder="Or enter image URL directly"
                                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500/30"
                            />
                        </div>
                    </div>
                </div>

                {uploadError && <p className="text-red-500 text-xs mt-1.5 font-medium">{uploadError}</p>}
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
    const [viewingTheme, setViewingTheme] = useState(null);
    const [stores, setStores] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState('');
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

    const fetchStores = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_STORE_API_URL}/stores/admin/all`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setStores(data);
                if (data.length > 0) {
                    setSelectedStoreId(data[0]._id);
                }
            }
        } catch (error) {
            console.error("Error fetching stores:", error);
        }
    };

    useEffect(() => {
        fetchThemes();
        fetchAvailableFolders();
        fetchStores();
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
                                         src={theme.thumbnail.startsWith('http') ? theme.thumbnail : `${ASSETS_BASE_URL}${theme.thumbnail.startsWith('/') ? '' : '/'}${theme.thumbnail}`}
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
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                     <button
                                         onClick={() => setViewingTheme(theme)}
                                         className="px-4 py-2 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                                     >
                                         <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                         View Details & Preview
                                     </button>
                                 </div>
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
                                         onClick={() => setViewingTheme(theme)}
                                         className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold border border-teal-200 text-teal-700 bg-teal-50/50 hover:bg-teal-50 transition-all hover:border-teal-300 cursor-pointer"
                                     >
                                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                         View details
                                     </button>
                                     <button
                                         onClick={() => setEditingTheme(theme)}
                                         className="px-2.5 py-1.5 rounded-lg border border-[#e3e3e3] text-gray-700 bg-white hover:bg-gray-50 transition-all hover:border-gray-300 cursor-pointer"
                                         title="Edit Details"
                                     >
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                     </button>
                                     <button
                                         onClick={() => setDeletingTheme(theme)}
                                         className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-all cursor-pointer"
                                         title="Delete Theme Registration"
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

            {/* View Details & Preview Modal */}
            {viewingTheme && (
                <Modal title={`Theme Details — ${viewingTheme.displayName}`} onClose={() => setViewingTheme(null)} width="max-w-3xl">
                    <div className="space-y-6">
                        {/* Upper layout: Image on left, details on right */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-80 h-48 bg-slate-100 border border-gray-200 rounded-xl overflow-hidden shrink-0 relative">
                                <img
                                    src={viewingTheme.thumbnail.startsWith('http') ? viewingTheme.thumbnail : `${ASSETS_BASE_URL}${viewingTheme.thumbnail.startsWith('/') ? '' : '/'}${viewingTheme.thumbnail}`}
                                    alt={viewingTheme.displayName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop";
                                    }}
                                />
                                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded text-white shadow-sm ${viewingTheme.status === 'published' ? 'bg-[#14B8A6]' : 'bg-amber-500'}`}>
                                        {viewingTheme.status}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3 z-10">
                                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded text-white bg-slate-900 shadow-sm">
                                        {viewingTheme.type === 'free' ? 'FREE' : `₹${viewingTheme.price}`}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-grow space-y-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{viewingTheme.displayName}</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Folder: /{viewingTheme.folder}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Industry</span>
                                        <span className="text-xs font-semibold text-gray-700 mt-0.5 block">{viewingTheme.industry}</span>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Version</span>
                                        <span className="text-xs font-semibold text-gray-700 mt-0.5 block">v{viewingTheme.version}</span>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Pricing Model</span>
                                        <span className="text-xs font-semibold text-gray-700 mt-0.5 block capitalize">{viewingTheme.type}</span>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Created On</span>
                                        <span className="text-xs font-semibold text-gray-700 mt-0.5 block">
                                            {viewingTheme.createdAt ? new Date(viewingTheme.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description & Features */}
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                            <div>
                                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Description</h4>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{viewingTheme.shortDescription || 'No description provided.'}</p>
                            </div>
                            
                            {viewingTheme.features && viewingTheme.features.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Key Features</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {viewingTheme.features.map(f => (
                                            <span key={f} className="px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Storefront Preview */}
                        <div className="pt-4 border-t border-gray-200 space-y-3">
                            <div>
                                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Live Storefront Preview</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Select a merchant store to preview this theme live in storefront mode.</p>
                            </div>

                            {stores.length > 0 ? (
                                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                                    <div className="flex-1 w-full">
                                        <select
                                            value={selectedStoreId}
                                            onChange={e => setSelectedStoreId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500/30"
                                        >
                                            {stores.map(store => (
                                                <option key={store._id} value={store._id}>
                                                    {store.storeName} ({store.owner || store.merchantId?.name || 'Unknown Owner'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const storefrontUrl = `http://localhost:5174/store/${selectedStoreId}?themeId=${viewingTheme._id}&cleanPreview=true&folder=${viewingTheme.folder}`;
                                            window.open(storefrontUrl, '_blank');
                                        }}
                                        className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                                        style={{ background: '#1a1c23' }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        Launch Preview
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                                    No active stores are available to load previews. Please create a merchant store first.
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setViewingTheme(null)}
                                className="px-5 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg text-xs hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ThemesTab;
