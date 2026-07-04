import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve themes directory — located at project root: /themes
const THEMES_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'themes');

/**
 * ThemeService
 * 
 * Scans the /themes directory on startup and loads manifest.json
 * from each valid theme folder. No database required.
 * 
 * This is a file-based, read-only service designed to be extended
 * later with database-backed theme management, marketplace, etc.
 */
class ThemeService {
    constructor() {
        this.themes = [];
        this.loaded = false;
    }

    /**
     * Scans /themes directory and loads all valid theme manifests.
     * Called once on server startup.
     */
    async loadThemes() {
        try {
            // Check if themes directory exists
            if (!fs.existsSync(THEMES_DIR)) {
                console.warn('[ThemeService] ⚠️  Themes directory not found:', THEMES_DIR);
                this.themes = [];
                this.loaded = true;
                return;
            }

            const entries = fs.readdirSync(THEMES_DIR, { withFileTypes: true });
            const loadedThemes = [];

            for (const entry of entries) {
                // Skip non-directories
                if (!entry.isDirectory()) continue;

                const themeDir = path.join(THEMES_DIR, entry.name);
                const manifestPath = path.join(themeDir, 'manifest.json');

                try {
                    // Check if manifest.json exists
                    if (!fs.existsSync(manifestPath)) {
                        console.warn(`[ThemeService] ⚠️  Skipping "${entry.name}" — no manifest.json found`);
                        continue;
                    }

                    // Read and parse manifest
                    const raw = fs.readFileSync(manifestPath, 'utf-8');
                    const manifest = JSON.parse(raw);

                    // Validate required fields
                    if (!manifest.id || !manifest.name || !manifest.version) {
                        console.warn(`[ThemeService] ⚠️  Skipping "${entry.name}" — manifest missing required fields (id, name, version)`);
                        continue;
                    }

                    loadedThemes.push({
                        id: manifest.id,
                        name: manifest.name,
                        version: manifest.version,
                        industry: manifest.industry || 'General',
                        type: manifest.type || 'free',
                        thumbnail: manifest.thumbnail || null
                    });

                    console.log(`[ThemeService] ✅ Loaded theme: ${manifest.name} (${manifest.id})`);
                } catch (err) {
                    console.warn(`[ThemeService] ⚠️  Skipping "${entry.name}" — ${err.message}`);
                }
            }

            this.themes = loadedThemes;
            this.loaded = true;
            console.log(`[ThemeService] 📦 Total themes loaded: ${this.themes.length}`);
        } catch (err) {
            console.error('[ThemeService] ❌ Failed to scan themes directory:', err.message);
            this.themes = [];
            this.loaded = true;
        }
    }

    /**
     * Returns all loaded built-in themes.
     */
    getAllThemes() {
        return this.themes;
    }

    /**
     * Returns a single theme by ID.
     */
    getThemeById(id) {
        return this.themes.find(theme => theme.id === id) || null;
    }

    /**
     * Returns list of physical theme folder names containing a manifest.json
     */
    getAvailableFolders() {
        try {
            if (!fs.existsSync(THEMES_DIR)) return [];
            const entries = fs.readdirSync(THEMES_DIR, { withFileTypes: true });
            const folders = [];
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const manifestPath = path.join(THEMES_DIR, entry.name, 'manifest.json');
                    if (fs.existsSync(manifestPath)) {
                        folders.push(entry.name);
                    }
                }
            }
            return folders;
        } catch (err) {
            console.error('[ThemeService] Error listing folders:', err.message);
            return [];
        }
    }

    /**
     * Reads manifest.json of a specific folder
     */
    getManifest(folder) {
        try {
            const manifestPath = path.join(THEMES_DIR, folder, 'manifest.json');
            if (!fs.existsSync(manifestPath)) {
                return null;
            }
            const raw = fs.readFileSync(manifestPath, 'utf-8');
            return JSON.parse(raw);
        } catch (err) {
            console.error(`[ThemeService] Error reading manifest for ${folder}:`, err.message);
            return null;
        }
    }
}

// Singleton instance — shared across the service
const themeService = new ThemeService();

export default themeService;
