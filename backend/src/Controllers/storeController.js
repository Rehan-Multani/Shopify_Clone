import Store from '../Models/Store.js';
import Merchant from '../Models/Merchant.js';

// @desc    Create a new store
// @route   POST /api/stores
// @access  Private/Merchant
export const createStore = async (req, res) => {
    try {
        const merchantId = req.merchant._id;
        const { storeName, storeDescription, contactEmail, contactPhone, address, city, state, pincode, storeLogo, storeBanner, socialLinks } = req.body;

        if (!storeName || !storeName.trim()) {
            return res.status(400).json({ message: 'Store name is required' });
        }

        const store = await Store.create({
            merchantId,
            storeName: storeName.trim(),
            storeDescription: storeDescription || '',
            contactEmail: contactEmail || req.merchant.email,
            contactPhone: contactPhone || req.merchant.mobile,
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
        const store = await Store.findOne({ _id: req.params.id, merchantId: req.merchant._id });
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

        const { storeName, storeDescription, contactEmail, contactPhone, address, city, state, pincode, storeLogo, storeBanner, socialLinks, isActive } = req.body;

        if (storeName !== undefined) store.storeName = storeName;
        if (storeDescription !== undefined) store.storeDescription = storeDescription;
        if (contactEmail !== undefined) store.contactEmail = contactEmail;
        if (contactPhone !== undefined) store.contactPhone = contactPhone;
        if (address !== undefined) store.address = address;
        if (city !== undefined) store.city = city;
        if (state !== undefined) store.state = state;
        if (pincode !== undefined) store.pincode = pincode;
        if (storeLogo !== undefined) store.storeLogo = storeLogo;
        if (storeBanner !== undefined) store.storeBanner = storeBanner;
        if (socialLinks !== undefined) store.socialLinks = socialLinks;
        if (isActive !== undefined) store.isActive = isActive;

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
// @route   GET /api/stores/all
// @access  Private/Admin
export const getAllStores = async (req, res) => {
    try {
        const stores = await Store.find({}).populate('merchantId', 'name email mobile').sort({ createdAt: -1 });
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
