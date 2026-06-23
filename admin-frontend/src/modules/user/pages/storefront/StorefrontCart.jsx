import React from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';

const StorefrontCart = ({ cart, cartCount, onUpdateCartQty, onRemoveFromCart, customer, onLogout, storeInfo }) => {
    const { storeId } = useParams();

    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Shopping Cart</h1>

                {cart.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-4">
                            {cart.map((item) => (
                                <div 
                                    key={item._id} 
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl gap-4 shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-20 rounded-xl bg-gray-50 overflow-hidden border border-gray-150 flex-shrink-0 flex items-center justify-center">
                                            {item.images && item.images.length > 0 ? (
                                                <img 
                                                    src={item.images[0].startsWith('http') || item.images[0].startsWith('data:') ? item.images[0] : `http://localhost:5000${item.images[0]}`} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xl">📦</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                                            {item.brandName && (
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.brandName}</p>
                                            )}
                                            <p className="text-xs font-black text-gray-900 mt-1">₹{item.sellingPrice}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6">
                                        {/* Qty edit */}
                                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                                            <button 
                                                onClick={() => onUpdateCartQty(item._id, item.qty - 1)}
                                                className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-xs font-bold text-gray-700">{item.qty}</span>
                                            <button 
                                                onClick={() => onUpdateCartQty(item._id, item.qty + 1)}
                                                className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 font-bold cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Item Total */}
                                        <span className="text-sm font-black text-gray-900 w-20 text-right">
                                            ₹{item.sellingPrice * item.qty}
                                        </span>

                                        {/* Remove button */}
                                        <button 
                                            onClick={() => onRemoveFromCart(item._id)}
                                            className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 transition-colors cursor-pointer"
                                            title="Remove Item"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary panel */}
                        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 self-start">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Order Summary</h3>

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
                                    <span>Total</span>
                                    <span>₹{subtotal}</span>
                                </div>
                            </div>

                            <Link 
                                to={`/store/${storeId}/checkout`}
                                className="block w-full py-3.5 text-center text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md hover:opacity-95 cursor-pointer"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white border border-gray-100 rounded-3xl space-y-4">
                        <span className="text-5xl">🛒</span>
                        <h2 className="text-lg font-black text-gray-700">Your Cart is Empty</h2>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
                        <Link 
                            to={`/store/${storeId}/catalog`} 
                            className="inline-block px-6 py-2.5 bg-gray-900 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-black transition-all cursor-pointer"
                        >
                            Explore Products
                        </Link>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontCart;
