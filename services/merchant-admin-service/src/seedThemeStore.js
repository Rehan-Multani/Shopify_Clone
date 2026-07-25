import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../../shared/connectDB.js';
import Theme from './models/Theme.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadCatalog = () => {
    const candidates = [
        path.resolve(__dirname, '../../../themes/theme-store-catalog.json'),
        path.resolve(process.cwd(), '../themes/theme-store-catalog.json'),
        path.resolve(process.cwd(), '../../themes/theme-store-catalog.json'),
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            return JSON.parse(fs.readFileSync(p, 'utf8'));
        }
    }
    return null;
};

/**
 * Upsert all Theme Store themes into DB.
 * Safe to run on every merchant-admin-service startup.
 */
export const seedThemeStore = async () => {
    try {
        const catalog = loadCatalog();
        if (!catalog || !catalog.length) {
            console.warn('[Themes] theme-store-catalog.json not found — skip seed');
            return;
        }

        let created = 0;
        let updated = 0;
        const folders = catalog.map((t) => t.folder);

        for (const theme of catalog) {
            const existing = await Theme.findOne({ folder: theme.folder });
            if (existing) {
                existing.themeName = theme.themeName;
                existing.displayName = theme.displayName;
                existing.type = theme.type;
                existing.price = theme.price;
                existing.industry = theme.industry;
                existing.thumbnail = theme.thumbnail;
                existing.previewImages = theme.previewImages || [];
                existing.shortDescription = theme.shortDescription;
                existing.longDescription = theme.longDescription || theme.shortDescription;
                existing.features = theme.features || [];
                existing.status = 'published';
                existing.visibility = 'visible';
                existing.version = theme.version || '1.0.0';
                await existing.save();
                updated++;
            } else {
                await Theme.create(theme);
                created++;
            }
        }

        const removed = await Theme.deleteMany({ folder: { $nin: folders } });

        console.log(`[Themes] Theme Store seeded — created ${created}, updated ${updated}, removed ${removed.deletedCount}, total ${catalog.length}`);
    } catch (error) {
        console.error(`[Themes] Failed to seed theme store: ${error.message}`);
    }
};

// Allow running as standalone script
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
    const run = async () => {
        await connectDB(mongoose);
        await seedThemeStore();
        process.exit(0);
    };
    run();
}

export default seedThemeStore;
