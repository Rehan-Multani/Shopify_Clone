import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import Banner from './models/Banner.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SINGLE_MERCHANT_EMAIL = 'single@storify.com';

const Merchant = mongoose.models.Merchant || mongoose.model('Merchant', new mongoose.Schema({
    email: String,
}, { collection: 'merchants' }));

const Store = mongoose.models.Store || mongoose.model('Store', new mongoose.Schema({
    merchantId: mongoose.Schema.Types.ObjectId,
    storeName: String,
}, { collection: 'stores' }));

const UPLOAD_DIR = path.resolve(__dirname, '../../gateway/public/uploads/seed');

const BANNER_SOURCES = [
    { title: 'Summer Collection Launch', file: 'banner-1.jpg', url: 'https://picsum.photos/seed/banner1/1400/600' },
    { title: 'Flat 40% Off Today', file: 'banner-2.jpg', url: 'https://picsum.photos/seed/banner2/1400/600' },
    { title: 'New Arrivals This Week', file: 'banner-3.jpg', url: 'https://picsum.photos/seed/banner3/1400/600' },
    { title: 'Free Shipping Over ₹499', file: 'banner-4.jpg', url: 'https://picsum.photos/seed/banner4/1400/600' },
    { title: 'Bestsellers Picks', file: 'banner-5.jpg', url: 'https://picsum.photos/seed/banner5/1400/600' },
];

const CATEGORY_SOURCES = [
    { name: 'Apparel', file: 'cat-apparel.jpg', url: 'https://picsum.photos/seed/apparel/800/800' },
    { name: 'Footwear', file: 'cat-footwear.jpg', url: 'https://picsum.photos/seed/footwear/800/800' },
    { name: 'Accessories', file: 'cat-accessories.jpg', url: 'https://picsum.photos/seed/accessories/800/800' },
    { name: 'Home & Living', file: 'cat-home.jpg', url: 'https://picsum.photos/seed/home/800/800' },
    { name: 'Beauty', file: 'cat-beauty.jpg', url: 'https://picsum.photos/seed/beauty/800/800' },
];

const PRODUCT_SOURCES = Array.from({ length: 5 }, (_, i) => ({
    file: `product-${i + 1}.jpg`,
    url: `https://picsum.photos/seed/product${i + 1}/800/800`,
}));

const downloadFile = (url, dest) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;

    const request = (targetUrl, redirects = 0) => {
        client.get(targetUrl, (res) => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                if (redirects > 5) {
                    reject(new Error('Too many redirects'));
                    return;
                }
                request(res.headers.location, redirects + 1);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} for ${targetUrl}`));
                return;
            }
            res.pipe(file);
            file.on('finish', () => file.close(() => resolve(dest)));
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    };

    request(url);
});

const ensureDownloads = async () => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const all = [...BANNER_SOURCES, ...CATEGORY_SOURCES, ...PRODUCT_SOURCES];
    for (const item of all) {
        const dest = path.join(UPLOAD_DIR, item.file);
        if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
            console.log(`[Images] Exists: ${item.file}`);
            continue;
        }
        console.log(`[Images] Downloading ${item.file}...`);
        try {
            await downloadFile(item.url, dest);
        } catch (err) {
            console.warn(`[Images] Download failed for ${item.file}: ${err.message}`);
            // Tiny valid JPEG placeholder (1x1) if download fails — better than broken remote URL
            // Use a small colored PNG via buffer instead
            const png1x1 = Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
                'base64'
            );
            fs.writeFileSync(dest.replace(/\.jpg$/, '.png'), png1x1);
        }
    }
};

const localPath = (file) => `/uploads/seed/${file}`;

const fixSeedImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('[Images] MongoDB connected');

        await ensureDownloads();

        const merchant = await Merchant.findOne({ email: SINGLE_MERCHANT_EMAIL });
        if (!merchant) throw new Error(`Merchant not found: ${SINGLE_MERCHANT_EMAIL}`);
        const store = await Store.findOne({ merchantId: merchant._id });
        if (!store) throw new Error('Store not found');

        for (const b of BANNER_SOURCES) {
            const res = await Banner.updateMany(
                { store: store._id, title: b.title },
                { $set: { image: localPath(b.file) } }
            );
            console.log(`[Images] Banner "${b.title}" → ${localPath(b.file)} (${res.modifiedCount} updated)`);
        }

        for (const c of CATEGORY_SOURCES) {
            const res = await Category.updateMany(
                { store: store._id, name: c.name },
                { $set: { image: localPath(c.file) } }
            );
            console.log(`[Images] Category "${c.name}" → ${localPath(c.file)} (${res.modifiedCount} updated)`);
        }

        const products = await Product.find({ store: store._id }).sort({ createdAt: 1 });
        let i = 0;
        for (const product of products) {
            const src = PRODUCT_SOURCES[i % PRODUCT_SOURCES.length];
            product.images = [localPath(src.file)];
            await product.save();
            i += 1;
        }
        console.log(`[Images] Updated ${products.length} product images`);

        console.log('[Images] Done — refresh dashboard');
        process.exit(0);
    } catch (error) {
        console.error('[Images] Failed:', error.message);
        process.exit(1);
    }
};

fixSeedImages();
