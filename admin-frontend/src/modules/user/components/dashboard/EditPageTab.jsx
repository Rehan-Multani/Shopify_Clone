import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;
const API_URL = STORE_API_URL;

const EditPageTab = () => {
    const navigate = useNavigate();
    const slugFromPath = window.location.pathname.split('/').pop();
    const isNew = slugFromPath === 'new';

    const [page, setPage] = useState(null);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const token = localStorage.getItem('merchantToken');

    const fetchPage = async () => {
        if (isNew) return;
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/store-pages/${slugFromPath}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setPage(data.page);
                setTitle(data.page.title);
                setSlug(data.page.slug);
                setContent(data.page.content);
            }
        } catch (err) {
            console.error('Failed to fetch page:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPage();
    }, [slugFromPath, isNew]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Auto-generate slug from title during page creation
    const handleTitleChange = (val) => {
        setTitle(val);
        if (isNew) {
            const generatedSlug = val
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                .replace(/\s+/g, '-') // collapse whitespace and replace by -
                .replace(/-+/g, '-'); // collapse dashes
            setSlug(generatedSlug);
        }
    };

    const handleSave = async () => {
        if (isNew && !title.trim()) {
            showToast('Page title is required', 'error');
            return;
        }
        if (isNew && !slug.trim()) {
            showToast('Page slug is required', 'error');
            return;
        }

        setSaving(true);
        const targetSlug = isNew ? slug.trim() : slugFromPath;

        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/store-pages/${targetSlug}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-store-id': storeId
                },
                body: JSON.stringify({ 
                    content,
                    title: title.trim()
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showToast(isNew ? 'Page created successfully' : 'Page content saved successfully');
                if (isNew) {
                    setTimeout(() => {
                        navigate('/dashboard/pages');
                    }, 1000);
                }
            } else {
                showToast(data.message || 'Failed to save', 'error');
            }
        } catch (err) {
            console.error('Failed to save page:', err);
            showToast('Failed to save page', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-300 ${
                    toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {toast.type === 'success' 
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        }
                    </svg>
                    {toast.message}
                </div>
            )}

            <div className="flex items-center gap-3 mb-2">
                <Link to="/dashboard/pages" className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">
                        {isNew ? 'Create Store Page' : `Edit ${title}`}
                    </h1>
                </div>
            </div>

            {/* Inputs card for Title & Slug (only for creation, or editable title for editing) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-[#202223] mb-1.5">Page Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="e.g. Help Center"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#202223] mb-1.5">Page Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => isNew && setSlug(e.target.value)}
                            disabled={!isNew}
                            placeholder="e.g. help-center"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-mono disabled:bg-gray-50 disabled:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-[500px]">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <span className="text-sm font-bold text-gray-600">Page Content (HTML supported)</span>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            Dynamic tokens: {'{{storeName}}'}, {'{{email}}'}, {'{{phone}}'}, {'{{address}}'}
                        </p>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#1a1c23] text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-[2px] border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {isNew ? 'Create Page' : 'Save Changes'}
                    </button>
                </div>
                <div className="flex-1 p-0">
                    <textarea 
                        className="w-full h-full p-6 text-[#202223] resize-none focus:outline-none focus:ring-0 border-none font-mono text-sm leading-relaxed"
                        placeholder={`Enter the HTML / text content for ${title || 'your page'} here...`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default EditPageTab;
