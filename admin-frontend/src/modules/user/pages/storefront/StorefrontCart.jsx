import React from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL.replace('/api', '');

const StorefrontCart = ({ cart, cartCount, onUpdateCartQty, onRemoveFromCart, customer, onLogout, storeInfo }) => {
    const { storeId } = useParams();

    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);
    
    // Shipping goal target (e.g. Free shipping above 499)
    const shippingThreshold = 499;
    const isFreeShipping = subtotal >= shippingThreshold;
    const shippingProgress = Math.min(100, (subtotal / shippingThreshold) * 100);
    const neededAmount = shippingThreshold - subtotal;

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
                <div className="space-y-1 mb-8">
                    <h1 className="text-lg font-black tracking-widest text-zinc-900 uppercase">Shopping Cart</h1>
                    <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                </div>

                {cart.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Free Shipping Progress Indicator */}
                            <div className="bg-white border border-zinc-200/60 rounded-2xl p-4.5 shadow-[0_1px_4px_rgba(0,0,0,0.01)] space-y-3">
                                <div className="flex justify-between items-center text-xs font-semibold text-zinc-650">
                                    {isFreeShipping ? (
                                        <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                                            🎉 You qualify for FREE Shipping!
                                        </span>
                                    ) : (
                                        <span>
                                            Add <strong className="text-zinc-900">₹{neededAmount}</strong> more to get <strong>FREE Shipping</strong>
                                        </span>
                                    )}
                                    <span className="text-[10px] font-black uppercase tracking-wider">Goal: ₹{shippingThreshold}</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-500 rounded-full"
                                        style={{ 
                                            width: `${shippingProgress}%`,
                                            backgroundColor: isFreeShipping ? '#10b981' : 'var(--color-primary)'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {cart.map((item, idx) => (
                                <div 
                                    key={item._id} 
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-zinc-200/60 rounded-2xl gap-4 shadow-sm hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.04)] transition-all duration-300 animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 40}ms`, borderRadius: 'var(--border-radius)' }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-xl bg-[#fafafa] overflow-hidden border border-zinc-200/50 flex-shrink-0 flex items-center justify-center">
                                            {item.images && item.images.length > 0 ? (
                                                <img 
                                                    src={item.images[0].startsWith('http') || item.images[0].startsWith('data:') ? item.images[0] : `${ASSETS_BASE_URL}${item.images[0]}`} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <h3 className="text-xs font-bold text-zinc-800 truncate uppercase tracking-tight">{item.name}</h3>
                                            {item.brandName && (
                                                <p className="text-[8px] text-zinc-400 font-extrabold uppercase tracking-widest leading-none">{item.brandName}</p>
                                            )}
                                            <p className="text-[10px] font-black text-zinc-950">₹{item.sellingPrice}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                                        {/* Qty edit */}
                                        <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50">
                                            <button 
                                                onClick={() => onUpdateCartQty(item._id, item.qty - 1)}
                                                className="px-2.5 py-1.5 text-zinc-500 hover:bg-zinc-150 active:scale-95 font-bold cursor-pointer transition-all text-xs"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-xs font-black text-zinc-700">{item.qty}</span>
                                            <button 
                                                onClick={() => onUpdateCartQty(item._id, item.qty + 1)}
                                                className="px-2.5 py-1.5 text-zinc-500 hover:bg-zinc-150 active:scale-95 font-bold cursor-pointer transition-all text-xs"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Item Total */}
                                        <span className="text-xs font-black text-zinc-900 w-24 text-right">
                                            ₹{(item.sellingPrice * item.qty).toLocaleString()}
                                        </span>

                                        {/* Remove button */}
                                        <button 
                                            onClick={() => onRemoveFromCart(item._id)}
                                            className="p-2 bg-red-50 hover:bg-red-100/80 border border-red-100 rounded-xl text-red-500 transition-all cursor-pointer active:scale-95 flex items-center justify-center shadow-sm"
                                            title="Remove Item"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary panel */}
                        <div 
                            className="lg:col-span-4 bg-white border border-zinc-200/60 rounded-3xl p-6 shadow-sm space-y-6 lg:sticky lg:top-24"
                            style={{ borderRadius: 'var(--border-radius)' }}
                        >
                            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-3">Order Summary</h3>

                            <div className="space-y-3.5 font-semibold text-xs text-zinc-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-zinc-950 font-bold">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">Free</span>
                                </div>
                                <hr className="border-zinc-100" />
                                <div className="flex justify-between text-sm font-black text-zinc-900 uppercase tracking-wide">
                                    <span>Total Amount</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <Link 
                                to={`/store/${storeId}/checkout`}
                                className="block w-full py-3.5 text-center text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] shadow-md hover:opacity-95 cursor-pointer btn-premium"
                                style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white border border-zinc-200/60 rounded-3xl space-y-5 shadow-sm animate-scale-in max-w-md mx-auto" style={{ borderRadius: 'var(--border-radius)' }}>
                        <div className="w-12 h-12 bg-zinc-55 rounded-2xl flex items-center justify-center mx-auto text-zinc-400 border border-zinc-100">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div className="space-y-1 px-4">
                            <h2 className="text-sm font-black text-zinc-800 uppercase tracking-wider">Your Cart is Empty</h2>
                            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed font-semibold">Looks like you haven't added anything to your cart yet.</p>
                        </div>
                        <Link 
                            to={`/store/${storeId}/catalog`} 
                            className="inline-block px-7 py-3 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md btn-premium"
                            style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
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
