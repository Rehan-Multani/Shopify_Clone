import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useCartUI } from './ThemeExperience';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL?.replace('/api', '') || '';

/**
 * Theme-aware header — composition changes by headerStyle.
 */
export default function ThemeHeader({
    storeInfo,
    cartCount,
    customer,
    pages = [],
    isScrolled,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showSearchOverlay,
    setShowSearchOverlay,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    onLogout,
    getLink,
}) {
    const theme = useTheme();
    const cartUi = useCartUI();
    const style = theme.headerStyle || 'classic';
    const cfg = theme.headerConfig || {};
    const storeName = storeInfo?.storeName || 'Store';
    const logo = storeInfo?.storeLogo
        ? (storeInfo.storeLogo.startsWith('http') ? storeInfo.storeLogo : `${ASSETS_BASE_URL}${storeInfo.storeLogo}`)
        : null;

    const sticky = cfg.sticky !== false;
    const transparent = style === 'transparent' || style === 'floating' || cfg.transparent;
    const dark = style === 'dark' || style === 'mega';

    const bg = transparent && !isScrolled
        ? 'transparent'
        : dark
            ? (cfg.backgroundColor || '#0a0a0a')
            : (cfg.backgroundColor || theme.secondaryColor || '#ffffff');
    const text = transparent && !isScrolled
        ? '#ffffff'
        : dark
            ? '#fafafa'
            : (cfg.textColor || theme.primaryColor || '#111');

    const navLinks = (
        <>
            <Link to={getLink('/')} className="theme-nav-link">Home</Link>
            <Link to={getLink('/catalog')} className="theme-nav-link">Shop</Link>
            {pages.slice(0, 4).map((p) => (
                <Link key={p._id || p.slug} to={getLink(`/pages/${p.slug}`)} className="theme-nav-link">
                    {p.title}
                </Link>
            ))}
        </>
    );

    const cartControl = (theme.cartStyle === 'drawer' || theme.cartStyle === 'sticky') ? (
        <button type="button" onClick={cartUi.openCart} className="relative p-2 hover:opacity-70 transition-opacity" aria-label={`Open cart with ${cartCount} items`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                    style={{ background: 'var(--color-accent)' }}>{cartCount}</span>
            )}
        </button>
    ) : (
        <Link to={getLink('/cart')} className="relative p-2 hover:opacity-70 transition-opacity" aria-label={`Cart with ${cartCount} items`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                    style={{ background: 'var(--color-accent)' }}>{cartCount}</span>
            )}
        </Link>
    );

    const icons = (
        <div className="flex items-center gap-1 sm:gap-2">
            {cfg.showSearch !== false && (
                <button type="button" onClick={() => setShowSearchOverlay(true)} className="p-2 hover:opacity-70 transition-opacity" aria-label="Search">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
            )}
            {cfg.showWishlist !== false && (
                <Link to={getLink('/wishlist')} className="p-2 hover:opacity-70 transition-opacity" aria-label="Wishlist">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </Link>
            )}
            {cfg.showCart !== false && cartControl}
            <button
                type="button"
                className="lg:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
        </div>
    );

    const logoEl = (
        <Link to={getLink('/')} className="theme-brand flex items-center gap-2.5 tracking-tight text-xl md:text-2xl">
            {logo ? (
                <img src={logo} alt={storeName} className="h-9 md:h-10 w-auto object-contain" />
            ) : (
                <span style={{ fontFamily: 'var(--heading-font)' }}>{storeName}</span>
            )}
        </Link>
    );

    // CENTERED logo
    if (style === 'centered') {
        return (
            <header className={`${sticky ? 'sticky top-0' : ''} z-40 transition-all duration-300 ${isScrolled ? 'border-b border-black/5 shadow-[0_8px_30px_-18px_rgba(0,0,0,.25)]' : 'border-b border-transparent'}`}
                style={{ background: bg, color: text, backdropFilter: transparent && !isScrolled ? 'none' : 'blur(16px)' }}>
                <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 md:py-5 grid grid-cols-3 items-center">
                    <nav className="hidden lg:flex items-center gap-7">{navLinks}</nav>
                    <div className="flex justify-center">{logoEl}</div>
                    <div className="flex justify-end">{icons}</div>
                </div>
            </header>
        );
    }

    // FLOATING
    if (style === 'floating') {
        return (
            <header className={`fixed left-3 right-3 sm:left-5 sm:right-5 z-40 transition-all duration-500 ${isScrolled ? 'top-3' : 'top-5'}`}>
                <div className="max-w-6xl mx-auto rounded-2xl px-5 md:px-7 py-3.5 flex items-center justify-between border border-white/25"
                    style={{
                        background: isScrolled ? (dark ? bg : 'rgba(255,255,255,0.92)') : 'rgba(255,255,255,0.14)',
                        color: text,
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 18px 50px -28px rgba(15,23,42,.45)',
                    }}>
                    {logoEl}
                    <nav className="hidden lg:flex items-center gap-7">{navLinks}</nav>
                    {icons}
                </div>
            </header>
        );
    }

    // MINIMAL — logo + icons only
    if (style === 'minimal') {
        return (
            <header className={`${sticky ? 'sticky top-0' : ''} z-40 py-5 md:py-6`} style={{ background: bg, color: text }}>
                <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
                    {logoEl}
                    <div className="flex items-center gap-6">
                        <Link to={getLink('/catalog')} className="theme-nav-link">Shop</Link>
                        {icons}
                    </div>
                </div>
            </header>
        );
    }

    // MEGA / DARK — marketplace style with category strip
    if (style === 'mega' || style === 'dark') {
        return (
            <header className={`${sticky ? 'sticky top-0' : ''} z-40`} style={{ background: bg, color: text }}>
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between gap-4">
                    {logoEl}
                    <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl">
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full px-4 py-2.5 text-sm rounded-l-xl border-0 outline-none text-zinc-900 bg-white" />
                        <button type="submit" className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-r-xl text-white" style={{ background: 'var(--color-accent)' }}>Search</button>
                    </form>
                    {icons}
                </div>
                <div className="border-t border-white/10">
                    <nav className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-6 overflow-visible">
                        {style === 'mega' && (
                            <details className="relative group">
                                <summary className="list-none cursor-pointer text-[11px] font-semibold tracking-[0.14em] uppercase flex items-center gap-2 opacity-90">
                                    Departments <span aria-hidden="true">⌄</span>
                                </summary>
                                <div className="absolute left-0 top-full mt-3 w-[min(760px,90vw)] bg-white text-zinc-900 shadow-2xl border border-zinc-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 rounded-2xl">
                                    <div>
                                        <span className="text-[9px] font-bold uppercase tracking-[.18em] text-zinc-400">Shop</span>
                                        <Link to={getLink('/catalog')} className="block mt-3 text-sm font-medium" style={{ fontFamily: 'var(--heading-font)' }}>All products</Link>
                                        <Link to={getLink('/catalog?sort=newest')} className="block mt-2 text-xs text-zinc-500">New arrivals</Link>
                                        <Link to={getLink('/catalog?sort=price-low')} className="block mt-2 text-xs text-zinc-500">Best value</Link>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-[9px] font-bold uppercase tracking-[.18em] text-zinc-400">Information</span>
                                        <div className="grid grid-cols-2 gap-x-5 mt-3">
                                            {pages.slice(0, 6).map((page) => <Link key={page.slug} to={getLink(`/pages/${page.slug}`)} className="py-1.5 text-xs hover:text-[var(--color-primary)]">{page.title}</Link>)}
                                        </div>
                                    </div>
                                    <Link to={getLink('/catalog')} className="min-h-32 p-5 text-white flex flex-col justify-end rounded-xl" style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-accent))' }}>
                                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-75">Featured</span>
                                        <strong className="text-lg mt-1 font-medium" style={{ fontFamily: 'var(--heading-font)' }}>Explore the catalog →</strong>
                                    </Link>
                                </div>
                            </details>
                        )}
                        {navLinks}
                    </nav>
                </div>
            </header>
        );
    }

    // TRANSPARENT overlay
    if (style === 'transparent') {
        return (
            <header className={`absolute top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'sticky bg-white/95 backdrop-blur-xl border-b border-black/5 shadow-[0_8px_30px_-18px_rgba(0,0,0,.2)]' : ''}`}
                style={{ color: isScrolled ? theme.primaryColor : '#fff' }}>
                <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 md:py-5 flex items-center justify-between">
                    {logoEl}
                    <nav className="hidden lg:flex items-center gap-7">{navLinks}</nav>
                    {icons}
                </div>
            </header>
        );
    }

    // CLASSIC — logo left, nav center, icons right
    return (
        <header className={`${sticky ? 'sticky top-0' : ''} z-40 transition-all duration-300 ${isScrolled ? 'border-b border-black/5 shadow-[0_8px_30px_-18px_rgba(0,0,0,.22)]' : 'border-b border-black/[0.04]'}`}
            style={{ background: bg, color: text, backdropFilter: 'blur(14px)' }}>
            <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 md:py-5 flex items-center justify-between gap-6">
                {logoEl}
                <nav className="hidden lg:flex items-center gap-7 flex-1 justify-center">{navLinks}</nav>
                {icons}
            </div>
        </header>
    );
}
