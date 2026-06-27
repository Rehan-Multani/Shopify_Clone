export const getStorePath = (storeId, subpath = '') => {
    const hostname = window.location.hostname;
    // We check if the current page is running on custom domain vs admin control domain
    const isSystemDomain = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'admin.cloudedata.in' || hostname === 'storify.cloudedata.in';
    
    const cleanSubpath = subpath.startsWith('/') ? subpath.substring(1) : subpath;
    
    if (!isSystemDomain) {
        return `/${cleanSubpath}`;
    } else {
        return `/store/${storeId}/${cleanSubpath}`;
    }
};
