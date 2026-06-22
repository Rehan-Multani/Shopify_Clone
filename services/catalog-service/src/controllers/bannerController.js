import Banner from '../models/Banner.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// @desc    Get all banners
// @route   GET /api/banners
export const getBanners = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const banners = await Banner.find({ merchant: req.merchant._id, store: storeId }).sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single banner
// @route   GET /api/banners/:id
export const getBanner = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const banner = await Banner.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a banner
// @route   POST /api/banners
export const createBanner = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const { title, image, isActive } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }
        if (!image) {
            return res.status(400).json({ message: 'Banner image is required' });
        }

        const banner = await Banner.create({
            merchant: req.merchant._id,
            store: storeId,
            title: title.trim(),
            image,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
export const updateBanner = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const banner = await Banner.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        const { title, image, isActive } = req.body;

        banner.title = title !== undefined ? title.trim() : banner.title;
        banner.image = image !== undefined ? image : banner.image;
        banner.isActive = isActive !== undefined ? isActive : banner.isActive;

        const updatedBanner = await banner.save();
        res.json(updatedBanner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
export const deleteBanner = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const banner = await Banner.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        await Banner.deleteOne({ _id: banner._id });
        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload banner image
// @route   POST /api/banners/upload
export const uploadBannerImage = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const file = req.files[0];
        const filename = `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
        const filepath = path.join(uploadDir, filename);

        // Banners are usually wide, resize appropriately, e.g. 1920 wide or keep ratio
        await sharp(file.buffer)
            .resize(1920, null, { withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(filepath);

        res.json({ url: `/uploads/${filename}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
