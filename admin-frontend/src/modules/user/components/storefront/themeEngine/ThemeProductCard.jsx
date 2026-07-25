import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStorePath } from '../storeUrlHelper';
import { useTheme } from './ThemeContext';
import { useCartUI } from './ThemeExperience';

const ASSETS_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${ASSETS_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Theme-aware product card — visual composition changes by productCardStyle.
 */
export default function ThemeProductCard({ product, storeId, onAddToCart, cardShape, customer }) {
    const theme = useTheme();
    const cartUi = useCartUI();
    const style = theme.productCardStyle || 'standard';
    const [hovered, setHovered] = useState(false);
    const [adding, setAdding] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [activeCustomer, setActiveCustomer] = useState(customer || null);

    useEffect(() => {
        if (customer) {
            setActiveCustomer(customer);
            return;
        }
        try {
            const saved = localStorage.getItem(`customer_${storeId}`);
            setActiveCustomer(saved ? JSON.parse(saved) : null);
        } catch {
            setActiveCustomer(null);
        }
    }, [customer, storeId]);

    const img1 = product.images?.[0] ? getImageUrl(product.images[0]) : null;
    const img2 = product.images?.[1] ? getImageUrl(product.images[1]) : img1;
    const discount = product.actualPrice > product.sellingPrice
        ? Math.round(((product.actualPrice - product.sellingPrice) / product.actualPrice) * 100)
        : 0;
    const outOfStock = Number(product.stock) === 0;
    const lowStock = !outOfStock && Number(product.stock) > 0 && Number(product.stock) <= 10;

    useEffect(() => {
        if (!activeCustomer?._id || !storeId || !product?._id) return;
        fetch(`${GATEWAY_URL}/customers/${activeCustomer._id}/wishlist`, { headers: { 'x-store-id': storeId } })
            .then((res) => res.json())
            .then((data) => {
                if (data.success && Array.isArray(data.wishlist)) {
                    const ids = data.wishlist.map((item) => item._id || item);
                    setWishlisted(ids.includes(product._id));
                }
            })
            .catch(() => {});
    }, [activeCustomer?._id, storeId, product?._id]);

    const handleAdd = async (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        if (!onAddToCart || outOfStock) return;
        setAdding(true);
        await onAddToCart(product);
        if (theme.cartStyle === 'drawer' || theme.cartStyle === 'sticky') {
            cartUi.openCart?.();
        }
        setTimeout(() => setAdding(false), 700);
    };

    const handleWishlist = async (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        if (!activeCustomer?._id) {
            window.location.assign(getStorePath(storeId, '/login?redirect=wishlist'));
            return;
        }
        const next = !wishlisted;
        setWishlisted(next);
        try {
            const res = await fetch(`${GATEWAY_URL}/customers/${activeCustomer._id}/wishlist`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-store-id': storeId },
                body: JSON.stringify({ productId: product._id }),
            });
            const data = await res.json();
            if (res.ok && data.success && Array.isArray(data.wishlist)) {
                const ids = data.wishlist.map((item) => item._id || item);
                setWishlisted(ids.includes(product._id));
            }
        } catch {
            setWishlisted(!next);
        }
    };

    const radius = cardShape === 'square' ? '0px'
        : cardShape === 'pill' ? '24px'
        : theme.borderRadius || '8px';

    const link = getStorePath(storeId, `/product/${product._id}`);
    const priceColor = ['luxury', 'editorial', 'minimal'].includes(style) ? 'var(--color-text)' : 'var(--color-primary)';
    const price = (
        <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-bold" style={{ color: priceColor, fontFamily: 'var(--theme-price-font)' }}>
                ₹{Number(product.sellingPrice || 0).toLocaleString()}
            </span>
            {discount > 0 && (
                <>
                    <span className="text-xs text-zinc-400 line-through">₹{Number(product.actualPrice).toLocaleString()}</span>
                    {style === 'sale' && <span className="text-[10px] font-black text-red-600">-{discount}%</span>}
                </>
            )}
        </div>
    );

    const badge = discount > 0 && !['luxury', 'editorial', 'minimal'].includes(style) && (
        <span className={`absolute top-3 left-3 z-10 px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
            style === 'sale' ? 'bg-red-600 text-white' : style === 'quickAdd' ? 'bg-black text-white' : 'text-white'
        }`} style={style === 'sale' || style === 'quickAdd' ? undefined : { background: 'var(--color-accent)' }}>
            {style === 'sale' ? `${discount}% OFF` : `−${discount}%`}
        </span>
    );

    const wishlistBtn = !['luxury', 'minimal'].includes(style) && (
        <button type="button" onClick={handleWishlist} aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className={`w-3.5 h-3.5 ${wishlisted ? 'fill-red-500 stroke-red-500' : 'stroke-zinc-700 fill-none'}`} strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        </button>
    );

    const stockOverlay = outOfStock && (
        <span className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center text-[10px] font-black uppercase">Out of stock</span>
    );

    const addLabel = adding ? 'Added ✓' : outOfStock ? 'Out of stock' : (style === 'quickAdd' ? '+ Quick Add' : style === 'sale' ? 'Grab Deal' : 'Add to Cart');

    if (style === 'luxury' || style === 'editorial') {
        return (
            <div data-theme-card data-card-style={style} className="group flex flex-col" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                <Link to={link} className="relative block aspect-[3/4] overflow-hidden bg-zinc-100 mb-4" style={{ borderRadius: style === 'luxury' ? '0px' : radius }}>
                    {stockOverlay}
                    {(hovered && img2 ? img2 : img1) ? (
                        <img src={hovered && img2 ? img2 : img1} alt={product.name} loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full bg-zinc-200" />
                    )}
                    {style === 'editorial' && (
                        <span className="absolute bottom-3 left-3 right-3 py-2 text-center text-[10px] font-black uppercase tracking-widest bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                            View product
                        </span>
                    )}
                </Link>
                <Link to={link} className={`text-sm tracking-wide mb-1 ${style === 'luxury' ? 'uppercase font-light' : 'font-semibold'}`}>
                    {product.name}
                </Link>
                <div className="text-sm opacity-80">{price}</div>
            </div>
        );
    }

    if (style === 'minimal') {
        return (
            <div data-theme-card data-card-style={style} className="group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                <Link to={link} className="relative block aspect-square overflow-hidden mb-3 bg-zinc-50">
                    {stockOverlay}
                    {img1 && <img src={hovered && img2 ? img2 : img1} alt={product.name} loading="lazy" className="w-full h-full object-cover" />}
                </Link>
                <Link to={link} className="text-xs font-medium text-zinc-800 line-clamp-1">{product.name}</Link>
                <div className="mt-1 text-sm">{price}</div>
            </div>
        );
    }

    if (style === 'large' || style === 'hoverSwap') {
        return (
            <div data-theme-card data-card-style={style} className="group relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                <Link to={link} className="relative block aspect-[4/5] overflow-hidden bg-zinc-100" style={{ borderRadius: radius }}>
                    {badge}{wishlistBtn}{stockOverlay}
                    {img1 && (
                        <>
                            <img src={img1} alt={product.name} loading="lazy" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hovered && img2 ? 'opacity-0' : 'opacity-100'}`} />
                            {img2 && <img src={img2} alt={product.name} loading="lazy" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`} />}
                        </>
                    )}
                    <button type="button" onClick={handleAdd} disabled={outOfStock}
                        className="absolute bottom-3 left-3 right-3 py-2.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40 btn-premium"
                        style={{ background: 'var(--color-accent)', borderRadius: radius }}>
                        {addLabel}
                    </button>
                </Link>
                <div className="mt-3 space-y-1">
                    <Link to={link} className="text-sm font-semibold line-clamp-1">{product.name}</Link>
                    {price}
                </div>
            </div>
        );
    }

    if (style === 'marketplace' || style === 'compact') {
        return (
            <div data-theme-card data-card-style={style}
                className="group store-card bg-white flex flex-col h-full overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
                style={{ borderRadius: radius }}
                onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                <Link to={link} className="theme-card-media relative block aspect-square bg-zinc-100 overflow-hidden m-2.5 mb-0" style={{ borderRadius: `calc(${radius} - 4px)` }}>
                    {badge}{wishlistBtn}{stockOverlay}
                    {lowStock && <span className="absolute bottom-2 left-2 z-10 bg-amber-500 text-white px-2 py-1 text-[9px] font-black uppercase rounded-md">Only {product.stock} left</span>}
                    {img1 ? <img src={hovered && img2 ? img2 : img1} alt={product.name} loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-100" />}
                </Link>
                <div className="p-4 pt-3 flex-1 flex flex-col gap-1.5">
                    {product.brandName && <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">{product.brandName}</span>}
                    <Link to={link} className="text-sm font-medium line-clamp-2 leading-snug flex-1" style={{ fontFamily: 'var(--heading-font)' }}>{product.name}</Link>
                    {price}
                    <button type="button" onClick={handleAdd} disabled={outOfStock}
                        className="w-full py-2.5 text-[11px] font-bold text-white disabled:opacity-40 btn-premium mt-1"
                        style={{ background: 'var(--color-primary)', borderRadius: radius }}>
                        {addLabel}
                    </button>
                </div>
            </div>
        );
    }

    if (style === 'sale') {
        return (
            <div data-theme-card data-card-style={style}
                className="group store-card bg-white flex flex-col h-full overflow-hidden relative transition-transform duration-300 hover:-translate-y-1.5"
                style={{ borderRadius: radius }}
                onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                <Link to={link} className="relative block aspect-square bg-zinc-100 overflow-hidden m-2.5 mb-0" style={{ borderRadius: `calc(${radius} - 4px)` }}>
                    {badge}{wishlistBtn}{stockOverlay}
                    <span className="absolute top-0 left-0 z-20 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-br-md">Deal</span>
                    {img1 ? <img src={hovered && img2 ? img2 : img1} alt={product.name} loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-100" />}
                </Link>
                <div className="p-4 pt-3 flex-1 flex flex-col gap-2">
                    <Link to={link} className="text-sm font-medium line-clamp-2" style={{ fontFamily: 'var(--heading-font)' }}>{product.name}</Link>
                    {price}
                    <button type="button" onClick={handleAdd} disabled={outOfStock}
                        className="w-full py-2.5 text-[11px] font-black uppercase tracking-wider text-white bg-red-600 disabled:opacity-40 btn-premium"
                        style={{ borderRadius: radius }}>
                        {addLabel}
                    </button>
                </div>
            </div>
        );
    }

    if (style === 'quickAdd') {
        return (
            <div data-theme-card data-card-style={style}
                className="group store-card bg-white overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
                style={{ borderRadius: radius }}
                onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                <Link to={link} className="relative block aspect-[4/5] bg-zinc-100 overflow-hidden m-2.5 mb-0" style={{ borderRadius: `calc(${radius} - 4px)` }}>
                    {badge}{wishlistBtn}{stockOverlay}
                    {img1 && <img src={hovered && img2 ? img2 : img1} alt={product.name} loading="lazy" className="w-full h-full object-cover" />}
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <button type="button" onClick={handleAdd} disabled={outOfStock}
                            className="w-full py-3 text-[11px] font-black uppercase tracking-wider bg-white text-zinc-900 disabled:opacity-40 btn-premium shadow-md"
                            style={{ borderRadius: radius }}>
                            {addLabel}
                        </button>
                    </div>
                </Link>
                <div className="p-4 pt-3 space-y-1">
                    <Link to={link} className="text-sm font-medium line-clamp-1 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--heading-font)' }}>{product.name}</Link>
                    {price}
                </div>
            </div>
        );
    }

    return (
        <div data-theme-card data-card-style={style}
            className="group store-card bg-white flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
            style={{ borderRadius: radius }}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <div className="theme-card-media aspect-square w-auto overflow-hidden bg-zinc-100 relative m-2.5 mb-0" style={{ borderRadius: `calc(${radius} - 4px)` }}>
                {badge}{wishlistBtn}{stockOverlay}
                <Link to={link} className="block w-full h-full">
                    {img1 ? (
                        <img src={hovered && img2 ? img2 : img1} alt={product.name} loading="lazy"
                            className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-zinc-100" />
                    )}
                </Link>
            </div>
            <div className="p-4 pt-3 flex flex-col gap-1.5 flex-1">
                <Link to={link} className="text-sm font-medium line-clamp-1 group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'var(--heading-font)' }}>{product.name}</Link>
                {price}
                <button type="button" onClick={handleAdd} disabled={outOfStock}
                    className="mt-2 w-full py-2.5 text-[11px] font-bold text-white disabled:opacity-40 btn-premium"
                    style={{ background: 'var(--color-primary)', borderRadius: radius }}>
                    {addLabel}
                </button>
            </div>
        </div>
    );
}
