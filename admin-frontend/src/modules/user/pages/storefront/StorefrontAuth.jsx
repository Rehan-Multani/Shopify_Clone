import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';

const StorefrontAuth = ({ cartCount, onLoginSuccess, customer, onLogout, storeInfo }) => {
    const { storeId } = useParams();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        setTimeout(() => {
            setSubmitting(false);
            if (isLogin) {
                // Simulate Login
                const customers = JSON.parse(localStorage.getItem('store_customers') || '[]');
                const found = customers.find(c => c.email === form.email && c.password === form.password);
                if (found) {
                    onLoginSuccess(found);
                    navigate(`/store/${storeId}`);
                } else {
                    setError('Invalid email address or password.');
                }
            } else {
                // Simulate Signup
                if (!form.name || !form.email || !form.phone || !form.password) {
                    setError('All fields are required.');
                    return;
                }
                const customers = JSON.parse(localStorage.getItem('store_customers') || '[]');
                const exists = customers.some(c => c.email === form.email);
                if (exists) {
                    setError('A customer with this email already exists.');
                    return;
                }

                const newCustomer = {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    password: form.password
                };
                customers.push(newCustomer);
                localStorage.setItem('store_customers', JSON.stringify(customers));

                onLoginSuccess(newCustomer);
                navigate(`/store/${storeId}`);
            }
        }, 1000);
    };

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-md mx-auto py-16 px-4">
                <div className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 pb-3 gap-6">
                        <button 
                            type="button"
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`text-sm font-black uppercase tracking-wider pb-1 transition-all cursor-pointer ${
                                isLogin ? 'text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Sign In
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`text-sm font-black uppercase tracking-wider pb-1 transition-all cursor-pointer ${
                                !isLogin ? 'text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Register
                        </button>
                    </div>

                    <h2 className="text-xl font-black text-gray-900 tracking-tight">
                        {isLogin ? 'Welcome Back!' : 'Create an Account'}
                    </h2>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={form.name} 
                                        onChange={e => setForm({...form, name: e.target.value})}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        required
                                        value={form.phone} 
                                        onChange={e => setForm({...form, phone: e.target.value})}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Email Address</label>
                            <input 
                                type="email" 
                                required
                                value={form.email} 
                                onChange={e => setForm({...form, email: e.target.value})}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Password</label>
                            <input 
                                type="password" 
                                required
                                value={form.password} 
                                onChange={e => setForm({...form, password: e.target.value})}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 text-center text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md hover:opacity-95 disabled:opacity-50 cursor-pointer"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                            {submitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Register Account'}
                        </button>
                    </form>
                </div>
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontAuth;
