import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

const BILLING_API_URL = import.meta.env.VITE_BILLING_API_URL;

const Subscribe = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedPlan = location.state?.plan || { name: 'Basic', price: 999 };
    
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [error, setError] = useState('');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('merchantToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
        };
    };

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

    const handlePayment = async () => {
        setIsProcessing(true);
        setError('');

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setError('Failed to load payment gateway. Please check your internet connection.');
                setIsProcessing(false);
                return;
            }

            // Create order on backend
            const orderRes = await fetch(`${BILLING_API_URL}/create-order`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ planId: selectedPlan._id })
            });
            const orderData = await orderRes.json();

            if (!orderRes.ok) {
                setError(orderData.message || 'Failed to create payment order');
                setIsProcessing(false);
                return;
            }

            const merchantInfo = JSON.parse(localStorage.getItem('merchantInfo') || '{}');

            // Open Razorpay checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Storify',
                description: `${orderData.planName} Plan - Monthly Subscription`,
                image: logo,
                order_id: orderData.orderId,
                handler: async function (response) {
                    // Verify payment on backend
                    try {
                        const verifyRes = await fetch(`${BILLING_API_URL}/verify`, {
                            method: 'POST',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planId: selectedPlan._id
                            })
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            setPaymentSuccess(true);
                            // Update local merchant info with new plan
                            const updatedMerchant = { ...merchantInfo, plan: { _id: selectedPlan._id, planName: selectedPlan.name, planPrice: selectedPlan.price, planType: selectedPlan.planType } };
                            localStorage.setItem('merchantInfo', JSON.stringify(updatedMerchant));
                            localStorage.setItem('adminPanelType', selectedPlan.planType === 'Multi Vendor' ? 'multi' : 'single');

                            setTimeout(() => navigate('/dashboard'), 2500);
                        } else {
                            setError(verifyData.message || 'Payment verification failed');
                        }
                    } catch (err) {
                        setError('Payment verification error. Please contact support.');
                    }
                    setIsProcessing(false);
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
                        setIsProcessing(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setIsProcessing(false);
        }
    };

    // Payment Success Screen
    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-[#f1f2f4] flex items-center justify-center px-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#202223] mb-2">Payment Successful! 🎉</h2>
                        <p className="text-[#5c5f62] text-sm">Your <strong>{selectedPlan.name}</strong> plan is now active. Redirecting to dashboard...</p>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    const planPrice = typeof selectedPlan.price === 'number' ? selectedPlan.price : parseInt(selectedPlan.price?.replace(/,/g, '') || '0');

    return (
        <div className="min-h-screen bg-[#f1f2f4] flex flex-col font-sans text-[#202223] animate-in fade-in duration-700">
            {/* Header */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-base font-bold text-[#202223]">Subscribe</h1>
                </div>
                <button onClick={() => navigate('/dashboard')} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                {/* Info Banner */}
                <div className="bg-[#b4e1fa] rounded-xl p-4 flex gap-4 items-start shadow-sm border border-[#a0d6f5]">
                    <div className="bg-[#005bd3] text-white rounded-full p-1 mt-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold mb-1">Secure Payment via Razorpay</h3>
                        <p className="text-xs text-gray-700 leading-relaxed">
                            Your payment is processed securely through Razorpay. We support UPI, Credit/Debit Cards, Net Banking, and Wallets.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Payment Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Plan Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-sm font-bold">Your Selected Plan</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-[#1a1c23] to-[#333] rounded-xl flex items-center justify-center">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black">{selectedPlan.name}</h4>
                                            <p className="text-xs text-[#5c5f62] font-medium">{selectedPlan.planType || 'Single Vendor'} • Monthly billing</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black">₹{planPrice.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">per month</p>
                                    </div>
                                </div>

                                {/* Features */}
                                {selectedPlan.features && selectedPlan.features.length > 0 && (
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-[10px] font-black text-[#5c5f62] uppercase tracking-wider mb-3">Plan includes</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {selectedPlan.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-[#5c5f62] font-medium">
                                                    <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-sm font-bold">Payment Method</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-[#5c5f62]">Click "Pay Now" to complete your subscription via Razorpay's secure checkout. You can pay using:</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe' },
                                        { name: 'Cards', icon: '💳', desc: 'Visa, Mastercard' },
                                        { name: 'Net Banking', icon: '🏦', desc: 'All major banks' },
                                        { name: 'Wallets', icon: '👛', desc: 'Paytm, Mobikwik' }
                                    ].map(m => (
                                        <div key={m.name} className="p-4 border border-gray-100 rounded-xl bg-gray-50 text-center hover:border-black/20 transition-all">
                                            <div className="text-2xl mb-1">{m.icon}</div>
                                            <p className="text-xs font-bold text-[#202223]">{m.name}</p>
                                            <p className="text-[10px] text-[#9CA3AF]">{m.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1 border border-gray-200 bg-white rounded-2xl shadow-sm overflow-hidden p-6 space-y-6 sticky top-20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#008060]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest">{selectedPlan.name}</h3>
                                    <p className="text-xs font-medium text-gray-500 tracking-wide">Monthly</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black">₹{planPrice.toLocaleString()}.00</div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-5 relative">
                            <div className="absolute left-1.5 top-1 bottom-1 w-[1.2px] bg-gray-200"></div>
                            
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-3 h-3 rounded-full bg-black border-2 border-white mt-1 shadow-sm"></div>
                                <div className="flex-1 flex justify-between">
                                    <div>
                                        <p className="text-sm font-bold">Today</p>
                                        <p className="text-[11px] font-medium text-gray-500">Subscription starts</p>
                                    </div>
                                    <p className="text-sm font-bold">₹{planPrice.toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-white mt-1"></div>
                                <div className="flex-1 flex justify-between">
                                    <div>
                                        <p className="text-sm font-bold">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        <p className="text-[11px] font-medium text-gray-500">Next billing</p>
                                    </div>
                                    <p className="text-sm font-bold">₹{planPrice.toLocaleString()}/mo</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm font-bold">Amount due today</span>
                                <span className="text-lg font-black">₹{planPrice.toLocaleString()}.00</span>
                            </div>
                            <div className="flex items-baseline justify-between text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                <span>INR</span>
                                <span>plus applicable taxes</span>
                            </div>
                        </div>

                        <button 
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 group relative overflow-hidden flex items-center justify-center gap-2 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1a1c23] hover:bg-black text-white'}`}
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    Pay ₹{planPrice.toLocaleString()} Now
                                </>
                            )}
                        </button>

                        <div className="text-center space-y-3">
                            <div className="flex items-center justify-center gap-2 text-[10px] text-[#9CA3AF] font-bold">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Secured by Razorpay
                            </div>
                            <p className="text-xs font-bold text-gray-500 hover:text-black cursor-pointer transition-colors underline underline-offset-2">
                                Change or cancel your plan anytime
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Subscribe;
