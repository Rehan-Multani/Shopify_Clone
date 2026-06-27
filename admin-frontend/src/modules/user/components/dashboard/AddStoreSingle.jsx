import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MERCHANT_ADMIN_API_URL = import.meta.env.VITE_MERCHANT_ADMIN_API_URL;
const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;
const BILLING_API_URL = import.meta.env.VITE_BILLING_API_URL;

const AddStoreSingle = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [plans, setPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState('');

    // Parse path to see if we are in Edit Mode
    const pathParts = window.location.pathname.split('/');
    const isEdit = pathParts.includes('edit');
    const storeId = isEdit ? pathParts[pathParts.indexOf('edit') + 1] : null;

    const [form, setForm] = useState({
        storeName: '',
        storeDescription: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        storeLogo: '',
        facebook: '',
        instagram: '',
        twitter: ''
    });

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const getAuthHeaders = () => {
        const token = localStorage.getItem('merchantToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
        };
    };

    // Fetch plans
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch(`${MERCHANT_ADMIN_API_URL}/plans`);
                const data = await res.json();
                if (res.ok) {
                    const merchantInfo = JSON.parse(localStorage.getItem('merchantInfo') || '{}');
                    const currentPlanType = merchantInfo?.plan?.planType || 'Single Vendor';
                    const filteredPlans = data.filter(p => p.planType === currentPlanType);
                    setPlans(filteredPlans);
                    if (!isEdit) {
                        if (filteredPlans.length > 0) {
                            setSelectedPlanId(filteredPlans[0]._id);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch plans', err);
            }
        };
        fetchPlans();
    }, [isEdit]);

    // Fetch store details if editing
    useEffect(() => {
        if (!isEdit || !storeId) return;
        const fetchStore = async () => {
            try {
                const res = await fetch(`${STORE_API_URL}/stores/${storeId}`, {
                    headers: getAuthHeaders()
                });
                const data = await res.json();
                if (res.ok) {
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
                        twitter: data.socialLinks?.twitter || ''
                    });
                } else {
                    setError(data.message || 'Failed to fetch store details');
                }
            } catch (err) {
                console.error('Error fetching store details:', err);
                setError('Failed to load store data');
            }
        };
        fetchStore();
    }, [isEdit, storeId]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (document.getElementById('razorpay-script')) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => set('storeLogo', reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!form.storeName.trim()) {
            setError('Store name is required');
            return;
        }

        if (form.contactEmail.trim() && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.contactEmail.trim())) {
            setError('Please enter a valid contact email address');
            return;
        }

        if (form.contactPhone.trim() && !/^\d{10}$/.test(form.contactPhone.trim())) {
            setError('Phone number must be exactly 10 digits');
            return;
        }

        setIsSaving(true);
        setError('');

        if (isEdit) {
            // Update Store Flow
            try {
                const res = await fetch(`${STORE_API_URL}/stores/${storeId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        ...form,
                        socialLinks: {
                            facebook: form.facebook,
                            instagram: form.instagram,
                            twitter: form.twitter
                        }
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    // Update activeStoreId/shopStoreName in localStorage if we updated the currently active store
                    if (localStorage.getItem('activeStoreId') === storeId) {
                        localStorage.setItem('shopStoreName', data.storeName);
                    }
                    navigate('/dashboard/stores');
                } else {
                    setError(data.message || 'Failed to update store');
                }
            } catch (err) {
                setError('Connection error. Please try again.');
            } finally {
                setIsSaving(false);
            }
            return;
        }

        // Create Store Flow (with payment)
        if (!selectedPlanId) {
            setError('Please select a store plan');
            setIsSaving(false);
            return;
        }

        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setError('Failed to load payment gateway. Please check your internet connection.');
                setIsSaving(false);
                return;
            }

            // 1. Create order on backend
            const orderRes = await fetch(`${BILLING_API_URL}/create-order`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ planId: selectedPlanId })
            });
            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                setError(orderData.message || 'Failed to create payment order');
                setIsSaving(false);
                return;
            }

            const merchantInfo = JSON.parse(localStorage.getItem('merchantInfo') || '{}');
            const selectedPlan = plans.find(p => p._id === selectedPlanId);

            // Bypassing Razorpay checkout if backend issued a mock order
            if (orderData.orderId && orderData.orderId.startsWith('mock_order_')) {
                const verifyRes = await fetch(`${BILLING_API_URL}/verify-store-payment`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        razorpay_order_id: orderData.orderId,
                        razorpay_payment_id: `mock_pay_${Date.now()}`,
                        razorpay_signature: 'mock_sig',
                        planId: selectedPlanId,
                        storeDetails: {
                            ...form,
                            socialLinks: {
                                facebook: form.facebook,
                                instagram: form.instagram,
                                twitter: form.twitter
                            }
                        }
                    })
                });
                const verifyData = await verifyRes.json();

                if (verifyRes.ok) {
                    localStorage.setItem('activeStoreId', verifyData.store._id);
                    localStorage.setItem('shopStoreName', verifyData.store.storeName);
                    localStorage.setItem('adminPanelType', selectedPlan.planType === 'Multi Vendor' ? 'multi' : 'single');
                    window.location.href = '/dashboard/stores';
                } else {
                    setError(verifyData.message || 'Store verification failed');
                }
                setIsSaving(false);
                return;
            }

            // 2. Open Razorpay checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Storify',
                description: `${orderData.planName} Plan - Create Store`,
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        setIsSaving(true);
                        // 3. Verify payment and create store
                        const verifyRes = await fetch(`${BILLING_API_URL}/verify-store-payment`, {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planId: selectedPlanId,
                                storeDetails: {
                                    ...form,
                                    socialLinks: {
                                        facebook: form.facebook,
                                        instagram: form.instagram,
                                        twitter: form.twitter
                                    }
                                }
                            })
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            // Update active store
                            localStorage.setItem('activeStoreId', verifyData.store._id);
                            localStorage.setItem('shopStoreName', verifyData.store.storeName);
                            localStorage.setItem('adminPanelType', selectedPlan.planType === 'Multi Vendor' ? 'multi' : 'single');
                            window.location.href = '/dashboard/stores';
                        } else {
                            setError(verifyData.message || 'Store verification failed');
                        }
                    } catch (err) {
                        setError('Verification connection error. Please contact support.');
                    } finally {
                        setIsSaving(false);
                    }
                },
                prefill: {
                    name: merchantInfo.name || '',
                    email: merchantInfo.email || '',
                    contact: merchantInfo.mobile || ''
                },
                theme: {
                    color: '#1a1c23'
                },
                modal: {
                    ondismiss: function () {
                        setIsSaving(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            setError('Something went wrong. Please try again.');
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/stores')} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-[#202223]">{isEdit ? 'Edit Store' : 'Add Store'}</h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
                    {error}
                </div>
            )}

            {/* Store Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-sm font-bold text-[#202223] mb-4 uppercase tracking-wider">Store Details</h2>
                <div className="space-y-4">
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

                    <div>
                        <label className="block text-sm font-semibold text-[#202223] mb-1">Store Name <span className="text-red-500">*</span></label>
                        <input type="text" value={form.storeName} onChange={e => set('storeName', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                            placeholder="e.g. Rehan Electronics" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#202223] mb-1">Store Description</label>
                        <textarea value={form.storeDescription} onChange={e => set('storeDescription', e.target.value)} rows={3}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm resize-none"
                            placeholder="Describe what your store sells..." />
                    </div>

                    {!isEdit && (
                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-bold text-[#202223] mb-3">Select Store Plan <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plans.map(p => (
                                    <div 
                                        key={p._id}
                                        onClick={() => setSelectedPlanId(p._id)}
                                        className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between hover:border-black/20 ${selectedPlanId === p._id ? 'border-black bg-gray-50/50 ring-2 ring-black/5' : 'border-gray-200'}`}
                                    >
                                        <div>
                                            <p className="font-extrabold text-sm text-[#202223]">{p.planName}</p>
                                            <p className="text-[11px] text-[#5c5f62] mt-0.5">{p.description || `Build a ${p.planType} store`}</p>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#5c5f62]">{p.planType}</span>
                                            <span className="font-black text-sm text-black">₹{p.planPrice}/mo</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-sm font-bold text-[#202223] mb-4 uppercase tracking-wider">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#202223] mb-1">Email</label>
                        <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                            placeholder="store@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#202223] mb-1">Phone</label>
                        <input type="text" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                            placeholder="10-digit phone number" />
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-sm font-bold text-[#202223] mb-4 uppercase tracking-wider">Store Address</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#202223] mb-1">Address</label>
                        <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                            placeholder="Street address" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#202223] mb-1">City</label>
                            <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                                placeholder="e.g. Mumbai" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#202223] mb-1">State</label>
                            <input type="text" value={form.state} onChange={e => set('state', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                                placeholder="e.g. Maharashtra" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#202223] mb-1">Pincode</label>
                            <input type="text" value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                                placeholder="e.g. 400001" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-sm font-bold text-[#202223] mb-4 uppercase tracking-wider">Social Media</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.95.925-1.95 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </div>
                        <input type="url" value={form.facebook} onChange={e => set('facebook', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            placeholder="https://facebook.com/yourstore" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        </div>
                        <input type="url" value={form.instagram} onChange={e => set('instagram', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            placeholder="https://instagram.com/yourstore" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        </div>
                        <input type="url" value={form.twitter} onChange={e => set('twitter', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            placeholder="https://twitter.com/yourstore" />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pb-8">
                <button onClick={() => navigate('/dashboard/stores')} className="px-5 py-2.5 font-bold text-sm text-[#202223] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSaving || !form.storeName.trim()}
                    className={`px-5 py-2.5 font-bold text-sm text-white bg-black rounded-lg transition-all shadow-sm flex items-center gap-2 ${(isSaving || !form.storeName.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/80 active:scale-95'}`}
                >
                    {isSaving ? (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : null}
                    {isSaving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save changes' : 'Create store')}
                </button>
            </div>
        </div>
    );
};

export default AddStoreSingle;
