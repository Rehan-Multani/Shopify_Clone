import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from './models/Store.js';
import Merchant from './models/Merchant.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MULTI_MERCHANT_EMAIL = 'multi@storify.com';

const STORE_DATA = {
    storeName: 'Multi Demo Marketplace',
    storeDescription: 'Demo multi-vendor marketplace for Storify — multiple sellers, one storefront',
    address: 'Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
};

const seedMultiStore = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connected');

        const merchant = await Merchant.findOne({ email: MULTI_MERCHANT_EMAIL });
        if (!merchant) {
            console.error(`Merchant not found: ${MULTI_MERCHANT_EMAIL}`);
            console.error('Start merchant-admin-service first so demo merchants are seeded.');
            process.exit(1);
        }

        const existing = await Store.findOne({ merchantId: merchant._id });
        if (existing) {
            console.log(`Store already exists for ${MULTI_MERCHANT_EMAIL}`);
            console.log(`  Name: ${existing.storeName}`);
            console.log(`  ID:   ${existing._id}`);
            console.log(`  Slug: ${existing.storeSlug}`);
            console.log(`  Plan: ${existing.planType}`);
            process.exit(0);
        }

        const store = await Store.create({
            merchantId: merchant._id,
            planType: 'Multi Vendor',
            storeName: STORE_DATA.storeName,
            storeDescription: STORE_DATA.storeDescription,
            contactEmail: merchant.email,
            contactPhone: merchant.mobile,
            address: STORE_DATA.address,
            city: STORE_DATA.city,
            state: STORE_DATA.state,
            pincode: STORE_DATA.pincode,
            isActive: true,
            platformCommission: 10,
        });

        console.log('Multi vendor store created:');
        console.log(`  Name:     ${store.storeName}`);
        console.log(`  ID:       ${store._id}`);
        console.log(`  Slug:     ${store.storeSlug}`);
        console.log(`  Plan:     ${store.planType}`);
        console.log(`  Merchant: ${merchant.email} (${merchant._id})`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed multi store:', error.message);
        process.exit(1);
    }
};

seedMultiStore();
