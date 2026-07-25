import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Banner from './models/Banner.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SINGLE_MERCHANT_EMAIL = 'single@storify.com';

const Merchant = mongoose.models.Merchant || mongoose.model('Merchant', new mongoose.Schema({
    email: String,
    name: String,
    mobile: String,
}, { collection: 'merchants' }));

const Store = mongoose.models.Store || mongoose.model('Store', new mongoose.Schema({
    merchantId: mongoose.Schema.Types.ObjectId,
    storeName: String,
    storeSlug: String,
}, { collection: 'stores' }));

const BANNER_DATA = [
    { title: 'Summer Collection Launch', image: '/uploads/seed/banner-1.jpg' },
    { title: 'Flat 40% Off Today', image: '/uploads/seed/banner-2.jpg' },
    { title: 'New Arrivals This Week', image: '/uploads/seed/banner-3.jpg' },
    { title: 'Free Shipping Over ₹499', image: '/uploads/seed/banner-4.jpg' },
    { title: 'Bestsellers Picks', image: '/uploads/seed/banner-5.jpg' },
];

const CATEGORY_DATA = [
    {
        name: 'Apparel',
        description: 'Everyday wear and seasonal fashion essentials',
        image: '/uploads/seed/cat-apparel.jpg',
        products: [
            { name: 'Classic Cotton Tee', actualPrice: 999, sellingPrice: 699, stock: 80, isFeatured: true },
            { name: 'Relaxed Fit Hoodie', actualPrice: 2499, sellingPrice: 1899, stock: 45, isFeatured: true },
            { name: 'Slim Denim Jeans', actualPrice: 2199, sellingPrice: 1599, stock: 60 },
            { name: 'Linen Summer Shirt', actualPrice: 1799, sellingPrice: 1299, stock: 55 },
            { name: 'Everyday Cargo Shorts', actualPrice: 1499, sellingPrice: 999, stock: 70 },
        ],
    },
    {
        name: 'Footwear',
        description: 'Sneakers, sandals and casual shoes',
        image: '/uploads/seed/cat-footwear.jpg',
        products: [
            { name: 'Urban Runner Sneakers', actualPrice: 3999, sellingPrice: 2999, stock: 40, isFeatured: true },
            { name: 'Leather Loafers', actualPrice: 4499, sellingPrice: 3499, stock: 30 },
            { name: 'Everyday Slip-Ons', actualPrice: 1999, sellingPrice: 1499, stock: 65 },
            { name: 'Trail Walking Shoes', actualPrice: 3599, sellingPrice: 2799, stock: 35 },
            { name: 'Canvas Casual Pumps', actualPrice: 2299, sellingPrice: 1699, stock: 50 },
        ],
    },
    {
        name: 'Accessories',
        description: 'Bags, belts, wallets and everyday extras',
        image: '/uploads/seed/cat-accessories.jpg',
        products: [
            { name: 'Minimal Leather Belt', actualPrice: 1299, sellingPrice: 899, stock: 90 },
            { name: 'Compact Crossbody Bag', actualPrice: 2799, sellingPrice: 1999, stock: 40, isFeatured: true },
            { name: 'Classic Bifold Wallet', actualPrice: 1499, sellingPrice: 999, stock: 75 },
            { name: 'Aviator Sunglasses', actualPrice: 1899, sellingPrice: 1299, stock: 55 },
            { name: 'Knit Beanie Cap', actualPrice: 799, sellingPrice: 499, stock: 100 },
        ],
    },
    {
        name: 'Home & Living',
        description: 'Decor, soft furnishings and lifestyle finds',
        image: '/uploads/seed/cat-home.jpg',
        products: [
            { name: 'Ceramic Table Lamp', actualPrice: 2499, sellingPrice: 1899, stock: 25, isFeatured: true },
            { name: 'Cotton Throw Blanket', actualPrice: 1999, sellingPrice: 1499, stock: 45 },
            { name: 'Scented Soy Candle Set', actualPrice: 1299, sellingPrice: 899, stock: 80 },
            { name: 'Woven Storage Basket', actualPrice: 1599, sellingPrice: 1199, stock: 35 },
            { name: 'Minimal Desk Organizer', actualPrice: 999, sellingPrice: 699, stock: 60 },
        ],
    },
    {
        name: 'Beauty',
        description: 'Skin, hair and personal care essentials',
        image: '/uploads/seed/cat-beauty.jpg',
        products: [
            { name: 'Hydrating Face Serum', actualPrice: 1899, sellingPrice: 1399, stock: 70, isFeatured: true },
            { name: 'Daily SPF Moisturizer', actualPrice: 1499, sellingPrice: 1099, stock: 85 },
            { name: 'Nourishing Hair Oil', actualPrice: 999, sellingPrice: 749, stock: 95 },
            { name: 'Gentle Cleansing Foam', actualPrice: 799, sellingPrice: 549, stock: 110 },
            { name: 'Matte Lip Color Kit', actualPrice: 1299, sellingPrice: 899, stock: 60 },
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

const seedSingleStoreCatalog = async ({ exitOnDone = true } = {}) => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URL);
            console.log('[Catalog Seed] MongoDB connected');
        }

        const merchant = await Merchant.findOne({ email: SINGLE_MERCHANT_EMAIL });
        if (!merchant) {
            console.error(`[Catalog Seed] Merchant not found: ${SINGLE_MERCHANT_EMAIL}`);
            if (exitOnDone) process.exit(1);
            return;
        }

        const store = await Store.findOne({ merchantId: merchant._id });
        if (!store) {
            console.error('[Catalog Seed] Store not found. Run seedSingleStore.js first.');
            if (exitOnDone) process.exit(1);
            return;
        }

        console.log(`[Catalog Seed] Store: ${store.storeName} (${store._id})`);

        // Banners
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
        console.log(`[Catalog Seed] Banners: ${bannerCreated} created (${BANNER_DATA.length} total catalog)`);

        // Categories + products
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
                const sku = `${cat.name.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
                const existingProduct = await Product.findOne({
                    store: store._id,
                    $or: [{ sku }, { name: p.name }],
                });
                if (existingProduct) continue;

                await Product.create({
                    merchant: merchant._id,
                    store: store._id,
                    name: p.name,
                    description: `${p.name} from our ${cat.name} collection. Quality products for everyday use.`,
                    brandName: 'Storify Demo',
                    sku,
                    actualPrice: p.actualPrice,
                    sellingPrice: p.sellingPrice,
                    category: category._id,
                    stock: p.stock,
                    images: [PRODUCT_IMAGES[i % PRODUCT_IMAGES.length]],
                    isActive: true,
                    isApproved: true,
                    isFeatured: !!p.isFeatured,
                    tags: [cat.name.toLowerCase(), 'demo', 'seed'],
                });
                productCreated += 1;
            }
        }

        console.log(`[Catalog Seed] Categories: ${categoryCreated} created`);
        console.log(`[Catalog Seed] Products: ${productCreated} created`);
        console.log('[Catalog Seed] Done (5 banners, 5 categories × 5 products)');

        if (exitOnDone) process.exit(0);
    } catch (error) {
        console.error('[Catalog Seed] Failed:', error.message);
        if (exitOnDone) process.exit(1);
        throw error;
    }
};

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
    seedSingleStoreCatalog();
}

export default seedSingleStoreCatalog;
