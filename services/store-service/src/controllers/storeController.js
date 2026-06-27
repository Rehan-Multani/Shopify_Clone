import Store from '../models/Store.js';
import Merchant from '../models/Merchant.js';
import PlatformSetting from '../models/PlatformSetting.js';
import dns from 'dns';

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
        const { storeName, storeDescription, contactEmail, contactPhone, address, city, state, pincode, storeLogo, storeBanner, socialLinks } = req.body;

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
            socialLinks: socialLinks || {}
        });

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
        res.json(store);
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

        const { storeName, storeDescription, contactEmail, contactPhone, address, city, state, pincode, storeLogo, storeBanner, socialLinks, isActive, paymentSettings } = req.body;

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

        const store = await Store.findOne({ customDomain: cleanDomain, isActive: true });
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
        const { expectedStoreIP, platformName, supportEmail, adminEmail, maxStoresPerMerchant, trialDays, defaultCurrency, maintenanceMode } = req.body;
        
        if (expectedStoreIP !== undefined) settings.expectedStoreIP = expectedStoreIP.trim();
        if (platformName !== undefined) settings.platformName = platformName;
        if (supportEmail !== undefined) settings.supportEmail = supportEmail;
        if (adminEmail !== undefined) settings.adminEmail = adminEmail;
        if (maxStoresPerMerchant !== undefined) settings.maxStoresPerMerchant = Number(maxStoresPerMerchant);
        if (trialDays !== undefined) settings.trialDays = Number(trialDays);
        if (defaultCurrency !== undefined) settings.defaultCurrency = defaultCurrency;
        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;

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
