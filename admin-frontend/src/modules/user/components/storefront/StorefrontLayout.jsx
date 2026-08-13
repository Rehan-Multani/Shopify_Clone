import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { getStorePath } from './storeUrlHelper';
import ThemeHeader from './themeEngine/ThemeHeader';
import { useTheme } from './themeEngine/ThemeContext';
import { resolveDesignTokens, isDarkColor } from './themeEngine/DesignTokens';
import ThemeLoader from './themeEngine/ThemeLoader';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL.replace('/api', '');

const StorefrontLayout = ({ children, cartCount, customer, onLogout, storeInfo }) => {
    const { storeId: paramStoreId } = useParams();
    const storeId = storeInfo?._id || paramStoreId;
    const getLink = (subpath) => getStorePath(storeId, subpath);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const [pages, setPages] = useState([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSearchOverlay, setShowSearchOverlay] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchProducts, setSearchProducts] = useState([]);
    const [searchCategories, setSearchCategories] = useState([]);

    useEffect(() => {
        if (!storeId) return;
        Promise.all([
            fetch(`${GATEWAY_URL}/products?storeId=${storeId}`).then((res) => res.json()).catch(() => []),
            fetch(`${GATEWAY_URL}/categories?storeId=${storeId}`).then((res) => res.json()).catch(() => []),
        ]).then(([prodData, catData]) => {
            setSearchProducts(Array.isArray(prodData) ? prodData : (prodData.products || []));
            setSearchCategories(Array.isArray(catData) ? catData : (catData.categories || []));
        });
    }, [storeId]);

    useEffect(() => {
        if (!storeId) return;
        // Fetch pages to display in navigation and footer (passing previewThemeId/themeId if present in browser query string)
        const searchParams = new URLSearchParams(location.search);
        const previewThemeId = searchParams.get('previewThemeId') || searchParams.get('themeId') || '';
        const url = previewThemeId
            ? `${GATEWAY_URL}/store-pages?storeId=${storeId}&previewThemeId=${previewThemeId}`
            : `${GATEWAY_URL}/store-pages?storeId=${storeId}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.pages) {
                    setPages(data.pages.filter(p => p.slug !== 'home'));
                }
            })
            .catch(err => console.error('Error fetching pages for storefront layout:', err));
    }, [storeId, location.search]);

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

    const footerStyle = theme.footerStyle || storeInfo?.themeSettings?.footerStyle || 'columns';
    const configuredFooterBg = storeInfo?.themeSettings?.footerConfig?.backgroundColor || storeInfo?.themeSettings?.secondaryColor || '#ffffff';
    const footerBg = footerStyle === 'dark'
        ? (storeInfo?.themeSettings?.primaryColor || '#111827')
        : configuredFooterBg;
    const isFooterDark = footerStyle === 'dark' || isDarkColor(footerBg);
    const footerText = isFooterDark ? '#f4f4f5' : '#09090b';
    const footerTextMuted = isFooterDark ? '#a1a1aa' : '#52525b';
    const footerBorder = isFooterDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const footerCardBg = isFooterDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    const designTokenStyle = {
        ...resolveDesignTokens({
            ...(storeInfo?.themeSettings || {}),
            primaryColor: storeInfo?.themeSettings?.primaryColor || theme.primaryColor,
            secondaryColor: storeInfo?.themeSettings?.secondaryColor || theme.secondaryColor,
            accentColor: storeInfo?.themeSettings?.accentColor || theme.accentColor,
            borderRadius: storeInfo?.themeSettings?.borderRadius || theme.borderRadius,
            headingFont: storeInfo?.themeSettings?.headingFont || storeInfo?.themeSettings?.fontFamily || theme.headingFont,
            bodyFont: storeInfo?.themeSettings?.bodyFont || storeInfo?.themeSettings?.fontFamily || theme.bodyFont,
            fontFamily: storeInfo?.themeSettings?.fontFamily || theme.fontFamily,
            buttonFont: storeInfo?.themeSettings?.buttonFont || theme.buttonFont,
            navigationFont: storeInfo?.themeSettings?.navigationFont || theme.navigationFont,
            priceFont: storeInfo?.themeSettings?.priceFont || theme.priceFont,
            headingLetterSpacing: storeInfo?.themeSettings?.headingLetterSpacing || theme.headingLetterSpacing,
            bodyLineHeight: storeInfo?.themeSettings?.bodyLineHeight || theme.bodyLineHeight,
            spacingScale: storeInfo?.themeSettings?.spacingScale || theme.spacingScale,
            buttonStyle: storeInfo?.themeSettings?.buttonStyle || theme.buttonStyle,
            containerWidth: storeInfo?.themeSettings?.containerWidth || theme.containerWidth,
            animationPreset: storeInfo?.themeSettings?.animationPreset || storeInfo?.themeSettings?.motionPreset || theme.animationPreset,
            motionPreset: storeInfo?.themeSettings?.motionPreset || theme.motionPreset,
            shadowPreset: storeInfo?.themeSettings?.shadowPreset || theme.shadowPreset,
            headerStyle: storeInfo?.themeSettings?.headerStyle || theme.headerStyle,
            footerStyle: storeInfo?.themeSettings?.footerStyle || theme.footerStyle,
            productCardStyle: storeInfo?.themeSettings?.productCardStyle || theme.productCardStyle,
            themeFolder: storeInfo?.themeSettings?.themeFolder || theme.themeFolder,
            themeId: storeInfo?.themeSettings?.themeId || theme.themeId,
        }),
        ...(theme.cssVars || {}),
    };

    return (
        <>
            <ThemeLoader
                settings={storeInfo?.themeSettings || theme.raw || {}}
                themeFolder={storeInfo?.themeSettings?.themeFolder || theme.themeFolder}
            />
            <div 
                className="flex flex-col min-h-screen w-full overflow-x-hidden bg-[var(--color-secondary)] selection:bg-[var(--color-primary-semi)] selection:text-[var(--color-primary-dark)] text-[var(--color-text)]"
                style={designTokenStyle}
            >
                {/* Dynamic Announcement Bar & Header */}
                {storeInfo?.themeSettings?.headerConfig?.enabled !== false && (
                    <>
                        {storeInfo?.themeSettings?.headerConfig?.announcementBar?.enabled !== false && (
                            <div 
                                className="w-full text-center py-2.5 text-[10px] font-semibold tracking-[0.16em] uppercase text-white flex items-center justify-center gap-1.5 z-50 relative"
                                style={{ 
                                    backgroundColor: storeInfo?.themeSettings?.headerConfig?.announcementBar?.backgroundColor || 'var(--color-primary)',
                                    color: storeInfo?.themeSettings?.headerConfig?.announcementBar?.textColor || '#ffffff',
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                <span>
                                    {storeInfo?.themeSettings?.headerConfig?.announcementBar?.icon && (
                                        <span className="mr-1">{storeInfo.themeSettings.headerConfig.announcementBar.icon}</span>
                                    )}
                                    {storeInfo?.themeSettings?.headerConfig?.announcementBar?.text || '✨ Free Shipping on all orders above ₹499'}
                                </span>
                            </div>
                        )}

                        <ThemeHeader
                            storeInfo={storeInfo}
                            cartCount={cartCount}
                            customer={customer}
                            pages={pages}
                            isScrolled={isScrolled}
                            isMobileMenuOpen={isMobileMenuOpen}
                            setIsMobileMenuOpen={setIsMobileMenuOpen}
                            showSearchOverlay={showSearchOverlay}
                            setShowSearchOverlay={setShowSearchOverlay}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            handleSearchSubmit={handleSearchSubmit}
                            onLogout={onLogout}
                            getLink={getLink}
                        />
                    </>
                )}

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
                                    {storeInfo?.themeSettings?.headerConfig?.wishlistEnabled !== false && (
                                        <Link 
                                            to={customer ? getLink('/wishlist') : getLink('/login')}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`text-sm font-bold tracking-wide transition-colors ${
                                                location.pathname.includes('/wishlist') 
                                                    ? 'text-[var(--color-primary)]' 
                                                    : 'text-zinc-600 hover:text-zinc-950'
                                            }`}
                                        >
                                            Wishlist
                                        </Link>
                                    )}
                                    {storeInfo?.themeSettings?.headerConfig?.profileEnabled !== false && customer && (
                                        <Link 
                                            to={getLink('/account')}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`text-sm font-bold tracking-wide transition-colors ${
                                                location.pathname.includes('/account') 
                                                    ? 'text-[var(--color-primary)]' 
                                                    : 'text-zinc-600 hover:text-zinc-950'
                                            }`}
                                        >
                                            My Account
                                        </Link>
                                    )}
                                </nav>
                            </div>

                            {storeInfo?.themeSettings?.headerConfig?.profileEnabled !== false && (
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
                                            onClick={() => setIsMobileMenuOpen(false)}
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
                            )}
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
                            <div className="mt-8 space-y-6">
                                {searchQuery.trim() ? (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            {searchProducts.filter((p) => {
                                                const q = searchQuery.toLowerCase();
                                                return p.name?.toLowerCase().includes(q)
                                                    || p.brandName?.toLowerCase().includes(q)
                                                    || p.sku?.toLowerCase().includes(q)
                                                    || (p.tags || []).some((tag) => String(tag).toLowerCase().includes(q))
                                                    || p.category?.name?.toLowerCase().includes(q);
                                            }).length} product matches
                                        </p>
                                        <div className="space-y-2 max-h-[45vh] overflow-y-auto">
                                            {searchProducts.filter((p) => {
                                                const q = searchQuery.toLowerCase();
                                                return p.name?.toLowerCase().includes(q)
                                                    || p.brandName?.toLowerCase().includes(q)
                                                    || p.sku?.toLowerCase().includes(q)
                                                    || (p.tags || []).some((tag) => String(tag).toLowerCase().includes(q))
                                                    || p.category?.name?.toLowerCase().includes(q);
                                            }).slice(0, 6).map((product) => (
                                                <button
                                                    key={product._id}
                                                    type="button"
                                                    onClick={() => {
                                                        navigate(getLink(`/product/${product._id}`));
                                                        setShowSearchOverlay(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 text-left"
                                                >
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                                                        {product.images?.[0] && (
                                                            <img
                                                                src={product.images[0].startsWith('http') ? product.images[0] : `${ASSETS_BASE_URL}${product.images[0]}`}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold truncate">{product.name}</p>
                                                        <p className="text-xs text-zinc-500">₹{product.sellingPrice}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Popular categories</p>
                                            <div className="flex flex-wrap gap-2.5">
                                                {searchCategories.slice(0, 6).map((cat) => (
                                                    <button
                                                        key={cat._id}
                                                        type="button"
                                                        onClick={() => {
                                                            navigate(getLink(`/catalog?category=${cat._id}`));
                                                            setShowSearchOverlay(false);
                                                        }}
                                                        className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold border border-zinc-200/50"
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Featured products</p>
                                            <div className="flex flex-wrap gap-2.5">
                                                {searchProducts.filter((p) => p.isFeatured).slice(0, 4).map((product) => (
                                                    <button
                                                        key={product._id}
                                                        type="button"
                                                        onClick={() => {
                                                            navigate(getLink(`/product/${product._id}`));
                                                            setShowSearchOverlay(false);
                                                        }}
                                                        className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold border border-zinc-200/50"
                                                    >
                                                        {product.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <main className="flex-grow animate-fade-in">
                    {children}
                </main>
                {/* Footer */}
                {storeInfo?.themeSettings?.footerConfig?.enabled !== false && (
                    <footer 
                        className="mt-28 relative overflow-hidden border-t"
                        style={{
                            backgroundColor: footerBg,
                            color: footerText,
                            borderColor: footerBorder
                        }}
                    >
                    <div className="absolute top-0 left-1/4 w-[280px] h-[280px] rounded-full bg-[var(--color-primary-semi)] blur-[120px] pointer-events-none opacity-15"></div>

                    <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-20 relative z-10 ${
                        footerStyle === 'minimal' || footerStyle === 'centered'
                            ? 'flex flex-col items-center text-center gap-8'
                            : 'grid grid-cols-1 md:grid-cols-12 gap-12'
                    }`}>
                        {footerStyle === 'minimal' ? (
                            <>
                                <span className="text-2xl tracking-tight font-medium" style={{ color: footerText, fontFamily: 'var(--heading-font)' }}>
                                    {storeInfo?.storeName || 'My Store'}
                                </span>
                                <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] font-medium tracking-wide">
                                    <Link to={getLink('/catalog')} className="hover:opacity-80 transition-opacity" style={{ color: footerTextMuted }}>Catalog</Link>
                                    {pages.slice(0, 4).map((page) => (
                                        <Link key={page.slug} to={getLink(`/pages/${page.slug}`)} className="hover:opacity-80 transition-opacity" style={{ color: footerTextMuted }}>{page.title}</Link>
                                    ))}
                                </div>
                            </>
                        ) : footerStyle === 'centered' ? (
                            <>
                                <span className="text-3xl tracking-tight font-medium" style={{ color: footerText, fontFamily: 'var(--heading-font)' }}>
                                    {storeInfo?.storeName || 'My Store'}
                                </span>
                                <p className="text-sm font-medium leading-relaxed max-w-md" style={{ color: footerTextMuted }}>
                                    {storeInfo?.storeDescription || 'Welcome to our premium online shop.'}
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] font-medium">
                                    <Link to={getLink('/catalog')} className="hover:opacity-80 transition-opacity" style={{ color: footerTextMuted }}>Catalog</Link>
                                    {pages.map((page) => (
                                        <Link key={page.slug} to={getLink(`/pages/${page.slug}`)} className="hover:opacity-80 transition-opacity" style={{ color: footerTextMuted }}>{page.title}</Link>
                                    ))}
                                </div>
                            </>
                        ) : storeInfo?.themeSettings?.footerConfig?.columns ? (
                            storeInfo.themeSettings.footerConfig.columns.map((col, idx) => (
                                <div key={idx} className="md:col-span-4 space-y-5">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: footerText }}>
                                        {col.title}
                                        <span className="mt-2.5 block h-[2px] w-8" style={{ background: 'var(--color-accent, var(--color-primary))' }} />
                                    </h3>
                                    {col.type === 'links' ? (
                                        <ul className="space-y-3 text-[13px] font-medium">
                                            {(col.links || []).map((link, lIdx) => (
                                                <li key={lIdx}>
                                                    <Link 
                                                        to={link.link.startsWith('/') ? getLink(link.link === '/' ? '' : link.link) : link.link} 
                                                        className="transition-opacity hover:opacity-80"
                                                        style={{ color: footerTextMuted }}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-[13px] font-medium leading-relaxed max-w-sm" style={{ color: footerTextMuted }}>{col.text}</p>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="email" 
                                                    placeholder="Your email address" 
                                                    className="border text-xs px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] w-full" 
                                                    style={{
                                                        backgroundColor: footerCardBg,
                                                        borderColor: footerBorder,
                                                        color: footerText,
                                                        borderRadius: 'var(--border-radius, 10px)',
                                                    }}
                                                />
                                                <button className="bg-[var(--color-accent,var(--color-primary))] text-white text-[10px] px-4 py-2.5 font-bold uppercase tracking-widest btn-premium" style={{ borderRadius: 'var(--border-radius, 10px)' }}>
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="md:col-span-5 space-y-6">
                                    <span className="text-2xl tracking-tight font-medium block" style={{ color: footerText, fontFamily: 'var(--heading-font)' }}>
                                        {storeInfo?.storeName || 'My Store'}
                                    </span>
                                    <p className="text-[13px] font-medium leading-relaxed max-w-sm" style={{ color: footerTextMuted }}>
                                        {storeInfo?.storeDescription || 'Welcome to our premium online shop. Explore our collection of premium quality products curated just for you.'}
                                    </p>
                                    {storeInfo?.socialLinks && Object.values(storeInfo.socialLinks).some(Boolean) && (
                                        <div className="flex items-center gap-3 pt-1">
                                            {storeInfo.socialLinks.instagram && (
                                                <a 
                                                    href={storeInfo.socialLinks.instagram} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-premium border"
                                                    style={{
                                                        backgroundColor: footerCardBg,
                                                        borderColor: footerBorder,
                                                        color: footerTextMuted
                                                    }}
                                                    title="Instagram"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
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
                                                    className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-premium border"
                                                    style={{
                                                        backgroundColor: footerCardBg,
                                                        borderColor: footerBorder,
                                                        color: footerTextMuted
                                                    }}
                                                    title="Facebook"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                                    </svg>
                                                </a>
                                            )}
                                            {storeInfo.socialLinks.twitter && (
                                                <a 
                                                    href={storeInfo.socialLinks.twitter} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-premium border"
                                                    style={{
                                                        backgroundColor: footerCardBg,
                                                        borderColor: footerBorder,
                                                        color: footerTextMuted
                                                    }}
                                                    title="Twitter"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-3 space-y-5">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: footerText }}>
                                        Quick Links
                                        <span className="mt-2.5 block h-[2px] w-8" style={{ background: 'var(--color-accent, var(--color-primary))' }} />
                                    </h3>
                                    <ul className="space-y-3 text-[13px] font-medium">
                                        <li>
                                            <Link to={getLink('/catalog')} className="transition-opacity hover:opacity-80" style={{ color: footerTextMuted }}>Catalog</Link>
                                        </li>
                                        {pages.map(page => (
                                            <li key={page.slug}>
                                                <Link to={getLink(`/pages/${page.slug}`)} className="transition-opacity hover:opacity-80" style={{ color: footerTextMuted }}>{page.title}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="md:col-span-4 space-y-5">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: footerText }}>
                                        Contact Us
                                        <span className="mt-2.5 block h-[2px] w-8" style={{ background: 'var(--color-accent, var(--color-primary))' }} />
                                    </h3>
                                    <ul className="space-y-3.5 text-[13px] font-medium">
                                        {storeInfo?.contactEmail && (
                                            <li className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center border flex-shrink-0" style={{ backgroundColor: footerCardBg, borderColor: footerBorder, color: 'var(--color-accent, var(--color-primary))' }}>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                        <polyline points="22,6 12,13 2,6"></polyline>
                                                    </svg>
                                                </div>
                                                <span className="truncate hover:opacity-80 transition-opacity" style={{ color: footerTextMuted }}>{storeInfo.contactEmail}</span>
                                            </li>
                                        )}
                                        {storeInfo?.contactPhone && (
                                            <li className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center border flex-shrink-0" style={{ backgroundColor: footerCardBg, borderColor: footerBorder, color: 'var(--color-accent, var(--color-primary))' }}>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                                    </svg>
                                                </div>
                                                <span className="hover:opacity-80 transition-opacity" style={{ color: footerTextMuted }}>{storeInfo.contactPhone}</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="border-t py-7 text-center text-[10px] font-semibold tracking-[0.16em] relative z-10 uppercase" style={{ color: footerTextMuted, borderColor: footerBorder }}>
                        {storeInfo?.themeSettings?.footerConfig?.copyrightText || `© ${new Date().getFullYear()} ${storeInfo?.storeName || 'Storify'}. All rights reserved.`}
                    </div>
                    </footer>
                )}
            </div>
        </>
    );
};

export default StorefrontLayout;
