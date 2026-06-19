import Category from '../Models/Category.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// @desc    Get all categories for logged-in merchant
// @route   GET /api/categories
// @access  Private/Merchant
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ merchant: req.merchant._id }).sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Merchant
export const createCategory = async (req, res) => {
    try {
        const { name, image, description, isActive } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // Check for duplicate name within this merchant
        const existing = await Category.findOne({ merchant: req.merchant._id, name: name.trim() });
        if (existing) {
            return res.status(400).json({ message: 'A category with this name already exists' });
        }

        const category = await Category.create({
            merchant: req.merchant._id,
            name: name.trim(),
            image: image || '',
            description: description || '',
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Merchant
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, merchant: req.merchant._id });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const { name, image, description, isActive } = req.body;

        // If name is changing, check for duplicates
        if (name && name.trim() !== category.name) {
            const existing = await Category.findOne({
                merchant: req.merchant._id,
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

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Merchant
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, merchant: req.merchant._id });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await Category.deleteOne({ _id: category._id });
        res.json({ message: 'Category removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload category image
// @route   POST /api/categories/upload
// @access  Private/Merchant
export const uploadCategoryImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image file' });
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
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
