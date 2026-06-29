import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const OrdersTab = ({ vendorId }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const isVendor = window.location.pathname.startsWith('/vendor');
    const token = isVendor ? localStorage.getItem('vendorToken') : (localStorage.getItem('merchantToken') || localStorage.getItem('vendorToken'));
    const dashboardPrefix = isVendor ? '/vendor/dashboard' : '/dashboard';
    const storeId = localStorage.getItem('activeStoreId') || '';
    const API_URL = import.meta.env.VITE_STORE_API_URL;

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            if (vendorId) {
                const [prodRes, ordRes] = await Promise.all([
                    fetch(`${API_URL.replace('/stores', '')}/products`, {
                        headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
                    }),
                    fetch(`${API_URL.replace('/stores', '')}/orders?storeId=${storeId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);
                const prodData = await prodRes.json();
                const ordData = await ordRes.json();
                
                if (ordRes.ok) {
                    if (prodRes.ok) {
                        const vendorProductIds = new Set(
                            prodData
                                .filter(p => p.vendor === vendorId || p.vendor?._id === vendorId)
                                .map(p => p._id)
                        );
                        const vendorOrders = ordData.filter(o => 
                            o.products?.some(p => vendorProductIds.has(p.productId))
                        );
                        setOrders(vendorOrders);
                    } else {
                        setOrders(ordData || []);
                    }
                } else {
                    showToast(ordData.message || 'Failed to fetch orders', 'error');
                }
            } else {
                const res = await fetch(`${API_URL.replace('/stores', '')}/orders?storeId=${storeId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    setOrders(data || []);
                } else {
                    showToast(data.message || 'Failed to fetch orders', 'error');
                }
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            showToast('Network error while fetching orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [storeId, vendorId]);

    const handleUpdateStatus = async (id, status, paymentStatus) => {
        try {
            const res = await fetch(`${API_URL.replace('/stores', '')}/orders/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, paymentStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setOrders(prev => prev.map(o => o._id === id ? updated : o));
                showToast('Order updated successfully');
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to update order', 'error');
            }
        } catch (err) {
            showToast('Network error while updating order', 'error');
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || 
            (o.customerEmail && o.customerEmail.toLowerCase().includes(search.toLowerCase())) ||
            o._id.toLowerCase().includes(search.toLowerCase());
        
        if (filter === 'all') return matchesSearch;
        return matchesSearch && o.status === filter;
    });

    const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'accepted':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'shipped':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'out_for_delivery':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'completed':
            case 'delivered':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected':
            case 'cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
    };

    const getStatusDotColor = (status) => {
        switch (status) {
            case 'accepted': return 'bg-blue-500';
            case 'shipped': return 'bg-indigo-500';
            case 'out_for_delivery': return 'bg-purple-500';
            case 'completed':
            case 'delivered': return 'bg-green-500';
            case 'rejected':
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-yellow-500';
        }
    };

    return (
        <div className="space-y-6">
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-300 ${
                    toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {toast.type === 'success'
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        }
                    </svg>
                    {toast.message}
                </div>
            )}

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Orders</h1>
                    <p className="text-sm text-[#5c5f62] mt-1">{orders.length} orders total</p>
                </div>
                {!isVendor && (
                    <div className="flex items-center gap-3">
                        <Link 
                            to={`${dashboardPrefix}/orders/new`} 
                            className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Order
                        </Link>
                    </div>
                )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by customer name, email or order ID..."
                        className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 overflow-x-auto">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'pending', label: 'Pending' },
                        { id: 'accepted', label: 'Accepted' },
                        { id: 'shipped', label: 'Shipped' },
                        { id: 'out_for_delivery', label: 'Out for Delivery' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'rejected', label: 'Rejected' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap capitalize ${
                                filter === f.id ? 'bg-[#1a1c23] text-white shadow-sm' : 'text-[#5c5f62] hover:bg-gray-50'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Table Card */}
            {loading ? (
                /* Skeleton Loading State */
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {['Order ID', 'Customer', 'Date', 'Amount', 'Order Status', 'Payment', 'Actions'].map(h => (
                                    <th key={h} className="text-left text-[10px] font-black text-gray-400 tracking-[0.15em] uppercase px-5 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map(i => (
                                <tr key={`skel-${i}`} className="border-b border-gray-50 last:border-0 animate-pulse">
                                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                    <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                    <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                    <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                    <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : filteredOrders.length === 0 ? (
                /* Empty State */
                <div className="bg-white rounded-[12px] border border-[#e3e3e3] shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
                    <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-2 text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-base font-bold text-[#202223]">No orders found</h2>
                            <p className="text-sm text-[#5c5f62] leading-relaxed max-w-sm">
                                {isVendor 
                                    ? "Drive sales to your store to see customers' orders here." 
                                    : "Create an order manually or drive sales to your store to see customers' orders here."
                                }
                            </p>
                        </div>
                        {!isVendor && (
                            <Link to={`${dashboardPrefix}/orders/new`} className="bg-[#1a1c23] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95 block">
                                Create order
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                /* Data Table State */
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Order ID</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Customer</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Date</th>
                                    <th className="text-right text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Total</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Order Status</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Payment</th>
                                    <th className="text-right text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order, idx) => (
                                    <tr key={order._id} className={`group hover:bg-gray-50/80 transition-colors ${idx !== filteredOrders.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                        <td className="px-5 py-3.5 text-sm font-mono text-gray-500">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="text-sm font-bold text-[#202223]">{order.customerName}</div>
                                            {order.customerEmail && <div className="text-xs text-gray-400">{order.customerEmail}</div>}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-[#5c5f62]">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-bold text-right text-[#202223]">
                                            {formatPrice(order.totalAmount)}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${getStatusStyle(order.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(order.status)}`} />
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                                                {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2 flex-wrap">
                                                <Link 
                                                    to={`${dashboardPrefix}/orders/${order._id}`}
                                                    className="text-xs font-bold text-[#202223] hover:bg-gray-100 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 transition-all active:scale-95"
                                                >
                                                    View Details
                                                </Link>
                                                {order.paymentStatus !== 'paid' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order._id, order.status, 'paid')}
                                                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 transition-all active:scale-95"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                                {order.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(order._id, 'accepted', order.paymentStatus)}
                                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 transition-all active:scale-95"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(order._id, 'rejected', order.paymentStatus)}
                                                            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded-lg border border-red-100 transition-all active:scale-95"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {order.status === 'accepted' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order._id, 'shipped', order.paymentStatus)}
                                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 transition-all active:scale-95"
                                                    >
                                                        Ship Order
                                                    </button>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order._id, 'out_for_delivery', order.paymentStatus)}
                                                        className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 transition-all active:scale-95"
                                                    >
                                                        Out For Delivery
                                                    </button>
                                                )}
                                                {order.status === 'out_for_delivery' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(order._id, 'completed', order.paymentStatus)}
                                                        className="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded-lg border border-green-100 transition-all active:scale-95"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100 text-xs text-[#5c5f62] font-medium">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersTab;
