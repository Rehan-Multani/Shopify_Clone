import Store from '../models/Store.js';
import StorePage from '../models/StorePage.js';
import { DEFAULT_HOME_SECTIONS } from '../data/defaultSections.js';
import { sanitizeThemeSettings } from '../utils/themeValidation.js';
import {
    compareSemver,
    migrateThemeConfig,
    listMigrations,
    withThemeVersionMeta,
} from '../utils/themeMigration.js';
import { buildUpgradeImpactReport } from '../utils/migrationImpact.js';
import { mintPreviewToken, revokePreviewToken, checkPreviewTokenRateLimit } from '../utils/previewToken.js';
import ThemeAnalyticsEvent from '../models/ThemeAnalyticsEvent.js';
import { recordThemeAudit } from '../utils/themeAudit.js';
import { requireOwnedStore } from '../utils/storeAccess.js';
import path from 'path';
import fs from 'fs';

const denyUnlessOwned = async (req, res, storeId) => {
    const access = await requireOwnedStore(req, storeId);
    if (!access.ok) {
        res.status(access.status).json({ success: false, message: access.message });
        return null;
    }
    return access.store;
};

const recordThemeLifecycleEvent = async ({ storeId, themeId, themeVersion, eventType, meta = {} }) => {
    try {
        await ThemeAnalyticsEvent.create({
            storeId,
            themeId: String(themeId || '').slice(0, 120),
            themeVersion: String(themeVersion || '').slice(0, 40),
            eventType,
            meta,
        });
    } catch (err) {
        console.error('[ThemeAnalytics] lifecycle:', err.message);
    }
};

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
        const store = await denyUnlessOwned(req, res, storeId);
        if (!store) return;

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
        const store = await denyUnlessOwned(req, res, storeId);
        if (!store) return;

        const themeId = req.query.themeId || req.headers['x-theme-id'];
        const activeId = themeId || (store.activeTheme ? store.activeTheme.themeId : '');

        if (!activeId) {
            return res.status(400).json({ success: false, message: 'No theme specified to customize' });
        }

        const themeIndex = store.installedThemes.findIndex(t => t.themeId === activeId);

        if (themeIndex === -1) {
            return res.status(404).json({ success: false, message: 'Theme settings record not found' });
        }

        // Merge customized settings into draftThemeSettings (sanitized)
        const cleanBody = sanitizeThemeSettings(req.body || {});
        store.installedThemes[themeIndex].draftThemeSettings = {
            ...store.installedThemes[themeIndex].draftThemeSettings,
            ...cleanBody
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
        const store = await denyUnlessOwned(req, res, storeId);
        if (!store) return;

        const themeId = req.query.themeId || req.headers['x-theme-id'];
        const activeId = themeId || (store.activeTheme ? store.activeTheme.themeId : '');

        if (!activeId) {
            return res.status(400).json({ success: false, message: 'No theme specified to publish' });
        }

        const themeIndex = store.installedThemes.findIndex(t => t.themeId === activeId);

        if (themeIndex === -1) {
            return res.status(404).json({ success: false, message: 'Theme settings record not found' });
        }

        const install = store.installedThemes[themeIndex];
        const homePage = await StorePage.findOne({
            storeId,
            slug: 'home',
            themeId: activeId,
        });

        // Snapshot current published for rollback before promoting draft
        store.previousPublishedTheme = {
            themeId: store.activeTheme?.themeId || activeId,
            folder: store.activeTheme?.folder || install.folder || '',
            version: store.activeTheme?.version || install.version || '',
            snapshotAt: new Date(),
        };
        store.previousPublishedConfig = {
            themeId: activeId,
            themeSettings: JSON.parse(JSON.stringify(install.publishedThemeSettings || {})),
            homeSections: homePage
                ? JSON.parse(JSON.stringify(
                    (homePage.publishedSections && homePage.publishedSections.length)
                        ? homePage.publishedSections
                        : (homePage.sections || [])
                ))
                : null,
        };

        // Copy draft settings to published settings
        store.installedThemes[themeIndex].publishedThemeSettings = JSON.parse(
            JSON.stringify(store.installedThemes[themeIndex].draftThemeSettings)
        );

        // Promote pending theme pointer to live if set
        if (store.pendingTheme?.themeId && String(store.pendingTheme.themeId) === String(activeId)) {
            store.activeTheme = {
                themeId: store.pendingTheme.themeId,
                folder: store.pendingTheme.folder || install.folder,
                version: store.pendingTheme.version || install.version,
                installedAt: new Date(),
            };
            store.pendingTheme = { themeId: '', folder: '', version: '', mode: '', preparedAt: undefined };
        } else {
            store.activeTheme = {
                themeId: activeId,
                folder: install.folder,
                version: install.version
                    || install.draftThemeSettings?.themeVersion
                    || install.publishedThemeSettings?.themeVersion
                    || store.activeTheme?.version
                    || '1.0.0',
                installedAt: store.activeTheme?.installedAt || new Date(),
            };
        }

        store.markModified('installedThemes');
        store.markModified('activeTheme');
        store.markModified('previousPublishedTheme');
        store.markModified('previousPublishedConfig');
        store.markModified('pendingTheme');
        await store.save();

        await recordThemeLifecycleEvent({
            storeId,
            themeId: activeId,
            themeVersion: store.activeTheme?.version || install.version || '',
            eventType: 'theme_published',
            meta: { folder: store.activeTheme?.folder || install.folder || '' },
        });
        await recordThemeAudit({
            storeId,
            actorId: req.merchant?._id,
            action: 'THEME_PUBLISHED',
            themeId: activeId,
            themeVersion: store.activeTheme?.version || install.version || '',
            metadata: { folder: store.activeTheme?.folder || install.folder || '' },
        });

        res.status(200).json({
            success: true,
            message: 'Theme settings published successfully!',
            theme: store.installedThemes[themeIndex],
            activeTheme: store.activeTheme,
            previousPublishedTheme: store.previousPublishedTheme,
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
        // library = add only | draft = prepare pending (not live) | live = legacy activate now
        const mode = String(req.body.mode || req.body.activateMode || 'draft').toLowerCase();

        if (!themeId || !folder || !version) {
            return res.status(400).json({ success: false, message: 'themeId, folder, and version are required' });
        }

        const store = await denyUnlessOwned(req, res, storeId);
        if (!store) return;

        // Gate premium themes — require a paid ThemePurchase record
        try {
            const merchantAdminUrl = process.env.MERCHANT_ADMIN_SERVICE_URL || 'http://localhost:5002';
            const themeRes = await fetch(`${merchantAdminUrl}/api/admin/themes/${themeId}`);
            if (themeRes.ok) {
                const themeJson = await themeRes.json();
                const themeMeta = themeJson.data || themeJson;
                if (themeMeta?.type === 'paid') {
                    const billingUrl = process.env.BILLING_SERVICE_URL || 'http://localhost:5005';
                    const merchantId = store.merchantId;
                    const checkRes = await fetch(
                        `${billingUrl}/api/billing/themes/check/${themeId}?merchantId=${merchantId}`,
                        {
                            headers: {
                                'x-merchant-id': String(merchantId),
                                Authorization: req.headers.authorization || '',
                            },
                        }
                    );
                    const checkJson = await checkRes.json();
                    if (!checkJson.purchased) {
                        return res.status(402).json({
                            success: false,
                            code: 'THEME_PURCHASE_REQUIRED',
                            message: 'This is a premium theme. Please purchase it before adding to your library.',
                            price: themeMeta.price,
                            themeName: themeMeta.displayName || themeMeta.themeName,
                        });
                    }
                }
            }
        } catch (gateErr) {
            console.error('[ThemeController] Premium gate check failed:', gateErr.message);
            return res.status(503).json({
                success: false,
                message: 'Unable to verify theme purchase entitlement. Please try again.',
            });
        }

        // Read physical folder JSONs
        let themesDir = path.resolve(process.cwd(), '..', 'themes');
        if (!fs.existsSync(themesDir)) {
            themesDir = path.resolve(process.cwd(), '..', '..', 'themes');
        }
        const defaultSettingsPath = path.join(themesDir, folder, 'defaultSettings.json');
        const manifestPath = path.join(themesDir, folder, 'manifest.json');
        
        const defaultSettings = readJsonFile(defaultSettingsPath) || {};
        const manifest = readJsonFile(manifestPath) || {};
        const supportedSections = Array.isArray(manifest.supportedSections) ? manifest.supportedSections : undefined;

        // Check if theme is already installed in installedThemes history
        let themeIndex = store.installedThemes.findIndex(t => t.themeId === themeId);

        const withFolderIdentity = (settings = {}) => ({
            ...defaultSettings,
            ...settings,
            themeId: folder,
            themeFolder: folder,
            themeVersion: version || settings.themeVersion || defaultSettings.themeVersion || '1.0.0',
            version: version || settings.version || defaultSettings.version || '1.0.0',
            designLanguage: defaultSettings.designLanguage || settings.designLanguage || folder,
            ...(supportedSections ? { supportedSections } : {}),
            // Always refresh visual engine keys from disk so theme upgrades stick
            productCardStyle: defaultSettings.productCardStyle || settings.productCardStyle,
            productPageLayout: defaultSettings.productPageLayout || settings.productPageLayout,
            collectionLayout: defaultSettings.collectionLayout || settings.collectionLayout,
            cartStyle: defaultSettings.cartStyle || settings.cartStyle,
            heroStyle: defaultSettings.heroStyle || settings.heroStyle,
            headerStyle: defaultSettings.headerStyle || settings.headerStyle,
            footerStyle: defaultSettings.footerStyle || settings.footerStyle,
            buttonStyle: defaultSettings.buttonStyle || settings.buttonStyle,
            spacingScale: defaultSettings.spacingScale || settings.spacingScale,
            motionPreset: defaultSettings.motionPreset || settings.motionPreset,
            animationPreset: defaultSettings.animationPreset || settings.animationPreset || defaultSettings.motionPreset,
            hoverPreset: defaultSettings.hoverPreset || settings.hoverPreset,
            carouselStyle: defaultSettings.carouselStyle || settings.carouselStyle,
            imageTreatment: defaultSettings.imageTreatment || settings.imageTreatment,
            sectionStyle: defaultSettings.sectionStyle || settings.sectionStyle,
            mobileNavStyle: defaultSettings.mobileNavStyle || settings.mobileNavStyle,
            contentDensity: defaultSettings.contentDensity || settings.contentDensity,
            headingFont: defaultSettings.headingFont || settings.headingFont,
            bodyFont: defaultSettings.bodyFont || settings.bodyFont,
            buttonFont: defaultSettings.buttonFont || settings.buttonFont,
            navigationFont: defaultSettings.navigationFont || settings.navigationFont,
            priceFont: defaultSettings.priceFont || settings.priceFont,
        });

        if (themeIndex === -1) {
            // New installation: initialize draft and published settings from defaultSettings
            store.installedThemes.push({
                themeId,
                folder,
                version,
                draftThemeSettings: withFolderIdentity(defaultSettings),
                publishedThemeSettings: withFolderIdentity(defaultSettings),
                installedAt: new Date()
            });
            themeIndex = store.installedThemes.length - 1;
        } else if (mode === 'live') {
            // Re-activate live: keep merchant color/copy customizations, refresh engine identity from disk
            const existing = store.installedThemes[themeIndex];
            store.installedThemes[themeIndex].folder = folder;
            store.installedThemes[themeIndex].version = version;
            store.installedThemes[themeIndex].draftThemeSettings = withFolderIdentity(existing.draftThemeSettings || {});
            store.installedThemes[themeIndex].publishedThemeSettings = withFolderIdentity(existing.publishedThemeSettings || {});
        } else if (mode === 'draft' || mode === 'library') {
            // Ensure folder/version metadata; do not overwrite published
            store.installedThemes[themeIndex].folder = folder;
            if (!store.installedThemes[themeIndex].draftThemeSettings
                || Object.keys(store.installedThemes[themeIndex].draftThemeSettings || {}).length === 0) {
                store.installedThemes[themeIndex].draftThemeSettings = withFolderIdentity(defaultSettings);
            }
        }

        if (mode === 'draft') {
            // Draft-safe theme switch: prepare pending, do NOT change live activeTheme
            store.pendingTheme = {
                themeId,
                folder,
                version,
                mode: 'switch',
                preparedAt: new Date(),
            };
            // Seed draft settings from theme defaults (preserve existing draft customizations if same theme)
            const existingDraft = store.installedThemes[themeIndex].draftThemeSettings || {};
            store.installedThemes[themeIndex].draftThemeSettings = withFolderIdentity({
                ...defaultSettings,
                ...existingDraft,
                primaryColor: existingDraft.primaryColor || defaultSettings.primaryColor,
                secondaryColor: existingDraft.secondaryColor || defaultSettings.secondaryColor,
                accentColor: existingDraft.accentColor || defaultSettings.accentColor,
            });
            store.installedThemes[themeIndex].version = version;
        } else if (mode === 'live') {
            store.activeTheme = {
                themeId,
                folder,
                version,
                installedAt: new Date()
            };
            store.pendingTheme = { themeId: '', folder: '', version: '', mode: '', preparedAt: undefined };
        }
        // mode === 'library' → no activeTheme / pendingTheme change

        store.markModified('installedThemes');
        store.markModified('activeTheme');
        store.markModified('pendingTheme');
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

        // Update or create home page for this theme — draft-safe for draft mode
        let homePage = await StorePage.findOne({ storeId, slug: 'home', themeId });
        if (homePage) {
            if (mode === 'draft') {
                homePage.draftSections = loadedSections;
                if (!homePage.publishedSections || homePage.publishedSections.length === 0) {
                    homePage.publishedSections = homePage.sections || [];
                }
            } else if (mode === 'live') {
                homePage.sections = loadedSections;
                homePage.draftSections = loadedSections;
                homePage.publishedSections = loadedSections;
            } else if (!homePage.draftSections?.length) {
                homePage.draftSections = loadedSections;
            }
            await homePage.save();
        } else {
            await StorePage.create({
                merchantId: store.merchantId || store.merchant || store._id,
                storeId,
                themeId,
                slug: 'home',
                title: 'Home Page',
                isHomePage: true,
                sections: mode === 'live' ? loadedSections : [],
                draftSections: loadedSections,
                publishedSections: mode === 'live' ? loadedSections : [],
                visibility: mode === 'live' ? 'published' : 'draft'
            });
        }

        const messages = {
            library: 'Theme added to library (live theme unchanged)',
            draft: 'Theme prepared as draft — preview and publish when ready',
            live: 'Theme installed and activated successfully',
        };

        await recordThemeAudit({
            storeId,
            actorId: req.merchant?._id,
            action: mode === 'live' ? 'THEME_SELECTED' : 'THEME_INSTALLED',
            themeId,
            themeVersion: version,
            metadata: { folder, mode },
        });

        res.status(200).json({
            success: true,
            message: messages[mode] || messages.live,
            mode,
            activeTheme: store.activeTheme,
            pendingTheme: store.pendingTheme,
            theme: store.installedThemes[themeIndex],
            supportedSections: supportedSections || [],
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

const resolveThemesDir = () => {
    let themesDir = path.resolve(process.cwd(), '..', 'themes');
    if (!fs.existsSync(themesDir)) {
        themesDir = path.resolve(process.cwd(), '..', '..', 'themes');
    }
    return themesDir;
};

/**
 * @desc    Detect available theme updates for the store's installed themes
 * @route   GET /api/themes/updates
 */
export const checkThemeUpdates = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        const store = await denyUnlessOwned(req, res, storeId);
        if (!store) return;

        const themesDir = resolveThemesDir();
        const updates = [];

        for (const install of store.installedThemes || []) {
            const folder = install.folder || '';
            if (!folder) continue;
            const manifest = readJsonFile(path.join(themesDir, folder, 'manifest.json')) || {};
            const availableVersion = manifest.version || '1.0.0';
            const currentVersion = install.version
                || install.draftThemeSettings?.themeVersion
                || install.publishedThemeSettings?.themeVersion
                || '1.0.0';

            if (compareSemver(availableVersion, currentVersion) > 0) {
                const steps = listMigrations(folder, currentVersion, availableVersion);
                const changelog = steps.flatMap((s) => s.changelog || []);
                updates.push({
                    themeId: install.themeId,
                    folder,
                    displayName: manifest.name || folder,
                    currentVersion,
                    availableVersion,
                    migrationSteps: steps.map((s) => `${s.from}→${s.to}`),
                    changelog: changelog.length
                        ? changelog
                        : [`Version metadata update to ${availableVersion}`],
                    isActive: String(store.activeTheme?.themeId) === String(install.themeId),
                });
            }
        }

        res.status(200).json({
            success: true,
            updates,
            pendingTheme: store.pendingTheme || null,
            previousPublishedTheme: store.previousPublishedTheme || null,
            hasRollback: !!(store.previousPublishedTheme?.themeId),
        });
    } catch (error) {
        console.error('[ThemeController] checkThemeUpdates:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Preview upgrade (dry-run migration) — does not write
 * @route   POST /api/themes/upgrade/preview
 */
export const previewThemeUpgrade = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        const { themeId, toVersion } = req.body || {};
        const store = await denyUnlessOwned(req, res, storeId);
        if (!store) return;

        const install = store.installedThemes.find((t) => String(t.themeId) === String(themeId));
        if (!install) {
            return res.status(404).json({ success: false, message: 'Theme not installed' });
        }

        const folder = install.folder;
        const themesDir = resolveThemesDir();
        const manifest = readJsonFile(path.join(themesDir, folder, 'manifest.json')) || {};
        const targetVersion = toVersion || manifest.version || '1.0.0';
        const fromVersion = install.version
            || install.publishedThemeSettings?.themeVersion
            || install.draftThemeSettings?.themeVersion
            || '1.0.0';

        const sourceConfig = JSON.parse(JSON.stringify(
            install.publishedThemeSettings || install.draftThemeSettings || {}
        ));
        const result = migrateThemeConfig(sourceConfig, folder, fromVersion, targetVersion);

        // Compatibility: compare draft home sections vs supportedSections
        const homePage = await StorePage.findOne({ storeId, slug: 'home', themeId });
        const sections = homePage?.draftSections?.length
            ? homePage.draftSections
            : (homePage?.sections || []);
        const supported = Array.isArray(manifest.supportedSections) ? manifest.supportedSections : [];
        const unsupported = (sections || []).filter((sec) => {
            if (!sec || ['header', 'footer'].includes(String(sec.type || '').toLowerCase())) return false;
            if (!supported.length) return false;
            const keys = [sec.type, sec.component].filter(Boolean).map((k) => String(k).toLowerCase());
            return !keys.some((k) => supported.map((s) => String(s).toLowerCase()).includes(k));
        });

        const impact = buildUpgradeImpactReport({
            sections,
            supportedSections: supported,
            fromVersion,
            toVersion: targetVersion,
            themeFolder: folder,
            changelog: result.changelog || [],
        });

        res.status(200).json({
            success: result.ok,
            message: result.message,
            fromVersion,
            toVersion: targetVersion,
            applied: result.applied || [],
            changelog: result.changelog || [],
            previewConfig: result.ok ? result.config : null,
            publishedUnchanged: true,
            impact,
            compatibility: {
                needsAttention: impact.summary.requiresAction + impact.summary.warning,
                unsupported: unsupported.map((s) => ({
                    sectionId: s.sectionId,
                    type: s.type,
                    component: s.component,
                    name: s.name || s.type,
                })),
            },
        });
    } catch (error) {
        console.error('[ThemeController] previewThemeUpgrade:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Apply upgrade to DRAFT only — published remains untouched
 * @route   POST /api/themes/upgrade
 */
export const upgradeTheme = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        const { themeId, toVersion } = req.body || {};
        if (!themeId) {
            return res.status(400).json({ success: false, message: 'themeId is required' });
        }

        const store = await denyUnlessOwned(req, res, storeId);
        if (!store) return;

        const themeIndex = store.installedThemes.findIndex((t) => String(t.themeId) === String(themeId));
        if (themeIndex === -1) {
            return res.status(404).json({ success: false, message: 'Theme not installed' });
        }

        const install = store.installedThemes[themeIndex];
        const folder = install.folder;
        const themesDir = resolveThemesDir();
        const manifest = readJsonFile(path.join(themesDir, folder, 'manifest.json')) || {};
        const targetVersion = toVersion || manifest.version || '1.0.0';
        const fromVersion = install.version
            || install.publishedThemeSettings?.themeVersion
            || '1.0.0';

        // Migrate from published config so live stays stable
        const publishedSnapshot = JSON.parse(JSON.stringify(install.publishedThemeSettings || {}));
        const result = migrateThemeConfig(publishedSnapshot, folder, fromVersion, targetVersion);
        if (!result.ok) {
            return res.status(400).json({ success: false, message: result.message, applied: result.applied });
        }

        const clean = sanitizeThemeSettings(result.config);
        store.installedThemes[themeIndex].draftThemeSettings = withThemeVersionMeta(clean, {
            folder,
            version: targetVersion,
            themeId: folder,
        });
        // Do NOT bump install.version or published until merchant publishes
        store.pendingTheme = {
            themeId,
            folder,
            version: targetVersion,
            mode: 'upgrade',
            preparedAt: new Date(),
        };

        store.markModified('installedThemes');
        store.markModified('pendingTheme');
        await store.save();

        await recordThemeLifecycleEvent({
            storeId,
            themeId: folder || themeId,
            themeVersion: targetVersion,
            eventType: 'theme_upgraded',
            meta: { fromVersion, toVersion: targetVersion, publishedUnchanged: true },
        });
        await recordThemeAudit({
            storeId,
            actorId: req.merchant?._id,
            action: 'THEME_UPGRADED',
            themeId: folder || themeId,
            themeVersion: targetVersion,
            previousVersion: fromVersion,
            metadata: { publishedUnchanged: true, applied: result.applied },
        });

        res.status(200).json({
            success: true,
            message: 'Upgrade applied to draft. Review and publish when ready.',
            fromVersion,
            toVersion: targetVersion,
            applied: result.applied,
            changelog: result.changelog,
            publishedUnchanged: true,
            draftThemeSettings: store.installedThemes[themeIndex].draftThemeSettings,
            publishedThemeSettings: store.installedThemes[themeIndex].publishedThemeSettings,
            pendingTheme: store.pendingTheme,
        });
    } catch (error) {
        console.error('[ThemeController] upgradeTheme:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Rollback to previousPublishedTheme snapshot
 * @route   POST /api/themes/rollback
 */
export const rollbackTheme = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        const store = await denyUnlessOwned(req, res, storeId);
        if (!store) return;

        const prev = store.previousPublishedTheme;
        const prevConfig = store.previousPublishedConfig;
        if (!prev?.themeId || !prevConfig?.themeSettings) {
            return res.status(400).json({ success: false, message: 'No rollback snapshot available' });
        }

        const themeIndex = store.installedThemes.findIndex((t) => String(t.themeId) === String(prev.themeId));
        if (themeIndex === -1) {
            return res.status(404).json({ success: false, message: 'Previous theme no longer in library' });
        }

        const restored = sanitizeThemeSettings(prevConfig.themeSettings);
        store.installedThemes[themeIndex].draftThemeSettings = JSON.parse(JSON.stringify(restored));
        store.installedThemes[themeIndex].publishedThemeSettings = JSON.parse(JSON.stringify(restored));
        store.installedThemes[themeIndex].version = prev.version || restored.themeVersion || '1.0.0';

        store.activeTheme = {
            themeId: prev.themeId,
            folder: prev.folder,
            version: prev.version,
            installedAt: new Date(),
        };
        store.pendingTheme = { themeId: '', folder: '', version: '', mode: '', preparedAt: undefined };

        // Clear snapshot after restore (single-level rollback)
        store.previousPublishedTheme = { themeId: '', folder: '', version: '', snapshotAt: undefined };
        store.previousPublishedConfig = { themeSettings: null, homeSections: null, themeId: '' };

        store.markModified('installedThemes');
        store.markModified('activeTheme');
        store.markModified('pendingTheme');
        store.markModified('previousPublishedTheme');
        store.markModified('previousPublishedConfig');
        await store.save();

        await recordThemeAudit({
            storeId,
            actorId: req.merchant?._id,
            action: 'THEME_ROLLED_BACK',
            themeId: prev.themeId,
            themeVersion: prev.version || '',
            previousVersion: '',
            metadata: { folder: prev.folder || '' },
        });

        if (Array.isArray(prevConfig.homeSections)) {
            const homePage = await StorePage.findOne({ storeId, slug: 'home', themeId: prev.themeId });
            if (homePage) {
                homePage.draftSections = prevConfig.homeSections;
                homePage.publishedSections = prevConfig.homeSections;
                homePage.sections = prevConfig.homeSections;
                await homePage.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Rolled back to previous published theme',
            activeTheme: store.activeTheme,
        });
    } catch (error) {
        console.error('[ThemeController] rollbackTheme:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Mint short-lived signed preview token (merchant JWT must NOT go in iframe URL)
 * @route   POST /api/themes/preview-token
 */
export const createPreviewToken = async (req, res) => {
    try {
        if (!req.merchant?._id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (req.previewAuth) {
            return res.status(403).json({ success: false, message: 'Cannot mint preview token with preview auth' });
        }

        const rate = await checkPreviewTokenRateLimit(String(req.merchant._id), { max: 30, windowSec: 600 });
        if (!rate.ok) {
            return res.status(rate.status || 429).json({ success: false, message: rate.message });
        }

        const storeId = req.headers['x-store-id'] || req.body.storeId;
        const { themeId = '', ttlSec } = req.body || {};
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'storeId required' });
        }

        const store = await Store.findOne({ _id: storeId, merchantId: req.merchant._id });
        if (!store) {
            return res.status(403).json({ success: false, message: 'Store access denied' });
        }

        if (themeId) {
            const installed = (store.installedThemes || []).some((t) => String(t.themeId) === String(themeId));
            const pending = store.pendingTheme?.themeId && String(store.pendingTheme.themeId) === String(themeId);
            const active = store.activeTheme?.themeId && String(store.activeTheme.themeId) === String(themeId);
            if (!installed && !pending && !active) {
                return res.status(404).json({ success: false, message: 'Theme not available for this store' });
            }
        }

        const minted = await mintPreviewToken({
            storeId: String(store._id),
            themeId: String(themeId || store.activeTheme?.themeId || ''),
            merchantId: String(req.merchant._id),
            ttlSec,
        });

        await recordThemeAudit({
            storeId: store._id,
            actorId: req.merchant._id,
            action: 'THEME_PREVIEWED',
            themeId: minted.themeId,
            metadata: { tokenId: minted.tokenId, ttlSec: minted.ttlSec },
        });

        res.status(200).json({
            success: true,
            token: minted.token,
            expiresAt: minted.expiresAt,
            storeId: minted.storeId,
            themeId: minted.themeId,
            tokenId: minted.tokenId,
            ttlSec: minted.ttlSec,
            backend: minted.backend,
        });
    } catch (error) {
        console.error('[ThemeController] createPreviewToken:', error.message);
        const status = error.status || 500;
        res.status(status).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Revoke a preview token before expiry
 * @route   POST /api/themes/preview-token/revoke
 */
export const revokePreviewTokenHandler = async (req, res) => {
    try {
        if (!req.merchant?._id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { token, tokenId } = req.body || {};
        const result = await revokePreviewToken({
            token,
            tokenId,
            merchantId: String(req.merchant._id),
        });
        if (!result.ok) {
            return res.status(result.status || 400).json({ success: false, message: result.message });
        }
        res.json({ success: true, revoked: result.revoked, tokenId: result.tokenId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Activate an installed theme as pending draft (does not publish).
 * @route POST /api/themes/activate
 */
export const activateTheme = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        const { themeId } = req.body || {};
        if (!storeId || !themeId) {
            return res.status(400).json({ success: false, message: 'storeId and themeId required' });
        }
        const store = await denyUnlessOwned(req, res, storeId);
        if (!store) return;
        const install = store.installedThemes.find((t) => String(t.themeId) === String(themeId));
        if (!install) return res.status(404).json({ success: false, message: 'Theme not installed' });

        store.pendingTheme = {
            themeId: install.themeId,
            folder: install.folder,
            version: install.version,
            mode: 'activate',
            preparedAt: new Date(),
        };
        // Ensure draft exists
        if (!install.draftThemeSettings || !Object.keys(install.draftThemeSettings).length) {
            install.draftThemeSettings = JSON.parse(JSON.stringify(install.publishedThemeSettings || {}));
            store.markModified('installedThemes');
        }
        store.markModified('pendingTheme');
        await store.save();

        await recordThemeAudit({
            storeId,
            actorId: req.merchant?._id,
            action: 'THEME_ACTIVATED',
            themeId: install.folder || themeId,
            themeVersion: install.version || '',
            metadata: { publishedUnchanged: true, mode: 'draft-pending' },
        });

        res.json({
            success: true,
            message: 'Theme prepared as draft. Preview and publish when ready.',
            pendingTheme: store.pendingTheme,
            publishedUnchanged: true,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Remove an installed theme (not active / not pending).
 * @route POST /api/themes/remove
 */
export const removeTheme = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        const { themeId } = req.body || {};
        if (!storeId || !themeId) {
            return res.status(400).json({ success: false, message: 'storeId and themeId required' });
        }
        const store = await denyUnlessOwned(req, res, storeId);
        if (!store) return;

        if (String(store.activeTheme?.themeId) === String(themeId)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove the active theme. Activate another theme first.',
            });
        }
        if (String(store.pendingTheme?.themeId) === String(themeId)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove a pending draft theme. Clear pending first.',
            });
        }
        if ((store.installedThemes || []).length <= 1) {
            return res.status(400).json({ success: false, message: 'At least one installed theme is required' });
        }

        const before = store.installedThemes.find((t) => String(t.themeId) === String(themeId));
        store.installedThemes = store.installedThemes.filter((t) => String(t.themeId) !== String(themeId));
        store.markModified('installedThemes');
        await store.save();

        await recordThemeAudit({
            storeId,
            actorId: req.merchant?._id,
            action: 'THEME_REMOVED',
            themeId: before?.folder || themeId,
            themeVersion: before?.version || '',
        });

        res.json({ success: true, message: 'Theme removed from library' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
