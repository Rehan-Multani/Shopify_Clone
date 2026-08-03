import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

const StoreProfileTab = () => {
    const activeStoreId = localStorage.getItem('activeStoreId');
    const token = localStorage.getItem('merchantToken');

    const [form, setForm] = useState({
        storeName: localStorage.getItem('shopStoreName') || 'My Store',
        storeDescription: '',
        contactEmail: localStorage.getItem('shopEmail') || 'merchant@storify.com',
        contactPhone: localStorage.getItem('shopPhone') || '9876543210',
        address: localStorage.getItem('shopAddress') || '',
        city: '',
        state: '',
        pincode: '',
        storeLogo: '',
        facebook: '',
        instagram: '',
        twitter: '',
        gstPercent: 0,
        platformCommission: 0
    });

    const [paymentSettings, setPaymentSettings] = useState({
        codEnabled: true,
        onlineEnabled: true
    });

    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    useEffect(() => {
        if (!activeStoreId || !token) return;

        const fetchStoreData = async () => {
            try {
                const res = await fetch(`${STORE_API_URL}/stores/${activeStoreId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setForm({
                        storeName: data.storeName || '',
                        storeDescription: data.storeDescription || '',
                        contactEmail: data.contactEmail || '',
                        contactPhone: data.contactPhone || '',
                        address: data.address || '',
                        city: data.city || '',
                        state: data.state || '',
                        pincode: data.pincode || '',
                        storeLogo: data.storeLogo || '',
                        facebook: data.socialLinks?.facebook || '',
                        instagram: data.socialLinks?.instagram || '',
                        twitter: data.socialLinks?.twitter || '',
                        gstPercent: data.gstPercent || 0,
                        platformCommission: data.platformCommission || 0
                    });
                    if (data.paymentSettings) {
                        setPaymentSettings({
                            codEnabled: data.paymentSettings.codEnabled !== false,
                            onlineEnabled: data.paymentSettings.onlineEnabled !== false
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching store details:', err);
            }
        };

        fetchStoreData();
    }, [activeStoreId, token]);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => set('storeLogo', reader.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErrorMsg('');
        setSuccessMsg('');

        if (!form.storeName.trim()) {
            setErrorMsg('Store name is required');
            setIsSaving(false);
            return;
        }

        if (form.contactEmail.trim() && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.contactEmail.trim())) {
            setErrorMsg('Please enter a valid contact email address');
            setIsSaving(false);
            return;
        }

        if (form.contactPhone.trim() && !/^\d{10}$/.test(form.contactPhone.trim())) {
            setErrorMsg('Phone number must be exactly 10 digits');
            setIsSaving(false);
            return;
        }

        try {
            if (activeStoreId && token) {
                const res = await fetch(`${STORE_API_URL}/stores/${activeStoreId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...form,
                        socialLinks: {
                            facebook: form.facebook,
                            instagram: form.instagram,
                            twitter: form.twitter
                        },
                        paymentSettings: paymentSettings
                    })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to update store in database');
                }
            }

            localStorage.setItem('shopStoreName', form.storeName);
            localStorage.setItem('shopEmail', form.contactEmail);
            localStorage.setItem('shopPhone', form.contactPhone);
            localStorage.setItem('shopAddress', form.address);
            
            setSuccessMsg('Store settings and payment configurations updated successfully!');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            setErrorMsg(err.message || 'Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold text-[#202223]">Store Settings</h1>
                <p className="text-xs text-[#5c5f62] mt-0.5">Manage your shop name, contact channels, address, and checkout payment gateway settings.</p>
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                    {successMsg}
                </div>
            )}

            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold">
                    {errorMsg}
                </div>
            )}

            {/* Store Details */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-bold text-[#202223] pb-3 border-b border-gray-100 uppercase tracking-wider">Store Details</h2>
                
                {/* Logo Upload */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                        {form.storeLogo ? (
                            <img src={form.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        )}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[#202223]">Store Logo</p>
                        <p className="text-[11px] text-[#9CA3AF]">Upload a logo for your store (recommended: 512x512)</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Store Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={form.storeName} 
                            onChange={e => set('storeName', e.target.value)}
                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            placeholder="e.g. Rehan Electronics" 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Store Description</label>
                        <textarea 
                            value={form.storeDescription} 
                            onChange={e => set('storeDescription', e.target.value)} 
                            rows={3}
                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white resize-none" 
                            placeholder="Describe what your store sells..." 
                        />
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-bold text-[#202223] pb-3 border-b border-gray-100 uppercase tracking-wider">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Email</label>
                        <input 
                            type="email" 
                            value={form.contactEmail} 
                            onChange={e => set('contactEmail', e.target.value)}
                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            placeholder="store@example.com" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Phone</label>
                        <input 
                            type="text" 
                            value={form.contactPhone} 
                            onChange={e => set('contactPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            placeholder="10-digit phone number" 
                        />
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-bold text-[#202223] pb-3 border-b border-gray-100 uppercase tracking-wider">Store Address</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Address</label>
                        <input 
                            type="text" 
                            value={form.address} 
                            onChange={e => set('address', e.target.value)}
                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            placeholder="Street address" 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">City</label>
                            <input 
                                type="text" 
                                value={form.city} 
                                onChange={e => set('city', e.target.value)}
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                                placeholder="e.g. Mumbai" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">State</label>
                            <input 
                                type="text" 
                                value={form.state} 
                                onChange={e => set('state', e.target.value)}
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                                placeholder="e.g. Maharashtra" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Pincode</label>
                            <input 
                                type="text" 
                                value={form.pincode} 
                                onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                                placeholder="e.g. 400001" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-bold text-[#202223] pb-3 border-b border-gray-100 uppercase tracking-wider">Social Media</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.95.925-1.95 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </div>
                        <input 
                            type="url" 
                            value={form.facebook} 
                            onChange={e => set('facebook', e.target.value)}
                            className="flex-1 px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            placeholder="https://facebook.com/yourstore" 
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        </div>
                        <input 
                            type="url" 
                            value={form.instagram} 
                            onChange={e => set('instagram', e.target.value)}
                            className="flex-1 px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            placeholder="https://instagram.com/yourstore" 
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        </div>
                        <input 
                            type="url" 
                            value={form.twitter} 
                            onChange={e => set('twitter', e.target.value)}
                            className="flex-1 px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            placeholder="https://twitter.com/yourstore" 
                        />
                    </div>
                </div>
            </div>

            {/* Payment Settings Section */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-bold text-[#202223] pb-3 border-b border-gray-100 uppercase tracking-wider">Payment Settings</h2>
                <p className="text-xs text-[#5c5f62]">Configure which payment methods are enabled for your storefront checkout.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                        <div>
                            <h4 className="text-xs font-bold text-gray-800">Cash on Delivery (COD)</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5">Allow users to pay with cash at delivery.</p>
                        </div>
                        <button
                            onClick={() => setPaymentSettings(p => ({ ...p, codEnabled: !p.codEnabled }))}
                            className={`relative w-11 h-6 rounded-full transition-colors ${paymentSettings.codEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${paymentSettings.codEnabled ? 'translate-x-5' : ''}`}></span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                        <div>
                            <h4 className="text-xs font-bold text-gray-800">Online Payment</h4>
                            <p className="text-[10px] text-gray-500 mt-0.5">Enable online checkout via configured gateways.</p>
                        </div>
                        <button
                            onClick={() => setPaymentSettings(p => ({ ...p, onlineEnabled: !p.onlineEnabled }))}
                            className={`relative w-11 h-6 rounded-full transition-colors ${paymentSettings.onlineEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${paymentSettings.onlineEnabled ? 'translate-x-5' : ''}`}></span>
                        </button>
                    </div>
                </div>
                <Link
                    to="/dashboard/payment-gateways"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                >
                    Manage Payment Gateways (Razorpay, Stripe, PayU, Cashfree) →
                </Link>
            </div>

            {/* Tax & Handling Settings Section */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-bold text-[#202223] pb-3 border-b border-gray-100 uppercase tracking-wider">Tax & Handling Charges</h2>
                <p className="text-xs text-[#5c5f62]">Configure tax percentages and handling charges applied at checkout.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">GST (%)</label>
                        <input 
                            type="number" 
                            min="0"
                            max="100"
                            value={form.gstPercent} 
                            onChange={e => set('gstPercent', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            placeholder="e.g. 18" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Platform Commission / Handling Fee (%)</label>
                        <input 
                            type="number" 
                            min="0"
                            max="100"
                            value={form.platformCommission} 
                            onChange={e => set('platformCommission', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white" 
                            placeholder="e.g. 2" 
                        />
                    </div>
                </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#1a1c23] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? 'Saving Settings...' : 'Save Store Settings'}
                </button>
            </div>
        </div>
    );
};

export default StoreProfileTab;
