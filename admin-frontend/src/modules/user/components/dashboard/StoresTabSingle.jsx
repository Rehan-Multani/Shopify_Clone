import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;
const API_URL = STORE_API_URL;

const StoresTabSingle = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingStore, setDeletingStore] = useState(null);
    const [toast, setToast] = useState(null);
    const [activeStoreId, setActiveStoreId] = useState(localStorage.getItem('activeStoreId') || '');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('merchantToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
        };
    };

    const fetchStores = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_URL}/stores/my-stores`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (res.ok) {
                setStores(data);
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStores(); }, []);

    const handleDelete = async () => {
        if (!deletingStore) return;
        try {
            const res = await fetch(`${API_URL}/stores/${deletingStore._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setStores(prev => prev.filter(s => s._id !== deletingStore._id));
                setToast({ msg: `Store "${deletingStore.storeName}" deleted`, type: 'success' });
            } else {
                const data = await res.json();
                setToast({ msg: data.message || 'Delete failed', type: 'error' });
            }
        } catch (error) {
            setToast({ msg: 'Network error', type: 'error' });
        } finally {
            setDeletingStore(null);
        }
    };

    const handleToggleActive = async (store) => {
        try {
            const res = await fetch(`${API_URL}/stores/${store._id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ isActive: !store.isActive })
            });
            const data = await res.json();
            if (res.ok) {
                setStores(prev => prev.map(s => s._id === data._id ? data : s));
                setToast({ msg: `Store ${data.isActive ? 'activated' : 'deactivated'}`, type: 'success' });
            }
        } catch (error) {
            setToast({ msg: 'Error updating store', type: 'error' });
        }
    };
    const handleSelectStore = (store) => {
        localStorage.setItem('activeStoreId', store._id);
        localStorage.setItem('shopStoreName', store.storeName);
        localStorage.setItem('adminPanelType', store.planType === 'Multi Vendor' ? 'multi' : 'single');
        setActiveStoreId(store._id);
        setToast({ msg: `Switched to store "${store.storeName}"`, type: 'success' });
        setTimeout(() => { window.location.href = '/dashboard'; }, 500);
    };
    // Toast component
    const Toast = () => {
        if (!toast) return null;
        setTimeout(() => setToast(null), 3000);
        return (
            <div className={`fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#1a1c23]'}`}>
                {toast.type === 'success' ? (
                    <svg className="w-4 h-4 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                {toast.msg}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Toast />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Stores</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Manage your store locations and online presence.</p>
                </div>
                <Link
                    to="/dashboard/stores/new"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black/80 transition-all shadow-sm active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add store
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Stores', value: stores.length, color: '#202223' },
                    { label: 'Active', value: stores.filter(s => s.isActive).length, color: '#15803d' },
                    { label: 'Inactive', value: stores.filter(s => !s.isActive).length, color: '#DC2626' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs font-semibold text-[#5c5f62] mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Store Cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-gray-200 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-5 bg-gray-200 rounded w-32" />
                                    <div className="h-3 bg-gray-100 rounded w-48" />
                                </div>
                            </div>
                            <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                            <div className="h-4 bg-gray-100 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            ) : stores.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#202223] mb-2">Create your first store</h3>
                        <p className="text-[#5c5f62] mb-6 max-w-md text-sm">Add a store to start selling. Each store gets its own products, pages, and settings.</p>
                        <Link
                            to="/dashboard/stores/new"
                            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-black/80 transition-all shadow-sm active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add store
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stores.map(store => (
                        <div key={store._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                            {/* Store Banner */}
                            {store.storeBanner && (
                                <div className="h-24 bg-gradient-to-r from-gray-100 to-gray-50 overflow-hidden">
                                    <img src={store.storeBanner.startsWith('http') || store.storeBanner.startsWith('data:') ? store.storeBanner : `${API_URL.replace('/api', '')}${store.storeBanner}`} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {store.storeLogo ? (
                                            <img src={store.storeLogo.startsWith('http') || store.storeLogo.startsWith('data:') ? store.storeLogo : `${API_URL.replace('/api', '')}${store.storeLogo}`} alt={store.storeName} className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0d9488] flex items-center justify-center text-white font-black text-lg shadow-sm">
                                                {store.storeName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-[#202223] text-base">{store.storeName}</h3>
                                            <p className="text-[11px] text-[#9CA3AF] font-medium">/{store.storeSlug}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${store.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                        {store.isActive ? '● Active' : '● Inactive'}
                                    </span>
                                </div>

                                {store.storeDescription && (
                                    <p className="text-sm text-[#5c5f62] mb-3 line-clamp-2">{store.storeDescription}</p>
                                )}

                                <div className="flex items-center gap-4 text-[11px] text-[#9CA3AF] font-medium mb-4">
                                    {store.contactEmail && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            {store.contactEmail}
                                        </span>
                                    )}
                                    {store.city && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {store.city}{store.state ? `, ${store.state}` : ''}
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSelectStore(store)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${activeStoreId === store._id ? 'bg-black text-white border-black' : 'border-gray-200 text-[#202223] hover:bg-gray-50'}`}
                                        >
                                            {activeStoreId === store._id ? 'Currently Managing' : 'Manage Store'}
                                        </button>
                                        <button onClick={() => navigate(`/dashboard/stores/edit/${store._id}`)} className="py-2 px-3 rounded-lg text-xs font-bold border border-gray-200 text-[#202223] hover:bg-gray-50 transition-all">
                                            Edit
                                        </button>
                                        <button onClick={() => handleToggleActive(store)} className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${store.isActive ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                                            {store.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => setDeletingStore(store)} className="py-2 px-3 rounded-lg text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50 transition-all">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingStore && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={e => e.target === e.currentTarget && setDeletingStore(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-[#202223]">Delete Store</h3>
                            <button onClick={() => setDeletingStore(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm font-semibold text-red-800">
                                    Are you sure you want to delete <strong>{deletingStore.storeName}</strong>? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setDeletingStore(null)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-[#5c5f62] hover:bg-gray-50 transition-all">Cancel</button>
                                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all">Delete Store</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoresTabSingle;
