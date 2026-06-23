import StorePage from '../models/StorePage.js';
import { DEFAULT_HOME_SECTIONS } from '../data/defaultSections.js';

const DEFAULT_PAGES = [
    { slug: 'home', title: 'Home Page', isDefault: true, isHomePage: true },
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
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID is required' });
        }

        const filter = req.merchant ? { merchantId: req.merchant._id, storeId } : { storeId };
        let pages = await StorePage.find(filter);

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
                    sections: defaultPage.slug === 'home' ? DEFAULT_HOME_SECTIONS : [],
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
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID is required' });
        }

        const filter = req.merchant ? { merchantId: req.merchant._id, storeId, slug } : { storeId, slug };
        let page = await StorePage.findOne(filter);

        if (!page) {
            const defaultPage = DEFAULT_PAGES.find(p => p.slug === slug);
            if (!defaultPage) {
                return res.status(404).json({ success: false, message: 'Page not found' });
            }
            page = {
                ...defaultPage,
                content: '',
                sections: slug === 'home' ? DEFAULT_HOME_SECTIONS : [],
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
        const { content, title, sections, isHomePage } = req.body;
        const merchantId = req.merchant._id;
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        let page = await StorePage.findOne({ merchantId, storeId, slug });

        if (page) {
            page.content = content !== undefined ? content : page.content;
            page.title = title !== undefined ? title : page.title;
            if (sections !== undefined) page.sections = sections;
            if (isHomePage !== undefined) page.isHomePage = isHomePage;
            await page.save();
        } else {
            const defaultPage = DEFAULT_PAGES.find(p => p.slug === slug);
            page = await StorePage.create({
                merchantId,
                storeId,
                slug,
                title: title || (defaultPage ? defaultPage.title : slug),
                content: content || '',
                isHomePage: isHomePage !== undefined ? isHomePage : (defaultPage ? !!defaultPage.isHomePage : false),
                sections: sections !== undefined ? sections : (slug === 'home' ? DEFAULT_HOME_SECTIONS : [])
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

// @desc    Update sections for a specific page
// @route   PUT /api/store-pages/:slug/sections
// @access  Private (Merchant)
export const updatePageSections = async (req, res) => {
    try {
        const { slug } = req.params;
        const { sections } = req.body;
        const merchantId = req.merchant._id;
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        if (!Array.isArray(sections)) {
            return res.status(400).json({ success: false, message: 'Sections must be an array' });
        }

        let page = await StorePage.findOne({ merchantId, storeId, slug });

        if (!page) {
            const defaultPage = DEFAULT_PAGES.find(p => p.slug === slug);
            page = await StorePage.create({
                merchantId,
                storeId,
                slug,
                title: defaultPage ? defaultPage.title : slug,
                isHomePage: defaultPage ? !!defaultPage.isHomePage : slug === 'home',
                sections: sections
            });
        } else {
            page.sections = sections;
            await page.save();
        }

        res.status(200).json({
            success: true,
            message: 'Sections updated successfully',
            page
        });
    } catch (error) {
        console.error('Error updating page sections:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update settings for a specific section in a page
// @route   PUT /api/store-pages/:slug/sections/:sectionId
// @access  Private (Merchant)
export const updateSectionSettings = async (req, res) => {
    try {
        const { slug, sectionId } = req.params;
        const { settings, enabled } = req.body;
        const merchantId = req.merchant._id;
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        let page = await StorePage.findOne({ merchantId, storeId, slug });

        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }

        const section = page.sections.find(sec => sec.sectionId.toString() === sectionId || sec._id.toString() === sectionId);
        if (!section) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        if (settings !== undefined) {
            section.settings = { ...section.settings, ...settings };
        }
        if (enabled !== undefined) {
            section.enabled = enabled;
        }

        // Mark the settings subdocument path as modified to ensure Mongoose updates mixed type
        page.markModified('sections');
        await page.save();

        res.status(200).json({
            success: true,
            message: 'Section settings updated successfully',
            page
        });
    } catch (error) {
        console.error('Error updating section settings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
