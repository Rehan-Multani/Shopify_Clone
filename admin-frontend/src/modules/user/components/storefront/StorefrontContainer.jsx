import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route } from 'react-router-dom';
import StorefrontHome from '../../pages/storefront/StorefrontHome';
import StorefrontCatalog from '../../pages/storefront/StorefrontCatalog';
import StorefrontProductDetails from '../../pages/storefront/StorefrontProductDetails';
import StorefrontCart from '../../pages/storefront/StorefrontCart';
import StorefrontCheckout from '../../pages/storefront/StorefrontCheckout';
import StorefrontAuth from '../../pages/storefront/StorefrontAuth';
import StorefrontPage from '../../pages/storefront/StorefrontPage';

const GATEWAY_URL = 'http://localhost:5000/api';

const StorefrontContainer = () => {
    const { storeId } = useParams();
    const [storeInfo, setStoreInfo] = useState(null);
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load store settings, cart, and customer session
    useEffect(() => {
        if (!storeId) return;

        // Fetch store settings publicly
        const fetchStoreDetails = async () => {
            try {
                const res = await fetch(`${GATEWAY_URL}/stores/${storeId}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    // Fetch theme as well
                    const themeRes = await fetch(`${GATEWAY_URL}/themes`, {
                        headers: { 'x-store-id': storeId }
                    });
                    const themeData = await themeRes.json();
                    
                    setStoreInfo({
                        ...data,
                        themeSettings: themeRes.ok && themeData.success ? themeData.theme : {}
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
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
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
                <StorefrontCheckout 
                    cart={cart}
                    cartCount={cartCount} 
                    onClearCart={handleClearCart}
                    customer={customer}
                    onLogout={handleLogout}
                    storeInfo={storeInfo}
                />
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
            <Route path="/pages/:slug" element={
                <StorefrontPage 
                    cartCount={cartCount} 
                    customer={customer}
                    onLogout={handleLogout}
                    storeInfo={storeInfo}
                />
            } />
        </Routes>
    );
};

export default StorefrontContainer;
