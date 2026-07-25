import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import StorefrontHome from '../../pages/storefront/StorefrontHome';
import StorefrontCatalog from '../../pages/storefront/StorefrontCatalog';
import StorefrontProductDetails from '../../pages/storefront/StorefrontProductDetails';
import StorefrontCart from '../../pages/storefront/StorefrontCart';
import StorefrontCheckout from '../../pages/storefront/StorefrontCheckout';
import StorefrontAuth from '../../pages/storefront/StorefrontAuth';
import StorefrontPage from '../../pages/storefront/StorefrontPage';
import StorefrontWishlist from '../../pages/storefront/StorefrontWishlist';
import StorefrontAccount from '../../pages/storefront/StorefrontAccount';
import StorefrontOrderTrack from '../../pages/storefront/StorefrontOrderTrack';
import { getStorePath } from './storeUrlHelper';
import { ThemeProvider } from './themeEngine/ThemeContext';
import ThemeExperience from './themeEngine/ThemeExperience';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

const PageSlugRedirect = () => {
    const { storeId, slug } = useParams();
    return <Navigate to={getStorePath(storeId, `/pages/${slug}`)} replace />;
};

const ProtectedRoute = ({ customer, storeId, redirect, children }) => {
    if (!customer) {
        return <Navigate to={getStorePath(storeId, `/login?redirect=${redirect}`)} replace />;
    }
    return children;
};

const StorefrontContainer = ({ resolvedStoreId }) => {
    const { storeId: paramStoreId } = useParams();
    const storeId = resolvedStoreId || paramStoreId;
    const location = useLocation();
    const [storeInfo, setStoreInfo] = useState(null);
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    // Scroll to top automatically on route change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

    // Load store settings, cart, and customer session
    useEffect(() => {
        if (!storeId) return;

        // Fetch store settings publicly
        const fetchStoreDetails = async () => {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const cleanPreview = searchParams.get('cleanPreview') || '';
                const folder = searchParams.get('folder') || '';
                const previewThemeId = searchParams.get('previewThemeId') || searchParams.get('themeId') || '';

                let storeUrl = `${GATEWAY_URL}/stores/${storeId}`;
                const queryParts = [];
                if (cleanPreview) queryParts.push(`cleanPreview=${cleanPreview}`);
                if (folder) queryParts.push(`folder=${folder}`);
                if (previewThemeId) queryParts.push(`themeId=${previewThemeId}`);
                if (queryParts.length > 0) {
                    storeUrl += `?${queryParts.join('&')}`;
                }

                const res = await fetch(storeUrl);
                if (res.ok) {
                    const data = await res.json();
                    
                    let activeSettings = {};
                    if (data.activeTheme && data.installedThemes) {
                        const activeInstall = data.installedThemes.find(t => t.themeId === data.activeTheme.themeId);
                        if (activeInstall) {
                            activeSettings = activeInstall.publishedThemeSettings || {};
                        }
                    }

                    // If previewing, load draftThemeSettings
                    if (previewThemeId && data.installedThemes) {
                        const previewInstall = data.installedThemes.find(t => t.themeId === previewThemeId);
                        if (previewInstall) {
                            activeSettings = previewInstall.draftThemeSettings || previewInstall.publishedThemeSettings || {};
                        }
                    }

                    const activeInstall = data.installedThemes?.find((t) =>
                        t.themeId === (previewThemeId || data.activeTheme?.themeId)
                    ) || data.installedThemes?.find((t) => t.themeId === data.activeTheme?.themeId);
                    const themeFolder = activeInstall?.folder || data.activeTheme?.folder || activeSettings.themeFolder || '';
                    const themeSlug = themeFolder || activeSettings.themeId || 'default';
                    const catalogThemeId = previewThemeId || data.activeTheme?.themeId || activeSettings.themeId || 'default';
                    setStoreInfo({
                        ...data,
                        themeSettings: {
                            ...activeSettings,
                            themeId: themeSlug,
                            themeFolder,
                            themeCatalogId: catalogThemeId,
                            designLanguage: activeSettings.designLanguage || themeSlug,
                        }
                    });
                }
            } catch (err) {
                console.error('Error fetching storefront store details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreDetails();

        // Load cart
        const savedCart = localStorage.getItem(`cart_${storeId}`);
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        } else {
            setCart([]);
        }

        // Load customer session
        const savedCustomer = localStorage.getItem(`customer_${storeId}`);
        if (savedCustomer) {
            setCustomer(JSON.parse(savedCustomer));
        } else {
            setCustomer(null);
        }
    }, [storeId]);

    // Save cart helper
    const saveCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem(`cart_${storeId}`, JSON.stringify(newCart));
    };

    const handleAddToCart = (product, qty = 1) => {
        const index = cart.findIndex(item => item._id === product._id);
        const newCart = [...cart];
        if (index > -1) {
            newCart[index].qty += qty;
        } else {
            newCart.push({ ...product, qty });
        }
        saveCart(newCart);
    };

    const handleUpdateCartQty = (productId, qty) => {
        if (qty < 1) return;
        const newCart = cart.map(item => item._id === productId ? { ...item, qty } : item);
        saveCart(newCart);
    };

    const handleRemoveFromCart = (productId) => {
        const newCart = cart.filter(item => item._id !== productId);
        saveCart(newCart);
    };

    const handleClearCart = () => {
        saveCart([]);
    };

    // Customer Authentication helpers
    const handleLoginSuccess = (customerData) => {
        setCustomer(customerData);
        localStorage.setItem(`customer_${storeId}`, JSON.stringify(customerData));
    };

    const handleLogout = () => {
        setCustomer(null);
        localStorage.removeItem(`customer_${storeId}`);
    };

    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
                {/* Header Skeleton */}
                <header className="bg-white border-b border-zinc-200/60 py-4.5 px-6 md:px-12 flex items-center justify-between">
                    <div className="w-24 h-6 animate-pulse bg-zinc-200/80 rounded-xl"></div>
                    <div className="hidden md:flex gap-8">
                        <div className="w-12 h-3 animate-pulse bg-zinc-200/80 rounded"></div>
                        <div className="w-14 h-3 animate-pulse bg-zinc-200/80 rounded"></div>
                        <div className="w-14 h-3 animate-pulse bg-zinc-200/80 rounded"></div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 animate-pulse bg-zinc-200/80 rounded-full"></div>
                        <div className="w-8 h-8 animate-pulse bg-zinc-200/80 rounded-full"></div>
                    </div>
                </header>
 
                {/* Main Content Skeleton */}
                <main className="flex-grow max-w-7xl w-full mx-auto p-6 md:p-12 space-y-12">
                    {/* Hero Banner */}
                    <div className="w-full aspect-[21/9] animate-pulse bg-zinc-200/70 rounded-3xl"></div>
 
                    {/* Collections Title */}
                    <div className="space-y-2 flex flex-col items-center">
                        <div className="w-36 h-6 animate-pulse bg-zinc-200/80 rounded-xl"></div>
                        <div className="w-10 h-0.5 animate-pulse bg-zinc-200/80 rounded-full"></div>
                    </div>
 
                    {/* Collections Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[4/3] animate-pulse bg-zinc-200/70 rounded-2xl"></div>
                        ))}
                    </div>
 
                    {/* Products Title */}
                    <div className="space-y-2 flex flex-col items-center pt-4">
                        <div className="w-36 h-6 animate-pulse bg-zinc-200/80 rounded-xl"></div>
                        <div className="w-10 h-0.5 animate-pulse bg-zinc-200/80 rounded-full"></div>
                    </div>
 
                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="w-full aspect-square animate-pulse bg-zinc-200/70 rounded-2xl"></div>
                                <div className="w-3/4 h-4 animate-pulse bg-zinc-200/80 rounded-lg"></div>
                                <div className="w-1/2 h-4 animate-pulse bg-zinc-200/80 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <ThemeProvider settings={storeInfo?.themeSettings || {}}>
        <ThemeExperience
            storeId={storeId}
            cart={cart}
            cartCount={cartCount}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveFromCart={handleRemoveFromCart}
        >
        <Routes>
            <Route path="/" element={
                <StorefrontHome 
                    cartCount={cartCount} 
                    onAddToCart={handleAddToCart}
                    customer={customer}
                    onLogout={handleLogout}
                    storeInfo={storeInfo}
                />
            } />
            <Route path="/catalog" element={
                <StorefrontCatalog 
                    cartCount={cartCount} 
                    onAddToCart={handleAddToCart}
                    customer={customer}
                    onLogout={handleLogout}
                    storeInfo={storeInfo}
                />
            } />
            <Route path="/product/:productId" element={
                <StorefrontProductDetails 
                    cartCount={cartCount} 
                    onAddToCart={handleAddToCart}
                    customer={customer}
                    onLogout={handleLogout}
                    storeInfo={storeInfo}
                />
            } />
            <Route path="/cart" element={
                    <StorefrontCart 
                        cart={cart}
                        cartCount={cartCount} 
                        onUpdateCartQty={handleUpdateCartQty}
                        onRemoveFromCart={handleRemoveFromCart}
                        customer={customer}
                        onLogout={handleLogout}
                        storeInfo={storeInfo}
                    />
            } />
            <Route path="/checkout" element={
                <ProtectedRoute customer={customer} storeId={storeId} redirect="checkout">
                    <StorefrontCheckout 
                        cart={cart}
                        cartCount={cartCount} 
                        onClearCart={handleClearCart}
                        customer={customer}
                        onLogout={handleLogout}
                        storeInfo={storeInfo}
                    />
                </ProtectedRoute>
            } />
            <Route path="/login" element={
                <StorefrontAuth 
                    cartCount={cartCount} 
                    onLoginSuccess={handleLoginSuccess}
                    customer={customer}
                    onLogout={handleLogout}
                    storeInfo={storeInfo}
                />
            } />
            <Route path="/page/:slug" element={<PageSlugRedirect />} />
            <Route path="/pages/:slug" element={
                <StorefrontPage 
                    cartCount={cartCount} 
                    customer={customer}
                    onLogout={handleLogout}
                    storeInfo={storeInfo}
                />
            } />
            <Route path="/wishlist" element={
                <StorefrontWishlist 
                    cartCount={cartCount}
                    onAddToCart={handleAddToCart}
                    customer={customer}
                    onLogout={handleLogout}
                    storeInfo={storeInfo}
                />
            } />
            <Route path="/account" element={
                <ProtectedRoute customer={customer} storeId={storeId} redirect="account">
                    <StorefrontAccount 
                        cartCount={cartCount}
                        customer={customer}
                        onLogout={handleLogout}
                        storeInfo={storeInfo}
                    />
                </ProtectedRoute>
            } />
            <Route path="/orders/:orderId/track" element={
                <ProtectedRoute customer={customer} storeId={storeId} redirect="account">
                    <StorefrontOrderTrack 
                        cartCount={cartCount}
                        customer={customer}
                        onLogout={handleLogout}
                        storeInfo={storeInfo}
                    />
                </ProtectedRoute>
            } />
        </Routes>
        </ThemeExperience>
        </ThemeProvider>
    );
};

export default StorefrontContainer;
