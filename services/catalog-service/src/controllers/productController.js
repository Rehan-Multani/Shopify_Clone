import Product from '../models/Product.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// @desc    Get all products for logged-in merchant
// @route   GET /api/products
// @access  Private/Merchant (Header-based)
export const getProducts = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const products = await Product.find({ merchant: req.merchant._id, store: storeId })
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Private/Merchant (Header-based)
export const getProduct = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const product = await Product.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId })
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
// @access  Private/Merchant (Header-based)
export const createProduct = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const { name, images, description, brandName, sku, actualPrice, sellingPrice, category, stock, isActive, tags, weight } = req.body;

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

        const product = await Product.create({
            merchant: req.merchant._id,
            store: storeId,
            name: name.trim(),
            images: images || [],
            description: description || '',
            brandName: brandName || '',
            sku: sku ? sku.trim().toUpperCase() : '',
            actualPrice: Number(actualPrice),
            sellingPrice: Number(sellingPrice),
            category: category || null,
            stock: stock !== undefined ? Number(stock) : 0,
            isActive: isActive !== undefined ? isActive : true,
            tags: tags || [],
            weight: weight || ''
        });

        const populatedProduct = await Product.findById(product._id).populate('category', 'name');
        res.status(201).json(populatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Merchant (Header-based)
export const updateProduct = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const product = await Product.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const { name, images, description, brandName, sku, actualPrice, sellingPrice, category, stock, isActive, tags, weight } = req.body;

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

        const updatedProduct = await product.save();
        const populatedProduct = await Product.findById(updatedProduct._id).populate('category', 'name');
        res.json(populatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Merchant (Header-based)
export const deleteProduct = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const product = await Product.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload product images (up to 5)
// @route   POST /api/products/upload
// @access  Private/Merchant (Header-based)
export const uploadProductImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one image' });
        }

        const uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const urls = [];
        for (const file of req.files) {
            const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
            const filepath = path.join(uploadDir, filename);

            await sharp(file.buffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 85 })
                .toFile(filepath);

            urls.push(`/uploads/${filename}`);
        }

        res.json({ urls });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get total count of products in a store (internal API)
// @route   GET /api/products/internal/count
// @access  Internal
export const getProductCountInternal = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        const merchantId = req.headers['x-merchant-id'] || req.query.merchantId;
        
        let query = {};
        if (storeId) {
            query.store = storeId;
        } else if (merchantId) {
            query.merchant = merchantId;
        } else {
            return res.status(400).json({ message: 'Either store ID or merchant ID is required' });
        }
        
        const count = await Product.countDocuments(query);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
