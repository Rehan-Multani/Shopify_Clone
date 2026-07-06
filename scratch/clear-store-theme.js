import mongoose from 'mongoose';
import Store from '../services/store-service/src/models/Store.js';
import StorePage from '../services/store-service/src/models/StorePage.js';

const MONGODB_URL = "mongodb://mohammadrehan00121_db_user:ug6TNfitYIiWmt2B@ac-qqa7tmi-shard-00-00.9xyd4af.mongodb.net:27017,ac-qqa7tmi-shard-00-01.9xyd4af.mongodb.net:27017,ac-qqa7tmi-shard-00-02.9xyd4af.mongodb.net:27017/Shopify?ssl=true&replicaSet=atlas-oy7ora-shard-0&authSource=admin&appName=Cluster0";
const targetStoreId = "6a38ec79adca65fe95fb7a92";

async function main() {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");

    // Clear activeTheme and installedThemes for store
    const store = await Store.findById(targetStoreId);
    if (store) {
        store.activeTheme = null;
        store.installedThemes = [];
        await store.save();
        console.log(`Cleared themes for store: ${targetStoreId}`);
    } else {
        console.log("Store not found");
    }

    // Delete all store pages for this store so it starts fully fresh
    const result = await StorePage.deleteMany({ storeId: targetStoreId });
    console.log(`Deleted ${result.deletedCount} store pages for store: ${targetStoreId}`);

    await mongoose.disconnect();
}

main().catch(err => console.error(err));
