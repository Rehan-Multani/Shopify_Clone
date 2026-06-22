import StorePage from '../models/StorePage.js';

const DEFAULT_PAGES = [
    { slug: 'privacy-policy', title: 'Privacy Policy' },
    { slug: 'terms-and-conditions', title: 'Terms and Conditions' },
    { slug: 'about-us', title: 'About Us' },
    { slug: 'contact-us', title: 'Contact Us' },
    { slug: 'refund-policy', title: 'Refund Policy' }
];

// @desc    Get all store pages for the logged-in merchant
// @route   GET /api/store-pages
// @access  Private (Merchant)
export const getPages = async (req, res) => {
    try {
        const merchantId = req.merchant._id;
        let pages = await StorePage.find({ merchantId });

        const formattedPages = DEFAULT_PAGES.map(defaultPage => {
            const existingPage = pages.find(p => p.slug === defaultPage.slug);
            return existingPage || {
                ...defaultPage,
                content: '',
                isNew: true
            };
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

// @desc    Get a single store page by slug
// @route   GET /api/store-pages/:slug
// @access  Private (Merchant)
export const getPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const merchantId = req.merchant._id;

        const defaultPage = DEFAULT_PAGES.find(p => p.slug === slug);
        if (!defaultPage) {
            return res.status(404).json({ success: false, message: 'Invalid page slug' });
        }

        let page = await StorePage.findOne({ merchantId, slug });

        if (!page) {
            page = {
                ...defaultPage,
                content: '',
                isNew: true
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
        const { content } = req.body;
        const merchantId = req.merchant._id;

        const defaultPage = DEFAULT_PAGES.find(p => p.slug === slug);
        if (!defaultPage) {
            return res.status(404).json({ success: false, message: 'Invalid page slug' });
        }

        let page = await StorePage.findOne({ merchantId, slug });

        if (page) {
            page.content = content || '';
            await page.save();
        } else {
            page = await StorePage.create({
                merchantId,
                slug,
                title: defaultPage.title,
                content: content || ''
            });
        }

        res.status(200).json({
            success: true,
            message: 'Page updated successfully',
            page
        });
    } catch (error) {
        console.error('Error updating store page:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
