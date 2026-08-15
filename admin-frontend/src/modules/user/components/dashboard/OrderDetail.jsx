import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

const OrderDetail = ({ orderId }) => {
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Status management state
    const [status, setStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [trackingDescription, setTrackingDescription] = useState('');

    const isVendor = window.location.pathname.startsWith('/vendor');
    const dashboardPrefix = isVendor ? '/vendor/dashboard' : '/dashboard';
    const token = isVendor 
        ? (localStorage.getItem('vendorToken') || localStorage.getItem('merchantToken'))
        : (localStorage.getItem('merchantToken') || localStorage.getItem('vendorToken'));

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${GATEWAY_URL}/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setOrder(data.order);
                setStatus(data.order.status);
                setPaymentStatus(data.order.paymentStatus);
            } else {
                showToast(data.message || 'Failed to fetch order details', 'error');
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            showToast('Network error fetching order', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrder = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);

            // Provider refund when marking paid online order as refunded
            if (
                paymentStatus === 'refunded'
                && order?.paymentStatus === 'paid'
                && order?.paymentMethod
                && String(order.paymentMethod).toLowerCase() !== 'cod'
            ) {
                const refundRes = await fetch(`${GATEWAY_URL}/checkout/refund-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        orderId,
                        reason: trackingDescription.trim() || 'Refund from order dashboard',
                    }),
                });
                const refundData = await refundRes.json();
                if (!refundRes.ok) {
                    showToast(refundData.message || 'Gateway refund failed', 'error');
                    return;
                }
                showToast(refundData.message || 'Refund processed via payment gateway');
                if (refundData.order) {
                    setOrder(refundData.order);
                    setPaymentStatus(refundData.order.paymentStatus || 'refunded');
                    setStatus(refundData.order.status || status);
                } else {
                    await fetchOrder();
                }
                // Still sync order status fields (accepted/cancelled etc.) if changed
                if (status !== order.status) {
                    const res = await fetch(`${GATEWAY_URL}/orders/${orderId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            status,
                            paymentStatus: 'refunded',
                            trackingDescription: trackingDescription.trim() || undefined,
                        }),
                    });
                    const data = await res.json();
                    if (res.ok) setOrder(data);
                }
                setTrackingDescription('');
                return;
            }

            const res = await fetch(`${GATEWAY_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status,
                    paymentStatus,
                    trackingDescription: trackingDescription.trim() || undefined
                })
            });
            const data = await res.json();
            if (res.ok) {
                setOrder(data);
                setTrackingDescription('');
                showToast('Order updated successfully!');
            } else {
                showToast(data.message || 'Failed to update order', 'error');
            }
        } catch (err) {
            console.error('Error updating order details:', err);
            showToast('Network error while updating', 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-2">
                <div className="h-6 bg-gray-200 rounded-lg w-1/4"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
                    <div className="h-96 bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-sm">
                <p className="text-sm font-bold text-gray-500">Order not found or access denied.</p>
                <button 
                    onClick={() => navigate(`${dashboardPrefix}/orders`)} 
                    className="px-5 py-2 bg-zinc-900 text-white font-bold rounded-lg text-xs hover:bg-black transition-all"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    const orderDisplayId = order._id.slice(-6).toUpperCase();

    return (
        <div className="space-y-6">
            {toast.show && (
                <div className={`fixed bottom-5 right-5 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-bounce ${
                    toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {toast.message}
                </div>
            )}

            {/* Back Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate(`${dashboardPrefix}/orders`)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all mr-1 text-gray-500 hover:text-black"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[#202223]">Order #{orderDisplayId}</h1>
                        <p className="text-xs text-gray-500 font-medium">Placed on {new Date(order.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Side - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Products List */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#202223] border-b border-gray-100 pb-3">Items Order</h2>
                        <div className="divide-y divide-gray-100">
                            {order.products?.map((item) => (
                                <div key={item.productId || item._id} className="py-4 flex justify-between items-center gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{item.productName}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity} • Price: ₹{item.price.toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        {/* Calculation summary */}
                        <div className="border-t border-gray-150 pt-4 space-y-2.5 text-xs text-gray-600 font-semibold pl-1">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-gray-900">₹{order.subtotal?.toLocaleString()}</span>
                            </div>
                            {order.gstAmount > 0 && (
                                <div className="flex justify-between">
                                    <span>GST Amount</span>
                                    <span className="text-gray-900">₹{order.gstAmount?.toLocaleString()}</span>
                                </div>
                            )}
                            {order.platformCommissionAmount > 0 && (
                                <div className="flex justify-between">
                                    <span>Platform Commission</span>
                                    <span className="text-gray-900">₹{order.platformCommissionAmount?.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-3 pl-0">
                                <span>Total Amount</span>
                                <span>₹{order.totalAmount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tracking Timeline */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#202223] border-b border-gray-100 pb-3">Tracking History</h2>
                        <div className="space-y-6 relative pl-4 border-l border-zinc-155 max-w-lg mx-auto py-2">
                            {order.trackingStatus?.map((track, idx) => (
                                <div key={idx} className="relative group">
                                    {/* Timeline Node dot */}
                                    <span className="absolute -left-[20px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] border-2 border-white ring-4 ring-zinc-50" style={{ backgroundColor: 'var(--color-primary)' }} />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-zinc-900 uppercase">{track.status}</span>
                                            <span className="text-[10px] text-zinc-400 font-medium">
                                                {new Date(track.updatedAt).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 mt-1 font-semibold leading-relaxed">
                                            {track.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Actions & Customer info */}
                <div className="space-y-6">
                    {/* Status update panel */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#202223] border-b border-gray-100 pb-3">Status Management</h2>
                        
                        <form onSubmit={handleUpdateOrder} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5">Order Status</label>
                                <select 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 transition-all font-semibold"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="out_for_delivery">Out for Delivery</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5">Payment Status</label>
                                <select 
                                    value={paymentStatus} 
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 transition-all font-semibold"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded (provider refund)</option>
                                </select>
                                {order?.paymentStatus === 'paid' && order?.paymentMethod && String(order.paymentMethod).toLowerCase() !== 'cod' && (
                                    <p className="text-[10px] text-amber-700 font-semibold mt-1.5 leading-relaxed">
                                        Choosing Refunded runs a real {String(order.paymentMethod).toUpperCase()} refund to the customer.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5">Custom Status note (Optional)</label>
                                <input 
                                    type="text" 
                                    value={trackingDescription}
                                    onChange={(e) => setTrackingDescription(e.target.value)}
                                    placeholder="e.g. Dispatched via Express logistics"
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 transition-all font-medium"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={updating}
                                className="w-full py-3 bg-[#1a1c23] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {updating ? 'Saving...' : 'Update Status'}
                            </button>
                        </form>
                    </div>

                    {/* Customer & Shipping Summary */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#202223] border-b border-gray-100 pb-3">Customer Details</h2>
                        
                        <div className="space-y-3.5 text-xs text-gray-650 font-semibold pl-0.5">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contact</p>
                                <p className="text-gray-900 font-bold mt-0.5">{order.customerName}</p>
                                <p className="text-gray-500 mt-0.5 font-medium">{order.customerEmail || 'No email provided'}</p>
                                <p className="text-gray-500 font-medium">Phone: {order.customerPhone || 'No phone number'}</p>
                            </div>
                            
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Shipping Address</p>
                                {order.shippingAddress?.address ? (
                                    <div className="text-gray-650 mt-1 leading-relaxed font-semibold">
                                        <p>{order.shippingAddress.address}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                        <p className="text-gray-400 mt-1 uppercase font-bold text-[9px]">Country: India</p>
                                    </div>
                                ) : (
                                    <p className="italic text-gray-400 mt-0.5">No shipping address recorded</p>
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Shipment</p>
                                {order.shipping?.provider === 'shiprocket' ? (
                                    <div className="mt-1 space-y-1">
                                        <p className="text-gray-900 font-bold">Shiprocket ({order.shipping.ownerType || 'account'})</p>
                                        {order.shipping.awb ? (
                                            <p className="font-medium">AWB: {order.shipping.awb}</p>
                                        ) : (
                                            <p className="text-amber-700 font-medium">AWB pending</p>
                                        )}
                                        {order.shipping.courierName && (
                                            <p className="text-gray-500">{order.shipping.courierName}</p>
                                        )}
                                        {order.shipping.trackingUrl && (
                                            <a
                                                href={order.shipping.trackingUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-teal-700 underline font-bold"
                                            >
                                                Track shipment
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="mt-1 font-medium text-gray-600">
                                        Manual / COD shipping
                                        {order.shipping?.lastError ? ` — ${order.shipping.lastError}` : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
