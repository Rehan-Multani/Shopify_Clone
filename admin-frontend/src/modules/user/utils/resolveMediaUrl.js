/**
 * Resolve catalog/media paths for <img src>.
 * - Absolute http(s)/data/blob URLs are returned as-is
 * - Relative paths like /uploads/... get the API host prefix
 */
export const getAssetsBaseUrl = (apiUrl) => {
    const base = apiUrl || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_CATALOG_API_URL || '';
    return String(base).replace(/\/api\/?$/, '');
};

export const resolveMediaUrl = (path, apiUrl) => {
    if (!path) return '';
    const value = String(path).trim();
    if (!value) return '';
    if (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('data:') ||
        value.startsWith('blob:')
    ) {
        return value;
    }
    const assetsBase = getAssetsBaseUrl(apiUrl);
    const clean = value.startsWith('/') ? value : `/${value}`;
    return `${assetsBase}${clean}`;
};

export const stripMediaBaseUrl = (url, apiUrl) => {
    if (!url) return '';
    const value = String(url).trim();
    if (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('data:') ||
        value.startsWith('blob:')
    ) {
        // Keep absolute remote URLs as stored in DB
        const assetsBase = getAssetsBaseUrl(apiUrl);
        if (assetsBase && value.startsWith(assetsBase)) {
            return value.slice(assetsBase.length) || value;
        }
        return value;
    }
    return value;
};

export default resolveMediaUrl;
