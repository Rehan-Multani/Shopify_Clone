/**
 * Builder / theme feature flags.
 * Autosave is OFF by default — enable via VITE_THEME_BUILDER_AUTOSAVE=true
 */
export const FEATURE_FLAGS = {
    THEME_BUILDER_AUTOSAVE:
        String(import.meta.env.VITE_THEME_BUILDER_AUTOSAVE || '').toLowerCase() === 'true'
        || String(import.meta.env.THEME_BUILDER_AUTOSAVE || '').toLowerCase() === 'true',
};

export const isFeatureEnabled = (key) => !!FEATURE_FLAGS[key];

export default FEATURE_FLAGS;
