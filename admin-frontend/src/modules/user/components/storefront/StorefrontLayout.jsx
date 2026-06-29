import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import ThemeRenderer from './ThemeRenderer';
import { getStorePath } from './storeUrlHelper';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL.replace('/api', '');

const isDarkColor = (hex) => {
    try {
        const cleanHex = (hex || '').replace('#', '');
        let r, g, b;
        if (cleanHex.length === 3) {
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else {
            r = parseInt(cleanHex.substring(0, 2), 16);
            g = parseInt(cleanHex.substring(2, 4), 16);
            b = parseInt(cleanHex.substring(4, 6), 16);
        }
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    } catch (e) {
        return false;
    }
};

const hexToRgba = (hex, alpha) => {
    try {
        const cleanHex = (hex || '').replace('#', '');
        let r, g, b;
        if (cleanHex.length === 3) {
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else {
            r = parseInt(cleanHex.substring(0, 2), 16);
            g = parseInt(cleanHex.substring(2, 4), 16);
            b = parseInt(cleanHex.substring(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
        return `rgba(255, 255, 255, ${alpha})`;
    }
};

const StorefrontLayout = ({ children, cartCount, customer, onLogout, storeInfo }) => {
    const { storeId: paramStoreId } = useParams();
    const storeId = storeInfo?._id || paramStoreId;
    const getLink = (subpath) => getStorePath(storeId, subpath);
    const navigate = useNavigate();
    const location = useLocation();
    const [pages, setPages] = useState([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSearchOverlay, setShowSearchOverlay] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!storeId) return;
        // Fetch pages to display in navigation and footer
        fetch(`${GATEWAY_URL}/store-pages?storeId=${storeId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.pages) {
                    setPages(data.pages.filter(p => p.slug !== 'home'));
                }
            })
            .catch(err => console.error('Error fetching pages for storefront layout:', err));
    }, [storeId]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on page changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setShowSearchOverlay(false);
    }, [location.pathname]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(getLink(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`));
            setShowSearchOverlay(false);
            setSearchQuery('');
        }
    };

    const logoShapeClass = storeInfo?.themeSettings?.logoShape === 'circle' 
        ? 'rounded-full' 
        : storeInfo?.themeSettings?.logoShape === 'square' 
            ? 'rounded-none' 
            : 'rounded-xl';

    const logoSizeClass = storeInfo?.themeSettings?.logoSize === 'small'
        ? 'h-8 w-8 text-xs'
        : storeInfo?.themeSettings?.logoSize === 'large'
            ? 'h-14 w-14 text-lg'
            : 'h-11 w-11 text-sm'; // default medium

    const footerBg = storeInfo?.themeSettings?.secondaryColor || '#ffffff';
    const isFooterDark = isDarkColor(footerBg);
    const footerText = isFooterDark ? '#f4f4f5' : '#09090b';
    const footerTextMuted = isFooterDark ? '#a1a1aa' : '#52525b';
    const footerBorder = isFooterDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const footerCardBg = isFooterDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';

    return (
        <ThemeRenderer themeSettings={storeInfo?.themeSettings || {}}>
            <div className="flex flex-col min-h-screen bg-[var(--color-secondary)] selection:bg-[var(--color-primary-semi)] selection:text-[var(--color-primary-dark)] text-[var(--color-text)]">
                {/* Dynamic Announcement Bar */}
                {storeInfo?.themeSettings?.headerConfig?.announcementBar?.enabled !== false && (
                    <div 
                        className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-1.5 z-50 relative"
                        style={{ 
                            backgroundColor: storeInfo?.themeSettings?.headerConfig?.announcementBar?.backgroundColor || 'var(--color-primary)',
                            color: storeInfo?.themeSettings?.headerConfig?.announcementBar?.textColor || '#ffffff'
                        }}
                    >
                        <span>{storeInfo?.themeSettings?.headerConfig?.announcementBar?.text || '✨ Free Shipping on all orders above ₹499'}</span>
                    </div>
                )}

                {/* Header */}
                <header 
                    className={`${storeInfo?.themeSettings?.headerConfig?.sticky !== false ? 'sticky top-0 z-45' : 'relative z-45'} w-full transition-all duration-300 ${
                        isScrolled 
                            ? 'bg-white/80 backdrop-blur-md border-b border-zinc-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.02)] py-3' 
                            : storeInfo?.themeSettings?.headerConfig?.transparent ? 'bg-transparent py-5' : 'bg-white border-b border-zinc-150 py-5'
                    }`}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between min-h-[3rem]">
                        {/* Logo & Name */}
                        <Link to={getLink('/')} className="flex items-center gap-3.5 group">
                            {storeInfo?.themeSettings?.headerConfig?.logoUrl || storeInfo?.storeLogo ? (
                                <img 
                                    src={storeInfo?.themeSettings?.headerConfig?.logoUrl || (storeInfo.storeLogo.startsWith('http') || storeInfo.storeLogo.startsWith('data:') ? storeInfo.storeLogo : `${ASSETS_BASE_URL}${storeInfo.storeLogo}`)} 
                                    alt={storeInfo.storeName} 
                                    className={`${logoSizeClass} ${logoShapeClass} object-cover border border-zinc-150 shadow-sm group-hover:scale-[1.03] transition-transform duration-300`} 
                                />
                            ) : (
                                <div className={`${logoSizeClass} ${logoShapeClass} flex items-center justify-center font-extrabold text-white shadow-sm transition-transform duration-300 group-hover:scale-[1.03]`} style={{ backgroundColor: 'var(--color-primary)' }}>
                                    {storeInfo?.storeName?.charAt(0).toUpperCase() || 'S'}
                                </div>
                            )}
                            <span className="font-extrabold text-md tracking-tight text-zinc-900 group-hover:text-[var(--color-primary)] transition-colors duration-300">
                                {storeInfo?.storeName || 'My Store'}
                            </span>
                        </Link>

                        {/* Desktop Dynamic Navigation */}
                        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
                            {storeInfo?.themeSettings?.headerConfig?.menuItems ? (
                                storeInfo.themeSettings.headerConfig.menuItems.map((item, idx) => (
                                    <Link 
                                        key={idx}
                                        to={item.link.startsWith('/') ? getLink(item.link === '/' ? '' : item.link) : item.link} 
                                        className={`text-[11px] font-bold uppercase tracking-wider relative py-1.5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-primary)] after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 ${
                                            location.pathname === getLink(item.link === '/' ? '' : item.link)
                                                ? 'text-zinc-950 after:scale-x-100' 
                                                : 'text-zinc-500 hover:text-zinc-950'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))
                            ) : (
                                <>
                                    <Link 
                                        to={getLink('/')} 
                                        className={`text-[11px] font-bold uppercase tracking-wider relative py-1.5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-primary)] after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 ${
                                            location.pathname === getLink('/') || location.pathname === getLink('/') + '/'
                                                ? 'text-zinc-950 after:scale-x-100' 
                                                : 'text-zinc-500 hover:text-zinc-950'
                                        }`}
                                    >
                                        Home
                                    </Link>
                                    <Link 
                                        to={getLink('/catalog')} 
                                        className={`text-[11px] font-bold uppercase tracking-wider relative py-1.5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-primary)] after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 ${
                                            location.pathname.includes('/catalog') 
                                                ? 'text-zinc-950 after:scale-x-100' 
                                                : 'text-zinc-550 hover:text-zinc-950'
                                        }`}
                                    >
                                        Catalog
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 sm:gap-3.5">
                            {/* Search Trigger */}
                            <button
                                onClick={() => setShowSearchOverlay(true)}
                                className="p-2.5 text-zinc-600 hover:text-zinc-950 rounded-xl hover:bg-zinc-100 active:scale-95 transition-all cursor-pointer"
                                aria-label="Search"
                            >
                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.3-4.3"></path>
                                </svg>
                            </button>

                            {/* Wishlist Link */}
                            {customer && (
                                <Link 
                                    to={getLink('/wishlist')}
                                    className="p-2.5 bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 text-zinc-700 hover:text-red-500 transition-all shadow-sm hover:scale-[1.04] active:scale-95 flex items-center justify-center"
                                    title="Wishlist"
                                >
                                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </Link>
                            )}

                            {/* Customer Auth */}
                            {customer ? (
                                <div className="hidden sm:flex items-center gap-2.5 bg-zinc-50 border border-zinc-200/60 pl-2 pr-3 py-1 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                                    <Link to={getLink('/account')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                        <div className="w-6.5 h-6.5 rounded-full text-white flex items-center justify-center text-[10px] font-black shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
                                            {customer.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-[11px] font-bold text-zinc-700">Hi, {customer.name.split(' ')[0]}</span>
                                    </Link>
                                    <span className="w-px h-3 bg-zinc-200"></span>
                                    <button 
                                        onClick={onLogout}
                                        className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link 
                                    to={getLink('/login')}
                                    className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-zinc-700 hover:text-white hover:bg-[var(--color-primary)] transition-all bg-white border border-zinc-200/80 px-4.5 py-2.5 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-[var(--color-primary)]"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                    </svg>
                                    Login
                                </Link>
                            )}

                            {/* Cart Icon */}
                            <Link 
                                to={getLink('/cart')}
                                className="relative p-2.5 bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 text-zinc-700 transition-premium shadow-sm hover:scale-[1.04] active:scale-95 flex items-center justify-center"
                            >
                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span 
                                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-md animate-scale-in"
                                        style={{ 
                                            backgroundColor: 'var(--color-primary)',
                                            animation: 'pulse-ring 2.2s infinite' 
                                        }}
                                    >
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Mobile Hamburger toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2.5 bg-white border border-zinc-200/85 rounded-xl text-zinc-700 hover:bg-zinc-55 active:scale-95 transition-premium flex items-center justify-center cursor-pointer"
                                aria-label="Toggle Navigation"
                            >
                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Mobile Drawer Menu */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
                        {/* Overlay backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        ></div>
                        {/* Drawer body */}
                        <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-7 flex flex-col justify-between shadow-2xl animate-scale-in border-l border-zinc-100">
                            <div className="space-y-8">
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                                    <span className="font-extrabold text-sm text-zinc-900 uppercase tracking-widest">Menu</span>
                                    <button 
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 text-zinc-400 hover:text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <nav className="flex flex-col gap-5">
                                    <Link 
                                        to={getLink('/')} 
                                        className={`text-sm font-bold tracking-wide transition-colors ${
                                            location.pathname === getLink('/') || location.pathname === getLink('/') + '/'
                                                ? 'text-[var(--color-primary)]' 
                                                : 'text-zinc-600 hover:text-zinc-950'
                                        }`}
                                    >
                                        Home
                                    </Link>
                                    <Link 
                                        to={getLink('/catalog')} 
                                        className={`text-sm font-bold tracking-wide transition-colors ${
                                            location.pathname.includes('/catalog') 
                                                ? 'text-[var(--color-primary)]' 
                                                : 'text-zinc-600 hover:text-zinc-950'
                                        }`}
                                    >
                                        Catalog
                                    </Link>
                                    {pages.map(page => (
                                        <Link 
                                            key={page.slug}
                                            to={getLink(`/pages/${page.slug}`)} 
                                            className={`text-sm font-bold tracking-wide transition-colors ${
                                                location.pathname.includes(`/pages/${page.slug}`) 
                                                    ? 'text-[var(--color-primary)]' 
                                                    : 'text-zinc-600 hover:text-zinc-950'
                                            }`}
                                        >
                                            {page.title}
                                        </Link>
                                    ))}
                                    {customer && (
                                        <>
                                            <Link 
                                                to={getLink('/wishlist')}
                                                className={`text-sm font-bold tracking-wide transition-colors ${
                                                    location.pathname.includes('/wishlist') 
                                                        ? 'text-[var(--color-primary)]' 
                                                        : 'text-zinc-600 hover:text-zinc-950'
                                                }`}
                                            >
                                                Wishlist
                                            </Link>
                                            <Link 
                                                to={getLink('/account')}
                                                className={`text-sm font-bold tracking-wide transition-colors ${
                                                    location.pathname.includes('/account') 
                                                        ? 'text-[var(--color-primary)]' 
                                                        : 'text-zinc-600 hover:text-zinc-950'
                                                }`}
                                            >
                                                My Account
                                            </Link>
                                        </>
                                    )}
                                </nav>
                            </div>

                            <div className="border-t border-zinc-150 pt-6">
                                {customer ? (
                                    <div className="space-y-4">
                                        <Link 
                                            to={getLink('/account')}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 hover:opacity-85"
                                        >
                                            <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-black shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
                                                {customer.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">My Account</p>
                                                <p className="text-sm font-bold text-zinc-800 truncate">{customer.name}</p>
                                            </div>
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                onLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full py-3 border border-red-200 text-red-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                ) : (
                                    <Link 
                                        to={getLink('/login')}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-primary)] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                        </svg>
                                        Log In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Full-Screen Search Overlay */}
                {showSearchOverlay && (
                    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col justify-start animate-fade-in">
                        <div className="max-w-4xl mx-auto w-full px-6 py-6 flex flex-col">
                            <div className="flex justify-end mb-16">
                                <button 
                                    onClick={() => setShowSearchOverlay(false)}
                                    className="p-3 text-zinc-400 hover:text-zinc-950 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer active:scale-95"
                                    aria-label="Close search"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleSearchSubmit} className="relative w-full border-b-2 border-zinc-200 focus-within:border-[var(--color-primary)] transition-colors duration-300">
                                <input 
                                    type="text" 
                                    placeholder="Type to search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full text-2xl sm:text-3xl font-extrabold pb-4 bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-900 placeholder-zinc-300"
                                    autoFocus
                                />
                                <button type="submit" className="absolute right-0 top-1.5 p-2 text-zinc-400 hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.3-4.3"></path>
                                    </svg>
                                </button>
                            </form>
                            <div className="mt-8 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Quick suggestions</p>
                                <div className="flex flex-wrap gap-2.5">
                                    {['New Arrivals', 'Trending', 'Best Sellers', 'Collections'].map((tag) => (
                                        <button 
                                            key={tag}
                                            onClick={() => {
                                                navigate(getLink(`/catalog?search=${encodeURIComponent(tag)}`));
                                                setShowSearchOverlay(false);
                                            }}
                                            className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-950 text-zinc-600 rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-200/50"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <main className="flex-grow animate-fade-in">
                    {children}
                </main>
                {/* Footer */}
                <footer 
                    className="mt-24 relative overflow-hidden border-t"
                    style={{
                        backgroundColor: footerBg,
                        color: footerText,
                        borderColor: footerBorder
                    }}
                >
                    {/* Background glows */}
                    <div className="absolute top-0 left-1/4 w-[350px] h-[350px] rounded-full bg-[var(--color-primary-semi)] blur-[100px] pointer-events-none opacity-20"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-10 relative z-10">
                        {storeInfo?.themeSettings?.footerConfig?.columns ? (
                            // Dynamic columns
                            storeInfo.themeSettings.footerConfig.columns.map((col, idx) => (
                                <div key={idx} className="md:col-span-4 space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest border-l border-[var(--color-primary)] pl-2" style={{ color: footerText }}>
                                        {col.title}
                                    </h3>
                                    {col.type === 'links' ? (
                                        <ul className="space-y-2.5 text-xs font-bold">
                                            {(col.links || []).map((link, lIdx) => (
                                                <li key={lIdx}>
                                                    <Link 
                                                        to={link.link.startsWith('/') ? getLink(link.link === '/' ? '' : link.link) : link.link} 
                                                        className="transition-colors relative py-1 hover:pl-1 transition-all hover:opacity-80"
                                                        style={{ color: footerTextMuted }}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-xs font-medium leading-relaxed max-w-sm" style={{ color: footerTextMuted }}>{col.text}</p>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="email" 
                                                    placeholder="Your email address" 
                                                    className="border text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] w-full" 
                                                    style={{
                                                        backgroundColor: footerCardBg,
                                                        borderColor: footerBorder,
                                                        color: footerText
                                                    }}
                                                />
                                                <button className="bg-[var(--color-primary)] text-white text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-widest">
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            // Fallback static columns
                            <>
                                {/* Store Info & Socials */}
                                <div className="md:col-span-5 space-y-6">
                                    <span className="font-extrabold text-xl tracking-tight uppercase" style={{ color: footerText }}>
                                        {storeInfo?.storeName || 'My Store'}
                                    </span>
                                    <p className="text-xs font-medium leading-relaxed max-w-sm" style={{ color: footerTextMuted }}>
                                        {storeInfo?.storeDescription || 'Welcome to our premium online shop. Explore our collection of premium quality products curated just for you.'}
                                    </p>
                                    {/* Social Links */}
                                    {storeInfo?.socialLinks && Object.values(storeInfo.socialLinks).some(Boolean) && (
                                        <div className="flex items-center gap-3 pt-2">
                                            {storeInfo.socialLinks.instagram && (
                                                <a 
                                                    href={storeInfo.socialLinks.instagram} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-premium shadow-sm border hover:opacity-80"
                                                    style={{
                                                        backgroundColor: footerCardBg,
                                                        borderColor: footerBorder,
                                                        color: footerTextMuted
                                                    }}
                                                    title="Instagram"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                                    </svg>
                                                </a>
                                            )}
                                            {storeInfo.socialLinks.facebook && (
                                                <a 
                                                    href={storeInfo.socialLinks.facebook} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-premium shadow-sm border hover:opacity-80"
                                                    style={{
                                                        backgroundColor: footerCardBg,
                                                        borderColor: footerBorder,
                                                        color: footerTextMuted
                                                    }}
                                                    title="Facebook"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                                    </svg>
                                                </a>
                                            )}
                                            {storeInfo.socialLinks.twitter && (
                                                <a 
                                                    href={storeInfo.socialLinks.twitter} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-premium shadow-sm border hover:opacity-80"
                                                    style={{
                                                        backgroundColor: footerCardBg,
                                                        borderColor: footerBorder,
                                                        color: footerTextMuted
                                                    }}
                                                    title="Twitter"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Quick Links */}
                                <div className="md:col-span-3 space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest border-l border-[var(--color-primary)] pl-2" style={{ color: footerText }}>Quick Links</h3>
                                    <ul className="space-y-2.5 text-xs font-bold">
                                        <li>
                                            <Link to={getLink('/catalog')} className="transition-colors relative py-1 hover:pl-1 transition-all hover:opacity-80" style={{ color: footerTextMuted }}>Catalog</Link>
                                        </li>
                                        {pages.map(page => (
                                            <li key={page.slug}>
                                                <Link to={getLink(`/pages/${page.slug}`)} className="transition-colors relative py-1 hover:pl-1 transition-all hover:opacity-80" style={{ color: footerTextMuted }}>{page.title}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Contact Details */}
                                <div className="md:col-span-4 space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest border-l border-[var(--color-primary)] pl-2" style={{ color: footerText }}>Contact Us</h3>
                                    <ul className="space-y-3 text-xs font-semibold">
                                        {storeInfo?.contactEmail && (
                                            <li className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0" style={{ backgroundColor: footerCardBg, borderColor: footerBorder, color: 'var(--color-primary)' }}>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                        <polyline points="22,6 12,13 2,6"></polyline>
                                                    </svg>
                                                </div>
                                                <span className="truncate hover:opacity-80 transition-colors" style={{ color: footerTextMuted }}>{storeInfo.contactEmail}</span>
                                            </li>
                                        )}
                                        {storeInfo?.contactPhone && (
                                            <li className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0" style={{ backgroundColor: footerCardBg, borderColor: footerBorder, color: 'var(--color-primary)' }}>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                                    </svg>
                                                </div>
                                                <span className="hover:opacity-80 transition-colors" style={{ color: footerTextMuted }}>{storeInfo.contactPhone}</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bottom copyright */}
                    <div className="border-t py-8 text-center text-[10px] font-bold tracking-widest relative z-10 uppercase" style={{ color: footerTextMuted, borderColor: footerBorder }}>
                        {storeInfo?.themeSettings?.footerConfig?.copyrightText || `© ${new Date().getFullYear()} ${storeInfo?.storeName || 'Storify'}. All rights reserved. Powered by Storify.`}
                    </div>
                </footer>
            </div>
        </ThemeRenderer>
    );
};

export default StorefrontLayout;
