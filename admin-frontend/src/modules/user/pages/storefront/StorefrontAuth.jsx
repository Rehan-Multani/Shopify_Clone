import React, { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';
import { getStorePath } from '../../components/storefront/storeUrlHelper';

const StorefrontAuth = ({ cartCount, onLoginSuccess, customer, onLogout, storeInfo }) => {
    const { storeId: paramStoreId } = useParams();
    const storeId = storeInfo?._id || paramStoreId;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectPath = searchParams.get('redirect');

    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (isLogin) {
                // Real Login
                const res = await fetch(`${GATEWAY_URL}/customers/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-store-id': storeId
                    },
                    body: JSON.stringify({
                        email: form.email,
                        password: form.password
                    })
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    onLoginSuccess(data.customer);
                    const target = redirectPath ? getStorePath(storeId, `/${redirectPath}`) : getStorePath(storeId, '/');
                    navigate(target);
                } else {
                    setError(data.message || 'Invalid email address or password.');
                }
            } else {
                // Real Signup
                if (!form.name || !form.email || !form.phone || !form.password) {
                    setError('All fields are required.');
                    setSubmitting(false);
                    return;
                }

                const res = await fetch(`${GATEWAY_URL}/customers/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-store-id': storeId
                    },
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        number: form.phone,
                        password: form.password
                    })
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    onLoginSuccess(data.customer);
                    const target = redirectPath ? getStorePath(storeId, `/${redirectPath}`) : getStorePath(storeId, '/');
                    navigate(target);
                } else {
                    setError(data.message || 'Registration failed.');
                }
            }
        } catch (err) {
            console.error('Error during storefront customer auth:', err);
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-md mx-auto py-20 px-4 animate-scale-in">
                <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6" style={{ borderRadius: 'var(--border-radius)' }}>
                    {/* Tabs */}
                    <div className="flex border-b border-zinc-100 pb-3 gap-6 relative">
                        <button 
                            type="button"
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`text-[10px] font-black uppercase tracking-widest pb-1 transition-premium cursor-pointer ${
                                isLogin ? 'text-[var(--color-primary)]' : 'text-zinc-400 hover:text-zinc-600'
                            }`}
                            style={{ 
                                borderBottom: isLogin ? '2px solid var(--color-primary)' : '2px solid transparent',
                                marginBottom: '-13px'
                            }}
                        >
                            Sign In
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`text-[10px] font-black uppercase tracking-widest pb-1 transition-premium cursor-pointer ${
                                !isLogin ? 'text-[var(--color-primary)]' : 'text-zinc-400 hover:text-zinc-600'
                            }`}
                            style={{ 
                                borderBottom: !isLogin ? '2px solid var(--color-primary)' : '2px solid transparent',
                                marginBottom: '-13px'
                            }}
                        >
                            Register
                        </button>
                    </div>

                    <h2 className="text-md font-black text-zinc-900 uppercase tracking-wider pt-2 pl-0.5">
                        {isLogin ? 'Welcome Back!' : 'Create an Account'}
                    </h2>

                    {error && (
                        <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-slide-down">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={form.name} 
                                        onChange={e => setForm({...form, name: e.target.value})}
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/30 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        required
                                        value={form.phone} 
                                        onChange={e => setForm({...form, phone: e.target.value})}
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/30 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium" 
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Email Address</label>
                            <input 
                                type="email" 
                                required
                                value={form.email} 
                                onChange={e => setForm({...form, email: e.target.value})}
                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/30 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium" 
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    required
                                    value={form.password} 
                                    onChange={e => setForm({...form, password: e.target.value})}
                                    className="w-full pl-4 pr-10 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/30 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 transition-colors p-1 cursor-pointer"
                                    title={showPassword ? "Hide Password" : "Show Password"}
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.024 10.024 0 012.238-3.29M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 21l-2-2m-2-2L3 3m18 9a10.025 10.025 0 01-2.24 3.29M9 8.82A3.001 3.001 0 0115 12a3 3 0 01-.18 1" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 text-center text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-md hover:opacity-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 btn-premium"
                            style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                        >
                            {submitting && (
                                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {submitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Register Account'}
                        </button>
                    </form>
                </div>
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontAuth;
