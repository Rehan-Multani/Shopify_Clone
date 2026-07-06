import Theme from '../models/Theme.js';
import themeService from '../services/themeService.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * @desc    Get all registered themes (filterable by status)
 * @route   GET /api/admin/themes
 * @access  Public
 */
export const getThemes = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        const themes = await Theme.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: themes.length,
            data: themes
        });
    } catch (err) {
        console.error('[ThemeController] Error fetching themes:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch themes',
            error: err.message
        });
    }
};

/**
 * @desc    Get a single registered theme by ID
 * @route   GET /api/admin/themes/:id
 * @access  Public
 */
export const getThemeById = async (req, res) => {
    try {
        const theme = await Theme.findById(req.params.id);

        if (!theme) {
            return res.status(404).json({
                success: false,
                message: `Theme with id "${req.params.id}" not found`
            });
        }

        res.status(200).json({
            success: true,
            data: theme
        });
    } catch (err) {
        console.error('[ThemeController] Error fetching theme:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch theme',
            error: err.message
        });
    }
};

/**
 * @desc    Get list of physical theme folder names (auto-scanned)
 * @route   GET /api/admin/themes/folders
 * @access  Private/MasterAdmin
 */
export const getThemeFolders = async (req, res) => {
    try {
        const folders = themeService.getAvailableFolders();
        res.status(200).json({
            success: true,
            data: folders
        });
    } catch (err) {
        console.error('[ThemeController] Error listing folders:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to list theme folders',
            error: err.message
        });
    }
};

/**
 * @desc    Get manifest details for a folder
 * @route   GET /api/admin/themes/folders/:folder/manifest
 * @access  Private/MasterAdmin
 */
export const getFolderManifest = async (req, res) => {
    try {
        const manifest = themeService.getManifest(req.params.folder);
        if (!manifest) {
            return res.status(404).json({
                success: false,
                message: `Manifest not found for folder "${req.params.folder}"`
            });
        }
        res.status(200).json({
            success: true,
            data: manifest
        });
    } catch (err) {
        console.error('[ThemeController] Error fetching folder manifest:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch manifest',
            error: err.message
        });
    }
};

/**
 * @desc    Register a new built-in theme to the database
 * @route   POST /api/admin/themes
 * @access  Private/MasterAdmin
 */
export const registerTheme = async (req, res) => {
    try {
        const {
            folder,
            displayName,
            type,
            price,
            industry,
            thumbnail,
            previewImages,
            shortDescription,
            longDescription,
            features,
            status,
            visibility,
            version,
            themeName
        } = req.body;

        // Check if folder is already registered
        const existing = await Theme.findOne({ folder });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Theme folder "${folder}" is already registered`
            });
        }

        const theme = new Theme({
            folder,
            themeName,
            displayName,
            type,
            price: type === 'free' ? 0 : price,
            industry,
            thumbnail,
            previewImages: previewImages || [],
            shortDescription,
            longDescription,
            features: features || [],
            status: status || 'draft',
            visibility: visibility || 'visible',
            version
        });

        const savedTheme = await theme.save();

        res.status(201).json({
            success: true,
            data: savedTheme
        });
    } catch (err) {
        console.error('[ThemeController] Error registering theme:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to register theme',
            error: err.message
        });
    }
};

/**
 * @desc    Update a registered theme
 * @route   PUT /api/admin/themes/:id
 * @access  Private/MasterAdmin
 */
export const updateTheme = async (req, res) => {
    try {
        const {
            displayName,
            type,
            price,
            industry,
            thumbnail,
            previewImages,
            shortDescription,
            longDescription,
            features,
            status,
            visibility,
            version
        } = req.body;

        const theme = await Theme.findById(req.params.id);
        if (!theme) {
            return res.status(404).json({
                success: false,
                message: `Theme with id "${req.params.id}" not found`
            });
        }

        theme.displayName = displayName !== undefined ? displayName : theme.displayName;
        theme.type = type !== undefined ? type : theme.type;
        theme.price = type === 'free' ? 0 : (price !== undefined ? price : theme.price);
        theme.industry = industry !== undefined ? industry : theme.industry;
        theme.thumbnail = thumbnail !== undefined ? thumbnail : theme.thumbnail;
        theme.previewImages = previewImages !== undefined ? previewImages : theme.previewImages;
        theme.shortDescription = shortDescription !== undefined ? shortDescription : theme.shortDescription;
        theme.longDescription = longDescription !== undefined ? longDescription : theme.longDescription;
        theme.features = features !== undefined ? features : theme.features;
        theme.status = status !== undefined ? status : theme.status;
        theme.visibility = visibility !== undefined ? visibility : theme.visibility;
        theme.version = version !== undefined ? version : theme.version;

        const updatedTheme = await theme.save();

        res.status(200).json({
            success: true,
            data: updatedTheme
        });
    } catch (err) {
        console.error('[ThemeController] Error updating theme:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update theme',
            error: err.message
        });
    }
};

/**
 * @desc    Delete a theme registration
 * @route   DELETE /api/admin/themes/:id
 * @access  Private/MasterAdmin
 */
export const deleteTheme = async (req, res) => {
    try {
        const theme = await Theme.findById(req.params.id);
        if (!theme) {
            return res.status(404).json({
                success: false,
                message: `Theme with id "${req.params.id}" not found`
            });
        }

        await Theme.deleteOne({ _id: theme._id });

        res.status(200).json({
            success: true,
            message: 'Theme registration deleted successfully'
        });
    } catch (err) {
        console.error('[ThemeController] Error deleting theme:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete theme',
            error: err.message
        });
    }
};

/**
 * @desc    Upload theme thumbnail image
 * @route   POST /api/admin/themes/upload
 * @access  Private/MasterAdmin
 */
export const uploadThemeThumbnail = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file' });
        }

        const uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `theme-thumbnail-${Date.now()}.webp`;
        const filepath = path.join(uploadDir, filename);

        await sharp(req.file.buffer)
            .resize(800, 600, { fit: 'cover', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(filepath);

        res.status(200).json({
            success: true,
            url: `/uploads/${filename}`
        });
    } catch (error) {
        console.error('[ThemeController] Error uploading theme thumbnail:', error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

