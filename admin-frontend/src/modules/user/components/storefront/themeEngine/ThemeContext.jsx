import React, { createContext, useContext, useMemo } from 'react';

const ThemeContext = createContext(null);

export const THEME_DEFAULTS = {
    headerStyle: 'classic', // classic | centered | floating | transparent | minimal | mega | dark
    productCardStyle: 'standard', // standard | minimal | editorial | luxury | compact | hoverSwap | quickAdd | marketplace | sale | large
    productPageLayout: 'classic', // classic | sticky | editorial | split | tech | luxury
    collectionLayout: 'grid', // grid | dense | editorial | masonry | sidebar
    cartStyle: 'page', // page | drawer | sticky
    footerStyle: 'columns', // columns | minimal | centered | dark
    heroStyle: 'full', // full | split | cinematic | minimal | promo
    spacingScale: 'normal', // tight | normal | roomy
    buttonStyle: 'solid', // solid | outline | pill | square
    themeId: 'default',
    themeFolder: '',
    motionPreset: 'gentle',
    hoverPreset: 'lift-swap',
    carouselStyle: 'multi',
    imageTreatment: 'crisp',
    sectionStyle: 'cards',
    mobileNavStyle: 'drawer',
    contentDensity: 'balanced',
};

const looksLikeObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ''));

export const resolveThemeConfig = (settings = {}) => {
    const folder = settings.themeFolder || (!looksLikeObjectId(settings.themeId) ? settings.themeId : '') || '';
    const themeSlug = folder || (!looksLikeObjectId(settings.themeId) ? settings.themeId : 'default');
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
    themeSlug,
    designLanguage: settings.designLanguage || '',
    motionPreset: settings.motionPreset || THEME_DEFAULTS.motionPreset,
    hoverPreset: settings.hoverPreset || THEME_DEFAULTS.hoverPreset,
    carouselStyle: settings.carouselStyle || THEME_DEFAULTS.carouselStyle,
    imageTreatment: settings.imageTreatment || THEME_DEFAULTS.imageTreatment,
    sectionStyle: settings.sectionStyle || THEME_DEFAULTS.sectionStyle,
    mobileNavStyle: settings.mobileNavStyle || THEME_DEFAULTS.mobileNavStyle,
    contentDensity: settings.contentDensity || THEME_DEFAULTS.contentDensity,
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
