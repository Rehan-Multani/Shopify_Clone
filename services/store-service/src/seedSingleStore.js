import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from './models/Store.js';
import Merchant from './models/Merchant.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SINGLE_MERCHANT_EMAIL = 'single@storify.com';

const STORE_DATA = {
    storeName: 'Single Demo Store',
    storeDescription: 'Demo single-vendor store for Storify',
    address: 'Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
};

const seedSingleStore = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connected');

        const merchant = await Merchant.findOne({ email: SINGLE_MERCHANT_EMAIL });
        if (!merchant) {
            console.error(`Merchant not found: ${SINGLE_MERCHANT_EMAIL}`);
            console.error('Start merchant-admin-service first so demo merchants are seeded.');
            process.exit(1);
        }

        const existing = await Store.findOne({ merchantId: merchant._id });
        if (existing) {
            console.log(`Store already exists for ${SINGLE_MERCHANT_EMAIL}`);
            console.log(`  Name: ${existing.storeName}`);
            console.log(`  ID:   ${existing._id}`);
            console.log(`  Slug: ${existing.storeSlug}`);
            process.exit(0);
        }

        const store = await Store.create({
            merchantId: merchant._id,
            planType: 'Single Vendor',
            storeName: STORE_DATA.storeName,
            storeDescription: STORE_DATA.storeDescription,
            contactEmail: merchant.email,
            contactPhone: merchant.mobile,
            address: STORE_DATA.address,
            city: STORE_DATA.city,
            state: STORE_DATA.state,
            pincode: STORE_DATA.pincode,
            isActive: true,
        });

        console.log('Single vendor store created:');
        console.log(`  Name:     ${store.storeName}`);
        console.log(`  ID:       ${store._id}`);
        console.log(`  Slug:     ${store.storeSlug}`);
        console.log(`  Merchant: ${merchant.email} (${merchant._id})`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed store:', error.message);
        process.exit(1);
    }
};

seedSingleStore();
