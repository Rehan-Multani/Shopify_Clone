const keyFor = (storeId) => `recently_viewed_${storeId}`;

export const getRecentlyViewed = (storeId) => {
    try {
        const raw = localStorage.getItem(keyFor(storeId));
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const pushRecentlyViewed = (storeId, product, limit = 8) => {
    if (!storeId || !product?._id) return [];
    const next = [
        {
            _id: product._id,
            name: product.name,
            sellingPrice: product.sellingPrice,
            actualPrice: product.actualPrice,
            images: product.images || [],
            category: product.category?._id || product.category || null,
        },
        ...getRecentlyViewed(storeId).filter((item) => item._id !== product._id),
    ].slice(0, limit);
    localStorage.setItem(keyFor(storeId), JSON.stringify(next));
    return next;
};
