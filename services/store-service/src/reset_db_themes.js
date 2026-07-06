import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
    console.error('MONGODB_URL is missing in environment variables');
    process.exit(1);
}

const storeSchema = new mongoose.Schema({
    installedThemes: [{
        themeId: String,
        folder: String,
        version: String,
        installedAt: Date,
        draftThemeSettings: mongoose.Schema.Types.Mixed,
        publishedThemeSettings: mongoose.Schema.Types.Mixed
    }],
    activeTheme: {
        themeId: String,
        folder: String,
        version: String,
        installedAt: Date
    }
}, { collection: 'stores' });

const Store = mongoose.model('Store', storeSchema);

const storePageSchema = new mongoose.Schema({
    storeId: mongoose.Schema.Types.ObjectId,
    slug: String,
    themeId: String
}, { collection: 'storepages' });

const StorePage = mongoose.model('StorePage', storePageSchema);

const run = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGODB_URL);
        console.log('Connected!');

        // Query the themes collection to find the IDs of our 5 built-in themes
        const themesCollection = mongoose.connection.db.collection('themes');
        const defaultFolders = ['fashion', 'electronics', 'grocery', 'furniture', 'beauty', 'jewellery', 'sports', 'books', 'petstore', 'kids'];
        const dbThemes = await themesCollection.find({ folder: { $in: defaultFolders } }).toArray();
        
        const dbThemeIds = dbThemes.map(t => t._id.toString());
        console.log('Found default theme IDs in database:', dbThemeIds);

        if (dbThemeIds.length === 0) {
            console.log('No default themes found in database themes collection. Have you run seedThemes.js?');
            await mongoose.disconnect();
            process.exit(1);
        }

        console.log('Clearing home pages for built-in themes...');
        const deletePageResult = await StorePage.deleteMany({
            slug: 'home',
            themeId: { $in: dbThemeIds }
        });
        console.log(`Deleted ${deletePageResult.deletedCount} store pages.`);

        console.log('Resetting installed themes for all stores...');
        const stores = await Store.find({});
        console.log(`Found ${stores.length} stores to reset.`);

        let resetCount = 0;
        for (const store of stores) {
            const hasDefaultInstalled = store.installedThemes.some(
                t => dbThemeIds.includes(t.themeId) || defaultFolders.includes(t.folder)
            );
            
            const activeThemeIsDefault = store.activeTheme && (
                dbThemeIds.includes(store.activeTheme.themeId) || defaultFolders.includes(store.activeTheme.folder)
            );

            if (hasDefaultInstalled || activeThemeIsDefault) {
                store.installedThemes = store.installedThemes.filter(
                    t => !dbThemeIds.includes(t.themeId) && !defaultFolders.includes(t.folder)
                );
                
                if (activeThemeIsDefault) {
                    store.activeTheme = {
                        themeId: '',
                        folder: '',
                        version: '',
                        installedAt: null
                    };
                }
                
                await store.save();
                resetCount++;
            }
        }
        console.log(`Reset completed. Reset ${resetCount} stores.`);

        await mongoose.disconnect();
        console.log('Database disconnected. All clear!');
        process.exit(0);
    } catch (err) {
        console.error('Error running reset script:', err);
        process.exit(1);
    }
};

run();
