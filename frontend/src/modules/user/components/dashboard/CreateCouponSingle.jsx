import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:5003/api';
const API_URL = CATALOG_API_URL;

const CreateCoupon = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('merchantToken');

    const [form, setForm] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minimumOrderAmount: '',
        usageLimit: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: '',
        isActive: true
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setForm(p => ({ ...p, code }));
    };

    const handleSave = async () => {
        if (!form.code.trim()) { setError('Coupon code is required'); return; }
        if (!form.discountValue || Number(form.discountValue) <= 0) { setError('Discount value must be greater than 0'); return; }
        if (form.discountType === 'percentage' && Number(form.discountValue) > 100) { setError('Percentage discount cannot exceed 100%'); return; }

        setSaving(true);
        setError('');

        try {
            const payload = {
                code: form.code.trim(),
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : 0,
                usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                startDate: form.startDate || null,
                endDate: form.endDate || null,
                description: form.description,
                isActive: form.isActive
            };

            const res = await fetch(`${API_URL}/coupons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                navigate('/dashboard/coupons');
            } else {
                setError(data.message || 'Failed to create coupon');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard/coupons')} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Create Coupon</h1>
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
                {/* Coupon Code & Status */}
                <div className="flex flex-col md:flex-row gap-8 pb-8 border-b border-gray-100">
                    <div className="flex-grow space-y-4">
                        <h2 className="text-lg font-bold text-[#202223]">Coupon Code</h2>
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                    placeholder="e.g. SUMMER2024"
                                    className="flex-grow max-w-sm border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all font-mono uppercase tracking-wider font-bold"
                                />
                                <button
                                    onClick={generateCode}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-[#5c5f62] transition-all whitespace-nowrap"
                                >
                                    Generate
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Customers will enter this code at checkout</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Description (optional)</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Internal note about this coupon..."
                                rows={2}
                                className="w-full max-w-lg border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all resize-none"
                            />
                        </div>
                    </div>
                    
                    {/* Status & Preview */}
                    <div className="md:w-72 space-y-6 flex-shrink-0">
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

                        {form.code && (
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4 shadow-sm">
                                <h3 className="text-[10px] font-black text-indigo-400 tracking-[0.15em] uppercase mb-2">Preview</h3>
                                <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono font-bold text-base text-[#202223] tracking-wider truncate">{form.code}</span>
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${form.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                    </div>
                                    {form.discountValue && (
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md p-2 text-center mb-2">
                                            <span className="text-xl font-black">
                                                {form.discountType === 'percentage' ? `${form.discountValue}%` : `₹${Number(form.discountValue).toLocaleString('en-IN')}`}
                                            </span>
                                        </div>
                                    )}
                                    <div className="space-y-0.5 text-[11px] text-[#5c5f62]">
                                        {form.minimumOrderAmount && <p>Min. order: ₹{Number(form.minimumOrderAmount).toLocaleString('en-IN')}</p>}
                                        {form.usageLimit && <p>Limited to {form.usageLimit} uses</p>}
                                        {form.endDate && <p>Expires: {new Date(form.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Discount Details */}
                <div className="space-y-4 pb-8 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-[#202223]">Discount Details</h2>
                    <div>
                        <label className="block text-sm font-bold text-[#202223] mb-2">Discount Type</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                            {[
                                { value: 'percentage', label: 'Percentage', icon: '%', desc: 'Discount by percentage' },
                                { value: 'flat', label: 'Flat Amount', icon: '₹', desc: 'Fixed amount off' }
                            ].map(type => (
                                <button
                                    key={type.value}
                                    onClick={() => setForm(p => ({ ...p, discountType: type.value }))}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                                        form.discountType === type.value
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                                            form.discountType === type.value ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {type.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[#202223]">{type.label}</p>
                                            <p className="text-xs text-gray-400">{type.desc}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl pt-2">
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Discount Value</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                                    {form.discountType === 'percentage' ? '%' : '₹'}
                                </span>
                                <input
                                    type="number"
                                    value={form.discountValue}
                                    onChange={(e) => setForm(p => ({ ...p, discountValue: e.target.value }))}
                                    placeholder="0"
                                    min="0"
                                    max={form.discountType === 'percentage' ? 100 : undefined}
                                    className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Minimum Order Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                <input
                                    type="number"
                                    value={form.minimumOrderAmount}
                                    onChange={(e) => setForm(p => ({ ...p, minimumOrderAmount: e.target.value }))}
                                    placeholder="No minimum"
                                    min="0"
                                    className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage & Validity */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-[#202223]">Usage & Validity</h2>
                    <div className="max-w-sm">
                        <label className="block text-sm font-bold text-[#202223] mb-1.5">Usage Limit</label>
                        <input
                            type="number"
                            value={form.usageLimit}
                            onChange={(e) => setForm(p => ({ ...p, usageLimit: e.target.value }))}
                            placeholder="Unlimited (leave empty)"
                            min="1"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-400 mt-1">Total number of times this coupon can be used. Leave empty for unlimited.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl pt-2">
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">Start Date</label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#202223] mb-1.5">End Date</label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all cursor-pointer"
                            />
                            <p className="text-xs text-gray-400 mt-1">Leave empty for no expiry</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 pb-8">
                <button onClick={() => navigate('/dashboard/coupons')} className="px-5 py-2.5 text-sm font-bold text-[#5c5f62] hover:bg-gray-100 rounded-lg transition-all">
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
                    Save Coupon
                </button>
            </div>
        </div>
    );
};

export default CreateCoupon;
