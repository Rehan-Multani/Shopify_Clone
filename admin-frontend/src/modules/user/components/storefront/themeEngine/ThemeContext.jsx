import React, { createContext, useContext, useMemo } from 'react';
import { resolveDesignTokens } from './DesignTokens';

const ThemeContext = createContext(null);

export const THEME_DEFAULTS = {
    headerStyle: 'classic',
    productCardStyle: 'standard',
    productPageLayout: 'classic',
    collectionLayout: 'grid',
    cartStyle: 'page',
    footerStyle: 'columns',
    heroStyle: 'full',
    spacingScale: 'normal',
    buttonStyle: 'solid',
    themeId: 'default',
    themeFolder: '',
    themeVersion: '1.0.0',
    supportedSections: null,
    motionPreset: 'gentle',
    animationPreset: 'smooth',
    hoverPreset: 'lift-swap',
    carouselStyle: 'multi',
    imageTreatment: 'crisp',
    sectionStyle: 'cards',
    mobileNavStyle: 'drawer',
    contentDensity: 'balanced',
    containerWidth: '1280px',
    shadowPreset: 'soft',
};

const looksLikeObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ''));

export const resolveThemeConfig = (settings = {}) => {
    const folder = settings.themeFolder || (!looksLikeObjectId(settings.themeId) ? settings.themeId : '') || '';
    const themeSlug = folder || (!looksLikeObjectId(settings.themeId) ? settings.themeId : 'default');
    const animationPreset = settings.animationPreset || settings.motionPreset || THEME_DEFAULTS.animationPreset;
    const supportedSections = Array.isArray(settings.supportedSections) ? settings.supportedSections : null;

    return {
        ...THEME_DEFAULTS,
        headerStyle: settings.headerStyle || THEME_DEFAULTS.headerStyle,
        productCardStyle: settings.productCardStyle || THEME_DEFAULTS.productCardStyle,
        productPageLayout: settings.productPageLayout || THEME_DEFAULTS.productPageLayout,
        collectionLayout: settings.collectionLayout || THEME_DEFAULTS.collectionLayout,
        cartStyle: settings.cartStyle || THEME_DEFAULTS.cartStyle,
        footerStyle: settings.footerStyle || THEME_DEFAULTS.footerStyle,
        heroStyle: settings.heroStyle || THEME_DEFAULTS.heroStyle,
        spacingScale: settings.spacingScale || THEME_DEFAULTS.spacingScale,
        buttonStyle: settings.buttonStyle || THEME_DEFAULTS.buttonStyle,
        themeId: themeSlug,
        themeFolder: folder,
        themeVersion: settings.themeVersion || settings.version || THEME_DEFAULTS.themeVersion,
        themeSlug,
        supportedSections,
        designLanguage: settings.designLanguage || '',
        motionPreset: settings.motionPreset || animationPreset || THEME_DEFAULTS.motionPreset,
        animationPreset,
        hoverPreset: settings.hoverPreset || THEME_DEFAULTS.hoverPreset,
        carouselStyle: settings.carouselStyle || THEME_DEFAULTS.carouselStyle,
        imageTreatment: settings.imageTreatment || THEME_DEFAULTS.imageTreatment,
        sectionStyle: settings.sectionStyle || THEME_DEFAULTS.sectionStyle,
        mobileNavStyle: settings.mobileNavStyle || THEME_DEFAULTS.mobileNavStyle,
        contentDensity: settings.contentDensity || THEME_DEFAULTS.contentDensity,
        containerWidth: settings.containerWidth || THEME_DEFAULTS.containerWidth,
        shadowPreset: settings.shadowPreset || THEME_DEFAULTS.shadowPreset,
        primaryColor: settings.primaryColor || '#0f172a',
        secondaryColor: settings.secondaryColor || '#ffffff',
        accentColor: settings.accentColor || '#0ea5e9',
        borderRadius: settings.borderRadius || '8px',
        fontFamily: settings.fontFamily || 'Inter, sans-serif',
        headingFont: settings.headingFont || settings.fontFamily || 'Inter, sans-serif',
        bodyFont: settings.bodyFont || settings.fontFamily || 'Inter, sans-serif',
        buttonFont: settings.buttonFont || settings.navigationFont || settings.fontFamily || 'Inter, sans-serif',
        navigationFont: settings.navigationFont || settings.fontFamily || 'Inter, sans-serif',
        priceFont: settings.priceFont || settings.fontFamily || 'Inter, sans-serif',
        headingLetterSpacing: settings.headingLetterSpacing || '-0.025em',
        bodyLineHeight: settings.bodyLineHeight || 1.6,
        headerConfig: settings.headerConfig || {},
        footerConfig: settings.footerConfig || {},
        cssVars: resolveDesignTokens({
            ...settings,
            animationPreset,
            themeFolder: folder,
            themeId: themeSlug,
        }),
        raw: settings,
    };
};

export const ThemeProvider = ({ settings, children }) => {
    const value = useMemo(() => resolveThemeConfig(settings), [settings]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    return ctx || resolveThemeConfig({});
};

export default ThemeContext;
