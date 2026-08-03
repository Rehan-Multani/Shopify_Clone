import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';
import { getStorePath } from '../../components/storefront/storeUrlHelper';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

const StorefrontCheckout = ({ cart, cartCount, onClearCart, customer, onLogout, storeInfo }) => {
    const { storeId: paramStoreId } = useParams();
    const storeId = storeInfo?._id || paramStoreId;
    const [searchParams, setSearchParams] = useSearchParams();
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

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [saveAddressToBook, setSaveAddressToBook] = useState(false);

    // Prefill default shipping address if customer is logged in
    useEffect(() => {
        if (customer && customer._id && storeId) {
            fetch(`${GATEWAY_URL}/customers/${customer._id}`, {
                headers: { 'x-store-id': storeId }
            })
                .then(res => res.json())
                .then(data => {
                    if (data && data.addresses) {
                        setSavedAddresses(data.addresses);
                        const defaultAddress = data.addresses.find(addr => addr.isDefault);
                        if (defaultAddress) {
                            setSelectedAddressId(defaultAddress._id);
                            setShowNewAddressForm(false);
                            setForm({
                                name: defaultAddress.fullName || customer.name || '',
                                email: customer.email || '',
                                phone: defaultAddress.phoneNumber || customer.number || '',
                                address: defaultAddress.addressLine1 + (defaultAddress.addressLine2 ? ', ' + defaultAddress.addressLine2 : ''),
                                city: defaultAddress.city || '',
                                state: defaultAddress.state || '',
                                pincode: defaultAddress.postalCode || ''
                            });
                        } else if (data.addresses.length > 0) {
                            const firstAddress = data.addresses[0];
                            setSelectedAddressId(firstAddress._id);
                            setShowNewAddressForm(false);
                            setForm({
                                name: firstAddress.fullName || customer.name || '',
                                email: customer.email || '',
                                phone: firstAddress.phoneNumber || customer.number || '',
                                address: firstAddress.addressLine1 + (firstAddress.addressLine2 ? ', ' + firstAddress.addressLine2 : ''),
                                city: firstAddress.city || '',
                                state: firstAddress.state || '',
                                pincode: firstAddress.postalCode || ''
                            });
                        } else {
                            setSelectedAddressId('new');
                            setShowNewAddressForm(true);
                        }
                    } else {
                        setSelectedAddressId('new');
                        setShowNewAddressForm(true);
                    }
                })
                .catch(err => {
                    console.error('Error prefilling address in checkout:', err);
                    setSelectedAddressId('new');
                    setShowNewAddressForm(true);
                });
        } else {
            setSelectedAddressId('new');
            setShowNewAddressForm(true);
        }
    }, [customer, storeId]);

    const handleSelectAddress = (addr) => {
        setSelectedAddressId(addr._id);
        setShowNewAddressForm(false);
        setForm({
            name: addr.fullName || customer?.name || '',
            email: customer?.email || '',
            phone: addr.phoneNumber || customer?.number || '',
            address: addr.addressLine1 + (addr.addressLine2 ? ', ' + addr.addressLine2 : ''),
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.postalCode || ''
        });
    };

    const handleSelectNewAddress = () => {
        setSelectedAddressId('new');
        setShowNewAddressForm(true);
        setForm({
            name: customer?.name || '',
            email: customer?.email || '',
            phone: customer?.number || '',
            address: '',
            city: '',
            state: '',
            pincode: ''
        });
    };

    const [paymentOptions, setPaymentOptions] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [vendorGatewayError, setVendorGatewayError] = useState(null);

    const cartVendorInfo = React.useMemo(() => {
        const ids = [];
        for (const item of cart || []) {
            const raw = item.vendor?._id || item.vendor || item.vendorId || null;
            if (!raw) continue;
            const id = String(raw);
            if (!ids.includes(id)) ids.push(id);
        }
        return {
            vendorId: ids.length === 1 ? ids[0] : (ids[0] || null),
            vendorIds: ids,
            isMixedVendors: ids.length > 1
        };
    }, [cart]);

    const vendorIdFromCart = cartVendorInfo.vendorId;
    const isMixedVendorCart = cartVendorInfo.isMixedVendors;

    const onlineOptions = paymentOptions.filter((o) => o.gateway !== 'cod');

    // Load dynamic checkout payment options
    useEffect(() => {
        if (!storeId) return;
        let cancelled = false;
        const load = async () => {
            setLoadingPayments(true);
            try {
                // Mixed-vendor carts cannot charge one online gateway for two sellers
                if (isMixedVendorCart) {
                    if (cancelled) return;
                    const fallback = [];
                    if (storeInfo?.paymentSettings?.codEnabled !== false) {
                        fallback.push({
                            gateway: 'cod',
                            name: 'Cash on Delivery',
                            description: 'Checkout separately per vendor for online payment'
                        });
                    }
                    setPaymentOptions(fallback);
                    setVendorGatewayError('Cart me alag-alag vendors ke products hain. Online payment ke liye ek vendor ke products hi rakhein, ya COD use karein.');
                    setPaymentMethod(fallback[0] ? 'COD' : '');
                    setLoadingPayments(false);
                    return;
                }

                const qs = new URLSearchParams({ storeId });
                if (vendorIdFromCart) qs.set('vendorId', String(vendorIdFromCart));
                const res = await fetch(`${GATEWAY_URL}/checkout/payment-options?${qs.toString()}`);
                const data = await res.json();
                if (!cancelled && res.ok) {
                    const opts = data.options || [];
                    setPaymentOptions(opts);
                    setVendorGatewayError(data.vendorGatewayError || null);
                    const preferred = opts.find((o) => o.isDefault) || opts[0];
                    if (preferred) setPaymentMethod(preferred.gateway === 'cod' ? 'COD' : preferred.gateway);
                } else if (!cancelled) {
                    setVendorGatewayError(null);
                    const fallback = [];
                    if (storeInfo?.paymentSettings?.codEnabled !== false) {
                        fallback.push({ gateway: 'cod', name: 'Cash on Delivery' });
                    }
                    setPaymentOptions(fallback);
                    if (fallback[0]) setPaymentMethod('COD');
                }
            } catch {
                if (!cancelled) {
                    setPaymentOptions([{ gateway: 'cod', name: 'Cash on Delivery' }]);
                    setPaymentMethod('COD');
                }
            } finally {
                if (!cancelled) setLoadingPayments(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [storeId, vendorIdFromCart, isMixedVendorCart, storeInfo?.paymentSettings?.codEnabled]);

    const loadRazorpayScript = () => new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);
    const gstPercent = storeInfo?.gstPercent || 0;
    const platformCommission = storeInfo?.platformCommission || 0;
    const gstAmount = Math.round(subtotal * (gstPercent / 100));
    const platformCommissionAmount = Math.round(subtotal * (platformCommission / 100));
    const totalAmount = Math.max(0, subtotal - couponDiscount + gstAmount + platformCommissionAmount);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        setApplyingCoupon(true);
        setCouponError('');
        try {
            const res = await fetch(`${GATEWAY_URL}/coupons/validate?code=${couponCode.trim()}&cartAmount=${subtotal}`, {
                headers: { 'x-store-id': storeId }
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                const cop = data.coupon;
                setAppliedCoupon(cop);
                let disc = 0;
                if (cop.discountType === 'percentage') {
                    disc = Math.round(subtotal * (cop.discountValue / 100));
                } else if (cop.discountType === 'flat') {
                    disc = cop.discountValue;
                }
                setCouponDiscount(Math.min(disc, subtotal));
                setCouponError('');
            } else {
                setCouponError(data.message || 'Invalid coupon code');
                setAppliedCoupon(null);
                setCouponDiscount(0);
            }
        } catch (err) {
            console.error('Error applying coupon:', err);
            setCouponError('Network error while applying coupon.');
            setAppliedCoupon(null);
            setCouponDiscount(0);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponCode('');
        setCouponError('');
    };

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

    // Resume after PayU redirect (?payment=success|failed&orderId=...)
    useEffect(() => {
        const paymentFlag = searchParams.get('payment');
        const orderId = searchParams.get('orderId');
        if (!paymentFlag || !orderId) return;

        let cancelled = false;
        const resume = async () => {
            try {
                const res = await fetch(`${GATEWAY_URL}/checkout/payment-status?orderId=${orderId}`);
                const data = await res.json();
                if (cancelled) return;

                if (paymentFlag === 'success' && data.paymentStatus === 'paid') {
                    const orderRes = await fetch(`${GATEWAY_URL}/orders/${orderId}`);
                    const orderData = await orderRes.json();
                    const order = orderData.order || orderData;
                    if (order?._id) {
                        setOrderSuccess(order);
                        setPaymentMethod(order.paymentMethod || 'payu');
                        onClearCart();
                    }
                } else if (paymentFlag === 'success') {
                    setError('Payment is still confirming. Refresh this page in a moment, or check My Orders.');
                    setStep(2);
                } else if (paymentFlag === 'failed') {
                    setError('Payment failed or was cancelled. Your order is saved as unpaid — you can retry from a new checkout.');
                    setStep(2);
                }
            } catch (err) {
                if (!cancelled) setError(err.message || 'Could not confirm payment status');
            } finally {
                // Clear query so refresh doesn't re-trigger
                const next = new URLSearchParams(searchParams);
                next.delete('payment');
                next.delete('orderId');
                next.delete('paymentId');
                next.delete('reason');
                setSearchParams(next, { replace: true });
            }
        };
        resume();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** Create pending order first (server computes amount). Never send paymentStatus=paid. */
    const placeOrder = async ({ paymentMethodLabel }) => {
        const productsPayload = cart.map(item => ({
            productId: item._id,
            productName: item.name,
            quantity: item.qty,
            price: item.sellingPrice,
            vendorId: item.vendor?._id || item.vendor || item.vendorId || null
        }));

        if (selectedAddressId === 'new' && saveAddressToBook && customer && customer._id) {
            try {
                await fetch(`${GATEWAY_URL}/customers/${customer._id}/addresses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-store-id': storeId
                    },
                    body: JSON.stringify({
                        fullName: form.name,
                        phoneNumber: form.phone,
                        addressLine1: form.address,
                        city: form.city,
                        state: form.state,
                        postalCode: form.pincode,
                        country: 'India',
                        isDefault: savedAddresses.length === 0
                    })
                });
            } catch (err) {
                console.error('Error saving new address from checkout:', err);
            }
        }

        const res = await fetch(`${GATEWAY_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-store-id': storeId
            },
            body: JSON.stringify({
                customerId: customer?._id || null,
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
                couponCode: appliedCoupon?.code || null,
                status: 'pending',
                paymentMethod: paymentMethodLabel,
                storeId: storeId,
                vendorId: vendorIdFromCart || null
            })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Failed to place order. Please try again.');
        }
        return data;
    };

    const createPaymentForOrder = async (order, gateway) => {
        const frontendReturnUrl = `${window.location.origin}${window.location.pathname}`;
        const createRes = await fetch(`${GATEWAY_URL}/checkout/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                storeId,
                vendorId: vendorIdFromCart ? String(vendorIdFromCart) : null,
                gateway,
                orderId: order._id,
                idempotencyKey: `${order._id}:${gateway}`,
                customer: {
                    id: customer?._id,
                    name: form.name,
                    email: form.email,
                    phone: form.phone
                },
                returnUrl: frontendReturnUrl,
                notes: { productinfo: 'Storefront Order' }
            })
        });
        const paymentData = await createRes.json();
        if (!createRes.ok) {
            throw new Error(paymentData.message || 'Failed to create payment');
        }
        return paymentData;
    };

    const refreshOrder = async (orderId) => {
        const res = await fetch(`${GATEWAY_URL}/orders/${orderId}`);
        const data = await res.json();
        return data.order || data;
    };

    const handleOnlinePayment = async (gateway) => {
        if (isMixedVendorCart) {
            throw new Error('Cart me multiple vendors ke products hain. Online payment ke liye ek vendor ke products hi checkout karein.');
        }

        // Order-first: money can never succeed without an order row
        const order = await placeOrder({ paymentMethodLabel: gateway });
        const paymentData = await createPaymentForOrder(order, gateway);

        if (gateway === 'razorpay') {
            const ok = await loadRazorpayScript();
            if (!ok) throw new Error('Failed to load Razorpay checkout');

            return new Promise((resolve, reject) => {
                const rzp = new window.Razorpay({
                    key: paymentData.publicKey,
                    amount: paymentData.amount,
                    currency: paymentData.currency || 'INR',
                    name: storeInfo?.storeName || 'Store',
                    description: 'Order Payment',
                    order_id: paymentData.gatewayOrderId,
                    prefill: {
                        name: form.name,
                        email: form.email,
                        contact: form.phone
                    },
                    handler: async (response) => {
                        try {
                            const verifyRes = await fetch(`${GATEWAY_URL}/checkout/verify-payment`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    paymentId: paymentData.paymentId,
                                    gateway: 'razorpay',
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                })
                            });
                            const verifyData = await verifyRes.json();
                            if (!verifyRes.ok || !verifyData.success) {
                                reject(new Error(verifyData.message || 'Payment verification failed'));
                                return;
                            }
                            const paidOrder = await refreshOrder(order._id);
                            resolve(paidOrder);
                        } catch (err) {
                            reject(err);
                        }
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Payment cancelled. Your order is saved as unpaid.'))
                    }
                });
                rzp.on('payment.failed', (resp) => {
                    reject(new Error(resp?.error?.description || 'Payment failure'));
                });
                rzp.open();
            });
        }

        if (gateway === 'payu' && paymentData.form && paymentData.paymentUrl) {
            const formEl = document.createElement('form');
            formEl.method = 'POST';
            formEl.action = paymentData.paymentUrl;
            Object.entries(paymentData.form).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value ?? '';
                formEl.appendChild(input);
            });
            document.body.appendChild(formEl);
            formEl.submit();
            return null; // redirect away
        }

        throw new Error('This payment method is not available for checkout yet. Please use Razorpay or PayU.');
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

        try {
            let data;
            if (paymentMethod === 'COD' || paymentMethod === 'cod') {
                data = await placeOrder({ paymentMethodLabel: 'COD' });
            } else {
                data = await handleOnlinePayment(paymentMethod);
            }

            if (data) {
                setOrderSuccess(data);
                onClearCart();
            }
        } catch (err) {
            console.error('Error placing storefront order:', err);
            setError(err.message || 'Network error while placing order. Please check connection.');
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
                            <span>{orderSuccess.paymentStatus === 'paid' ? 'Amount Paid' : 'Amount Due'}</span>
                            <span className="text-zinc-900 font-bold">₹{(orderSuccess.totalAmount || totalAmount).toLocaleString()}</span>
                        </p>
                        {orderSuccess.paymentStatus && orderSuccess.paymentStatus !== 'paid' && paymentMethod !== 'COD' && (
                            <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                                Payment status: {orderSuccess.paymentStatus}. Complete payment if still pending.
                            </p>
                        )}
                    </div>
                    <Link 
                        to={getStorePath(storeId, '/catalog')} 
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
                            to={getStorePath(storeId, '/catalog')} 
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
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-white border border-zinc-200/60 p-4 rounded-2xl shadow-sm text-[10px] sm:text-xs font-black uppercase tracking-wider">
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
                                <form onSubmit={handleNextStep} className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5" style={{ borderRadius: 'var(--border-radius)' }}>
                                    <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-2 pb-2 border-b border-zinc-100">Shipping Information</h2>

                                    {/* Saved Addresses List */}
                                    {savedAddresses.length > 0 && (
                                        <div className="space-y-3 mb-6">
                                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider pl-0.5">Select a Saved Address</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                                {savedAddresses.map((addr) => (
                                                    <div 
                                                        key={addr._id}
                                                        type="button"
                                                        onClick={() => handleSelectAddress(addr)}
                                                        className={`border p-4.5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between relative text-left ${
                                                            selectedAddressId === addr._id 
                                                                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/20 shadow-[0_4px_12px_rgba(0,0,0,0.02)]' 
                                                                : 'border-zinc-200 bg-zinc-50/10 hover:border-zinc-300'
                                                        }`}
                                                    >
                                                        {selectedAddressId === addr._id && (
                                                            <span 
                                                                className="absolute top-3 right-3 text-[7px] font-black uppercase tracking-wider text-white px-1.5 py-0.5 rounded"
                                                                style={{ backgroundColor: 'var(--color-primary)' }}
                                                            >
                                                                Selected
                                                            </span>
                                                        )}
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-black text-zinc-800">{addr.fullName}</p>
                                                            <p className="text-[10px] text-zinc-450 leading-normal">
                                                                {addr.addressLine1}
                                                                {addr.addressLine2 && `, ${addr.addressLine2}`}
                                                                <br />
                                                                {addr.city}, {addr.state} - {addr.postalCode}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Phone: {addr.phoneNumber}</p>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div 
                                                    type="button"
                                                    onClick={handleSelectNewAddress}
                                                    className={`border p-4.5 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center border-dashed text-zinc-400 hover:text-zinc-700 min-h-[100px] ${
                                                        selectedAddressId === 'new'
                                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/10 text-[var(--color-primary)]'
                                                            : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/10'
                                                    }`}
                                                >
                                                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                    <span className="text-[9px] font-black uppercase tracking-wider">Use Another Address</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Read-only Saved Address Card if selected */}
                                    {!showNewAddressForm && selectedAddressId && (
                                        <div className="bg-zinc-50 border border-zinc-150 p-5 rounded-2xl space-y-2 animate-scale-in text-left">
                                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider pl-0.5">Shipping details</p>
                                            <p className="text-xs font-black text-zinc-800">{form.name}</p>
                                            <p className="text-xs text-zinc-650 leading-relaxed font-semibold">{form.address}, {form.city}, {form.state} - {form.pincode}</p>
                                            <p className="text-xs text-zinc-650 font-bold mt-1">Phone: {form.phone}</p>
                                        </div>
                                    )}

                                    {/* New Address Input Form */}
                                    {showNewAddressForm && (
                                        <div className="space-y-4 pt-4 border-t border-zinc-100/60 animate-scale-in text-left">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Full Name *</label>
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
                                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Phone Number *</label>
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
                                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Email Address *</label>
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
                                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Street Address *</label>
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
                                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">City *</label>
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
                                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">State *</label>
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
                                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5 pl-0.5">Pincode *</label>
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

                                            {customer && (
                                                <div className="flex items-center gap-2 pt-2 select-none">
                                                    <input 
                                                        type="checkbox" 
                                                        id="saveAddressToBook" 
                                                        checked={saveAddressToBook} 
                                                        onChange={(e) => setSaveAddressToBook(e.target.checked)}
                                                        className="rounded border-zinc-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                                                    />
                                                    <label htmlFor="saveAddressToBook" className="text-[10px] font-bold text-zinc-650 cursor-pointer">Save this address to my address book</label>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        className="w-full py-4 text-center text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-md hover:opacity-95 cursor-pointer btn-premium mt-4"
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
                                        {loadingPayments && (
                                            <div className="sm:col-span-2 text-center text-xs text-zinc-400 font-semibold py-4">
                                                Loading payment methods…
                                            </div>
                                        )}

                                        {!loadingPayments && vendorGatewayError && onlineOptions.length === 0 && (
                                            <div className="sm:col-span-2 p-4 bg-red-50 border border-red-100 text-red-800 text-xs font-bold rounded-xl text-center">
                                                {vendorGatewayError}
                                            </div>
                                        )}

                                        {!loadingPayments && paymentOptions.map((opt) => {
                                            const value = opt.gateway === 'cod' ? 'COD' : opt.gateway;
                                            const selected = paymentMethod === value || (value === 'COD' && paymentMethod === 'cod');
                                            return (
                                                <label
                                                    key={opt.gateway}
                                                    className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-350 ${
                                                        selected
                                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                                                            : 'border-zinc-200 hover:border-zinc-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name="paymentMethod"
                                                            value={value}
                                                            checked={selected}
                                                            onChange={() => setPaymentMethod(value)}
                                                            className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                                        />
                                                        <div className="text-left">
                                                            <p className="text-xs font-black text-zinc-800 uppercase tracking-wide">{opt.name}</p>
                                                            <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">
                                                                {opt.description || (opt.gateway === 'cod' ? 'Pay with cash upon delivery' : 'Secure online checkout')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <svg className="w-5 h-5 text-zinc-550" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                                    </svg>
                                                </label>
                                            );
                                        })}

                                        {!loadingPayments && paymentOptions.length === 0 && (
                                            <div className="sm:col-span-2 p-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold rounded-xl text-center">
                                                No payment methods configured.
                                            </div>
                                        )}
                                    </div>

                                    {paymentMethod && paymentMethod !== 'COD' && paymentMethod !== 'cod' && (
                                        <div className="bg-zinc-50 border border-zinc-150 p-4.5 rounded-2xl space-y-2 animate-scale-in">
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                                {String(paymentMethod).toUpperCase()} Checkout
                                            </p>
                                            <p className="text-[10px] text-zinc-500 font-semibold">
                                                You will complete payment securely through the selected gateway.
                                            </p>
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={submitting || loadingPayments || paymentOptions.length === 0}
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

                                {/* Coupon promo code form */}
                                <div className="border-t border-zinc-100 pt-4 space-y-2">
                                    <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider pl-0.5 text-left">Promo Coupon Code</label>
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 animate-scale-in">
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded">{appliedCoupon.code}</span>
                                                Applied
                                            </span>
                                            <button 
                                                type="button" 
                                                onClick={handleRemoveCoupon}
                                                className="text-[9px] font-black uppercase text-red-500 hover:text-red-750 tracking-wider transition-colors ml-2 cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="ENTER CODE" 
                                                className="flex-grow min-w-0 px-3 py-2 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] font-bold tracking-widest bg-zinc-50/20"
                                            />
                                            <button 
                                                type="submit" 
                                                disabled={applyingCoupon || !couponCode.trim()}
                                                className="px-4 py-2 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                                style={{ backgroundColor: 'var(--color-primary)' }}
                                            >
                                                {applyingCoupon ? '...' : 'Apply'}
                                            </button>
                                        </form>
                                    )}
                                    {couponError && (
                                        <p className="text-[9px] font-bold text-red-500 pl-0.5 text-left animate-slide-down">{couponError}</p>
                                    )}
                                </div>

                                <div className="space-y-3 pt-3 border-t border-zinc-100 text-xs font-semibold text-zinc-650">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="text-zinc-950 font-bold">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-emerald-700 font-bold animate-fade-in">
                                            <span>Discount Code ({appliedCoupon?.code})</span>
                                            <span>- ₹{couponDiscount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {gstPercent > 0 && (
                                        <div className="flex justify-between animate-fade-in">
                                            <span>GST ({gstPercent}%)</span>
                                            <span className="text-zinc-950 font-bold">₹{gstAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {platformCommission > 0 && (
                                        <div className="flex justify-between animate-fade-in">
                                            <span>Handling Charges ({platformCommission}%)</span>
                                            <span className="text-zinc-950 font-bold">₹{platformCommissionAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Shipping cost</span>
                                        <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">Free</span>
                                    </div>
                                    <hr className="border-zinc-100" />
                                    <div className="flex justify-between text-sm font-black text-zinc-900 uppercase tracking-wide">
                                        <span>Order Total</span>
                                        <span>₹{totalAmount.toLocaleString()}</span>
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
