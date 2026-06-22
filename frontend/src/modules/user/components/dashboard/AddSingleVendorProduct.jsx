import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:5003/api';
const API_URL = CATALOG_API_URL;

const AddSingleVendorProduct = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const token = localStorage.getItem('merchantToken');

    const [form, setForm] = useState({
        name: '',
        description: '',
        brandName: '',
        sku: '',
        actualPrice: '',
        sellingPrice: '',
        stock: '',
        category: '',
        weight: '',
        tags: '',
        isActive: true
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const storeId = localStorage.getItem('activeStoreId') || '';
                const res = await fetch(`${API_URL}/categories`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
                });
                const data = await res.json();
                if (res.ok) setCategories(data.filter(c => c.isActive));
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const handleImageSelect = (files) => {
        const newFiles = Array.from(files);
        const totalCount = imageFiles.length + newFiles.length;
        if (totalCount > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        const validFiles = newFiles.filter(f => {
            if (!f.type.startsWith('image/')) return false;
            if (f.size > 5 * 1024 * 1024) return false;
            return true;
        });

        if (validFiles.length !== newFiles.length) {
            setError('Some files were skipped. Only images under 5MB are accepted.');
        } else {
            setError('');
        }

        const newPreviews = validFiles.map(f => URL.createObjectURL(f));
        setImageFiles(prev => [...prev, ...validFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleImageSelect(e.dataTransfer.files);
    };

    const generateSku = () => {
        const prefix = form.brandName ? form.brandName.substring(0, 3).toUpperCase() : 'PRD';
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        setForm(p => ({ ...p, sku: `${prefix}-${random}` }));
    };

    const discount = form.actualPrice && form.sellingPrice && Number(form.actualPrice) > Number(form.sellingPrice)
        ? Math.round(((Number(form.actualPrice) - Number(form.sellingPrice)) / Number(form.actualPrice)) * 100)
        : null;

    const handleSave = async () => {
        if (!form.name.trim()) { setError('Product name is required'); return; }
        if (!form.actualPrice || Number(form.actualPrice) <= 0) { setError('Actual price is required'); return; }
        if (!form.sellingPrice || Number(form.sellingPrice) <= 0) { setError('Selling price is required'); return; }

        setSaving(true);
        setError('');

        try {
            let imageUrls = [];

            // Upload images if any
            if (imageFiles.length > 0) {
                const formData = new FormData();
                imageFiles.forEach(file => formData.append('images', file));
                const storeId = localStorage.getItem('activeStoreId') || '';
                const uploadRes = await fetch(`${API_URL}/products/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId },
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) {
                    imageUrls = uploadData.urls;
                } else {
                    throw new Error(uploadData.message || 'Image upload failed');
                }
            }

            // Create product
            const payload = {
                name: form.name.trim(),
                images: imageUrls,
                description: form.description,
                brandName: form.brandName,
                sku: form.sku,
                actualPrice: Number(form.actualPrice),
                sellingPrice: Number(form.sellingPrice),
                stock: form.stock ? Number(form.stock) : 0,
                category: form.category || null,
                weight: form.weight,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                isActive: form.isActive
            };

            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                navigate('/dashboard/products');
            } else {
                setError(data.message || 'Failed to create product');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard/products')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Add Product</h1>
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
                {/* Header Info & Status & Category */}
                <div className="flex flex-col md:flex-row gap-8 pb-8 border-b border-gray-100">
                    <div className="flex-grow space-y-4">
                        <h2 className="text-lg font-bold text-[#202223]">Basic Information</h2>
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Product Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Premium Wireless Headphones"
                                className="w-full max-w-lg border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Describe your product..."
                                rows={5}
                                className="w-full max-w-2xl border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000 characters</p>
                        </div>
                    </div>
                    
                    <div className="md:w-72 space-y-6 flex-shrink-0">
                        {/* Status */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="block text-sm font-bold text-[#202223] mb-3">Status</label>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#5c5f62]">{form.isActive ? 'Active' : 'Inactive'}</span>
                                <button
                                    onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`}></span>
                                </button>
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 cursor-pointer"
                            >
                                <option value="">Select category</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                            {categories.length === 0 && (
                                <p className="text-xs text-gray-400 mt-2">No categories yet. <button onClick={() => navigate('/dashboard/category/new')} className="text-blue-600 hover:underline">Create one</button></p>
                            )}
                        </div>

                        {/* Inventory Info */}
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Stock Quantity</label>
                            <input
                                type="number"
                                value={form.stock}
                                onChange={(e) => setForm(p => ({ ...p, stock: e.target.value }))}
                                placeholder="0"
                                min="0"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="space-y-4 pb-8 border-b border-gray-100">
                    <div className="flex items-center justify-between max-w-3xl">
                        <h2 className="text-lg font-bold text-[#202223]">Media</h2>
                        <span className="text-xs text-gray-400 font-medium">{imageFiles.length}/5 images</span>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl">
                            {imagePreviews.map((preview, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                    <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="p-2 bg-white/90 rounded-lg text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    {idx === 0 && (
                                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Main</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload Area */}
                    {imageFiles.length < 5 && (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`max-w-3xl border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                                isDragging ? 'border-black bg-gray-50 scale-[1.01]' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
                            }`}
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="font-bold text-sm text-[#202223] mb-1">Drop images here or click to upload</p>
                            <p className="text-xs text-gray-400">JPEG, PNG, WEBP up to 5MB each • {5 - imageFiles.length} remaining</p>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageSelect(e.target.files)}
                        className="hidden"
                    />
                </div>

                {/* Pricing & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#202223]">Pricing</h2>
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Actual Price (MRP)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                <input
                                    type="number"
                                    value={form.actualPrice}
                                    onChange={(e) => setForm(p => ({ ...p, actualPrice: e.target.value }))}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Selling Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                <input
                                    type="number"
                                    value={form.sellingPrice}
                                    onChange={(e) => setForm(p => ({ ...p, sellingPrice: e.target.value }))}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        {discount && (
                            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span className="text-sm font-bold text-emerald-700">Customer saves {discount}% (₹{(Number(form.actualPrice) - Number(form.sellingPrice)).toLocaleString('en-IN')} off)</span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#202223]">Details</h2>
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Brand Name</label>
                            <input
                                type="text"
                                value={form.brandName}
                                onChange={(e) => setForm(p => ({ ...p, brandName: e.target.value }))}
                                placeholder="e.g. Nike, Apple"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">SKU</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={form.sku}
                                    onChange={(e) => setForm(p => ({ ...p, sku: e.target.value }))}
                                    placeholder="e.g. PRD-ABC123"
                                    className="flex-grow border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all font-mono uppercase"
                                />
                                <button
                                    onClick={generateSku}
                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-[#5c5f62] transition-all whitespace-nowrap"
                                    title="Auto-generate SKU"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-[#202223] mb-1.5">Weight</label>
                                <input
                                    type="text"
                                    value={form.weight}
                                    onChange={(e) => setForm(p => ({ ...p, weight: e.target.value }))}
                                    placeholder="e.g. 500g"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#202223] mb-1.5">Tags</label>
                                <input
                                    type="text"
                                    value={form.tags}
                                    onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))}
                                    placeholder="sale, new"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 pb-8">
                <button onClick={() => navigate('/dashboard/products')} className="px-5 py-2.5 text-sm font-bold text-[#5c5f62] hover:bg-gray-100 rounded-lg transition-all">
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
                    Save Product
                </button>
            </div>
        </div>
    );
};

export default AddSingleVendorProduct;
