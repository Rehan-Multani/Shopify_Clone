import mongoose from 'mongoose';
import StorePage from '../services/store-service/src/models/StorePage.js';

const MONGODB_URL = "mongodb://mohammadrehan00121_db_user:ug6TNfitYIiWmt2B@ac-qqa7tmi-shard-00-00.9xyd4af.mongodb.net:27017,ac-qqa7tmi-shard-00-01.9xyd4af.mongodb.net:27017,ac-qqa7tmi-shard-00-02.9xyd4af.mongodb.net:27017/Shopify?ssl=true&replicaSet=atlas-oy7ora-shard-0&authSource=admin&appName=Cluster0";
const targetStoreId = "6a38ec79adca65fe95fb7a92";

async function main() {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");

    const pages = await StorePage.find({ storeId: targetStoreId });
    console.log(`Found ${pages.length} pages:`);
    for (const p of pages) {
        console.log(`Page: ${p.title} (${p.slug})`);
        console.log(`Sections count: ${p.sections.length}`);
        p.sections.forEach((s, idx) => {
            console.log(`  [${idx}] Type: ${s.type}, sectionId: ${s.sectionId}, _id: ${s._id}`);
        });
    }

    await mongoose.disconnect();
}

main().catch(err => console.error(err));
