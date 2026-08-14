import Store from '../models/Store.js';
import Merchant from '../models/Merchant.js';
import PlatformSetting from '../models/PlatformSetting.js';
import dns from 'dns';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { sendMerchantMail, storeCreatedEmail } from '../../../shared/merchantEmails.js';

const getLast6MonthsMockData = (totalRevenue) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const date = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        data.push({
            name: months[d.getMonth()],
            revenue: totalRevenue > 0 ? Math.floor(Math.random() * (totalRevenue / 5)) : 0,
            orders: totalRevenue > 0 ? Math.floor(Math.random() * 50) + 5 : 0
        });
    }
    return data;
};

// @desc    Create a new store
// @route   POST /api/stores
// @access  Private/Merchant
export const createStore = async (req, res) => {
    try {
        const merchantId = req.merchant._id;
        const { storeName, storeDescription, contactEmail, contactPhone, address, city, state, pincode, storeLogo, storeBanner, socialLinks, gstPercent, platformCommission } = req.body;

        const nameExists = await Store.findOne({
            storeName: { $regex: new RegExp(`^${storeName.trim()}$`, 'i') }
        });
        if (nameExists) {
            return res.status(400).json({ message: 'A store with this name already exists. Please choose a different name.' });
        }

        if (contactEmail && contactEmail.trim()) {
            const emailExists = await Store.findOne({ contactEmail: contactEmail.trim() });
            if (emailExists) {
                return res.status(400).json({ message: 'A store with this contact email already exists. Please use a unique email.' });
            }
        }

        if (contactPhone && contactPhone.trim()) {
            const phoneExists = await Store.findOne({ contactPhone: contactPhone.trim() });
            if (phoneExists) {
                return res.status(400).json({ message: 'A store with this contact phone already exists. Please use a unique phone number.' });
            }
        }

        const merchant = await Merchant.findById(merchantId);
        const planType = merchant ? merchant.planType : 'Single Vendor';

        const store = await Store.create({
            merchantId,
            planType,
            storeName: storeName.trim(),
            storeDescription: storeDescription || '',
            contactEmail: contactEmail || (merchant ? merchant.email : ''),
            contactPhone: contactPhone || (merchant ? merchant.mobile : ''),
            address: address || '',
            city: city || '',
            state: state || '',
            pincode: pincode || '',
            storeLogo: storeLogo || '',
            storeBanner: storeBanner || '',
            socialLinks: socialLinks || {},
            gstPercent: gstPercent || 0,
            platformCommission: platformCommission || 0
        });

        if (merchant?.email) {
            sendMerchantMail(storeCreatedEmail({
                name: merchant.name,
                email: merchant.email,
                storeName: store.storeName,
                storeId: String(store._id)
            }));
        }

        res.status(201).json(store);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A store with a similar name already exists. Please choose a different name.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all stores for a merchant
// @route   GET /api/stores/my-stores
// @access  Private/Merchant
export const getMyStores = async (req, res) => {
    try {
        const stores = await Store.find({ merchantId: req.merchant._id }).sort({ createdAt: -1 });
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single store by ID
// @route   GET /api/stores/:id
// @access  Private/Merchant
export const getStoreById = async (req, res) => {
    try {
        const query = req.merchant ? { _id: req.params.id, merchantId: req.merchant._id } : { _id: req.params.id };
        const store = await Store.findOne(query);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        let storeObj = store.toObject();

        const resolveThemesDir = () => {
            let themesDir = path.resolve(process.cwd(), '..', 'themes');
            if (!fs.existsSync(themesDir)) {
                themesDir = path.resolve(process.cwd(), '..', '..', 'themes');
            }
            return themesDir;
        };

        const readThemeDefaults = (folder) => {
            if (!folder) return {};
            try {
                const defaultSettingsPath = path.join(resolveThemesDir(), folder, 'defaultSettings.json');
                if (fs.existsSync(defaultSettingsPath)) {
                    return JSON.parse(fs.readFileSync(defaultSettingsPath, 'utf8'));
                }
            } catch (err) {
                console.error('Error reading theme defaultSettings:', err.message);
            }
            return {};
        };

        /** Merge disk engine defaults under DB settings so regenerated themes apply without reinstall. */
        const mergeThemeSettings = (folder, settings = {}) => {
            const defaults = readThemeDefaults(folder);
            const needsEngineRefresh = !settings.themeFolder && !settings.motionPreset;
            const pickEngine = (key) => (
                needsEngineRefresh
                    ? (defaults[key] || settings[key])
                    : (settings[key] || defaults[key])
            );
            return {
                ...defaults,
                ...settings,
                themeFolder: folder || settings.themeFolder || defaults.themeId || '',
                themeId: folder || defaults.themeId || settings.themeId || 'default',
                designLanguage: defaults.designLanguage || settings.designLanguage || folder || '',
                headerConfig: {
                    ...(defaults.headerConfig || {}),
                    ...(settings.headerConfig || {}),
                    announcementBar: {
                        ...(defaults.headerConfig?.announcementBar || {}),
                        ...(settings.headerConfig?.announcementBar || {}),
                    },
                },
                footerConfig: {
                    ...(defaults.footerConfig || {}),
                    ...(settings.footerConfig || {}),
                },
                productCardStyle: pickEngine('productCardStyle'),
                heroStyle: pickEngine('heroStyle'),
                motionPreset: pickEngine('motionPreset'),
                hoverPreset: pickEngine('hoverPreset'),
                sectionStyle: pickEngine('sectionStyle'),
                imageTreatment: pickEngine('imageTreatment'),
                contentDensity: pickEngine('contentDensity'),
                carouselStyle: pickEngine('carouselStyle'),
                mobileNavStyle: pickEngine('mobileNavStyle'),
                cartStyle: pickEngine('cartStyle'),
                buttonStyle: pickEngine('buttonStyle'),
                footerStyle: pickEngine('footerStyle'),
                headerStyle: pickEngine('headerStyle'),
                productPageLayout: pickEngine('productPageLayout'),
                collectionLayout: pickEngine('collectionLayout'),
                spacingScale: pickEngine('spacingScale'),
                headingFont: pickEngine('headingFont'),
                bodyFont: pickEngine('bodyFont'),
                buttonFont: pickEngine('buttonFont'),
                navigationFont: pickEngine('navigationFont'),
                priceFont: pickEngine('priceFont'),
                primaryColor: settings.primaryColor || defaults.primaryColor,
                secondaryColor: settings.secondaryColor || defaults.secondaryColor,
                accentColor: settings.accentColor || defaults.accentColor,
            };
        };

        if (req.query.cleanPreview === 'true' && req.query.folder) {
            const folder = req.query.folder;
            const defaultSettings = readThemeDefaults(folder);
            const mockThemeId = req.query.themeId || 'mock-theme-id';
            
            storeObj.activeTheme = {
                themeId: mockThemeId,
                folder: folder,
                version: req.query.version || '1.0.0',
                installedAt: new Date()
            };

            storeObj.installedThemes = [{
                themeId: mockThemeId,
                folder: folder,
                version: req.query.version || '1.0.0',
                installedAt: new Date(),
                draftThemeSettings: mergeThemeSettings(folder, defaultSettings),
                publishedThemeSettings: mergeThemeSettings(folder, defaultSettings)
            }];
        } else if (Array.isArray(storeObj.installedThemes)) {
            const canSeeDraft = !!(req.merchant || req.previewAuth);
            storeObj.installedThemes = storeObj.installedThemes.map((install) => {
                const published = mergeThemeSettings(install.folder, install.publishedThemeSettings || {});
                const draft = mergeThemeSettings(install.folder, install.draftThemeSettings || {});
                return {
                    ...install,
                    publishedThemeSettings: published,
                    // Wave 5 — never leak draft theme settings publicly
                    draftThemeSettings: canSeeDraft ? draft : published,
                };
            });
        }

        if (req.previewAuthError && (req.query.draft === 'true' || req.query.previewToken)) {
            return res.status(req.previewAuthError.status || 401).json({
                success: false,
                message: req.previewAuthError.message || 'Invalid preview token',
            });
        }
        if (req.previewAuth && String(req.previewAuth.storeId) !== String(req.params.id)) {
            return res.status(403).json({
                success: false,
                message: 'Preview token store mismatch',
            });
        }

        res.json(storeObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a store
// @route   PUT /api/stores/:id
// @access  Private/Merchant
export const updateStore = async (req, res) => {
    try {
        const store = await Store.findOne({ _id: req.params.id, merchantId: req.merchant._id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        const { storeName, storeDescription, contactEmail, contactPhone, address, city, state, pincode, storeLogo, storeBanner, socialLinks, isActive, paymentSettings, gstPercent, platformCommission } = req.body;

        if (storeName !== undefined && storeName.trim() !== store.storeName) {
            const nameExists = await Store.findOne({
                storeName: { $regex: new RegExp(`^${storeName.trim()}$`, 'i') },
                _id: { $ne: store._id }
            });
            if (nameExists) {
                return res.status(400).json({ message: 'A store with this name already exists. Please choose a different name.' });
            }
            store.storeName = storeName.trim();
        }

        if (contactEmail !== undefined && contactEmail.trim() && contactEmail.trim() !== store.contactEmail) {
            const emailExists = await Store.findOne({
                contactEmail: contactEmail.trim(),
                _id: { $ne: store._id }
            });
            if (emailExists) {
                return res.status(400).json({ message: 'A store with this contact email already exists. Please use a unique email.' });
            }
            store.contactEmail = contactEmail.trim();
        }

        if (contactPhone !== undefined && contactPhone.trim() && contactPhone.trim() !== store.contactPhone) {
            const phoneExists = await Store.findOne({
                contactPhone: contactPhone.trim(),
                _id: { $ne: store._id }
            });
            if (phoneExists) {
                return res.status(400).json({ message: 'A store with this contact phone already exists. Please use a unique phone number.' });
            }
            store.contactPhone = contactPhone.trim();
        }

        if (storeDescription !== undefined) store.storeDescription = storeDescription;
        if (address !== undefined) store.address = address;
        if (city !== undefined) store.city = city;
        if (state !== undefined) store.state = state;
        if (pincode !== undefined) store.pincode = pincode;
        if (storeLogo !== undefined) store.storeLogo = storeLogo;
        if (storeBanner !== undefined) store.storeBanner = storeBanner;
        if (socialLinks !== undefined) store.socialLinks = socialLinks;
        if (isActive !== undefined) store.isActive = isActive;
        if (paymentSettings !== undefined) store.paymentSettings = paymentSettings;
        if (gstPercent !== undefined) store.gstPercent = gstPercent;
        if (platformCommission !== undefined) store.platformCommission = platformCommission;

        const updatedStore = await store.save();
        res.json(updatedStore);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a store
// @route   DELETE /api/stores/:id
// @access  Private/Merchant
export const deleteStore = async (req, res) => {
    try {
        const store = await Store.findOne({ _id: req.params.id, merchantId: req.merchant._id });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        await Store.deleteOne({ _id: store._id });
        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all stores (Master Admin)
// @route   GET /api/stores/admin/all
// @access  Private/Admin (Internal or proxy routed)
export const getAllStores = async (req, res) => {
    try {
        const stores = await Store.find({}).populate('merchantId', 'name email mobile').sort({ createdAt: -1 });
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const merchantId = req.merchant._id;
        const { storeId } = req.query;

        // Find stores for this merchant
        const query = { merchantId };
        if (storeId) {
            query._id = storeId;
        }
        const stores = await Store.find(query);
        const totalStores = stores.length;
        const totalRevenue = stores.reduce((sum, s) => sum + (s.revenue || 0), 0);
        const activeOrders = stores.reduce((sum, s) => sum + (s.totalOrders || 0), 0);

        // Call catalog-service internally to count products for this merchant/store
        let totalProducts = 0;
        try {
            const catalogServiceUrl = process.env.CATALOG_SERVICE_URL;
            const countQuery = storeId ? `storeId=${storeId}` : `merchantId=${merchantId}`;
            const response = await fetch(`${catalogServiceUrl}/api/products/internal/count?${countQuery}`);
            if (response.ok) {
                const data = await response.json();
                totalProducts = data.count;
            }
        } catch (err) {
            console.error('Error fetching product count from catalog-service:', err.message);
        }

        const graphData = getLast6MonthsMockData(totalRevenue);

        res.json({
            totalStores,
            totalProducts,
            activeOrders,
            totalRevenue,
            graphData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed analytics stats for merchant
// @route   GET /api/stores/analytics-stats
// @access  Private/Merchant
export const getAnalyticsStats = async (req, res) => {
    try {
        const merchantId = req.merchant._id;
        const { storeId } = req.query;

        // Find stores for this merchant
        const query = { merchantId };
        if (storeId) {
            query._id = storeId;
        }
        const stores = await Store.find(query);
        const totalStores = stores.length;
        const totalRevenue = stores.reduce((sum, s) => sum + (s.revenue || 0), 0);
        const activeOrders = stores.reduce((sum, s) => sum + (s.totalOrders || 0), 0);

        // Fetch products list from catalog-service
        let allProducts = [];
        let totalProducts = 0;
        try {
            const catalogServiceUrl = process.env.CATALOG_SERVICE_URL;
            // Count products
            const countQuery = storeId ? `storeId=${storeId}` : `merchantId=${merchantId}`;
            const countResponse = await fetch(`${catalogServiceUrl}/api/products/internal/count?${countQuery}`);
            if (countResponse.ok) {
                const countData = await countResponse.json();
                totalProducts = countData.count;
            }

            // Get actual products list
            for (const store of stores) {
                const prodResponse = await fetch(`${catalogServiceUrl}/api/products`, {
                    headers: {
                        'x-merchant-id': merchantId.toString(),
                        'x-store-id': store._id.toString()
                    }
                });
                if (prodResponse.ok) {
                    const productsList = await prodResponse.json();
                    allProducts = allProducts.concat(productsList);
                }
            }
        } catch (err) {
            console.error('Error fetching products list from catalog-service:', err.message);
        }

        // Generate daily analytics data for last 30 days
        const dailyStats = [];
        const date = new Date();
        const days = 30;

        let remainingRevenue = totalRevenue;
        let remainingOrders = activeOrders;

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

            let dayRevenue = 0;
            let dayOrders = 0;

            if (totalRevenue > 0 && activeOrders > 0) {
                if (i === 0) {
                    dayRevenue = remainingRevenue;
                    dayOrders = remainingOrders;
                } else {
                    const factor = 1 / (i + 1);
                    dayRevenue = Math.floor(remainingRevenue * factor * (0.6 + Math.random() * 0.8));
                    dayOrders = Math.floor(remainingOrders * factor * (0.6 + Math.random() * 0.8));

                    if (dayRevenue > remainingRevenue) dayRevenue = Math.floor(remainingRevenue * 0.8);
                    if (dayOrders > remainingOrders) dayOrders = Math.floor(remainingOrders * 0.8);

                    remainingRevenue -= dayRevenue;
                    remainingOrders -= dayOrders;
                }
            }

            dailyStats.push({
                date: dateStr,
                sales: Math.max(0, dayRevenue),
                orders: Math.max(0, dayOrders),
                sessions: totalRevenue > 0 ? Math.max(10, Math.floor(dayOrders * 35 + 20 + Math.random() * 50)) : 0
            });
        }

        const totalSessions = dailyStats.reduce((sum, d) => sum + d.sessions, 0);

        // Dynamic channel distribution
        const channels = [
            {
                name: 'Direct',
                sessions: totalSessions > 0 ? Math.floor(totalSessions * 0.4) : 0,
                sales: totalRevenue > 0 ? Math.floor(totalRevenue * 0.38) : 0,
                orders: activeOrders > 0 ? Math.floor(activeOrders * 0.38) : 0,
                conversionRate: totalSessions > 0 ? '2.5%' : '0.00%'
            },
            {
                name: 'Organic Search',
                sessions: totalSessions > 0 ? Math.floor(totalSessions * 0.3) : 0,
                sales: totalRevenue > 0 ? Math.floor(totalRevenue * 0.32) : 0,
                orders: activeOrders > 0 ? Math.floor(activeOrders * 0.31) : 0,
                conversionRate: totalSessions > 0 ? '2.2%' : '0.00%'
            },
            {
                name: 'Social Media',
                sessions: totalSessions > 0 ? Math.floor(totalSessions * 0.2) : 0,
                sales: totalRevenue > 0 ? Math.floor(totalRevenue * 0.20) : 0,
                orders: activeOrders > 0 ? Math.floor(activeOrders * 0.21) : 0,
                conversionRate: totalSessions > 0 ? '1.8%' : '0.00%'
            },
            {
                name: 'Email Marketing',
                sessions: totalSessions > 0 ? Math.floor(totalSessions * 0.1) : 0,
                sales: totalRevenue > 0 ? Math.floor(totalRevenue * 0.10) : 0,
                orders: activeOrders > 0 ? Math.floor(activeOrders * 0.10) : 0,
                conversionRate: totalSessions > 0 ? '3.0%' : '0.00%'
            }
        ];

        // Dynamic product rankings
        let topProducts = [];
        if (allProducts.length > 0 && totalRevenue > 0) {
            let prodRemainingRevenue = totalRevenue;
            let prodRemainingOrders = activeOrders;

            topProducts = allProducts.slice(0, 5).map((p, idx, arr) => {
                let pRevenue = 0;
                let pQty = 0;
                if (idx === arr.length - 1) {
                    pRevenue = prodRemainingRevenue;
                    pQty = prodRemainingOrders;
                } else {
                    pRevenue = Math.floor(prodRemainingRevenue * 0.4);
                    pQty = Math.floor(prodRemainingOrders * 0.4);
                    prodRemainingRevenue -= pRevenue;
                    prodRemainingOrders -= pQty;
                }
                return {
                    name: p.name,
                    category: (p.category && p.category.name) ? p.category.name : 'Uncategorized',
                    quantity: Math.max(0, pQty),
                    revenue: Math.max(0, pRevenue)
                };
            }).sort((a, b) => b.revenue - a.revenue);
        } else {
            topProducts = allProducts.slice(0, 5).map(p => ({
                name: p.name,
                category: (p.category && p.category.name) ? p.category.name : 'Uncategorized',
                quantity: 0,
                revenue: 0
            }));
        }

        res.json({
            totalRevenue,
            activeOrders,
            totalStores,
            totalProducts,
            averageOrderValue: activeOrders > 0 ? Math.round(totalRevenue / activeOrders) : 0,
            conversionRate: activeOrders > 0 ? ((activeOrders / (totalSessions || 1)) * 100).toFixed(2) : '0.00',
            sessions: totalSessions,
            dailyStats,
            channels,
            topProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a store programmatically (internal endpoint called by billing-service)
// @route   POST /api/stores/internal/create
// @access  Internal
export const createStoreInternal = async (req, res) => {
    try {
        const { merchantId, planType, storeName, storeDescription, contactEmail, contactPhone, address, city, state, pincode, storeLogo, socialLinks } = req.body;

        const store = await Store.create({
            merchantId,
            planType,
            storeName,
            contactEmail,
            contactPhone,
            storeDescription: storeDescription || 'My store created on Storify',
            address: address || '',
            city: city || '',
            state: state || '',
            pincode: pincode || '',
            storeLogo: storeLogo || '',
            storeBanner: '',
            socialLinks: socialLinks || {}
        });

        res.status(201).json(store);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Resolve store by custom domain
// @route   GET /api/stores/domain/resolve
// @access  Public
export const resolveDomain = async (req, res) => {
    try {
        const { domain } = req.query;
        if (!domain) {
            return res.status(400).json({ success: false, message: 'Domain query parameter is required' });
        }

        // Clean protocol, www, paths, and ports from input domain
        let cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split(':')[0].trim().toLowerCase();

        const store = await Store.findOne({ customDomain: cleanDomain, isActive: true, domainPublished: true });
        if (!store) {
            return res.status(404).json({ success: false, message: 'No active store found for this domain' });
        }

        res.status(200).json({
            success: true,
            storeId: store._id,
            storeSlug: store.storeSlug,
            storeName: store.storeName
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update store custom domain
// @route   PUT /api/stores/:id/domain
// @access  Private/Merchant
export const updateStoreDomain = async (req, res) => {
    try {
        const store = await Store.findOne({ _id: req.params.id, merchantId: req.merchant._id });
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const { customDomain } = req.body;
        store.customDomain = customDomain !== undefined ? customDomain.trim().toLowerCase() : store.customDomain;
        // Reset published status when domain changes
        if (customDomain !== undefined) {
            store.domainPublished = false;
        }
        await store.save();

        res.status(200).json({
            success: true,
            message: 'Custom domain updated successfully',
            store
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Publish store on custom domain (after DNS verification)
// @route   PUT /api/stores/:id/domain/publish
// @access  Private/Merchant
export const publishStoreDomain = async (req, res) => {
    try {
        const store = await Store.findOne({ _id: req.params.id, merchantId: req.merchant._id });
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        if (!store.customDomain) {
            return res.status(400).json({ success: false, message: 'No custom domain configured. Please set a domain first.' });
        }

        console.log(`[Publish Step 1/5] Received publish request for store: ${req.params.id}`);
        store.domainPublished = true;
        await store.save();
        console.log(`[Publish Step 2/5] Database updated domainPublished to true`);

        const domain = store.customDomain;
        console.log(`[Publish Step 3/5] Targeted domain is: ${domain}`);

        // Strict domain validation to prevent command injection
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
        if (!domainRegex.test(domain)) {
            console.error(`[Publish Error] Invalid custom domain format detected: ${domain}`);
            return res.status(400).json({ success: false, message: 'Invalid custom domain format. Only alphanumeric characters, hyphens, and dots are allowed.' });
        }

        // Fetch platform settings from database for IP and SSH credentials
        console.log(`[Publish Step 4/5] Fetching SSH credentials from PlatformSettings...`);
        let settings = await PlatformSetting.findOne();
        if (!settings) {
            console.log(`[Publish Warning] PlatformSetting not found, creating default Settings entry...`);
            settings = await PlatformSetting.create({});
        }

        const serverIp = settings.expectedStoreIP;
        const sshUser = settings.sshUser;
        const sshPass = settings.sshPassword;

        console.log(`[Publish Config Status] IP: ${serverIp}, User: ${sshUser}, Password Present: ${!!sshPass}`);

        // Single shared frontend build directory path on the server
        const sharedWebRoot = '/var/www/admin-frontend/dist';

        const isRootDomain = domain.split('.').length === 2;
        const serverNames = isRootDomain ? `${domain} www.${domain}` : domain;
        const certbotDomains = isRootDomain ? `-d ${domain} -d www.${domain}` : `-d ${domain}`;

        // Dynamic nginx config content for this specific domain pointing to the shared build
        const nginxConfig = `
server {
    listen 80;
    listen [::]:80;
    server_name ${serverNames};

    root ${sharedWebRoot};
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://10.20.30.247/api/;
        proxy_http_version 1.1;
        proxy_set_header Host admin.cloudedata.in;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://10.20.30.247/uploads/;
        proxy_set_header Host admin.cloudedata.in;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;

        // Write the Nginx configuration locally in the services/store-service directory
        const localTempPath = path.resolve(process.cwd(), `${domain}.conf`);
        console.log(`[Publish Step 5/5] Writing temporary config locally to: ${localTempPath}`);
        const fsLib = await import('fs');
        fsLib.writeFileSync(localTempPath, nginxConfig.trim());
        console.log(`[Publish Step 5/5 Success] File written successfully`);

        const destPath = `/etc/nginx/sites-available/${domain}.conf`;
        const linkPath = `/etc/nginx/sites-enabled/${domain}.conf`;

        const buildFrontendPromise = (frontendPath) => {
            return new Promise((resolve, reject) => {
                console.log(`[Auto-Build] Initiating React production build at ${frontendPath}...`);
                exec('npm run build', {
                    cwd: frontendPath,
                    env: {
                        ...process.env,
                        VITE_API_BASE_URL: '/api',
                        VITE_STORE_API_URL: '/api',
                        VITE_AUTH_API_URL: '/api/auth',
                        VITE_MERCHANT_ADMIN_API_URL: '/api/admin',
                        VITE_ADMIN_API_URL: '/api/admin',
                        VITE_CATALOG_API_URL: '/api',
                        VITE_BILLING_API_URL: '/api/billing'
                    }
                }, (err, stdout, stderr) => {
                    if (err) {
                        console.error("[Auto-Build Error]", err.message);
                        return reject(err);
                    }
                    console.log("[Auto-Build Success] Build created.");
                    resolve();
                });
            });
        };

        const frontendPath = path.resolve(process.cwd(), '../../admin-frontend');

        if (!sshPass) {
            console.log(`[Publish Deployment] Initializing Local/Native Deployment...`);
            const localDistPath = path.resolve(process.cwd(), '../../admin-frontend/dist');
            
            buildFrontendPromise(frontendPath).then(() => {
                const deployCmd = `
                    sudo mkdir -p /var/www/admin-frontend/dist && \
                    if [ -d "${localDistPath}" ]; then \
                        sudo cp -r "${localDistPath}"/* /var/www/admin-frontend/dist/ || true; \
                    fi && \
                    sudo chmod -R 755 /var/www/admin-frontend && \
                    sudo cp ${localTempPath} ${destPath} && \
                    sudo ln -sf ${destPath} ${linkPath} && \
                    sudo nginx -t && \
                    sudo nginx -s reload && \
                    sudo certbot --nginx ${certbotDomains} --non-interactive --agree-tos -m admin@storify.com --redirect && \
                    sudo nginx -s reload
                `;
                exec(deployCmd, (error, stdout, stderr) => {
                    console.log(`[Execution Finish] Shell output returned`);
                    try {
                        fsLib.unlinkSync(localTempPath);
                        console.log(`[Cleanup] Deleted local temporary config file.`);
                    } catch (cleanupErr) {
                        console.log(`[Cleanup Warning] Local files cleanup skipped:`, cleanupErr.message);
                    }

                    if (error) {
                        console.error(`[Deployment Error - STEP FAILED] Error message:`, error.message);
                        console.error(`[Deployment Stderr Output]:`, stderr);
                        return;
                    }
                    console.log(`[Deployment Success - COMPLETE] Output:\n`, stdout);
                });
            }).catch(buildErr => {
                console.error(`[Local Build Deployment Blocked] Build failed:`, buildErr.message);
            });
        } else {
            console.log(`[Publish Deployment] Initializing Remote SSH2 Client connection to: ${sshUser}@${serverIp}...`);
            const { Client } = await import('ssh2');
            const { execSync } = await import('child_process');

            buildFrontendPromise(frontendPath).then(() => {
                const archiveName = `shared-dist-${Date.now()}.tar.gz`;
                const localArchivePath = path.resolve(process.cwd(), archiveName);
                
                try {
                    const tarCmd = `tar -czf "${localArchivePath}" -C "${frontendPath}/dist" .`;
                    execSync(tarCmd);
                    console.log(`[Compression Success] Archive created at ${localArchivePath}`);
                } catch (tarErr) {
                    console.error("[Compression Error] Failed to compress build:", tarErr.message);
                    return;
                }

                const conn = new Client();
                conn.on('ready', () => {
                    console.log(`[SSH2 Ready] Connection established. Initializing SFTP...`);
                    
                    conn.sftp((err, sftp) => {
                        if (err) {
                            console.error(`[SFTP Error] Failed to start SFTP session:`, err.message);
                            conn.end();
                            try { fsLib.unlinkSync(localArchivePath); } catch (e) {}
                            return;
                        }

                        const remoteTempPath = `/tmp/${domain}.conf`;
                        const remoteArchivePath = `/tmp/${archiveName}`;

                        console.log(`[SFTP Upload] Transferring configuration file: ${localTempPath} -> ${remoteTempPath}`);
                        sftp.fastPut(localTempPath, remoteTempPath, {}, (uploadErr) => {
                            if (uploadErr) {
                                console.error(`[SFTP Config Upload Error]`, uploadErr.message);
                                conn.end();
                                try { fsLib.unlinkSync(localArchivePath); } catch (e) {}
                                return;
                            }
                            console.log(`[SFTP Success] Config file transferred successfully.`);

                            console.log(`[SFTP Upload] Transferring frontend archive: ${localArchivePath} -> ${remoteArchivePath}`);
                            sftp.fastPut(localArchivePath, remoteArchivePath, {}, (archiveUploadErr) => {
                                try { fsLib.unlinkSync(localArchivePath); } catch (e) {}
                                if (archiveUploadErr) {
                                    console.error(`[SFTP Archive Upload Error]`, archiveUploadErr.message);
                                    conn.end();
                                    return;
                                }
                                console.log(`[SFTP Success] Frontend archive transferred.`);

                                // Phase 2: Execute remote linkage and Nginx reload commands
                                console.log(`[SSH2 Process] Configuring Nginx and deploying frontend on remote host...`);
                                const deployCmds = [
                                    `sudo mkdir -p /var/www/admin-frontend/dist`,
                                    `sudo tar -xzf ${remoteArchivePath} -C /var/www/admin-frontend/dist`,
                                    `sudo rm -f ${remoteArchivePath}`,
                                    `sudo chmod -R 755 /var/www/admin-frontend`,
                                    `sudo mv -f ${remoteTempPath} ${destPath}`,
                                    `sudo ln -sf ${destPath} ${linkPath}`,
                                    `sudo nginx -t`,
                                    `sudo nginx -s reload`,
                                    `sudo certbot --nginx ${certbotDomains} --non-interactive --agree-tos -m admin@storify.com --redirect`,
                                    `sudo nginx -s reload`
                                ].join(' && ');

                                conn.exec(deployCmds, (execErr, stream) => {
                                    if (execErr) {
                                        console.error(`[SSH2 Exec Error]`, execErr.message);
                                        conn.end();
                                        return;
                                    }

                                    let stdoutData = '';
                                    let stderrData = '';

                                    stream.on('close', (code, signal) => {
                                        console.log(`[SSH2 Command Finish] Exit code: ${code}`);
                                        conn.end();
                                        
                                        // Delete local temporary files after successful execution
                                        try {
                                            fsLib.unlinkSync(localTempPath);
                                            console.log(`[Cleanup] Deleted local temporary config file.`);
                                        } catch (cleanupErr) {
                                            console.log(`[Cleanup Warning] Local files cleanup skipped:`, cleanupErr.message);
                                        }

                                        if (code !== 0) {
                                            console.error(`[Deployment Error - STEP FAILED]`);
                                            console.error(`[Deployment Stderr Output]:\n`, stderrData);
                                            return;
                                        }
                                        console.log(`[Deployment Success - COMPLETE] Output:\n`, stdoutData);
                                        if (stderrData) {
                                            console.log(`[Deployment Warnings/Info]:\n`, stderrData);
                                        }
                                    }).on('data', (data) => {
                                        stdoutData += data.toString();
                                    });
                                    
                                    if (stream && stream.stderr) {
                                        stream.stderr.on('data', (data) => {
                                            stderrData += data.toString();
                                        });
                                    }
                                });
                            });
                        });
                    });
                }).on('error', (connErr) => {
                    console.error(`[SSH2 Connection Error] Failed to connect to ${serverIp}:`, connErr.message);
                    try {
                        fsLib.unlinkSync(localTempPath);
                    } catch (err) {}
                }).connect({
                    host: serverIp,
                    port: 22,
                    username: sshUser,
                    password: sshPass,
                    readyTimeout: 20000
                });
            }).catch(buildErr => {
                console.error(`[Remote SSH Deployment Blocked] Build failed:`, buildErr.message);
            });
        }

        res.status(200).json({
            success: true,
            message: `Store config created and deployment initialized for ${domain}.`,
            store
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Unpublish store from custom domain
// @route   PUT /api/stores/:id/domain/unpublish
// @access  Private/Merchant
export const unpublishStoreDomain = async (req, res) => {
    try {
        const store = await Store.findOne({ _id: req.params.id, merchantId: req.merchant._id });
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        store.domainPublished = false;
        await store.save();

        res.status(200).json({
            success: true,
            message: 'Store unpublished from custom domain',
            store
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Check custom domain DNS records
// @route   GET /api/stores/domain/dns-check
// @access  Private/Merchant
export const checkDomainDNS = async (req, res) => {
    try {
        const { domain } = req.query;
        if (!domain) {
            return res.status(400).json({ success: false, message: 'Domain parameter is required' });
        }

        // Clean protocol, www, and paths
        let cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split(':')[0];

        let settings = await PlatformSetting.findOne();
        if (!settings) {
            settings = await PlatformSetting.create({});
        }
        const expectedIP = settings.expectedStoreIP;

        dns.resolve4(cleanDomain, (err, addresses) => {
            if (err) {
                // Fallback to system dns.lookup (matches ping behavior)
                dns.lookup(cleanDomain, { all: true, family: 4 }, (lookupErr, lookupAddresses) => {
                    if (lookupErr) {
                        return res.status(200).json({
                            success: true,
                            resolved: false,
                            message: 'Could not resolve domain. Verify DNS settings or registrar details.',
                            addresses: [],
                            expectedIP
                        });
                    }

                    const ips = lookupAddresses.map(addr => addr.address);
                    const isLinked = ips.includes(expectedIP);
                    return res.status(200).json({
                        success: true,
                        resolved: true,
                        isLinked,
                        addresses: ips,
                        expectedIP
                    });
                });
                return;
            }

            const isLinked = addresses.includes(expectedIP);
            res.status(200).json({
                success: true,
                resolved: true,
                isLinked,
                addresses,
                expectedIP
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get platform settings
// @route   GET /api/stores/admin/settings
// @access  Private/Admin
export const getPlatformSettings = async (req, res) => {
    try {
        let settings = await PlatformSetting.findOne();
        if (!settings) {
            settings = await PlatformSetting.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update platform settings
// @route   PUT /api/stores/admin/settings
// @access  Private/Admin
export const updatePlatformSettings = async (req, res) => {
    try {
        let settings = await PlatformSetting.findOne();
        if (!settings) {
            settings = new PlatformSetting();
        }
        const { expectedStoreIP, sshUser, sshPassword, platformName, supportEmail, adminEmail, maxStoresPerMerchant, trialDays, defaultCurrency, maintenanceMode, availablePaymentGateways, shiprocketEnabled } = req.body;

        if (expectedStoreIP !== undefined) settings.expectedStoreIP = expectedStoreIP.trim();
        if (sshUser !== undefined) settings.sshUser = sshUser.trim();
        if (sshPassword !== undefined) settings.sshPassword = sshPassword.trim();
        if (platformName !== undefined) settings.platformName = platformName;
        if (supportEmail !== undefined) settings.supportEmail = supportEmail;
        if (adminEmail !== undefined) settings.adminEmail = adminEmail;
        if (maxStoresPerMerchant !== undefined) settings.maxStoresPerMerchant = Number(maxStoresPerMerchant);
        if (trialDays !== undefined) settings.trialDays = Number(trialDays);
        if (defaultCurrency !== undefined) settings.defaultCurrency = defaultCurrency;
        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
        if (availablePaymentGateways !== undefined) {
            const allowed = ['razorpay', 'stripe', 'payu', 'cashfree'];
            settings.availablePaymentGateways = (Array.isArray(availablePaymentGateways) ? availablePaymentGateways : [])
                .map((g) => String(g).toLowerCase())
                .filter((g) => allowed.includes(g));
        }
        if (shiprocketEnabled !== undefined) {
            settings.shiprocketEnabled = Boolean(shiprocketEnabled);
        }

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get expected store A-record IP for DNS settings
// @route   GET /api/stores/domain/expected-ip
// @access  Private/Merchant
export const getExpectedIP = async (req, res) => {
    try {
        let settings = await PlatformSetting.findOne();
        if (!settings) {
            settings = await PlatformSetting.create({});
        }
        res.json({ success: true, expectedIP: settings.expectedStoreIP });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
