import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:5003/api';
const API_URL = CATALOG_API_URL;

const AddBanner = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const token = localStorage.getItem('merchantToken');

    const [form, setForm] = useState({
        title: '',
        isActive: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Parse path to see if we are in Edit Mode
    const pathParts = window.location.pathname.split('/');
    const isEdit = pathParts.includes('edit');
    const bannerId = isEdit ? pathParts[pathParts.indexOf('edit') + 1] : null;

    useEffect(() => {
        if (!isEdit || !bannerId) return;
        const fetchBanner = async () => {
            try {
                const storeId = localStorage.getItem('activeStoreId') || '';
                const res = await fetch(`${API_URL}/banners/${bannerId}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
                });
                const data = await res.json();
                if (res.ok) {
                    setForm({
                        title: data.title || '',
                        isActive: data.isActive !== undefined ? data.isActive : true
                    });
                    if (data.image) {
                        setImagePreview(`${API_URL.replace('/api', '')}${data.image}`);
                    }
                } else {
                    setError('Failed to fetch banner details');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load banner data');
            }
        };
        fetchBanner();
    }, [isEdit, bannerId]);

    const handleImageSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('Image must be less than 10MB');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageSelect(file);
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            setError('Banner title is required');
            return;
        }
        if (!isEdit && !imageFile) {
            setError('Banner image is required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            let imageUrl = isEdit ? (imageFile ? '' : imagePreview.replace(API_URL.replace('/api', ''), '')) : '';

            // Upload image first if selected
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                const storeId = localStorage.getItem('activeStoreId') || '';
                const uploadRes = await fetch(`${API_URL}/banners/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId },
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) {
                    imageUrl = uploadData.url;
                } else {
                    throw new Error(uploadData.message || 'Image upload failed');
                }
            }

            const storeId = localStorage.getItem('activeStoreId') || '';
            let res;
            if (isEdit) {
                res = await fetch(`${API_URL}/banners/${bannerId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}`,
                        'x-store-id': storeId
                    },
                    body: JSON.stringify({ ...form, image: imageUrl })
                });
            } else {
                res = await fetch(`${API_URL}/banners`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}`,
                        'x-store-id': storeId
                    },
                    body: JSON.stringify({ ...form, image: imageUrl })
                });
            }
            const data = await res.json();

            if (res.ok) {
                navigate('/dashboard/banners');
            } else {
                setError(data.message || `Failed to ${isEdit ? 'update' : 'create'} banner`);
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard/banners')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">{isEdit ? 'Edit Banner' : 'Add Banner'}</h1>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-8">
                {/* Banner Details */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-[#202223] pb-2 border-b border-gray-100">Banner Details</h2>
                    <div>
                        <label className="block text-sm font-bold text-[#202223] mb-1.5">Banner Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Summer Sale 50% Off, New Arrivals"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                        />
                    </div>
               
                </div>

                {/* Banner Image */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-[#202223] pb-2 border-b border-gray-100">Banner Image</h2>
                    
                    {imagePreview ? (
                        <div className="relative group w-full">
                            <div className="w-full aspect-[21/9] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <button
                                onClick={() => { setImageFile(null); setImagePreview(''); }}
                                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                                isDragging ? 'border-black bg-gray-50 scale-[1.01]' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
                            }`}
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="font-bold text-sm text-[#202223] mb-1">Drop banner image here or click to upload</p>
                            <p className="text-xs text-gray-400">Recommended size: 1920x800px. Accepts JPEG, PNG, WEBP up to 10MB</p>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageSelect(e.target.files[0])}
                        className="hidden"
                    />
                </div>

                {/* Status */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-[#202223] pb-2 border-b border-gray-100">Status</h2>
                    <div className="flex items-center justify-between max-w-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <span className="font-bold text-sm text-[#202223]">{form.isActive ? 'Active' : 'Inactive'}</span>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {form.isActive ? 'Visible on your store homepage' : 'Hidden from your store homepage'}
                            </p>
                        </div>
                        <button
                            onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                            className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`}></span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 pb-8">
                <button onClick={() => navigate('/dashboard/banners')} className="px-5 py-2.5 text-sm font-bold text-[#5c5f62] hover:bg-gray-100 rounded-lg transition-all">
                    Discard
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-2.5 bg-[#1a1c23] text-white rounded-lg font-bold text-sm transition-all shadow-md flex items-center gap-2 ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-black active:scale-95'}`}
                >
                    {saving && (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    Save Banner
                </button>
            </div>
        </div>
    );
};

export default AddBanner;
