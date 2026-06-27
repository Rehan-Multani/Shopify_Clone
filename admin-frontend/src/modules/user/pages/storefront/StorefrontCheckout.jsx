import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

const StorefrontCheckout = ({ cart, cartCount, onClearCart, customer, onLogout, storeInfo }) => {
    const { storeId } = useParams();
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment

    const [form, setForm] = useState({
        name: customer?.name || '',
        email: customer?.email || '',
        phone: customer?.number || '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const isCodEnabled = storeInfo?.paymentSettings?.codEnabled ?? true;
    const isOnlineEnabled = storeInfo?.paymentSettings?.razorpayEnabled ?? false;

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);

    // Set default payment method based on settings
    React.useEffect(() => {
        if (isCodEnabled) {
            setPaymentMethod('COD');
        } else if (isOnlineEnabled) {
            setPaymentMethod('Razorpay');
        }
    }, [isCodEnabled, isOnlineEnabled]);

    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);

    const handleInputChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
            setError('Please fill in all shipping details before proceeding.');
            return;
        }
        setStep(2);
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        if (!paymentMethod) {
            setError('Please select a payment method.');
            return;
        }

        setError('');
        setSubmitting(true);

        const productsPayload = cart.map(item => ({
            productId: item._id,
            productName: item.name,
            quantity: item.qty,
            price: item.sellingPrice
        }));

        try {
            const res = await fetch(`${GATEWAY_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-store-id': storeId
                },
                body: JSON.stringify({
                    customerName: form.name,
                    customerEmail: form.email,
                    customerPhone: form.phone,
                    shippingAddress: {
                        address: form.address,
                        city: form.city,
                        state: form.state,
                        pincode: form.pincode
                    },
                    products: productsPayload,
                    totalAmount: subtotal,
                    status: 'pending',
                    paymentStatus: paymentMethod === 'Razorpay' ? 'paid' : 'pending',
                    paymentMethod: paymentMethod,
                    storeId: storeId
                })
            });

            const data = await res.json();
            if (res.ok) {
                setOrderSuccess(data);
                onClearCart();
            } else {
                setError(data.message || 'Failed to place order. Please try again.');
            }
        } catch (err) {
            console.error('Error placing storefront order:', err);
            setError('Network error while placing order. Please check connection.');
        } finally {
            setSubmitting(false);
        }
    };

    if (orderSuccess) {
        const orderDisplayId = orderSuccess._id ? orderSuccess._id.slice(-6).toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString();
        return (
            <StorefrontLayout cartCount={0} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6 animate-scale-in">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100 shadow-sm">
                        <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-wide">Order Confirmed!</h2>
                        <p className="text-xs text-zinc-550 max-w-xs mx-auto leading-relaxed font-semibold">
                            Thank you for shopping with us. Your Order ID is <strong className="text-zinc-900">#{orderDisplayId}</strong>. We are preparing it for shipping.
                        </p>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 text-left text-xs font-semibold text-zinc-650 space-y-2.5">
                        <p className="flex justify-between border-b border-zinc-200/50 pb-2">
                            <span>Payment Method</span>
                            <span className="text-zinc-900 uppercase font-bold">{paymentMethod}</span>
                        </p>
                        <p className="flex justify-between">
                            <span>Amount Paid</span>
                            <span className="text-zinc-900 font-bold">₹{subtotal.toLocaleString()}</span>
                        </p>
                    </div>
                    <Link 
                        to={`/store/${storeId}/catalog`} 
                        className="inline-block px-7 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md btn-premium"
                        style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                    >
                        Continue Shopping
                    </Link>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
                <div className="space-y-1 mb-8">
                    <h1 className="text-lg font-black tracking-widest text-zinc-900 uppercase">Secure Checkout</h1>
                    <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-zinc-200/60 rounded-3xl space-y-4 max-w-md mx-auto shadow-sm">
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">No items in your cart to checkout.</p>
                        <Link 
                            to={`/store/${storeId}/catalog`} 
                            className="inline-block px-6 py-2.5 bg-zinc-950 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-md"
                        >
                            Explore Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Form Steps */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Step Indicators */}
                            <div className="flex items-center gap-4 bg-white border border-zinc-200/60 p-4 rounded-2xl shadow-sm text-xs font-black uppercase tracking-wider">
                                <span className={`flex items-center gap-1.5 ${step === 1 ? 'text-[var(--color-primary)]' : 'text-zinc-400'}`}>
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-black ${
                                        step === 1 ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-zinc-300'
                                    }`}>1</span>
                                    Shipping
                                </span>
                                <span className="w-8 h-px bg-zinc-200" />
                                <span className={`flex items-center gap-1.5 ${step === 2 ? 'text-[var(--color-primary)]' : 'text-zinc-400'}`}>
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-black ${
                                        step === 2 ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-zinc-300'
                                    }`}>2</span>
                                    Payment
                                </span>
                            </div>

                            {error && (
                                <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-slide-down">
                                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            {step === 1 ? (
                                <form onSubmit={handleNextStep} className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4" style={{ borderRadius: 'var(--border-radius)' }}>
                                    <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-2 pb-2 border-b border-zinc-100">Shipping Information</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Full Name</label>
                                            <input 
                                                type="text" 
                                                name="name" 
                                                required
                                                value={form.name} 
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/30 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Phone Number</label>
                                            <input 
                                                type="tel" 
                                                name="phone" 
                                                required
                                                value={form.phone} 
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/30 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Email Address</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            required
                                            value={form.email} 
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/30 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Street Address</label>
                                        <input 
                                            type="text" 
                                            name="address" 
                                            required
                                            value={form.address} 
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/30 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium" 
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">City</label>
                                            <input 
                                                type="text" 
                                                name="city" 
                                                required
                                                value={form.city} 
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/30 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">State</label>
                                            <input 
                                                type="text" 
                                                name="state" 
                                                required
                                                value={form.state} 
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/30 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Pincode</label>
                                            <input 
                                                type="text" 
                                                name="pincode" 
                                                required
                                                value={form.pincode} 
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-zinc-50/30 focus:bg-white transition-all focus:border-[var(--color-primary)] input-premium" 
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full py-4 text-center text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-md hover:opacity-95 cursor-pointer btn-premium"
                                        style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                                    >
                                        Continue to Payment
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleSubmitOrder} className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-scale-in" style={{ borderRadius: 'var(--border-radius)' }}>
                                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                                        <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Select Payment Method</h2>
                                        <button 
                                            type="button" 
                                            onClick={() => setStep(1)}
                                            className="text-[9px] font-black uppercase tracking-wider text-zinc-400 hover:text-zinc-650 transition-colors pl-2 py-1 cursor-pointer"
                                        >
                                            Back to shipping
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* COD */}
                                        {isCodEnabled && (
                                            <label className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-350 ${
                                                paymentMethod === 'COD' 
                                                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' 
                                                : 'border-zinc-200 hover:border-zinc-300'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="radio" 
                                                        name="paymentMethod" 
                                                        value="COD" 
                                                        checked={paymentMethod === 'COD'}
                                                        onChange={() => setPaymentMethod('COD')}
                                                        className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                                    />
                                                    <div className="text-left">
                                                        <p className="text-xs font-black text-zinc-800 uppercase tracking-wide">Cash on Delivery</p>
                                                        <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Pay with cash upon delivery</p>
                                                    </div>
                                                </div>
                                                <svg className="w-5 h-5 text-zinc-550" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                                                    <line x1="2" y1="10" x2="22" y2="10"></line>
                                                </svg>
                                            </label>
                                        )}

                                        {/* Razorpay */}
                                        {isOnlineEnabled && (
                                            <label className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-350 ${
                                                paymentMethod === 'Razorpay' 
                                                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' 
                                                : 'border-zinc-200 hover:border-zinc-300'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="radio" 
                                                        name="paymentMethod" 
                                                        value="Razorpay" 
                                                        checked={paymentMethod === 'Razorpay'}
                                                        onChange={() => setPaymentMethod('Razorpay')}
                                                        className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                                    />
                                                    <div className="text-left">
                                                        <p className="text-xs font-black text-zinc-800 uppercase tracking-wide">Razorpay (Cards/UPI)</p>
                                                        <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Fully secure online checkout</p>
                                                    </div>
                                                </div>
                                                <svg className="w-5 h-5 text-zinc-550" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                                </svg>
                                            </label>
                                        )}

                                        {!isCodEnabled && !isOnlineEnabled && (
                                            <div className="sm:col-span-2 p-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold rounded-xl text-center">
                                                No payment methods configured.
                                            </div>
                                        )}
                                    </div>

                                    {paymentMethod === 'Razorpay' && (
                                        <div className="bg-zinc-50 border border-zinc-150 p-4.5 rounded-2xl space-y-4 animate-scale-in">
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Demo Online Gateway</p>
                                            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold rounded-xl flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                                Razorpay Sandbox sandbox simulation is active.
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={submitting || (!isCodEnabled && !isOnlineEnabled)}
                                        className="w-full py-4 text-center text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-md hover:opacity-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 btn-premium"
                                        style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                                    >
                                        {submitting && (
                                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {submitting ? 'Placing Order...' : 'Confirm Order Details'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Order Summary Summary Panel */}
                        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                            <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 shadow-sm space-y-6" style={{ borderRadius: 'var(--border-radius)' }}>
                                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-3">Review Order Items</h3>
                                <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto storefront-scrollbar pr-1">
                                    {cart.map((item) => (
                                        <div key={item._id} className="flex justify-between py-3 gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-zinc-800 truncate uppercase tracking-tight">{item.name}</p>
                                                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Qty: {item.qty}</p>
                                            </div>
                                            <span className="text-xs font-black text-zinc-900 flex-shrink-0">
                                                ₹{(item.sellingPrice * item.qty).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-3 border-t border-zinc-100 text-xs font-semibold text-zinc-650">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="text-zinc-950 font-bold">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping cost</span>
                                        <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">Free</span>
                                    </div>
                                    <hr className="border-zinc-100" />
                                    <div className="flex justify-between text-sm font-black text-zinc-900 uppercase tracking-wide">
                                        <span>Order Total</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontCheckout;
