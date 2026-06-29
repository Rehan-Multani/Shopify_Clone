import Category from '../models/Category.js';
import Vendor from '../models/Vendor.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// @desc    Get all categories for logged-in merchant/vendor or active store
// @route   GET /api/categories
// @access  Private/Merchant/Vendor (Header-based)
export const getCategories = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID is required' });
        }

        let filter;
        if (req.merchant) {
            filter = { merchant: req.merchant._id, store: storeId };
        } else if (req.vendor) {
            if (req.query.all === 'true') {
                filter = { 
                    store: storeId, 
                    $or: [
                        { vendor: req.vendor._id },
                        { vendor: null, isActive: true, isApproved: true }
                    ]
                };
            } else {
                // Vendor should strictly see categories created by themselves, and not the admin's categories
                filter = { store: storeId, vendor: req.vendor._id };
            }
        } else {
            filter = { store: storeId, isActive: true, isApproved: true };
        }

        const categories = await Category.find(filter).populate('vendor', 'name businessName').sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Merchant/Vendor (Header-based)
export const createCategory = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const { name, image, description, isActive } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // Validate name contains only English characters, numbers, and common punctuation symbols
        const englishRegex = /^[a-zA-Z0-9\s\(\)\-\&\,\.\/\'\"]+$/;
        if (!englishRegex.test(name.trim())) {
            return res.status(400).json({ message: 'Category name must be written in English' });
        }

        // Validate category image URL/path if provided
        if (image && typeof image === 'string' && image.trim() !== '') {
            const isValidUrl = image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/') || image.startsWith('/');
            if (!isValidUrl) {
                return res.status(400).json({ message: 'Category image must be a valid URL or path' });
            }
        }

        // Check for duplicate name within this store
        const existing = await Category.findOne({ store: storeId, name: name.trim() });
        if (existing) {
            return res.status(400).json({ message: 'A category with this name already exists' });
        }

        let merchantId;
        let isApproved = true;
        let vendorId = null;

        if (req.merchant) {
            merchantId = req.merchant._id;
        } else if (req.vendor) {
            const vendorProfile = await Vendor.findById(req.vendor._id);
            if (!vendorProfile) {
                return res.status(404).json({ message: 'Vendor not found' });
            }
            merchantId = vendorProfile.merchant;
            isApproved = false; // Requires approval from the store admin
            vendorId = req.vendor._id;
        } else {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const category = await Category.create({
            merchant: merchantId,
            store: storeId,
            vendor: vendorId,
            isApproved,
            name: name.trim(),
            image: image || '',
            description: description || '',
            isActive: req.vendor ? false : (isActive !== undefined ? isActive : true)
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Merchant/Vendor (Header-based)
export const updateCategory = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }

        let filter;
        if (req.merchant) {
            filter = { _id: req.params.id, merchant: req.merchant._id, store: storeId };
        } else if (req.vendor) {
            filter = { _id: req.params.id, store: storeId, vendor: req.vendor._id };
        } else {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const category = await Category.findOne(filter);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const { name, image, description, isActive } = req.body;

        // Validate name contains only English characters, numbers, and common punctuation symbols if provided
        if (name !== undefined) {
            if (!name || !name.trim()) {
                return res.status(400).json({ message: 'Category name is required' });
            }
            const englishRegex = /^[a-zA-Z0-9\s\(\)\-\&\,\.\/\'\"]+$/;
            if (!englishRegex.test(name.trim())) {
                return res.status(400).json({ message: 'Category name must be written in English' });
            }
        }

        // Validate category image URL/path if provided
        if (image !== undefined && image && typeof image === 'string' && image.trim() !== '') {
            const isValidUrl = image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/') || image.startsWith('/');
            if (!isValidUrl) {
                return res.status(400).json({ message: 'Category image must be a valid URL or path' });
            }
        }

        // If name is changing, check for duplicates
        if (name && name.trim() !== category.name) {
            const existing = await Category.findOne({
                store: storeId,
                name: name.trim(),
                _id: { $ne: category._id }
            });
            if (existing) {
                return res.status(400).json({ message: 'A category with this name already exists' });
            }
        }

        category.name = name !== undefined ? name.trim() : category.name;
        category.image = image !== undefined ? image : category.image;
        category.description = description !== undefined ? description : category.description;
        category.isActive = isActive !== undefined ? isActive : category.isActive;

        // If updated by vendor, reset approval status
        if (req.vendor) {
            category.isApproved = false;
            category.isActive = false;
        }

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Merchant/Vendor (Header-based)
export const deleteCategory = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }

        let filter;
        if (req.merchant) {
            filter = { _id: req.params.id, merchant: req.merchant._id, store: storeId };
        } else if (req.vendor) {
            filter = { _id: req.params.id, store: storeId, vendor: req.vendor._id };
        } else {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const category = await Category.findOne(filter);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await Category.deleteOne({ _id: category._id });
        res.json({ message: 'Category removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a category
// @route   PUT /api/categories/:id/approve
// @access  Private/Merchant
export const approveCategory = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        if (!req.merchant) {
            return res.status(403).json({ message: 'Only store admins can approve categories' });
        }
        const category = await Category.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.isApproved = true;
        category.isActive = true;
        await category.save();
        res.json({ success: true, message: 'Category approved successfully', category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload category image
// @route   POST /api/categories/upload
// @access  Private/Merchant/Vendor
export const uploadCategoryImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image file' });
        }

        const uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `category-${Date.now()}.webp`;
        const filepath = path.join(uploadDir, filename);

        await sharp(req.file.buffer)
            .resize(800, 800, { fit: 'cover', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(filepath);

        res.json({ url: `/uploads/${filename}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
