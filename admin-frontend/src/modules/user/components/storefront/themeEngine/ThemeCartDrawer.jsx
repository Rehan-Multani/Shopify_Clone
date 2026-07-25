import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { getStorePath } from '../storeUrlHelper';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

export default function ThemeCartDrawer({
    open,
    onClose,
    cart = [],
    storeId,
    onUpdateCartQty,
    onRemoveFromCart,
}) {
    const theme = useTheme();
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * Number(item.qty || 0)), 0);
    const shippingThreshold = 499;
    const remaining = Math.max(0, shippingThreshold - subtotal);
    const progress = Math.min(100, (subtotal / shippingThreshold) * 100);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => {
            if (event.key === 'Escape') onClose?.();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);

    if (!open || theme.cartStyle === 'page') return null;

    return (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Shopping cart drawer">
            <button type="button" className="absolute inset-0 bg-black/45" aria-label="Close cart drawer" onClick={onClose} />
            <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-fade-in-up">
                <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-wider">Your Cart</h2>
                        <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{cart.length} item{cart.length === 1 ? '' : 's'}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close cart" className="w-10 h-10 rounded-full bg-zinc-100 text-xl">×</button>
                </div>

                <div className="px-5 py-3 border-b border-zinc-100">
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-600 mb-2">
                        {remaining > 0 ? (
                            <span>Add <strong>₹{remaining}</strong> more for free shipping</span>
                        ) : (
                            <span className="text-emerald-600 font-bold">Free shipping unlocked</span>
                        )}
                        <span>₹{shippingThreshold}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--color-primary)' }} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {cart.length === 0 ? (
                        <div className="py-16 text-center space-y-3">
                            <p className="text-sm font-bold text-zinc-700">Your cart is empty</p>
                            <Link to={getStorePath(storeId, '/catalog')} onClick={onClose} className="inline-block px-5 py-2.5 text-white text-[10px] font-black uppercase tracking-wider" style={{ background: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}>
                                Continue shopping
                            </Link>
                        </div>
                    ) : cart.map((item) => (
                        <div key={item._id} className="flex gap-3 border border-zinc-100 rounded-2xl p-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-50 flex-shrink-0">
                                {item.images?.[0] ? (
                                    <img src={resolveMediaUrl(item.images[0], GATEWAY_URL)} alt={item.name} className="w-full h-full object-cover" />
                                ) : null}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold line-clamp-2">{item.name}</p>
                                <p className="text-xs font-black mt-1" style={{ color: 'var(--color-primary)' }}>₹{item.sellingPrice}</p>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                    <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                                        <button type="button" aria-label="Decrease quantity" className="px-2.5 py-1.5 text-xs font-bold" onClick={() => onUpdateCartQty?.(item._id, item.qty - 1)}>-</button>
                                        <span className="w-8 text-center text-xs font-black">{item.qty}</span>
                                        <button type="button" aria-label="Increase quantity" className="px-2.5 py-1.5 text-xs font-bold" onClick={() => onUpdateCartQty?.(item._id, item.qty + 1)}>+</button>
                                    </div>
                                    <button type="button" aria-label={`Remove ${item.name}`} className="text-[10px] font-black uppercase text-red-500" onClick={() => onRemoveFromCart?.(item._id)}>Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {cart.length > 0 && (
                    <div className="p-5 border-t border-zinc-100 space-y-3">
                        <div className="flex justify-between text-sm font-black">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <Link
                            to={getStorePath(storeId, '/checkout')}
                            onClick={onClose}
                            className="block w-full py-3.5 text-center text-white text-[10px] font-black uppercase tracking-widest btn-premium"
                            style={{ background: 'var(--color-primary)', borderRadius: 'var(--border-radius)' }}
                        >
                            Checkout
                        </Link>
                        <Link to={getStorePath(storeId, '/cart')} onClick={onClose} className="block text-center text-[10px] font-black uppercase tracking-wider text-zinc-500">
                            View full cart
                        </Link>
                    </div>
                )}
            </aside>
        </div>
    );
}
