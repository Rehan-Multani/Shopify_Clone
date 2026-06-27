import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;
const API_URL = STORE_API_URL;

const PagesTab = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ open: false, slug: '', title: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    const fetchPages = async () => {
        try {
            const res = await fetch(`${API_URL}/store-pages`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setPages(data.pages.filter(p => p.slug !== 'home'));
            }
        } catch (err) {
            console.error('Failed to fetch pages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPages(); }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_URL}/store-pages/${deleteModal.slug}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            if (res.ok) {
                setPages(prev => prev.filter(p => p.slug !== deleteModal.slug));
                showToast('Page deleted successfully');
                fetchPages(); // reload to fetch defaults back if a default was deleted
            } else {
                showToast('Failed to delete page', 'error');
            }
        } catch (err) {
            showToast('Failed to delete page', 'error');
        }
        setDeleteModal({ open: false, slug: '', title: '' });
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
            {/* Toast */}
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

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Store Pages</h1>
                    <p className="text-sm text-[#5c5f62] mt-1">Manage standard and custom pages for your store</p>
                </div>
                <Link
                    to="/dashboard/pages/new"
                    className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Page
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Page Title</th>
                                <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3 hidden md:table-cell">Type</th>
                                <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3 hidden md:table-cell">Status</th>
                                <th className="text-right text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map((page, idx) => (
                                <tr key={page.slug} className={`group hover:bg-gray-50/80 transition-colors ${idx !== pages.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-[#202223]">{page.title}</span>
                                            <span className="text-xs text-gray-400 font-mono">/page/{page.slug}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold ${
                                            page.isDefault ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {page.isDefault ? 'System Default' : 'Custom Page'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        {!page.isNew ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                Customized
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                                Empty Template
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                         <div className="flex items-center justify-end gap-1.5">
                                             {/* Preview Page */}
                                             <a
                                                 href={page.slug === 'home' ? `/store/${storeId}` : `/store/${storeId}/pages/${page.slug}`}
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-teal-600"
                                                 title="Preview Page"
                                             >
                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                 </svg>
                                             </a>

                                             <Link
                                                 to={`/dashboard/pages/edit/${page.slug}`}
                                                 className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-black"
                                                 title="Edit Content"
                                             >
                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                 </svg>
                                             </Link>
                                             {!page.isNew && (
                                                 <button
                                                     onClick={() => setDeleteModal({ open: true, slug: page.slug, title: page.title })}
                                                     className="p-2 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-500"
                                                     title={page.isDefault ? "Reset to Default" : "Delete Page"}
                                                 >
                                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                     </svg>
                                                 </button>
                                             )}
                                         </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal({ open: false, slug: '', title: '' })}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-[#202223]">Delete Page</h3>
                            <p className="text-sm text-[#5c5f62] mt-1">Are you sure you want to delete / reset <strong>{deleteModal.title}</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal({ open: false, slug: '', title: '' })} className="flex-1 px-4 py-2.5 bg-gray-100 text-[#202223] rounded-lg font-bold text-sm hover:bg-gray-200 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagesTab;
