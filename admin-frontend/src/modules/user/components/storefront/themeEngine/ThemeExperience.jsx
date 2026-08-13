import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { getStorePath } from '../storeUrlHelper';
import ThemeCartDrawer from './ThemeCartDrawer';
import './themeExperience.css';

const CartUIContext = createContext({
    openCart: () => {},
    closeCart: () => {},
    cartStyle: 'page',
});

export const useCartUI = () => useContext(CartUIContext);

const ThemeExperience = ({
    storeId,
    cart = [],
    cartCount = 0,
    onUpdateCartQty,
    onRemoveFromCart,
    children,
}) => {
    const theme = useTheme();
    const location = useLocation();
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        const families = [...new Set([
            theme.headingFont,
            theme.bodyFont,
            theme.navigationFont,
            theme.priceFont,
        ].filter(Boolean).map((font) => String(font).split(',')[0].trim()))];
        const id = 'storefront-theme-fonts';
        let link = document.getElementById(id);
        if (!link) {
            link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        const query = families.map((family) => `family=${encodeURIComponent(family).replace(/%20/g, '+')}`).join('&');
        link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
    }, [theme.headingFont, theme.bodyFont, theme.navigationFont, theme.priceFont]);

    useEffect(() => {
        const root = document.querySelector('.theme-experience');
        if (!root) return undefined;

        const targets = root.querySelectorAll('section, main > div, [data-theme-reveal]');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion || !('IntersectionObserver' in window)) {
            targets.forEach((node) => node.classList.add('theme-reveal', 'is-visible'));
            return undefined;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

        targets.forEach((node, index) => {
            node.classList.add('theme-reveal');
            node.style.setProperty('--reveal-index', index % 6);
            observer.observe(node);
        });

        return () => observer.disconnect();
    }, [location.pathname, theme.themeId]);

    useEffect(() => {
        setCartOpen(false);
    }, [location.pathname]);

    const cartUi = useMemo(() => ({
        cartStyle: theme.cartStyle || 'page',
        openCart: () => {
            if ((theme.cartStyle || 'page') === 'page') {
                window.location.assign(getStorePath(storeId, '/cart'));
                return;
            }
            setCartOpen(true);
        },
        closeCart: () => setCartOpen(false),
    }), [theme.cartStyle, storeId]);

    const showBottomNav = ['bottom-bar', 'adaptive'].includes(theme.mobileNavStyle);

    return (
        <CartUIContext.Provider value={cartUi}>
            <div
                className="theme-experience"
                data-theme={theme.themeSlug || theme.themeFolder || theme.themeId}
                data-motion={theme.animationPreset || theme.motionPreset}
                data-hover={theme.hoverPreset}
                data-image={theme.imageTreatment}
                data-sections={theme.sectionStyle}
                data-density={theme.contentDensity}
                data-button={theme.buttonStyle}
                data-footer={theme.footerStyle}
                data-hero={theme.heroStyle}
                data-cards={theme.productCardStyle}
                style={{
                    '--theme-body-font': theme.bodyFont,
                    '--theme-nav-font': theme.navigationFont,
                    '--theme-button-font': theme.buttonFont,
                    '--theme-price-font': theme.priceFont,
                    '--theme-heading-tracking': theme.headingLetterSpacing,
                    '--theme-body-leading': theme.bodyLineHeight,
                    ...(theme.cssVars || {}),
                }}
            >
                {children}

                <ThemeCartDrawer
                    open={cartOpen}
                    onClose={() => setCartOpen(false)}
                    cart={cart}
                    storeId={storeId}
                    onUpdateCartQty={onUpdateCartQty}
                    onRemoveFromCart={onRemoveFromCart}
                />

                {showBottomNav && (
                    <nav className="theme-mobile-nav" aria-label="Mobile store navigation">
                        <Link to={getStorePath(storeId, '/')} aria-label="Home">
                            <span aria-hidden="true">⌂</span><small>Home</small>
                        </Link>
                        <Link to={getStorePath(storeId, '/catalog')} aria-label="Shop">
                            <span aria-hidden="true">▦</span><small>Shop</small>
                        </Link>
                        <Link to={getStorePath(storeId, '/wishlist')} aria-label="Wishlist">
                            <span aria-hidden="true">♡</span><small>Saved</small>
                        </Link>
                        {(theme.cartStyle === 'drawer' || theme.cartStyle === 'sticky') ? (
                            <button type="button" onClick={cartUi.openCart} aria-label={`Cart with ${cartCount} items`} className="relative">
                                <span aria-hidden="true">◫</span><small>Cart</small>
                                {cartCount > 0 && <b>{cartCount}</b>}
                            </button>
                        ) : (
                            <Link to={getStorePath(storeId, '/cart')} aria-label={`Cart with ${cartCount} items`} className="relative">
                                <span aria-hidden="true">◫</span><small>Cart</small>
                                {cartCount > 0 && <b>{cartCount}</b>}
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </CartUIContext.Provider>
    );
};

export default ThemeExperience;
