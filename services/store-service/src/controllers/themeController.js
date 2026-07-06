import Store from '../models/Store.js';
import StorePage from '../models/StorePage.js';
import { DEFAULT_HOME_SECTIONS } from '../data/defaultSections.js';
import path from 'path';
import fs from 'fs';

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

/**
 * @desc    Get active theme settings and schema
 * @route   GET /api/themes/settings
 * @access  Private (Merchant)
 */
export const getThemeSettings = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID header is missing' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const themeId = req.query.themeId || req.headers['x-theme-id'];
        const active = store.activeTheme;
        const targetThemeId = themeId || (active ? active.themeId : '');

        if (!targetThemeId) {
            return res.status(200).json({
                success: true,
                theme: {},
                schema: { sections: [] }
            });
        }

        const installed = store.installedThemes.find(t => t.themeId === targetThemeId);
        if (!installed) {
            return res.status(404).json({ success: false, message: 'Theme settings not found' });
        }

        // Load schema.json dynamically from theme folder
        let themesDir = path.resolve(process.cwd(), '..', 'themes');
        if (!fs.existsSync(themesDir)) {
            themesDir = path.resolve(process.cwd(), '..', '..', 'themes');
        }
        const schemaPath = path.join(themesDir, installed.folder || '', 'schema.json');
        const schema = readJsonFile(schemaPath) || { sections: [] };

        res.status(200).json({
            success: true,
            theme: installed || {},
            schema
        });
    } catch (error) {
        console.error('[ThemeController] Error fetching settings:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Update draft theme settings
 * @route   PUT /api/themes/settings
 * @access  Private (Merchant)
 */
export const updateThemeSettings = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID header is missing' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const themeId = req.query.themeId || req.headers['x-theme-id'];
        const activeId = themeId || (store.activeTheme ? store.activeTheme.themeId : '');

        if (!activeId) {
            return res.status(400).json({ success: false, message: 'No theme specified to customize' });
        }

        const themeIndex = store.installedThemes.findIndex(t => t.themeId === activeId);

        if (themeIndex === -1) {
            return res.status(404).json({ success: false, message: 'Theme settings record not found' });
        }

        // Merge customized settings into draftThemeSettings
        store.installedThemes[themeIndex].draftThemeSettings = {
            ...store.installedThemes[themeIndex].draftThemeSettings,
            ...req.body
        };

        store.markModified('installedThemes');
        await store.save();

        res.status(200).json({
            success: true,
            message: 'Draft settings saved successfully',
            theme: store.installedThemes[themeIndex]
        });
    } catch (error) {
        console.error('[ThemeController] Error updating settings:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Publish draft theme settings to live website settings
 * @route   POST /api/themes/publish
 * @access  Private (Merchant)
 */
export const publishThemeSettings = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID header is missing' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const themeId = req.query.themeId || req.headers['x-theme-id'];
        const activeId = themeId || (store.activeTheme ? store.activeTheme.themeId : '');

        if (!activeId) {
            return res.status(400).json({ success: false, message: 'No theme specified to publish' });
        }

        const themeIndex = store.installedThemes.findIndex(t => t.themeId === activeId);

        if (themeIndex === -1) {
            return res.status(404).json({ success: false, message: 'Theme settings record not found' });
        }

        // Copy draft settings to published settings
        store.installedThemes[themeIndex].publishedThemeSettings = JSON.parse(
            JSON.stringify(store.installedThemes[themeIndex].draftThemeSettings)
        );

        store.markModified('installedThemes');
        await store.save();

        res.status(200).json({
            success: true,
            message: 'Theme settings published successfully!',
            theme: store.installedThemes[themeIndex]
        });
    } catch (error) {
        console.error('[ThemeController] Error publishing settings:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Install/activate a theme for a merchant store
 * @route   POST /api/themes/install
 * @access  Private (Merchant)
 */
export const installTheme = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        const { themeId, folder, version } = req.body;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID header is missing' });
        }
        if (!themeId || !folder || !version) {
            return res.status(400).json({ success: false, message: 'themeId, folder, and version are required' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Read physical folder JSONs
        let themesDir = path.resolve(process.cwd(), '..', 'themes');
        if (!fs.existsSync(themesDir)) {
            themesDir = path.resolve(process.cwd(), '..', '..', 'themes');
        }
        const defaultSettingsPath = path.join(themesDir, folder, 'defaultSettings.json');
        
        const defaultSettings = readJsonFile(defaultSettingsPath) || {};

        // Check if theme is already installed in installedThemes history
        let themeIndex = store.installedThemes.findIndex(t => t.themeId === themeId);

        if (themeIndex === -1) {
            // New installation: initialize draft and published settings from defaultSettings
            store.installedThemes.push({
                themeId,
                folder,
                version,
                draftThemeSettings: defaultSettings,
                publishedThemeSettings: defaultSettings,
                installedAt: new Date()
            });
            themeIndex = store.installedThemes.length - 1;
        } else {
            // Already installed: activate it and optionally keep existing configs,
            // or reset settings. We will keep current customizations if they exist, or fallback to defaults.
            store.installedThemes[themeIndex].folder = folder;
            store.installedThemes[themeIndex].version = version;
        }

        // Set pointer as activeTheme
        store.activeTheme = {
            themeId,
            folder,
            version,
            installedAt: new Date()
        };

        store.markModified('installedThemes');
        store.markModified('activeTheme');
        await store.save();

        // Load homepage index layout sections if they exist in theme folder
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

        if (loadedSections.length === 0) {
            loadedSections = DEFAULT_HOME_SECTIONS.map((sec, idx) => ({
                ...sec,
                sectionId: Math.random().toString(36).substr(2, 9),
                order: idx + 1
            }));
        }

        // Update or create home page for this theme
        let homePage = await StorePage.findOne({ storeId, slug: 'home', themeId });
        if (homePage) {
            homePage.sections = loadedSections;
            await homePage.save();
        } else {
            await StorePage.create({
                merchantId: store.merchantId || store.merchant || store._id,
                storeId,
                themeId,
                slug: 'home',
                title: 'Home Page',
                isHomePage: true,
                sections: loadedSections,
                visibility: 'published'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Theme installed and activated successfully',
            activeTheme: store.activeTheme,
            theme: store.installedThemes[themeIndex]
        });
    } catch (error) {
        console.error('[ThemeController] Error installing theme:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get Theme Store published themes
 * @route   GET /api/theme-store
 * @access  Private (Merchant)
 */
export const getThemeStore = async (req, res) => {
    try {
        // Fetch registered themes from merchant-admin-service on port 5002
        const response = await fetch('http://localhost:5002/api/admin/themes');
        const json = await response.json();

        if (response.ok && json.success) {
            // Only return themes that are published
            const publishedThemes = json.data.filter(theme => theme.status === 'published');
            return res.status(200).json({
                success: true,
                count: publishedThemes.length,
                data: publishedThemes
            });
        }

        res.status(response.status).json({
            success: false,
            message: json.message || 'Failed to fetch themes from admin'
        });
    } catch (error) {
        console.error('[ThemeController] Error fetching theme store:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
