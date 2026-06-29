import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
const API_URL = CATALOG_API_URL;

const AddVendorSingle = () => {
    const navigate = useNavigate();
    const logoInputRef = useRef(null);
    const profileInputRef = useRef(null);
    
    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    // Route checks
    const pathParts = window.location.pathname.split('/');
    const isEdit = pathParts.includes('edit');
    const vendorId = isEdit ? pathParts[pathParts.indexOf('edit') + 1] : null;

    const [form, setForm] = useState({
        name: '',
        businessName: '',
        businessProfile: '',
        logo: '',
        profileImage: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        commission: 10,
        gstNumber: '',
        panNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isActive: true,
        bankDetails: {
            accountNumber: '',
            bankName: '',
            accountHolderName: '',
            ifscCode: ''
        }
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    const [profileFile, setProfileFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState('');

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Load data if in edit mode
    useEffect(() => {
        if (isEdit && vendorId && storeId) {
            const fetchVendor = async () => {
                try {
                    const res = await fetch(`${API_URL}/vendors/${vendorId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'x-store-id': storeId
                        }
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setForm({
                            name: data.name || '',
                            businessName: data.businessName || '',
                            businessProfile: data.businessProfile || '',
                            logo: data.logo || '',
                            profileImage: data.profileImage || '',
                            email: data.email || '',
                            mobile: data.mobile || '',
                            password: '',
                            confirmPassword: '',
                            commission: data.commission || 10,
                            gstNumber: data.gstNumber || '',
                            panNumber: data.panNumber || '',
                            address: data.address || '',
                            city: data.city || '',
                            state: data.state || '',
                            pincode: data.pincode || '',
                            isActive: data.isActive !== undefined ? data.isActive : true,
                            bankDetails: {
                                accountNumber: data.bankDetails?.accountNumber || '',
                                bankName: data.bankDetails?.bankName || '',
                                accountHolderName: data.bankDetails?.accountHolderName || '',
                                ifscCode: data.bankDetails?.ifscCode || ''
                            }
                        });
                        if (data.logo) {
                            setLogoPreview(`${API_URL.replace('/api', '')}${data.logo}`);
                        }
                        if (data.profileImage) {
                            setProfilePreview(`${API_URL.replace('/api', '')}${data.profileImage}`);
                        }
                    } else {
                        showToast(data.message || 'Failed to fetch vendor details', 'error');
                    }
                } catch (err) {
                    showToast('Failed to connect to server', 'error');
                }
            };
            fetchVendor();
        }
    }, [isEdit, vendorId, storeId]);

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
    const setBank = (k, v) => setForm(prev => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [k]: v }
    }));

    const handleLogoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file for logo', 'error');
            return;
        }
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleProfileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file for profile', 'error');
            return;
        }
        setProfileFile(file);
        setProfilePreview(URL.createObjectURL(file));
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview('');
        setForm(p => ({ ...p, logo: '' }));
    };

    const handleRemoveProfile = () => {
        setProfileFile(null);
        setProfilePreview('');
        setForm(p => ({ ...p, profileImage: '' }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.name.trim()) errs.name = 'Vendor name is required';
        if (!form.businessName.trim()) errs.businessName = 'Business name is required';
        if (!form.email.trim()) {
            errs.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'Enter a valid email address';
        }
        if (!form.mobile.trim()) {
            errs.mobile = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(form.mobile)) {
            errs.mobile = 'Must be exactly 10 digits';
        }
        if (form.commission < 0 || form.commission > 100) {
            errs.commission = 'Commission must be between 0% and 100%';
        }

        // Password validations
        if (!isEdit) {
            if (!form.password) {
                errs.password = 'Password is required';
            } else if (form.password.length < 6) {
                errs.password = 'Password must be at least 6 characters';
            }
        }

        if (form.password && form.password !== form.confirmPassword) {
            errs.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSaving(true);
        try {
            let uploadedLogoUrl = form.logo;
            let uploadedProfileUrl = form.profileImage;

            // Upload Logo
            if (logoFile) {
                const formData = new FormData();
                formData.append('image', logoFile);
                const uploadRes = await fetch(`${API_URL}/vendors/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId },
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) {
                    uploadedLogoUrl = uploadData.url;
                } else {
                    throw new Error(uploadData.message || 'Logo upload failed');
                }
            }

            // Upload Profile Image
            if (profileFile) {
                const formData = new FormData();
                formData.append('image', profileFile);
                const uploadRes = await fetch(`${API_URL}/vendors/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId },
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) {
                    uploadedProfileUrl = uploadData.url;
                } else {
                    throw new Error(uploadData.message || 'Profile image upload failed');
                }
            }

            const url = isEdit ? `${API_URL}/vendors/${vendorId}` : `${API_URL}/vendors`;
            const method = isEdit ? 'PUT' : 'POST';

            const payload = {
                name: form.name,
                businessName: form.businessName,
                businessProfile: form.businessProfile,
                logo: uploadedLogoUrl,
                profileImage: uploadedProfileUrl,
                email: form.email,
                mobile: form.mobile,
                commission: Number(form.commission),
                gstNumber: form.gstNumber,
                panNumber: form.panNumber,
                address: form.address,
                city: form.city,
                state: form.state,
                pincode: form.pincode,
                isActive: form.isActive,
                bankDetails: form.bankDetails
            };

            if (form.password) {
                payload.password = form.password;
            }

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
                navigate('/dashboard/vendors');
            } else {
                showToast(data.message || 'Failed to save vendor details', 'error');
            }
        } catch (err) {
            showToast(err.message || 'Failed to connect to server', 'error');
        } finally {
            setSaving(false);
        }
    };

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Toast Notifications */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#1a1c23]'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate('/dashboard/vendors')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">
                    {isEdit ? 'Edit Vendor Profile' : 'Add New Vendor'}
                </h1>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                
                {/* 1. Brand / Business Profile Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
                    <h3 className="text-base font-bold text-[#202223] border-b border-gray-100 pb-3">1. Business Profile & Branding</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Two Upload Blocks */}
                        <div className="lg:col-span-4 flex flex-row gap-6 justify-center lg:justify-start">
                            {/* Logo Upload */}
                            <div className="flex flex-col items-center gap-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Shop Logo</label>
                                <div className="relative w-24 h-24 rounded-2xl bg-gray-50 border border-dashed border-gray-300 overflow-hidden flex items-center justify-center shadow-inner group transition-all hover:bg-gray-100/30">
                                    {logoPreview ? (
                                        <>
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button type="button" onClick={handleRemoveLogo} className="p-1.5 bg-white/90 rounded-lg text-red-500 hover:bg-red-50 transition-all">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div onClick={() => logoInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:text-gray-600 transition-colors p-2 text-center">
                                            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-[8px] font-bold mt-1 uppercase">Upload Logo</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                            </div>

                            {/* Profile Photo Upload */}
                            <div className="flex flex-col items-center gap-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Owner Photo</label>
                                <div className="relative w-24 h-24 rounded-2xl bg-gray-50 border border-dashed border-gray-300 overflow-hidden flex items-center justify-center shadow-inner group transition-all hover:bg-gray-100/30">
                                    {profilePreview ? (
                                        <>
                                            <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button type="button" onClick={handleRemoveProfile} className="p-1.5 bg-white/90 rounded-lg text-red-500 hover:bg-red-50 transition-all">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div onClick={() => profileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:text-gray-600 transition-colors p-2 text-center">
                                            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="text-[8px] font-bold mt-1 uppercase">Upload Photo</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={profileInputRef} type="file" accept="image/*" onChange={handleProfileSelect} className="hidden" />
                            </div>
                        </div>

                        {/* Basic Profile Details */}
                        <div className="lg:col-span-8 space-y-4 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#202223] mb-1.5">Owner / Contact Name *</label>
                                    <input 
                                        type="text" 
                                        value={form.name}
                                        onChange={e => set('name', e.target.value)}
                                        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                                            errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-black/5 focus:border-black'
                                        }`} 
                                        placeholder="e.g. John Doe" 
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#202223] mb-1.5">Business / Shop Name *</label>
                                    <input 
                                        type="text" 
                                        value={form.businessName}
                                        onChange={e => set('businessName', e.target.value)}
                                        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                                            errors.businessName ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-black/5 focus:border-black'
                                        }`} 
                                        placeholder="e.g. Acme Clothing Store" 
                                    />
                                    {errors.businessName && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.businessName}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#202223] mb-1.5">Business Profile Description</label>
                                <textarea 
                                    value={form.businessProfile}
                                    onChange={e => set('businessProfile', e.target.value)}
                                    rows={2}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                                    placeholder="Write a brief profile description about the vendor..." 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Login & Credentials Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-[#202223] border-b border-gray-100 pb-3">2. Credentials & Login Account</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Vendor Email *</label>
                            <input 
                                type="email" 
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                                    errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-black/5 focus:border-black'
                                }`} 
                                placeholder="vendor@example.com" 
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Phone / Mobile Number *</label>
                            <input 
                                type="text" 
                                value={form.mobile}
                                onChange={e => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                                    errors.mobile ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-black/5 focus:border-black'
                                }`} 
                                placeholder="10-digit mobile number" 
                            />
                            {errors.mobile && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.mobile}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">
                                Password {isEdit && '(Leave blank to keep current)'} *
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={form.password}
                                    onChange={e => set('password', e.target.value)}
                                    className={`w-full border rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                                        errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-black/5 focus:border-black'
                                    }`} 
                                    placeholder="••••••" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Confirm Password *</label>
                            <div className="relative">
                                <input 
                                    type={showConfirmPassword ? 'text' : 'password'} 
                                    value={form.confirmPassword}
                                    onChange={e => set('confirmPassword', e.target.value)}
                                    className={`w-full border rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                                        errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-black/5 focus:border-black'
                                    }`} 
                                    placeholder="••••••" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.confirmPassword}</p>}
                        </div>
                    </div>
                </div>

                {/* 3. Address details Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-[#202223] border-b border-gray-100 pb-3">3. Address details</h3>
                    
                    <div>
                        <label className="block text-sm font-bold text-[#202223] mb-1.5">Street Address</label>
                        <input 
                            type="text" 
                            value={form.address}
                            onChange={e => set('address', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                            placeholder="e.g. 123 Business Avenue, Sector 5" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">City</label>
                            <input 
                                type="text" 
                                value={form.city}
                                onChange={e => set('city', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                                placeholder="e.g. Mumbai" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">State</label>
                            <input 
                                type="text" 
                                value={form.state}
                                onChange={e => set('state', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                                placeholder="e.g. Maharashtra" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Pincode</label>
                            <input 
                                type="text" 
                                value={form.pincode}
                                onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                                placeholder="e.g. 400001" 
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Tax details & Commission Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-[#202223] border-b border-gray-100 pb-3">4. Tax & Commission Configurations</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">GST Number</label>
                            <input 
                                type="text" 
                                value={form.gstNumber}
                                onChange={e => set('gstNumber', e.target.value.toUpperCase())}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                                placeholder="e.g. 27AAAAA0000A1Z5" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">PAN Number</label>
                            <input 
                                type="text" 
                                value={form.panNumber}
                                onChange={e => set('panNumber', e.target.value.toUpperCase().slice(0, 10))}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                                placeholder="e.g. ABCDE1234F" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Commission (%)</label>
                            <input 
                                type="number" 
                                value={form.commission}
                                onChange={e => set('commission', e.target.value)}
                                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                                    errors.commission ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-black/5 focus:border-black'
                                }`} 
                                placeholder="e.g. 10" 
                            />
                            {errors.commission && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.commission}</p>}
                        </div>
                    </div>
                </div>

                {/* 5. Bank Account Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-[#202223] border-b border-gray-100 pb-3">5. Bank Details (For Payouts)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Account Holder Name</label>
                            <input 
                                type="text" 
                                value={form.bankDetails.accountHolderName}
                                onChange={e => setBank('accountHolderName', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                                placeholder="e.g. John Doe" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Bank Name</label>
                            <input 
                                type="text" 
                                value={form.bankDetails.bankName}
                                onChange={e => setBank('bankName', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                                placeholder="e.g. HDFC Bank" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Account Number</label>
                            <input 
                                type="text" 
                                value={form.bankDetails.accountNumber}
                                onChange={e => setBank('accountNumber', e.target.value.replace(/\D/g, ''))}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                                placeholder="e.g. 501002938475" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">IFSC Code</label>
                            <input 
                                type="text" 
                                value={form.bankDetails.ifscCode}
                                onChange={e => setBank('ifscCode', e.target.value.toUpperCase().slice(0, 11))}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" 
                                placeholder="e.g. HDFC0000123" 
                            />
                        </div>
                    </div>
                </div>

                {/* 6. Settings Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-[#202223] border-b border-gray-100 pb-3">6. Configuration Settings</h3>
                    
                    <div>
                        <label className="block text-sm font-bold text-[#202223] mb-1.5">Vendor Status</label>
                        <select 
                            value={form.isActive ? 'active' : 'inactive'}
                            onChange={e => set('isActive', e.target.value === 'active')}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all bg-white cursor-pointer"
                        >
                            <option value="active">Active (Permitted to sell & manage)</option>
                            <option value="inactive">Inactive (Suspended/Blocked)</option>
                        </select>
                    </div>
                </div>

                {/* Bottom Sticky Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <button 
                        type="button"
                        onClick={() => navigate('/dashboard/vendors')} 
                        disabled={saving}
                        className="px-5 py-2.5 text-sm font-bold text-[#5c5f62] hover:bg-gray-100 rounded-lg transition-all"
                    >
                        Discard
                    </button>
                    <button 
                        type="submit"
                        disabled={saving}
                        className={`px-6 py-2.5 bg-[#1a1c23] text-white rounded-lg font-bold text-sm transition-all shadow-md flex items-center gap-2 ${
                            saving ? 'opacity-65 cursor-not-allowed' : 'hover:bg-black active:scale-95'
                        }`}
                    >
                        {saving && (
                            <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isEdit ? 'Update Vendor' : 'Save Vendor'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddVendorSingle;
