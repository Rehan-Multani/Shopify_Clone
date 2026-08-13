import { useEffect, useRef } from 'react';
import { applyDesignTokensToElement } from './DesignTokens';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL || '';
const ASSETS_BASE = GATEWAY_URL.replace(/\/api\/?$/, '') || '';

/**
 * Applies design tokens to a root element and optionally loads theme pack CSS.
 */
const ThemeLoader = ({
    settings = {},
    targetRef,
    themeFolder = '',
    children,
}) => {
    const localRef = useRef(null);
    const rootRef = targetRef || localRef;
    const folder = themeFolder || settings.themeFolder || settings.themeId || '';

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        applyDesignTokensToElement(el, settings);
        el.setAttribute('data-theme', folder || settings.themeSlug || 'default');
        el.setAttribute('data-motion', settings.animationPreset || settings.motionPreset || 'smooth');
        el.setAttribute('data-header-style', settings.headerStyle || 'classic');
        el.setAttribute('data-footer-style', settings.footerStyle || 'columns');
        el.setAttribute('data-card-style', settings.productCardStyle || 'standard');
    }, [settings, folder, rootRef]);

    useEffect(() => {
        if (!folder || /^[a-f\d]{24}$/i.test(String(folder))) return undefined;

        const linkId = `theme-pack-css-${folder}`;
        let link = document.getElementById(linkId);
        const href = `${ASSETS_BASE}/themes/${folder}/assets/theme.css`;

        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = href;
            link.onerror = () => {
                link.remove();
            };
            document.head.appendChild(link);
        } else {
            link.href = href;
        }

        return undefined;
    }, [folder]);

    if (targetRef) {
        return children || null;
    }

    return (
        <div ref={localRef} className="theme-loader-root contents">
            {children}
        </div>
    );
};

export default ThemeLoader;
