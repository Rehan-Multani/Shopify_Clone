import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateOrder = () => {
    const navigate = useNavigate();

    // App state
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [productSearch, setProductSearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [notes, setNotes] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [orderStatus, setOrderStatus] = useState('pending');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // API Config
    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';
    const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:5003/api';
    const STORE_API_URL = import.meta.env.VITE_STORE_API_URL || 'http://localhost:5004/api';

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [productsRes, customersRes] = await Promise.all([
                    fetch(`${CATALOG_API_URL}/products`, { headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId } }),
                    fetch(`${CATALOG_API_URL}/customers`, { headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId } })
                ]);
                if (productsRes.ok) {
                    const prodData = await productsRes.json();
                    setProducts(prodData);
                }
                if (customersRes.ok) {
                    const custData = await customersRes.json();
                    setCustomers(custData);
                }
            } catch (err) {
                console.error('Error loading initial data:', err);
            }
        };
        loadInitialData();
    }, [storeId]);

    // Calculations
    const subtotal = selectedProducts.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);
    const totalAmount = Math.max(0, subtotal - discount + Number(shipping));

    const handleAddProduct = (prod) => {
        const exists = selectedProducts.find(p => p._id === prod._id);
        if (exists) {
            setSelectedProducts(prev => prev.map(p => p._id === prod._id ? { ...p, quantity: p.quantity + 1 } : p));
        } else {
            setSelectedProducts(prev => [...prev, { ...prod, quantity: 1 }]);
        }
        setShowProductDropdown(false);
        setProductSearch('');
    };

    const handleRemoveProduct = (id) => {
        setSelectedProducts(prev => prev.filter(p => p._id !== id));
    };

    const handleQuantityChange = (id, val) => {
        const qty = Math.max(1, parseInt(val) || 1);
        setSelectedProducts(prev => prev.map(p => p._id === id ? { ...p, quantity: qty } : p));
    };

    const handleCreateOrder = async () => {
        if (!selectedCustomer) {
            showToast('Please select or search a customer first', 'error');
            return;
        }
        if (selectedProducts.length === 0) {
            showToast('Please add at least one product to the order', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const orderPayload = {
                customerName: selectedCustomer.name,
                customerEmail: selectedCustomer.email || '',
                storeId,
                products: selectedProducts.map(p => ({
                    productId: p._id,
                    productName: p.name,
                    quantity: p.quantity,
                    price: p.sellingPrice
                })),
                totalAmount,
                status: orderStatus,
                paymentStatus,
                notes
            };

            const res = await fetch(`${STORE_API_URL.replace('/stores', '')}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderPayload)
            });

            if (res.ok) {
                showToast('Order created successfully!');
                setTimeout(() => navigate('/dashboard/orders'), 1500);
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to create order', 'error');
            }
        } catch (err) {
            showToast('Error creating order. Please check connection.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filtered lists
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

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

            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate('/dashboard/orders')}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-all text-gray-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <span className="text-gray-400 font-normal">›</span>
                    <h1 className="text-lg font-bold text-[#202223]">Create order</h1>
                </div>
                <button
                    onClick={handleCreateOrder}
                    disabled={isSubmitting}
                    className="bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : 'Save Order'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Column */}
                <div className="flex-1 space-y-4">
                    {/* Products Card */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-4 lg:p-6 space-y-4">
                        <h2 className="font-bold text-sm text-[#202223]">Products</h2>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                value={productSearch}
                                onChange={(e) => {
                                    setProductSearch(e.target.value);
                                    setShowProductDropdown(true);
                                }}
                                onFocus={() => setShowProductDropdown(true)}
                                placeholder="Search products by name..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all placeholder:text-gray-500"
                            />
                            {showProductDropdown && productSearch && (
                                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-20">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map(p => (
                                            <div 
                                                key={p._id} 
                                                onClick={() => handleAddProduct(p)}
                                                className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-sm transition-all"
                                            >
                                                <span className="font-medium text-[#202223]">{p.name}</span>
                                                <span className="font-bold text-[#14B8A6]">₹{p.sellingPrice}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2.5 text-xs text-gray-400 italic">No products found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Products Table */}
                        {selectedProducts.length > 0 && (
                            <div className="border border-gray-100 rounded-xl overflow-hidden mt-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="text-left px-4 py-2">Product</th>
                                            <th className="text-center px-4 py-2 w-24">Quantity</th>
                                            <th className="text-right px-4 py-2">Price</th>
                                            <th className="text-right px-4 py-2">Total</th>
                                            <th className="px-4 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedProducts.map(p => (
                                            <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-semibold text-[#202223]">{p.name}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        value={p.quantity} 
                                                        onChange={(e) => handleQuantityChange(p._id, e.target.value)}
                                                        className="w-16 border border-gray-200 rounded px-2 py-0.5 text-center text-sm font-bold focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-500">₹{p.sellingPrice}</td>
                                                <td className="px-4 py-3 text-right font-bold text-[#202223]">₹{p.sellingPrice * p.quantity}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button 
                                                        onClick={() => handleRemoveProduct(p._id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Payment Card */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm overflow-hidden">
                        <div className="p-4 lg:p-6 space-y-4">
                            <h2 className="font-bold text-sm text-[#202223]">Payment</h2>
                            <div className="space-y-4 pr-2">
                                <div className="flex justify-between text-sm text-[#202223]">
                                    <span className="font-medium">Subtotal</span>
                                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-[#5c5f62] items-center">
                                    <span className="font-medium">Discount (₹)</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={discount} 
                                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                                        className="w-24 border border-gray-200 rounded px-2 py-1 text-right text-sm font-bold focus:outline-none focus:ring-1 focus:ring-black/10"
                                    />
                                </div>
                                <div className="flex justify-between text-sm text-[#5c5f62] items-center">
                                    <span className="font-medium">Shipping (₹)</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={shipping} 
                                        onChange={(e) => setShipping(Math.max(0, Number(e.target.value) || 0))}
                                        className="w-24 border border-gray-200 rounded px-2 py-1 text-right text-sm font-bold focus:outline-none focus:ring-1 focus:ring-black/10"
                                    />
                                </div>
                                <div className="flex justify-between text-base font-bold text-[#202223] pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="w-full lg:w-80 space-y-4">
                    {/* Customer Card */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-4 space-y-3">
                        <h2 className="font-bold text-sm text-[#202223]">Customer</h2>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                value={selectedCustomer ? selectedCustomer.name : customerSearch}
                                onChange={(e) => {
                                    setCustomerSearch(e.target.value);
                                    setSelectedCustomer(null);
                                    setShowCustomerDropdown(true);
                                }}
                                onFocus={() => setShowCustomerDropdown(true)}
                                placeholder="Search or select customer..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
                            />
                            {showCustomerDropdown && customerSearch && (
                                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto z-20">
                                    {filteredCustomers.length > 0 ? (
                                        filteredCustomers.map(c => (
                                            <div 
                                                key={c._id} 
                                                onClick={() => {
                                                    setSelectedCustomer(c);
                                                    setShowCustomerDropdown(false);
                                                }}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium transition-all"
                                            >
                                                {c.name} ({c.email || 'No email'})
                                            </div>
                                        ))
                                    ) : (
                                        <div 
                                            onClick={() => {
                                                setSelectedCustomer({ name: customerSearch, email: '' });
                                                setShowCustomerDropdown(false);
                                            }}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-xs text-gray-400 italic"
                                        >
                                            Add "{customerSearch}" as custom customer
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Status Card */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-4 space-y-4">
                        <h2 className="font-bold text-sm text-[#202223]">Order & Payment Status</h2>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Status</label>
                                <select 
                                    value={orderStatus} 
                                    onChange={(e) => setOrderStatus(e.target.value)}
                                    className="w-full bg-white border border-[#d3d3d3] rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Status</label>
                                <select 
                                    value={paymentStatus} 
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="w-full bg-white border border-[#d3d3d3] rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                                >
                                    <option value="pending">Pending Payment</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notes Card */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] shadow-sm p-4 space-y-3">
                        <h2 className="font-bold text-sm text-[#202223]">Notes</h2>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes to this order"
                            className="w-full bg-white border border-[#d3d3d3] rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400 h-20 resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOrder;
