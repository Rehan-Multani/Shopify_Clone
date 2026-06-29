import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// @desc    Get all products for logged-in merchant/vendor or active store
// @route   GET /api/products
// @access  Private/Merchant/Vendor (Header-based)
export const getProducts = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID is required' });
        }
        
        let filter;
        if (req.merchant) {
            filter = { merchant: req.merchant._id, store: storeId };
        } else if (req.vendor) {
            filter = { store: storeId, vendor: req.vendor._id };
        } else {
            filter = { store: storeId, isActive: true, isApproved: true };
        }

        const products = await Product.find(filter)
            .populate('category', 'name')
            .populate('vendor', 'name businessName')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Private/Merchant/Vendor (Header-based)
export const getProduct = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID is required' });
        }

        let filter;
        if (req.merchant) {
            filter = { _id: req.params.id, merchant: req.merchant._id, store: storeId };
        } else if (req.vendor) {
            filter = { _id: req.params.id, store: storeId, vendor: req.vendor._id };
        } else {
            filter = { _id: req.params.id, store: storeId, isActive: true, isApproved: true };
        }

        const product = await Product.findOne(filter)
            .populate('category', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Merchant/Vendor (Header-based)
export const createProduct = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const { name, images, description, brandName, sku, actualPrice, sellingPrice, category, stock, isActive, tags, weight, isFeatured } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Product name is required' });
        }

        if (actualPrice === undefined || sellingPrice === undefined) {
            return res.status(400).json({ message: 'Both actual price and selling price are required' });
        }

        // Check for duplicate SKU within this store (if SKU is provided)
        if (sku && sku.trim()) {
            const existingSku = await Product.findOne({ store: storeId, sku: sku.trim().toUpperCase() });
            if (existingSku) {
                return res.status(400).json({ message: 'A product with this SKU already exists' });
            }
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

        const product = await Product.create({
            merchant: merchantId,
            store: storeId,
            vendor: vendorId,
            isApproved,
            name: name.trim(),
            images: images || [],
            description: description || '',
            brandName: brandName || '',
            sku: sku ? sku.trim().toUpperCase() : '',
            actualPrice: Number(actualPrice),
            sellingPrice: Number(sellingPrice),
            category: category || null,
            stock: stock !== undefined ? Number(stock) : 0,
            isActive: req.vendor ? false : (isActive !== undefined ? isActive : true),
            tags: tags || [],
            weight: weight || '',
            isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false
        });

        const populatedProduct = await Product.findById(product._id).populate('category', 'name');
        res.status(201).json(populatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Merchant/Vendor (Header-based)
export const updateProduct = async (req, res) => {
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

        const product = await Product.findOne(filter);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { name, images, description, brandName, sku, actualPrice, sellingPrice, category, stock, isActive, tags, weight, isFeatured } = req.body;

        // Check for duplicate SKU (if SKU changed)
        if (sku && sku.trim() && sku.trim().toUpperCase() !== product.sku) {
            const existingSku = await Product.findOne({
                store: storeId,
                sku: sku.trim().toUpperCase(),
                _id: { $ne: product._id }
            });
            if (existingSku) {
                return res.status(400).json({ message: 'A product with this SKU already exists' });
            }
        }

        product.name = name !== undefined ? name.trim() : product.name;
        product.images = images !== undefined ? images : product.images;
        product.description = description !== undefined ? description : product.description;
        product.brandName = brandName !== undefined ? brandName : product.brandName;
        product.sku = sku !== undefined ? sku.trim().toUpperCase() : product.sku;
        product.actualPrice = actualPrice !== undefined ? Number(actualPrice) : product.actualPrice;
        product.sellingPrice = sellingPrice !== undefined ? Number(sellingPrice) : product.sellingPrice;
        product.category = category !== undefined ? (category === '' ? null : category) : product.category;
        product.stock = stock !== undefined ? Number(stock) : product.stock;
        product.isActive = isActive !== undefined ? isActive : product.isActive;
        product.tags = tags !== undefined ? tags : product.tags;
        product.weight = weight !== undefined ? weight : product.weight;
        product.isFeatured = isFeatured !== undefined ? Boolean(isFeatured) : product.isFeatured;

        // If updated by vendor, reset approval status
        if (req.vendor) {
            product.isApproved = false;
            product.isActive = false;
        }

        const updatedProduct = await product.save();
        const populatedProduct = await Product.findById(updatedProduct._id).populate('category', 'name');
        res.json(populatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Merchant/Vendor (Header-based)
export const deleteProduct = async (req, res) => {
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

        const product = await Product.findOne(filter);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a product
// @route   PUT /api/products/:id/approve
// @access  Private/Merchant
export const approveProduct = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        if (!req.merchant) {
            return res.status(403).json({ message: 'Only store admins can approve products' });
        }
        const product = await Product.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.isApproved = true;
        product.isActive = true;
        await product.save();
        res.json({ success: true, message: 'Product approved successfully', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload product images (up to 5)
// @route   POST /api/products/upload
// @access  Private/Merchant/Vendor
export const uploadProductImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Please upload image files' });
        }
        if (req.files.length > 5) {
            return res.status(400).json({ message: 'A maximum of 5 images can be uploaded' });
        }

        const uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const urls = [];
        for (const file of req.files) {
            const filename = `product-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`;
            const filepath = path.join(uploadDir, filename);

            await sharp(file.buffer)
                .resize(1000, 1000, { fit: 'cover', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(filepath);

            urls.push(`/uploads/${filename}`);
        }

        res.json({ urls });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Internal route to get product count for merchant or store
// @route   GET /api/products/internal/count
// @access  Internal
export const getProductCountInternal = async (req, res) => {
    try {
        const { storeId, merchantId } = req.query;
        let filter = {};
        if (storeId) {
            filter.store = storeId;
        } else if (merchantId) {
            filter.merchant = merchantId;
        }
        const count = await Product.countDocuments(filter);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
