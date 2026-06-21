import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const EditPageTab = () => {
    const { "*": path } = useParams(); // Using wildcard since this component is nested deep in the routing structure
    // Extract slug from the path. Assuming path is something like 'pages/edit/privacy-policy' or just 'privacy-policy'
    // Since Dashboard route parameter is 'tab', we might need to parse the location directly.
    const slug = window.location.pathname.split('/').pop();
    
    const [page, setPage] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const navigate = useNavigate();

    const token = localStorage.getItem('merchantToken');

    const fetchPage = async () => {
        try {
            const res = await fetch(`${API_URL}/store-pages/${slug}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setPage(data.page);
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
    }, [slug]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/store-pages/${slug}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showToast('Page content saved successfully');
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

    if (!page) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <h3 className="font-bold text-[#202223] mb-2">Page not found</h3>
                <Link to="/dashboard/pages" className="text-blue-600 hover:underline text-sm font-medium">
                    Back to Pages
                </Link>
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
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Edit {page.title}</h1>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-600">Page Content (HTML supported)</span>
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
                        Save Changes
                    </button>
                </div>
                <div className="flex-1 p-0">
                    <textarea 
                        className="w-full h-full p-6 text-[#202223] resize-none focus:outline-none focus:ring-0 border-none font-mono text-sm leading-relaxed"
                        placeholder={`Enter the content for ${page.title} here...`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default EditPageTab;
