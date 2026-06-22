import StorePage from '../models/StorePage.js';

const DEFAULT_PAGES = [
    { slug: 'privacy-policy', title: 'Privacy Policy', isDefault: true },
    { slug: 'terms-and-conditions', title: 'Terms and Conditions', isDefault: true },
    { slug: 'about-us', title: 'About Us', isDefault: true },
    { slug: 'contact-us', title: 'Contact Us', isDefault: true },
    { slug: 'refund-policy', title: 'Refund Policy', isDefault: true }
];

// @desc    Get all store pages for the logged-in merchant and active store
// @route   GET /api/store-pages
// @access  Private (Merchant)
export const getPages = async (req, res) => {
    try {
        const merchantId = req.merchant._id;
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        let pages = await StorePage.find({ merchantId, storeId });

        const formattedPages = pages.map(p => {
            const obj = p.toObject();
            const isDef = DEFAULT_PAGES.some(d => d.slug === obj.slug);
            return {
                ...obj,
                isDefault: isDef
            };
        });

        DEFAULT_PAGES.forEach(defaultPage => {
            const exists = formattedPages.some(p => p.slug === defaultPage.slug);
            if (!exists) {
                formattedPages.push({
                    ...defaultPage,
                    content: '',
                    isNew: true
                });
            }
        });

        res.status(200).json({
            success: true,
            pages: formattedPages
        });
    } catch (error) {
        console.error('Error fetching store pages:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single store page by slug and active store
// @route   GET /api/store-pages/:slug
// @access  Private (Merchant)
export const getPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const merchantId = req.merchant._id;
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        let page = await StorePage.findOne({ merchantId, storeId, slug });

        if (!page) {
            const defaultPage = DEFAULT_PAGES.find(p => p.slug === slug);
            if (!defaultPage) {
                return res.status(404).json({ success: false, message: 'Page not found' });
            }
            page = {
                ...defaultPage,
                content: '',
                isNew: true
            };
        } else {
            const obj = page.toObject();
            const isDef = DEFAULT_PAGES.some(d => d.slug === obj.slug);
            page = {
                ...obj,
                isDefault: isDef
            };
        }

        res.status(200).json({
            success: true,
            page
        });
    } catch (error) {
        console.error('Error fetching store page:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update or create a store page
// @route   PUT /api/store-pages/:slug
// @access  Private (Merchant)
export const updatePage = async (req, res) => {
    try {
        const { slug } = req.params;
        const { content, title } = req.body;
        const merchantId = req.merchant._id;
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        let page = await StorePage.findOne({ merchantId, storeId, slug });

        if (page) {
            page.content = content !== undefined ? content : page.content;
            page.title = title !== undefined ? title : page.title;
            await page.save();
        } else {
            const defaultPage = DEFAULT_PAGES.find(p => p.slug === slug);
            page = await StorePage.create({
                merchantId,
                storeId,
                slug,
                title: title || (defaultPage ? defaultPage.title : slug),
                content: content || ''
            });
        }

        res.status(200).json({
            success: true,
            message: 'Page saved successfully',
            page
        });
    } catch (error) {
        console.error('Error updating store page:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a store page
// @route   DELETE /api/store-pages/:slug
// @access  Private (Merchant)
export const deletePage = async (req, res) => {
    try {
        const { slug } = req.params;
        const merchantId = req.merchant._id;
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        await StorePage.deleteOne({ merchantId, storeId, slug });

        res.status(200).json({
            success: true,
            message: 'Page deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting store page:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
