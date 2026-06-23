import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';

const StorefrontCheckout = ({ cart, cartCount, onClearCart, customer, onLogout, storeInfo }) => {
    const { storeId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: customer?.name || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');

    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);

    const isCodEnabled = storeInfo?.paymentSettings?.codEnabled ?? true;
    const isOnlineEnabled = storeInfo?.paymentSettings?.razorpayEnabled ?? false;

    // Set default payment method based on settings
    React.useEffect(() => {
        if (isCodEnabled) {
            setPaymentMethod('COD');
        } else if (isOnlineEnabled) {
            setPaymentMethod('Razorpay');
        }
    }, [isCodEnabled, isOnlineEnabled]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        if (!paymentMethod) {
            alert('Please select a payment method.');
            return;
        }

        setSubmitting(true);

        // Simulate order placement
        setTimeout(() => {
            setSubmitting(false);
            setOrderSuccess(true);
            setOrderId(Math.floor(100000 + Math.random() * 900000).toString());
            onClearCart();
        }, 1500);
    };

    if (orderSuccess) {
        return (
            <StorefrontLayout cartCount={0} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-xl mx-auto py-24 text-center space-y-6 bg-white border border-gray-150 p-8 rounded-3xl mt-12 shadow-sm">
                    <span className="text-5xl text-emerald-600 block">🎉</span>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Placed Successfully!</h1>
                    <p className="text-sm text-gray-500 font-semibold">Thank you for your purchase. Your Order ID is <strong className="text-gray-900 font-mono">#{orderId}</strong>.</p>
                    <p className="text-xs text-gray-400">A confirmation email will be sent shortly. We are preparing your order for shipping.</p>
                    <div className="pt-4">
                        <Link 
                            to={`/store/${storeId}`} 
                            className="inline-block px-8 py-3 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Checkout</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Shipping Address & Payments (Left) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Shipping Details */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Shipping Information</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
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
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        required
                                        value={form.phone} 
                                        onChange={e => setForm({...form, phone: e.target.value})}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Street Address</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={form.address} 
                                        onChange={e => setForm({...form, address: e.target.value})}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">City</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={form.city} 
                                        onChange={e => setForm({...form, city: e.target.value})}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">State</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={form.state} 
                                        onChange={e => setForm({...form, state: e.target.value})}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Pincode / Postal Code</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={form.pincode} 
                                        onChange={e => setForm({...form, pincode: e.target.value})}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Payment Method</h3>
                            
                            <div className="space-y-3">
                                {isCodEnabled && (
                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50/50 transition-colors">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={() => setPaymentMethod('COD')}
                                            className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-gray-800">Cash on Delivery (COD)</span>
                                            <span className="block text-xs text-gray-400 font-semibold mt-0.5">Pay in cash when your order is delivered.</span>
                                        </div>
                                    </label>
                                )}

                                {isOnlineEnabled && (
                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50/50 transition-colors">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            value="Razorpay"
                                            checked={paymentMethod === 'Razorpay'}
                                            onChange={() => setPaymentMethod('Razorpay')}
                                            className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-gray-800">Pay Online (Razorpay)</span>
                                            <span className="block text-xs text-gray-400 font-semibold mt-0.5">Secure payment using Cards, Netbanking, UPI or Wallets.</span>
                                        </div>
                                    </label>
                                )}

                                {!isCodEnabled && !isOnlineEnabled && (
                                    <div className="p-4 bg-yellow-50 text-yellow-800 text-xs font-bold rounded-xl text-center">
                                        No payment methods are currently configured for this store.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cart Items Summary (Right) */}
                    <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 self-start">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Order Items</h3>
                        
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                            {cart.map((item) => (
                                <div key={item._id} className="flex justify-between items-center gap-3 font-semibold text-xs text-gray-600">
                                    <span className="line-clamp-1">{item.name} <strong className="text-gray-800 font-black">x{item.qty}</strong></span>
                                    <span className="text-gray-900 font-black">₹{item.sellingPrice * item.qty}</span>
                                </div>
                            ))}
                        </div>

                        <hr className="border-gray-100" />

                        <div className="space-y-3 font-semibold text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span className="text-gray-800">₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span>
                                <span className="text-emerald-600">Free</span>
                            </div>
                            <hr className="border-gray-100" />
                            <div className="flex justify-between text-base font-black text-gray-900">
                                <span>Total Amount</span>
                                <span>₹{subtotal}</span>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={submitting || cart.length === 0 || (!isCodEnabled && !isOnlineEnabled)}
                            className="w-full py-4 text-center text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md hover:opacity-95 disabled:opacity-50 cursor-pointer"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                            {submitting ? 'Placing Order...' : `Place Order (₹${subtotal})`}
                        </button>
                    </div>
                </form>
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontCheckout;
