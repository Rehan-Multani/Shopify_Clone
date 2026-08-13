/**
 * Shared product-source filtering for storefront product sections.
 * Themes reference query intent / IDs — never embed product payloads.
 */

export const normalizeProductList = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.products && Array.isArray(data.products)) return data.products;
    return [];
};

export const filterProductsBySource = (products = [], settings = {}) => {
    const source = settings.source || 'featured';
    const limit = Math.max(1, parseInt(settings.limit, 10) || 8);
    let list = [...products].filter((p) => p && (p.isActive !== false));

    switch (source) {
        case 'featured':
            list = list.filter((p) => p.isFeatured).length
                ? list.filter((p) => p.isFeatured)
                : list;
            break;
        case 'latest':
            list = list.sort((a, b) => {
                const da = new Date(a.createdAt || 0).getTime();
                const db = new Date(b.createdAt || 0).getTime();
                return db - da;
            });
            break;
        case 'best_sellers':
            list = list.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
            break;
        case 'on_sale':
            list = list.filter((p) => {
                const price = Number(p.price) || 0;
                const compare = Number(p.compareAtPrice || p.originalPrice || 0);
                return compare > price && price > 0;
            });
            if (list.length === 0) {
                list = [...products].filter((p) => p && p.isActive !== false);
            }
            break;
        case 'category': {
            const categoryId = settings.categoryId || settings.category || '';
            if (categoryId) {
                list = list.filter((p) => {
                    const cat = p.category;
                    if (!cat) return false;
                    if (typeof cat === 'string') return cat === categoryId || String(cat) === String(categoryId);
                    return String(cat._id || cat.id || '') === String(categoryId);
                });
            }
            break;
        }
        case 'manual': {
            const raw = settings.productIds || settings.products || '';
            const ids = Array.isArray(raw)
                ? raw.map(String)
                : String(raw).split(',').map((s) => s.trim()).filter(Boolean);
            if (ids.length) {
                const map = new Map(list.map((p) => [String(p._id || p.id), p]));
                list = ids.map((id) => map.get(String(id))).filter(Boolean);
            }
            break;
        }
        default:
            break;
    }

    return list.slice(0, limit);
};

export default filterProductsBySource;
