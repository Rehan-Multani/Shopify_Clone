import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';
import { getStorePath } from '../../components/storefront/storeUrlHelper';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

const StorefrontOrderTrack = ({ cartCount, customer, onLogout, storeInfo }) => {
    const { storeId: paramStoreId, orderId } = useParams();
    const storeId = storeInfo?._id || paramStoreId;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');

    useEffect(() => {
        if (!orderId) return;
        const fetchOrderDetails = async () => {
            try {
                const res = await fetch(`${GATEWAY_URL}/orders/${orderId}`, {
                    headers: { 'x-store-id': storeId }
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    setOrder(data.order);
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId, storeId]);

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        setCancelling(true);
        setCancelError('');
        try {
            const res = await fetch(`${GATEWAY_URL}/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: { 'x-store-id': storeId }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setOrder(data.order);
            } else {
                setCancelError(data.message || 'Failed to cancel order.');
            }
        } catch (err) {
            console.error('Error cancelling order:', err);
            setCancelError('Network error while cancelling order.');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 animate-pulse">
                    <div className="h-6 bg-zinc-200 rounded-lg w-1/3"></div>
                    <div className="h-40 bg-zinc-200 rounded-3xl"></div>
                    <div className="h-64 bg-zinc-200 rounded-3xl"></div>
                </div>
            </StorefrontLayout>
        );
    }

    if (!order) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-md mx-auto py-20 text-center space-y-5 bg-white border border-zinc-200/60 p-8 rounded-3xl shadow-sm mt-12 animate-scale-in">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-md font-black text-zinc-800 uppercase tracking-wider">Order Not Found</h2>
                    <p className="text-xs text-zinc-455 max-w-xs mx-auto leading-relaxed font-semibold">We couldn't retrieve details for this order ID.</p>
                    <Link to={getStorePath(storeId, '/account')} className="inline-block px-6 py-2.5 bg-zinc-950 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-md">
                        Back to My Account
                    </Link>
                </div>
            </StorefrontLayout>
        );
    }

    const orderDisplayId = order._id.slice(-6).toUpperCase();
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Define steps for visual tracking status
    const steps = [
        { key: 'pending', label: 'Order Placed', icon: '📝' },
        { key: 'accepted', label: 'Accepted', icon: '📦' },
        { key: 'shipped', label: 'Shipped', icon: '🚚' },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵' },
        { key: 'delivered', label: 'Delivered', icon: '🎉' }
    ];

    // Determine current index based on status
    let currentStepIndex = 0; // default pending
    if (order.status === 'accepted') currentStepIndex = 1;
    if (order.status === 'shipped') currentStepIndex = 2;
    if (order.status === 'out_for_delivery') currentStepIndex = 3;
    if (order.status === 'delivered' || order.status === 'completed') currentStepIndex = 4;
    if (order.status === 'rejected' || order.status === 'cancelled') currentStepIndex = -1; // special case

    const canCancel = ['pending', 'accepted', 'shipped'].includes(order.status);

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
                {/* Back button & Breadcrumbs */}
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 pl-0.5">
                    <Link to={getStorePath(storeId, '/account')} className="hover:text-[var(--color-primary)] transition-colors">My Account</Link>
                    <span className="text-zinc-300">/</span>
                    <span className="text-zinc-650">Order Tracking</span>
                </div>

                {/* Order header summary */}
                <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-4">
                        <div className="space-y-1">
                            <h1 className="text-lg font-black text-zinc-900 tracking-tight">Order #{orderDisplayId}</h1>
                            <p className="text-xs text-zinc-450 font-semibold">{orderDate}</p>
                        </div>
                        <div className="text-right sm:text-right">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Amount</p>
                            <p className="text-lg font-black text-zinc-900">₹{order.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs font-semibold text-zinc-650 leading-relaxed">
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Shipping Address</p>
                            <p className="text-zinc-800 font-bold">{order.customerName}</p>
                            {order.shippingAddress?.address ? (
                                <p>
                                    {order.shippingAddress.address}
                                    <br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                    <br />
                                    Phone: {order.customerPhone || order.customerEmail}
                                </p>
                            ) : (
                                <p className="italic text-zinc-400">No shipping address recorded</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Payment Details</p>
                            <p>Method: <strong className="text-zinc-800 uppercase">{order.paymentMethod || 'COD'}</strong></p>
                            <p>Status: <span className={`uppercase font-bold ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.paymentStatus}</span></p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Order Status</p>
                            <div className="flex flex-col gap-2 items-start">
                                <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                    order.status === 'completed' || order.status === 'delivered'
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : order.status === 'rejected' || order.status === 'cancelled'
                                            ? 'bg-red-50 text-red-600 border border-red-100'
                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                }`}>
                                    {order.status}
                                </span>
                                {canCancel && (
                                    <button
                                        onClick={handleCancelOrder}
                                        disabled={cancelling}
                                        className="text-[9px] font-black uppercase tracking-wider text-red-500 hover:text-red-750 hover:underline disabled:opacity-50 cursor-pointer transition-all"
                                    >
                                        {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                )}
                                {cancelError && (
                                    <span className="text-[8px] font-bold text-red-500 leading-normal">{cancelError}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Tracking Progress */}
                {order.status === 'rejected' || order.status === 'cancelled' ? (
                    <div className="bg-red-50/50 border border-red-100 p-6 rounded-3xl text-center space-y-2.5">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl shadow-sm">❌</div>
                        <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Order Cancelled/Rejected</h2>
                        <p className="text-xs text-zinc-555 max-w-sm mx-auto leading-relaxed font-semibold">
                            {order.status === 'cancelled' 
                                ? 'This order has been cancelled by you. If you paid online, your refund is being processed.' 
                                : 'Unfortunately, this order has been rejected or cancelled by the store manager. If you paid online, your refund is being processed.'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
                        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest border-b border-zinc-100 pb-3">Delivery Status</h3>

                        {/* Progress Tracker Pipeline */}
                        <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0 md:items-center max-w-xl mx-auto px-4">
                            <style>{`
                                .tracker-bg-line {
                                    width: 2px;
                                    height: calc(100% - 32px);
                                    left: 29px;
                                    top: 16px;
                                }
                                .tracker-active-line {
                                    width: 2px;
                                    height: ${(currentStepIndex / (steps.length - 1)) * 88}%;
                                    left: 29px;
                                    top: 16px;
                                }
                                @media (min-width: 768px) {
                                    .tracker-bg-line {
                                        width: calc(100% - 80px);
                                        height: 2px;
                                        left: 40px;
                                        top: 16px;
                                    }
                                    .tracker-active-line {
                                        width: ${(currentStepIndex / (steps.length - 1)) * 82}%;
                                        height: 2px;
                                        left: 40px;
                                        top: 16px;
                                    }
                                }
                            `}</style>
                            {/* Background line */}
                            <div className="absolute bg-zinc-150 -z-10 tracker-bg-line" />
                            {/* Foreground colored line */}
                            {currentStepIndex >= 0 && (
                                <div className="absolute bg-[var(--color-primary)] transition-all duration-500 -z-10 tracker-active-line" />
                            )}

                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isActive = idx === currentStepIndex;
                                return (
                                    <div key={step.key} className="flex flex-row md:flex-col items-center gap-4 md:gap-2 text-left md:text-center w-full md:w-auto">
                                        <div 
                                            className={`w-8.5 h-8.5 rounded-full flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0 z-10 ${
                                                isCompleted 
                                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md' 
                                                    : 'border-zinc-200 bg-white text-zinc-400'
                                            }`}
                                        >
                                            <span className="text-xs">{step.icon}</span>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                                            isActive 
                                                ? 'text-[var(--color-primary)]' 
                                                : isCompleted 
                                                    ? 'text-zinc-800' 
                                                    : 'text-zinc-400'
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Detailed Timeline updates */}
                        <div className="border-t border-zinc-100 pt-6 space-y-5">
                            <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Status Timeline</h4>
                            <div className="space-y-4 max-w-lg">
                                {order.trackingStatus && order.trackingStatus.length > 0 ? (
                                    order.trackingStatus.slice().reverse().map((track, i) => {
                                        const updateTime = new Date(track.updatedAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                        return (
                                            <div key={i} className="flex gap-4 items-start animate-fade-in">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 ring-4 ring-[var(--color-primary-light)]/40 flex-shrink-0" />
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{updateTime}</p>
                                                    <p className="text-xs font-bold text-zinc-800 uppercase tracking-tight">{track.status}</p>
                                                    <p className="text-xs text-zinc-550 leading-relaxed font-semibold">{track.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex gap-4 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-1.5 ring-4 ring-[var(--color-primary-light)]/40 flex-shrink-0" />
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            <p className="text-xs font-bold text-zinc-800 uppercase tracking-tight">Order Placed</p>
                                            <p className="text-xs text-zinc-550 leading-relaxed font-semibold">Your order is being reviewed by the seller.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Ordered Items summary */}
                <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest border-b border-zinc-100 pb-3">Items Summary</h3>
                    <div className="divide-y divide-zinc-100">
                        {order.products?.map((item) => (
                            <div key={item._id || item.productId} className="py-3 flex justify-between items-center text-xs font-bold text-zinc-800">
                                <div>
                                    <p className="text-zinc-900 uppercase font-black">{item.productName}</p>
                                    <p className="text-[10px] text-zinc-400 mt-0.5">Qty: {item.quantity} • Price: ₹{item.price.toLocaleString()}</p>
                                </div>
                                <span className="text-zinc-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-zinc-200/50 pt-4 text-xs font-semibold text-zinc-650 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="text-zinc-900">₹{(order.subtotal || order.totalAmount).toLocaleString()}</span>
                        </div>
                        {order.gstAmount > 0 && (
                            <div className="flex justify-between">
                                <span>GST tax</span>
                                <span className="text-zinc-900">₹{order.gstAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-zinc-900 font-black border-t border-zinc-100 pt-3 text-sm">
                            <span>Total Amount</span>
                            <span style={{ color: 'var(--color-primary)' }}>₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontOrderTrack;
