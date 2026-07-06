import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URL = process.env.MONGODB_URL;

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log('Connected!');

        const storesCollection = mongoose.connection.db.collection('stores');
        const pagesCollection = mongoose.connection.db.collection('storepages');

        const stores = await storesCollection.find({}).limit(5).toArray();
        console.log('--- STORES IN DB ---');
        stores.forEach(s => {
            console.log(`Store: ${s.storeName} (${s._id})`);
            console.log(`  Active Theme:`, s.activeTheme);
            console.log(`  Installed Themes Count:`, s.installedThemes ? s.installedThemes.length : 0);
            if (s.installedThemes) {
                s.installedThemes.forEach(t => {
                    console.log(`    - ThemeId: "${t.themeId}", Folder: "${t.folder}", Version: "${t.version}"`);
                });
            }
        });

        const pages = await pagesCollection.find({ slug: 'home' }).limit(10).toArray();
        console.log('--- HOME PAGES IN DB ---');
        pages.forEach(p => {
            console.log(`Page: ${p.title} (${p._id})`);
            console.log(`  StoreId: "${p.storeId}"`);
            console.log(`  ThemeId: "${p.themeId}"`);
            console.log(`  Sections count:`, p.sections ? p.sections.length : 0);
            if (p.sections) {
                console.log(`  Section types:`, p.sections.map(sec => sec.type));
            }
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
