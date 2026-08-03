import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Banner from './models/Banner.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Vendor from './models/Vendor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MULTI_MERCHANT_EMAIL = 'multi@storify.com';

const Merchant = mongoose.models.Merchant || mongoose.model('Merchant', new mongoose.Schema({
    email: String,
    name: String,
    mobile: String,
}, { collection: 'merchants' }));

const Store = mongoose.models.Store || mongoose.model('Store', new mongoose.Schema({
    merchantId: mongoose.Schema.Types.ObjectId,
    storeName: String,
    storeSlug: String,
    planType: String,
}, { collection: 'stores' }));

const VENDOR_DATA = [
    {
        name: 'Aisha Khan',
        businessName: 'Urban Thread Co.',
        email: 'mrmmultani@gmail.com',
        mobile: '9811111111',
        password: 'password123',
        commission: 12,
        city: 'Mumbai',
        state: 'Maharashtra',
        address: 'Bandra West',
    },
    {
        name: 'Rohan Mehta',
        businessName: 'Northwind Goods',
        email: 'vendor2@storify.com',
        mobile: '9822222222',
        password: 'password123',
        commission: 10,
        city: 'Bengaluru',
        state: 'Karnataka',
        address: 'Indiranagar',
    },
    {
        name: 'Priya Sharma',
        businessName: 'Bloom & Home',
        email: 'vendor3@storify.com',
        mobile: '9833333333',
        password: 'password123',
        commission: 8,
        city: 'Jaipur',
        state: 'Rajasthan',
        address: 'C-Scheme',
    },
];

const BANNER_DATA = [
    { title: 'Marketplace Picks', image: '/uploads/seed/banner-1.jpg' },
    { title: 'Seller Spotlight Sale', image: '/uploads/seed/banner-2.jpg' },
    { title: 'New From Our Vendors', image: '/uploads/seed/banner-3.jpg' },
    { title: 'Free Shipping Over ₹499', image: '/uploads/seed/banner-4.jpg' },
    { title: 'Weekend Deals', image: '/uploads/seed/banner-5.jpg' },
];

const CATEGORY_DATA = [
    {
        name: 'Apparel',
        description: 'Fashion from independent sellers',
        image: '/uploads/seed/cat-apparel.jpg',
        products: [
            { name: 'Marketplace Cotton Tee', actualPrice: 999, sellingPrice: 699, stock: 80, isFeatured: true, vendorIndex: 0 },
            { name: 'Relaxed Fit Hoodie', actualPrice: 2499, sellingPrice: 1899, stock: 45, isFeatured: true, vendorIndex: 0 },
            { name: 'Slim Denim Jeans', actualPrice: 2199, sellingPrice: 1599, stock: 60, vendorIndex: 1 },
            { name: 'Linen Summer Shirt', actualPrice: 1799, sellingPrice: 1299, stock: 55, vendorIndex: 1 },
            { name: 'Everyday Cargo Shorts', actualPrice: 1499, sellingPrice: 999, stock: 70, vendorIndex: 0 },
        ],
    },
    {
        name: 'Footwear',
        description: 'Shoes from trusted marketplace sellers',
        image: '/uploads/seed/cat-footwear.jpg',
        products: [
            { name: 'Urban Runner Sneakers', actualPrice: 3999, sellingPrice: 2999, stock: 40, isFeatured: true, vendorIndex: 1 },
            { name: 'Leather Loafers', actualPrice: 4499, sellingPrice: 3499, stock: 30, vendorIndex: 1 },
            { name: 'Everyday Slip-Ons', actualPrice: 1999, sellingPrice: 1499, stock: 65, vendorIndex: 0 },
            { name: 'Trail Walking Shoes', actualPrice: 3599, sellingPrice: 2799, stock: 35, vendorIndex: 1 },
            { name: 'Canvas Casual Pumps', actualPrice: 2299, sellingPrice: 1699, stock: 50, vendorIndex: 0 },
        ],
    },
    {
        name: 'Accessories',
        description: 'Bags, belts and extras from vendors',
        image: '/uploads/seed/cat-accessories.jpg',
        products: [
            { name: 'Minimal Leather Belt', actualPrice: 1299, sellingPrice: 899, stock: 90, vendorIndex: 0 },
            { name: 'Compact Crossbody Bag', actualPrice: 2799, sellingPrice: 1999, stock: 40, isFeatured: true, vendorIndex: 2 },
            { name: 'Classic Bifold Wallet', actualPrice: 1499, sellingPrice: 999, stock: 75, vendorIndex: 1 },
            { name: 'Aviator Sunglasses', actualPrice: 1899, sellingPrice: 1299, stock: 55, vendorIndex: 0 },
            { name: 'Knit Beanie Cap', actualPrice: 799, sellingPrice: 499, stock: 100, vendorIndex: 2 },
        ],
    },
    {
        name: 'Home & Living',
        description: 'Decor and lifestyle from Bloom & Home',
        image: '/uploads/seed/cat-home.jpg',
        products: [
            { name: 'Ceramic Table Lamp', actualPrice: 2499, sellingPrice: 1899, stock: 25, isFeatured: true, vendorIndex: 2 },
            { name: 'Cotton Throw Blanket', actualPrice: 1999, sellingPrice: 1499, stock: 45, vendorIndex: 2 },
            { name: 'Scented Soy Candle Set', actualPrice: 1299, sellingPrice: 899, stock: 80, vendorIndex: 2 },
            { name: 'Woven Storage Basket', actualPrice: 1599, sellingPrice: 1199, stock: 35, vendorIndex: 2 },
            { name: 'Minimal Desk Organizer', actualPrice: 999, sellingPrice: 699, stock: 60, vendorIndex: 1 },
        ],
    },
    {
        name: 'Beauty',
        description: 'Personal care essentials from sellers',
        image: '/uploads/seed/cat-beauty.jpg',
        products: [
            { name: 'Hydrating Face Serum', actualPrice: 1899, sellingPrice: 1399, stock: 70, isFeatured: true, vendorIndex: 2 },
            { name: 'Daily SPF Moisturizer', actualPrice: 1499, sellingPrice: 1099, stock: 85, vendorIndex: 2 },
            { name: 'Nourishing Hair Oil', actualPrice: 999, sellingPrice: 749, stock: 95, vendorIndex: 0 },
            { name: 'Gentle Cleansing Foam', actualPrice: 799, sellingPrice: 549, stock: 110, vendorIndex: 1 },
            { name: 'Matte Lip Color Kit', actualPrice: 1299, sellingPrice: 899, stock: 60, vendorIndex: 2 },
        ],
    },
];

const PRODUCT_IMAGES = [
    '/uploads/seed/product-1.jpg',
    '/uploads/seed/product-2.jpg',
    '/uploads/seed/product-3.jpg',
    '/uploads/seed/product-4.jpg',
    '/uploads/seed/product-5.jpg',
];

const seedMultiStoreCatalog = async ({ exitOnDone = true } = {}) => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URL);
            console.log('[Multi Catalog] MongoDB connected');
        }

        const merchant = await Merchant.findOne({ email: MULTI_MERCHANT_EMAIL });
        if (!merchant) {
            console.error(`[Multi Catalog] Merchant not found: ${MULTI_MERCHANT_EMAIL}`);
            if (exitOnDone) process.exit(1);
            return;
        }

        const store = await Store.findOne({ merchantId: merchant._id });
        if (!store) {
            console.error('[Multi Catalog] Store not found. Run seedMultiStore.js first.');
            if (exitOnDone) process.exit(1);
            return;
        }

        console.log(`[Multi Catalog] Store: ${store.storeName} (${store._id})`);

        const vendors = [];
        let vendorCreated = 0;
        for (const v of VENDOR_DATA) {
            let vendor = await Vendor.findOne({ store: store._id, email: v.email });
            if (!vendor) {
                vendor = await Vendor.create({
                    merchant: merchant._id,
                    store: store._id,
                    name: v.name,
                    businessName: v.businessName,
                    email: v.email,
                    mobile: v.mobile,
                    password: v.password,
                    commission: v.commission,
                    city: v.city,
                    state: v.state,
                    address: v.address,
                    isActive: true,
                });
                vendorCreated += 1;
            }
            vendors.push(vendor);
        }
        console.log(`[Multi Catalog] Vendors: ${vendorCreated} created (${vendors.length} total)`);

        let bannerCreated = 0;
        for (const banner of BANNER_DATA) {
            const existing = await Banner.findOne({ store: store._id, title: banner.title });
            if (existing) continue;
            await Banner.create({
                merchant: merchant._id,
                store: store._id,
                title: banner.title,
                image: banner.image,
                isActive: true,
            });
            bannerCreated += 1;
        }
        console.log(`[Multi Catalog] Banners: ${bannerCreated} created`);

        let categoryCreated = 0;
        let productCreated = 0;

        for (const cat of CATEGORY_DATA) {
            let category = await Category.findOne({ store: store._id, name: cat.name });
            if (!category) {
                category = await Category.create({
                    merchant: merchant._id,
                    store: store._id,
                    name: cat.name,
                    description: cat.description,
                    image: cat.image,
                    isActive: true,
                    isApproved: true,
                });
                categoryCreated += 1;
            }

            for (let i = 0; i < cat.products.length; i += 1) {
                const p = cat.products[i];
                const sku = `MV-${cat.name.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
                const existingProduct = await Product.findOne({
                    store: store._id,
                    $or: [{ sku }, { name: p.name }],
                });
                if (existingProduct) continue;

                const vendor = vendors[p.vendorIndex % vendors.length];
                await Product.create({
                    merchant: merchant._id,
                    store: store._id,
                    vendor: vendor._id,
                    name: p.name,
                    description: `${p.name} sold by ${vendor.businessName} on the marketplace.`,
                    brandName: vendor.businessName,
                    sku,
                    actualPrice: p.actualPrice,
                    sellingPrice: p.sellingPrice,
                    category: category._id,
                    stock: p.stock,
                    images: [PRODUCT_IMAGES[i % PRODUCT_IMAGES.length]],
                    isActive: true,
                    isApproved: true,
                    isFeatured: !!p.isFeatured,
                    tags: [cat.name.toLowerCase(), 'marketplace', 'multi-vendor'],
                });
                productCreated += 1;
            }
        }

        console.log(`[Multi Catalog] Categories: ${categoryCreated} created`);
        console.log(`[Multi Catalog] Products: ${productCreated} created`);
        console.log('[Multi Catalog] Done');

        if (exitOnDone) process.exit(0);
    } catch (error) {
        console.error('[Multi Catalog] Failed:', error.message);
        if (exitOnDone) process.exit(1);
        throw error;
    }
};

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
    seedMultiStoreCatalog();
}

export default seedMultiStoreCatalog;
