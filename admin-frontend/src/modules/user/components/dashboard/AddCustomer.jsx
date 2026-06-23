import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:5003/api';
const API_URL = CATALOG_API_URL;

const AddCustomer = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const token = localStorage.getItem('merchantToken');

    const [form, setForm] = useState({
        name: '',
        email: '',
        number: '',
        image: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Parse path to see if we are in Edit Mode
    const pathParts = window.location.pathname.split('/');
    const isEdit = pathParts.includes('edit');
    const customerId = isEdit ? pathParts[pathParts.indexOf('edit') + 1] : null;

    useEffect(() => {
        if (!isEdit || !customerId) return;
        const fetchCustomer = async () => {
            try {
                const storeId = localStorage.getItem('activeStoreId') || '';
                const res = await fetch(`${API_URL}/customers/${customerId}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
                });
                const data = await res.json();
                if (res.ok) {
                    setForm({
                        name: data.name || '',
                        email: data.email || '',
                        number: data.number || '',
                        image: data.image || ''
                    });
                    if (data.image) {
                        setImagePreview(`${API_URL.replace('/api', '')}${data.image}`);
                    }
                } else {
                    setError('Failed to fetch customer details');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load customer data');
            }
        };
        fetchCustomer();
    }, [isEdit, customerId]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be under 5MB');
            return;
        }
        setError('');
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        setForm(p => ({ ...p, image: '' }));
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setError('Name is required'); return; }
        if (!form.email.trim()) { setError('Email is required'); return; }
        if (!form.number.trim()) { setError('Phone number is required'); return; }

        setSaving(true);
        setError('');

        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            let uploadedImageUrl = form.image;

            // Upload profile photo if a new one is selected
            if (imageFile) {
                const formData = new FormData();
                formData.append('images', imageFile); // matches multer field name
                const uploadRes = await fetch(`${API_URL}/customers/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId },
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) {
                    uploadedImageUrl = uploadData.url;
                } else {
                    throw new Error(uploadData.message || 'Profile photo upload failed');
                }
            }

            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                number: form.number.trim(),
                image: uploadedImageUrl
            };

            const url = isEdit ? `${API_URL}/customers/${customerId}` : `${API_URL}/customers`;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                navigate('/dashboard/customers');
            } else {
                setError(data.message || `Failed to ${isEdit ? 'update' : 'create'} customer`);
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/dashboard/customers')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">{isEdit ? 'Edit Customer' : 'Add Customer'}</h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
                {/* Photo Upload Section */}
                <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-100">
                    <div className="relative w-24 h-24 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shadow-inner group">
                        {imagePreview ? (
                            <>
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={handleRemoveImage} className="p-1.5 bg-white/90 rounded-lg text-red-500 hover:bg-red-50 transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-[10px] font-bold mt-1 uppercase">Upload</span>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    <p className="text-xs text-gray-400">Profile photo JPEG, PNG or WEBP up to 5MB</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#202223] mb-1.5">Full Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. John Doe"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#202223] mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                            placeholder="e.g. john.doe@example.com"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#202223] mb-1.5">Phone Number</label>
                        <input
                            type="tel"
                            value={form.number}
                            onChange={(e) => setForm(p => ({ ...p, number: e.target.value }))}
                            placeholder="e.g. +91 9876543210"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
                <button onClick={() => navigate('/dashboard/customers')} className="px-5 py-2.5 text-sm font-bold text-[#5c5f62] hover:bg-gray-100 rounded-lg transition-all">
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
                    {isEdit ? 'Update Customer' : 'Save Customer'}
                </button>
            </div>
        </div>
    );
};

export default AddCustomer;
