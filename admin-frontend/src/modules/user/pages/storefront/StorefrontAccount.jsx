import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';
import { getStorePath } from '../../components/storefront/storeUrlHelper';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

const StorefrontAccount = ({ cartCount, customer, onLogout, storeInfo }) => {
    const { storeId: paramStoreId } = useParams();
    const storeId = storeInfo?._id || paramStoreId;
    const getLink = (subpath) => getStorePath(storeId, subpath);

    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'addresses'
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [addressesLoading, setAddressesLoading] = useState(true);

    // Address form state
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        phoneNumber: '',
        isDefault: false
    });
    const [addressError, setAddressError] = useState('');
    const [addressSubmitting, setAddressSubmitting] = useState(false);

    // Load customer orders
    useEffect(() => {
        if (!customer || !customer._id) return;
        const fetchOrders = async () => {
            try {
                const res = await fetch(`${GATEWAY_URL}/orders/customer/${customer._id}`, {
                    headers: { 'x-store-id': storeId }
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    setOrders(data.orders || []);
                }
            } catch (err) {
                console.error('Error fetching customer orders:', err);
            } finally {
                setOrdersLoading(false);
            }
        };
        fetchOrders();
    }, [customer, storeId]);

    // Load customer addresses
    const fetchAddresses = async () => {
        if (!customer || !customer._id) return;
        try {
            const res = await fetch(`${GATEWAY_URL}/customers/${customer._id}`, {
                headers: { 'x-store-id': storeId }
            });
            const data = await res.json();
            if (res.ok) {
                setAddresses(data.addresses || []);
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
        } finally {
            setAddressesLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [customer, storeId]);

    const handleAddressInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAddressForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOpenAddAddress = () => {
        setEditingAddressId(null);
        setAddressForm({
            fullName: customer?.name || '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            phoneNumber: customer?.number || '',
            isDefault: addresses.length === 0 // default true if first address
        });
        setAddressError('');
        setShowAddressForm(true);
    };

    const handleOpenEditAddress = (addr) => {
        setEditingAddressId(addr._id);
        setAddressForm({
            fullName: addr.fullName,
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2 || '',
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            phoneNumber: addr.phoneNumber,
            isDefault: addr.isDefault
        });
        setAddressError('');
        setShowAddressForm(true);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setAddressError('');
        setAddressSubmitting(true);

        const { fullName, addressLine1, city, state, postalCode, phoneNumber } = addressForm;
        if (!fullName || !addressLine1 || !city || !state || !postalCode || !phoneNumber) {
            setAddressError('Please fill in all required fields.');
            setAddressSubmitting(false);
            return;
        }

        try {
            const url = editingAddressId 
                ? `${GATEWAY_URL}/customers/${customer._id}/addresses/${editingAddressId}`
                : `${GATEWAY_URL}/customers/${customer._id}/addresses`;
            const method = editingAddressId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-store-id': storeId
                },
                body: JSON.stringify(addressForm)
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setAddresses(data.addresses || []);
                setShowAddressForm(false);
            } else {
                setAddressError(data.message || 'Failed to save address. Please try again.');
            }
        } catch (err) {
            console.error('Error saving address:', err);
            setAddressError('Network error while saving address.');
        } finally {
            setAddressSubmitting(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            // Optimistic update
            setAddresses(prev => prev.filter(addr => addr._id !== addressId));

            const res = await fetch(`${GATEWAY_URL}/customers/${customer._id}/addresses/${addressId}`, {
                method: 'DELETE',
                headers: { 'x-store-id': storeId }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setAddresses(data.addresses || []);
            }
        } catch (err) {
            console.error('Error deleting address:', err);
            fetchAddresses();
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            // Optimistic update
            setAddresses(prev => prev.map(addr => ({
                ...addr,
                isDefault: addr._id === addressId
            })));

            const res = await fetch(`${GATEWAY_URL}/customers/${customer._id}/addresses/${addressId}/default`, {
                method: 'PUT',
                headers: { 'x-store-id': storeId }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setAddresses(data.addresses || []);
            }
        } catch (err) {
            console.error('Error setting default address:', err);
            fetchAddresses();
        }
    };

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
                {/* Header Welcome banner */}
                <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl text-white flex items-center justify-center text-2xl font-black shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
                            {customer?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-lg font-black text-zinc-900 tracking-tight">{customer?.name}</h1>
                            <p className="text-xs text-zinc-450 font-semibold">{customer?.email} • {customer?.number}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="px-6 py-2.5 border border-red-200 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-50 active:scale-95 transition-all cursor-pointer shadow-sm"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 bg-white border border-zinc-200/60 p-3 sm:p-4 rounded-3xl shadow-sm flex flex-row lg:flex-col gap-2.5 overflow-x-auto select-none">
                        <button 
                            onClick={() => { setActiveTab('orders'); setShowAddressForm(false); }}
                            className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex-1 lg:flex-none ${
                                activeTab === 'orders' 
                                    ? 'text-white' 
                                    : 'text-zinc-550 hover:bg-zinc-50'
                            }`}
                            style={{ backgroundColor: activeTab === 'orders' ? 'var(--color-primary)' : '' }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            My Orders
                        </button>
                        <button 
                            onClick={() => { setActiveTab('addresses'); }}
                            className={`flex-shrink-0 flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex-1 lg:flex-none ${
                                activeTab === 'addresses' 
                                    ? 'text-white' 
                                    : 'text-zinc-550 hover:bg-zinc-50'
                            }`}
                            style={{ backgroundColor: activeTab === 'addresses' ? 'var(--color-primary)' : '' }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Address Book
                        </button>
                    </div>

                    {/* Tab Panels */}
                    <div className="lg:col-span-9 bg-white border border-zinc-200/60 p-6 sm:p-8 rounded-3xl shadow-sm min-h-[400px]">
                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <div className="border-b border-zinc-100 pb-4">
                                    <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Order History</h2>
                                    <p className="text-[11px] text-zinc-400 font-semibold mt-1">Track and manage your online orders.</p>
                                </div>

                                {ordersLoading ? (
                                    <div className="space-y-4">
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className="h-24 bg-zinc-50 animate-pulse rounded-2xl"></div>
                                        ))}
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map((order) => {
                                            const orderDisplayId = order._id.slice(-6).toUpperCase();
                                            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            });
                                            return (
                                                <div 
                                                    key={order._id}
                                                    className="border border-zinc-150/80 hover:border-zinc-200 p-4 rounded-2xl space-y-3.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-zinc-900 uppercase">Order #{orderDisplayId}</span>
                                                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                                order.status === 'completed' || order.status === 'delivered'
                                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                    : order.status === 'rejected' || order.status === 'cancelled'
                                                                        ? 'bg-red-50 text-red-600 border border-red-100'
                                                                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase">{orderDate} • {order.products?.length} {order.products?.length === 1 ? 'item' : 'items'}</p>
                                                        <p className="text-xs font-black text-zinc-900 mt-1">₹{order.totalAmount.toLocaleString()}</p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Link 
                                                            to={getLink(`/orders/${order._id}/track`)}
                                                            className="px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-black active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                            </svg>
                                                            Track Order
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-zinc-50/50 rounded-2xl space-y-3">
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">No orders found.</p>
                                        <Link 
                                            to={getLink('/catalog')} 
                                            className="inline-block px-6 py-2.5 bg-zinc-950 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-sm"
                                        >
                                            Start Shopping
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <div className="border-b border-zinc-100 pb-4 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Address Book</h2>
                                        <p className="text-[11px] text-zinc-400 font-semibold mt-1">Manage multiple delivery addresses.</p>
                                    </div>
                                    {!showAddressForm && (
                                        <button 
                                            onClick={handleOpenAddAddress}
                                            className="px-4.5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
                                        >
                                            + Add New Address
                                        </button>
                                    )}
                                </div>

                                {showAddressForm ? (
                                    <form onSubmit={handleSaveAddress} className="bg-zinc-50/50 border border-zinc-150 p-5 rounded-2xl space-y-4 animate-scale-in">
                                        <h3 className="text-xs font-black text-zinc-800 uppercase tracking-wider border-b border-zinc-200 pb-2">
                                            {editingAddressId ? 'Edit Address' : 'Add New Address'}
                                        </h3>

                                        {addressError && (
                                            <p className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 p-2.5 rounded-lg">{addressError}</p>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-450">Receiver's Full Name *</label>
                                                <input 
                                                    type="text" 
                                                    name="fullName" 
                                                    value={addressForm.fullName} 
                                                    onChange={handleAddressInputChange} 
                                                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-[var(--color-primary)] bg-white input-premium"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-450">Phone Number *</label>
                                                <input 
                                                    type="tel" 
                                                    name="phoneNumber" 
                                                    value={addressForm.phoneNumber} 
                                                    onChange={handleAddressInputChange} 
                                                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-[var(--color-primary)] bg-white input-premium"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-450">Address Line 1 *</label>
                                            <input 
                                                type="text" 
                                                name="addressLine1" 
                                                value={addressForm.addressLine1} 
                                                onChange={handleAddressInputChange} 
                                                className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-[var(--color-primary)] bg-white input-premium"
                                                placeholder="Street address, P.O. box, company name"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-450">Address Line 2 (Optional)</label>
                                            <input 
                                                type="text" 
                                                name="addressLine2" 
                                                value={addressForm.addressLine2} 
                                                onChange={handleAddressInputChange} 
                                                className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-[var(--color-primary)] bg-white input-premium"
                                                placeholder="Apartment, suite, unit, building, floor, etc."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-450">City *</label>
                                                <input 
                                                    type="text" 
                                                    name="city" 
                                                    value={addressForm.city} 
                                                    onChange={handleAddressInputChange} 
                                                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-[var(--color-primary)] bg-white input-premium"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-450">State *</label>
                                                <input 
                                                    type="text" 
                                                    name="state" 
                                                    value={addressForm.state} 
                                                    onChange={handleAddressInputChange} 
                                                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-[var(--color-primary)] bg-white input-premium"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-wider text-zinc-450">Postal Pincode *</label>
                                                <input 
                                                    type="text" 
                                                    name="postalCode" 
                                                    value={addressForm.postalCode} 
                                                    onChange={handleAddressInputChange} 
                                                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-[var(--color-primary)] bg-white input-premium"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <input 
                                                type="checkbox" 
                                                id="isDefault" 
                                                name="isDefault" 
                                                checked={addressForm.isDefault} 
                                                onChange={handleAddressInputChange}
                                                disabled={addresses.length === 0} // First address is always default
                                                className="rounded border-zinc-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                                            />
                                            <label htmlFor="isDefault" className="text-[10px] font-bold text-zinc-650 cursor-pointer select-none">Set as default shipping address</label>
                                        </div>

                                        <div className="flex items-center gap-3 pt-3">
                                            <button 
                                                type="submit" 
                                                disabled={addressSubmitting}
                                                className="px-6 py-2.5 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-black active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
                                            >
                                                {addressSubmitting ? 'Saving...' : 'Save Address'}
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setShowAddressForm(false)}
                                                className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : addressesLoading ? (
                                    <div className="space-y-4">
                                        <div className="h-28 bg-zinc-50 animate-pulse rounded-2xl"></div>
                                    </div>
                                ) : addresses.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((addr) => (
                                            <div 
                                                key={addr._id}
                                                className={`border p-4.5 rounded-2xl flex flex-col justify-between gap-4 transition-all relative ${
                                                    addr.isDefault 
                                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/20 shadow-[0_4px_12px_rgba(var(--color-primary-rgb),0.02)]' 
                                                        : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-sm'
                                                }`}
                                            >
                                                {addr.isDefault && (
                                                    <span 
                                                        className="absolute top-3 right-3 px-2 py-0.5 text-[7px] font-black uppercase tracking-wider text-white rounded-md"
                                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                                    >
                                                        Default
                                                    </span>
                                                )}

                                                <div className="space-y-1.5">
                                                    <p className="text-xs font-black text-zinc-900">{addr.fullName}</p>
                                                    <p className="text-[10px] text-zinc-450 font-bold leading-normal">
                                                        {addr.addressLine1}
                                                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                                                        <br />
                                                        {addr.city}, {addr.state} - {addr.postalCode}
                                                        <br />
                                                        Phone: {addr.phoneNumber}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 flex-wrap">
                                                    {!addr.isDefault && (
                                                        <button 
                                                            onClick={() => handleSetDefault(addr._id)}
                                                            className="text-[9px] font-black uppercase tracking-wider text-[var(--color-primary)] hover:opacity-80 transition-opacity cursor-pointer mr-auto"
                                                        >
                                                            Set Default
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleOpenEditAddress(addr)}
                                                        className="text-[9px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteAddress(addr._id)}
                                                        className="text-[9px] font-black uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-zinc-50/50 rounded-2xl space-y-3">
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">No saved addresses found.</p>
                                        <button 
                                            onClick={handleOpenAddAddress}
                                            className="px-6 py-2.5 bg-zinc-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-black active:scale-95 transition-all shadow-md cursor-pointer"
                                        >
                                            Add Your First Address
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontAccount;
