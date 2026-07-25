import StorePage from '../models/StorePage.js';
import Store from '../models/Store.js';
import { DEFAULT_HOME_SECTIONS } from '../data/defaultSections.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Helper to read JSON safely
const readJsonFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (err) {
        console.error(`Error reading file at ${filePath}:`, err);
    }
    return null;
};

const getThemeDefaultSections = async (storeId, themeId, folderName = '') => {
    try {
        let folder = folderName;
        if (!folder) {
            const store = await Store.findById(storeId);
            if (!store) return DEFAULT_HOME_SECTIONS;

            const targetThemeId = themeId || (store.activeTheme ? store.activeTheme.themeId : '');
            const themeInfo = store.installedThemes.find(t => t.themeId === targetThemeId);

            if (!themeInfo || !themeInfo.folder) {
                return DEFAULT_HOME_SECTIONS;
            }
            folder = themeInfo.folder;
        }

        let themesDir = path.resolve(process.cwd(), '..', 'themes');
        if (!fs.existsSync(themesDir)) {
            themesDir = path.resolve(process.cwd(), '..', '..', 'themes');
        }
        const indexPagePath = path.join(themesDir, folder, 'pages', 'index.json');
        const indexPage = readJsonFile(indexPagePath);

        let loadedSections = [];
        if (indexPage && Array.isArray(indexPage.sections)) {
            let orderCounter = 1;
            for (const sectionName of indexPage.sections) {
                if (sectionName === 'header' || sectionName === 'footer') continue;
                
                const sectionPath = path.join(themesDir, folder, 'sections', `${sectionName}.json`);
                const sectionData = readJsonFile(sectionPath);
                if (sectionData) {
                    const settingsObj = { ...sectionData.settings };
                    if (settingsObj.background_image !== undefined) {
                        settingsObj.backgroundImage = settingsObj.background_image;
                    }
                    if (settingsObj.button_label !== undefined) {
                        settingsObj.buttonLabel = settingsObj.button_label;
                    }
                    if (settingsObj.button_link !== undefined) {
                        settingsObj.buttonLink = settingsObj.button_link;
                    }
                    if (settingsObj.heading !== undefined) {
                        settingsObj.title = settingsObj.heading;
                    }
                    if (settingsObj.subheading !== undefined) {
                        settingsObj.subtitle = settingsObj.subheading;
                    }

                    let sectionBlocks = [];
                    if (sectionData.blocks && Array.isArray(sectionData.blocks) && sectionData.blocks.length > 0) {
                        sectionBlocks = sectionData.blocks.map(b => ({
                            blockId: b.blockId || Math.random().toString(36).substr(2, 9),
                            type: b.type,
                            settings: b.settings || {}
                        }));
                    } else if (sectionName === 'hero') {
                        if (settingsObj.heading) {
                            sectionBlocks.push({
                                blockId: Math.random().toString(36).substr(2, 9),
                                type: 'heading',
                                settings: { text: settingsObj.heading }
                            });
                        }
                        if (settingsObj.subheading) {
                            sectionBlocks.push({
                                blockId: Math.random().toString(36).substr(2, 9),
                                type: 'subheading',
                                settings: { text: settingsObj.subheading }
                            });
                        }
                        if (settingsObj.buttonLabel) {
                            sectionBlocks.push({
                                blockId: Math.random().toString(36).substr(2, 9),
                                type: 'button',
                                settings: { label: settingsObj.buttonLabel, link: settingsObj.buttonLink || '/catalog' }
                            });
                        }
                    }

                    loadedSections.push({
                        sectionId: Math.random().toString(36).substr(2, 9),
                        type: sectionData.type || sectionName,
                        enabled: true,
                        locked: false,
                        settings: settingsObj,
                        blocks: sectionBlocks,
                        order: orderCounter++
                    });
                }
            }
        }

        if (loadedSections.length > 0) {
            return loadedSections;
        }
    } catch (err) {
        console.error('Error getting theme default sections:', err);
    }
    return DEFAULT_HOME_SECTIONS.map((s, i) => ({ ...s, sectionId: `fallback-${i}`, order: i + 1 }));
};

const getDefaultPageSections = async (slug, storeId, themeId, folderName = '') => {
    if (slug === 'home') {
        return await getThemeDefaultSections(storeId, themeId, folderName);
    }
    
    const timestamp = Date.now();
    
    if (slug === 'about-us') {
        return [
            {
                sectionId: `about-h-${timestamp}`,
                type: 'heading',
                enabled: true,
                settings: {
                    text: 'About Our Brand',
                    style: { tag: 'h1', fontSize: 36, color: '#18181b', fontWeight: '900', textAlign: 'center', marginTop: 15, marginBottom: 20 }
                },
                blocks: [],
                order: 1
            },
            {
                sectionId: `about-rt-${timestamp}`,
                type: 'rich-text',
                enabled: true,
                settings: {
                    title: 'Our Story & Vision',
                    content: 'Founded with a dedication to fine craftsmanship and sustainable organic sourcing, we design apparel that elevates everyday life. Our mission is simple: merge top-tier comfort with timeless aesthetic integrity.',
                    alignment: 'center'
                },
                blocks: [],
                order: 2
            },
            {
                sectionId: `about-fg-${timestamp}`,
                type: 'features-grid',
                enabled: true,
                settings: {
                    title: 'Our Key Brand Principles',
                    subtitle: 'Crafted with intention and responsibility.'
                },
                blocks: [
                    { blockId: 'b1', type: 'feature', settings: { icon: 'shield-check', title: '100% Organic Sourcing', text: 'All garments are certified organic and clean.' } },
                    { blockId: 'b2', type: 'feature', settings: { icon: 'truck', title: 'Express Delivery', text: 'Secured global shipping directly to your door.' } },
                    { blockId: 'b3', type: 'feature', settings: { icon: 'rotate-ccw', title: 'Easy Returns', text: 'Stress-free returns within 30 days.' } }
                ],
                order: 3
            },
            {
                sectionId: `about-nl-${timestamp}`,
                type: 'newsletter',
                enabled: true,
                settings: {
                    title: 'Subscribe to Our Journey',
                    subtitle: 'Receive early collection releases and exclusive promotions.'
                },
                blocks: [],
                order: 4
            }
        ];
    }

    if (slug === 'contact-us') {
        return [
            {
                sectionId: `contact-h-${timestamp}`,
                type: 'heading',
                enabled: true,
                settings: {
                    text: 'Get in Touch',
                    style: { tag: 'h1', fontSize: 36, color: '#18181b', fontWeight: '900', textAlign: 'center', marginTop: 15, marginBottom: 20 }
                },
                blocks: [],
                order: 1
            },
            {
                sectionId: `contact-rt-${timestamp}`,
                type: 'rich-text',
                enabled: true,
                settings: {
                    title: "We'd Love to Hear from You",
                    content: "Whether you have questions about sizing, shipping, or returns, our support team is here to help you. Send us a message and we'll reply within 24 hours.",
                    alignment: 'center'
                },
                blocks: [],
                order: 2
            },
            {
                sectionId: `contact-f-${timestamp}`,
                type: 'contact-form',
                enabled: true,
                settings: {
                    title: 'Send Us a Message',
                    subtitle: 'Submit your inquiry and our team will get back to you shortly.'
                },
                blocks: [],
                order: 3
            },
            {
                sectionId: `contact-fg-${timestamp}`,
                type: 'features-grid',
                enabled: true,
                settings: {
                    title: 'Customer Support Channels',
                    subtitle: 'Find help through our dedicated support routes.'
                },
                blocks: [
                    { blockId: 'c1', type: 'feature', settings: { icon: 'phone', title: 'Help Hotline', text: '+91 98765 43210 (Mon-Sat, 9AM-6PM)' } },
                    { blockId: 'c2', type: 'feature', settings: { icon: 'shield-check', title: 'Secure Ticketing', text: 'support@brandstore.com' } }
                ],
                order: 4
            }
        ];
    }

    if (slug === 'privacy-policy') {
        return [
            {
                sectionId: `privacy-h-${timestamp}`,
                type: 'heading',
                enabled: true,
                settings: {
                    text: 'Privacy Policy',
                    style: { tag: 'h1', fontSize: 32, color: '#18181b', fontWeight: '900', textAlign: 'left', marginTop: 10, marginBottom: 15 }
                },
                blocks: [],
                order: 1
            },
            {
                sectionId: `privacy-rt-${timestamp}`,
                type: 'rich-text',
                enabled: true,
                settings: {
                    title: 'Your Trust is Our Priority',
                    content: 'This privacy statement describes how we collect, use, protect, and manage your personal data when you visit or make a purchase from our store. We are committed to ensuring security and transparency.',
                    alignment: 'left'
                },
                blocks: [],
                order: 2
            },
            {
                sectionId: `privacy-ac-${timestamp}`,
                type: 'accordion',
                enabled: true,
                settings: {
                    title: 'Detailed Policy Sections'
                },
                blocks: [
                    { blockId: 'p1', type: 'accordion-item', settings: { title: 'What Data We Collect', content: 'We collect order processing details, device logs, IP addresses, and email communications for support.' } },
                    { blockId: 'p2', type: 'accordion-item', settings: { title: 'How We Use Your Data', content: 'Your data is solely used to deliver products, send transaction updates, prevent fraud, and run security compliance checks.' } },
                    { blockId: 'p3', type: 'accordion-item', settings: { title: 'Your Rights & Controls', content: 'You can request deletion, export, or correction of your personal data at any time by contacting our support team.' } }
                ],
                order: 3
            }
        ];
    }

    if (slug === 'terms-and-conditions') {
        return [
            {
                sectionId: `terms-h-${timestamp}`,
                type: 'heading',
                enabled: true,
                settings: {
                    text: 'Terms and Conditions',
                    style: { tag: 'h1', fontSize: 32, color: '#18181b', fontWeight: '900', textAlign: 'left', marginTop: 10, marginBottom: 15 }
                },
                blocks: [],
                order: 1
            },
            {
                sectionId: `terms-rt-${timestamp}`,
                type: 'rich-text',
                enabled: true,
                settings: {
                    title: 'Usage Agreement',
                    content: 'By accessing this store, you agree to comply with the terms and conditions outlined below. Please read these terms carefully before placing orders.',
                    alignment: 'left'
                },
                blocks: [],
                order: 2
            },
            {
                sectionId: `terms-ac-${timestamp}`,
                type: 'accordion',
                enabled: true,
                settings: {
                    title: 'Key Agreement Areas'
                },
                blocks: [
                    { blockId: 't1', type: 'accordion-item', settings: { title: 'Store Purchases & Pricing', content: 'All pricing details are dynamic and subject to change. Order completion is finalized only after successful transaction verification.' } },
                    { blockId: 't2', type: 'accordion-item', settings: { title: 'Intellectual Property Rights', content: 'All trademarks, catalog graphics, design styles, and copy text registered on this store belong exclusively to the merchant.' } },
                    { blockId: 't3', type: 'accordion-item', settings: { title: 'Account Conduct & Policy', content: 'User profiles engaged in fake transactions, spamming, or violating checkout security protocols will be suspended immediately.' } }
                ],
                order: 3
            }
        ];
    }

    if (slug === 'refund-policy') {
        return [
            {
                sectionId: `refund-h-${timestamp}`,
                type: 'heading',
                enabled: true,
                settings: {
                    text: 'Refund Policy',
                    style: { tag: 'h1', fontSize: 32, color: '#18181b', fontWeight: '900', textAlign: 'left', marginTop: 10, marginBottom: 15 }
                },
                blocks: [],
                order: 1
            },
            {
                sectionId: `refund-rt-${timestamp}`,
                type: 'rich-text',
                enabled: true,
                settings: {
                    title: 'Returns Made Simple',
                    content: 'If you are not 100% satisfied with your purchase, we offer simple returns and exchange processing directly from your account portal.',
                    alignment: 'left'
                },
                blocks: [],
                order: 2
            },
            {
                sectionId: `refund-fg-${timestamp}`,
                type: 'features-grid',
                enabled: true,
                settings: {
                    title: 'Our Refund Process',
                    subtitle: 'Transparent return steps and timelines.'
                },
                blocks: [
                    { blockId: 'r1', type: 'feature', settings: { icon: 'rotate-ccw', title: '30-Day Window', text: 'Request returns or exchanges within 30 days of receiving your package.' } },
                    { blockId: 'r2', type: 'feature', settings: { icon: 'truck', title: 'Prepaid Shipping Labels', text: 'Download a prepaid returns label and drop off the package at any delivery hub.' } },
                    { blockId: 'r3', type: 'feature', settings: { icon: 'heart-pulse', title: 'Quality Audits', text: 'Refunds are processed back to the original payment source within 3 business days of package inspection.' } }
                ],
                order: 3
            }
        ];
    }

    return [];
};

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

        const store = await Store.findById(storeId);
        const themeId = req.query.themeId || (store && store.activeTheme ? store.activeTheme.themeId : '');
        const baseFilter = req.merchant ? { merchantId: req.merchant._id, storeId } : { storeId };

        let pages = await StorePage.find({ ...baseFilter, themeId });
        // Fall back to unscoped/default theme pages when active theme has none yet
        if (pages.length === 0 && themeId) {
            pages = await StorePage.find({ ...baseFilter, themeId: '' });
        }

        const formattedPages = await Promise.all(pages.map(async p => {
            const obj = p.toObject();
            const isDef = DEFAULT_PAGES.some(d => d.slug === obj.slug);
            let sectionsList = obj.sections || [];
            // Prefer saved HTML content for CMS pages; only fall back to section templates when empty
            if (sectionsList.length === 0 && (!obj.content || obj.slug === 'home')) {
                sectionsList = await getDefaultPageSections(obj.slug, storeId, themeId);
            }
            return {
                ...obj,
                sections: sectionsList,
                isDefault: isDef,
                isNew: false
            };
        }));

        for (const defaultPage of DEFAULT_PAGES) {
            const exists = formattedPages.some(p => p.slug === defaultPage.slug);
            if (!exists) {
                const themeSections = await getDefaultPageSections(defaultPage.slug, storeId, themeId);
                formattedPages.push({
                    ...defaultPage,
                    content: '',
                    sections: themeSections,
                    isNew: true
                });
            }
        }

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

        const useCleanPreview = req.query.cleanPreview === 'true';
        const store = await Store.findById(storeId);
        const themeId = req.query.themeId || req.query.previewThemeId || (store && store.activeTheme ? store.activeTheme.themeId : '');
        const baseFilter = req.merchant ? { merchantId: req.merchant._id, storeId, slug } : { storeId, slug };

        let page = null;
        if (!useCleanPreview) {
            page = await StorePage.findOne({ ...baseFilter, themeId });
            if (!page && themeId) {
                page = await StorePage.findOne({ ...baseFilter, themeId: '' });
            }
        }

        if (!page) {
            const defaultPage = DEFAULT_PAGES.find(p => p.slug === slug);
            if (!defaultPage) {
                return res.status(404).json({ success: false, message: 'Page not found' });
            }

            const themeSections = await getDefaultPageSections(slug, storeId, themeId, req.query.folder);

            page = {
                ...defaultPage,
                content: '',
                sections: themeSections,
                isNew: true
            };
        } else {
            const obj = page.toObject();
            const isDef = DEFAULT_PAGES.some(d => d.slug === obj.slug);
            let sectionsList = obj.sections || [];
            if (sectionsList.length === 0 && (!obj.content || obj.slug === 'home')) {
                sectionsList = await getDefaultPageSections(obj.slug, storeId, themeId, req.query.folder);
            }
            page = {
                ...obj,
                sections: sectionsList,
                isDefault: isDef,
                isNew: false
            };
        }

        const isFallback = !!(page && page.sections && page.sections.some(s => s.sectionId && String(s.sectionId).startsWith('fallback-')));
        
        page = {
            ...page,
            isFallback
        };

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
        const { content, title, sections, isHomePage, seo, visibility, publishDate, password } = req.body;
        const merchantId = req.merchant._id;
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        const store = await Store.findById(storeId);
        const themeId = req.query.themeId || req.body.themeId || (store && store.activeTheme ? store.activeTheme.themeId : '');
        let page = await StorePage.findOne({ merchantId, storeId, slug, themeId });

        if (page) {
            page.content = content !== undefined ? content : page.content;
            page.title = title !== undefined ? title : page.title;
            if (sections !== undefined) page.sections = sections;
            if (isHomePage !== undefined) page.isHomePage = isHomePage;
            if (seo !== undefined) page.seo = seo;
            if (visibility !== undefined) page.visibility = visibility;
            if (publishDate !== undefined) page.publishDate = publishDate;
            if (password !== undefined) page.password = password;
            await page.save();
        } else {
            const defaultPage = DEFAULT_PAGES.find(p => p.slug === slug);
            let themeSections = sections;
            if (themeSections === undefined) {
                if (slug === 'home') {
                    themeSections = await getThemeDefaultSections(storeId, themeId);
                }
            }

            page = await StorePage.create({
                merchantId,
                storeId,
                themeId,
                slug,
                title: title || (defaultPage ? defaultPage.title : slug),
                content: content || '',
                isHomePage: isHomePage !== undefined ? isHomePage : (defaultPage ? !!defaultPage.isHomePage : false),
                sections: themeSections || [],
                seo: seo || {},
                visibility: visibility || 'published',
                publishDate: publishDate || Date.now(),
                password: password || ''
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

        const store = await Store.findById(storeId);
        const themeId = req.query.themeId || (store && store.activeTheme ? store.activeTheme.themeId : '');
        const filter = { merchantId, storeId, slug, themeId };

        await StorePage.deleteOne(filter);

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

        const store = await Store.findById(storeId);
        const themeId = req.query.themeId || req.body.themeId || (store && store.activeTheme ? store.activeTheme.themeId : '');
        const filter = { merchantId, storeId, slug, themeId };

        let page = await StorePage.findOne(filter);

        if (!page) {
            const defaultPage = DEFAULT_PAGES.find(p => p.slug === slug);
            page = await StorePage.create({
                merchantId,
                storeId,
                themeId,
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

        const store = await Store.findById(storeId);
        const themeId = req.query.themeId || req.body.themeId || (store && store.activeTheme ? store.activeTheme.themeId : '');
        const filter = { merchantId, storeId, slug, themeId };

        let page = await StorePage.findOne(filter);

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

// @desc    Create a new custom store page
// @route   POST /api/store-pages
// @access  Private (Merchant)
export const createPage = async (req, res) => {
    try {
        const { slug, title, content, isHomePage, seo, visibility, publishDate, password, sections } = req.body;
        const merchantId = req.merchant._id;
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        if (!slug || !title) {
            return res.status(400).json({ success: false, message: 'Slug and title are required' });
        }

        const store = await Store.findById(storeId);
        const themeId = req.query.themeId || req.body.themeId || (store && store.activeTheme ? store.activeTheme.themeId : '');
        const existingPage = await StorePage.findOne({ storeId, slug, themeId });
        if (existingPage) {
            return res.status(400).json({ success: false, message: 'A page with this slug already exists for this store/theme' });
        }

        const page = await StorePage.create({
            merchantId,
            storeId,
            themeId,
            slug,
            title,
            content: content || '',
            isHomePage: !!isHomePage,
            sections: sections || [],
            seo: seo || {},
            visibility: visibility || 'published',
            publishDate: publishDate || Date.now(),
            password: password || ''
        });

        res.status(201).json({
            success: true,
            message: 'Page created successfully',
            page
        });
    } catch (error) {
        console.error('Error creating store page:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
