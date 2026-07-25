import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from './models/Store.js';
import Merchant from './models/Merchant.js';
import StorePage from './models/StorePage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SINGLE_MERCHANT_EMAIL = 'single@storify.com';

const pageContent = {
    'about-us': `<h2>About {{storeName}}</h2>
<p>Welcome to <strong>{{storeName}}</strong> — your trusted online store for quality everyday essentials.</p>
<p>We started with a simple goal: bring carefully curated products to customers across India with transparent pricing and reliable delivery.</p>
<ul>
  <li>Curated collections across apparel, footwear, home and beauty</li>
  <li>Secure checkout and tracked shipping</li>
  <li>Friendly support at {{email}} / {{phone}}</li>
</ul>
<p>Visit us at {{address}}.</p>`,

    'contact-us': `<h2>Contact {{storeName}}</h2>
<p>Have a question about an order, product, or return? We are happy to help.</p>
<p><strong>Email:</strong> {{email}}<br/>
<strong>Phone:</strong> {{phone}}<br/>
<strong>Address:</strong> {{address}}</p>
<p>Support hours: Mon–Sat, 9:00 AM – 6:00 PM IST.</p>`,

    'privacy-policy': `<h2>Privacy Policy</h2>
<p>This Privacy Policy explains how <strong>{{storeName}}</strong> collects, uses, and protects your personal information when you shop with us.</p>
<h3>Information we collect</h3>
<p>We may collect your name, email, phone, shipping address, and order details needed to fulfill purchases.</p>
<h3>How we use it</h3>
<p>We use your data to process orders, provide support, prevent fraud, and improve your shopping experience.</p>
<h3>Contact</h3>
<p>For privacy requests, email {{email}} or call {{phone}}.</p>`,

    'terms-and-conditions': `<h2>Terms and Conditions</h2>
<p>By using the {{storeName}} website, you agree to these terms.</p>
<h3>Orders & pricing</h3>
<p>All prices are listed in INR. We reserve the right to correct pricing errors and cancel orders when necessary.</p>
<h3>Accounts</h3>
<p>You are responsible for keeping your account credentials secure.</p>
<h3>Contact</h3>
<p>Questions? Reach us at {{email}} or {{phone}}.</p>`,

    'refund-policy': `<h2>Refund & Return Policy</h2>
<p>At <strong>{{storeName}}</strong>, we want you to love what you buy.</p>
<ul>
  <li>Returns accepted within 7 days of delivery for unused items in original packaging</li>
  <li>Refunds are processed to the original payment method within 5–7 business days after inspection</li>
  <li>Sale / final-sale items may not be eligible for return</li>
</ul>
<p>Start a return by emailing {{email}} or calling {{phone}}.</p>`,
};

const DEFAULT_PAGES = [
    { slug: 'home', title: 'Home Page', isHomePage: true, content: '' },
    { slug: 'about-us', title: 'About Us', content: pageContent['about-us'] },
    { slug: 'contact-us', title: 'Contact Us', content: pageContent['contact-us'] },
    { slug: 'privacy-policy', title: 'Privacy Policy', content: pageContent['privacy-policy'] },
    { slug: 'terms-and-conditions', title: 'Terms and Conditions', content: pageContent['terms-and-conditions'] },
    { slug: 'refund-policy', title: 'Refund Policy', content: pageContent['refund-policy'] },
];

const seedStorePages = async ({ exitOnDone = true } = {}) => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URL);
            console.log('[Pages Seed] MongoDB connected');
        }

        const merchant = await Merchant.findOne({ email: SINGLE_MERCHANT_EMAIL });
        if (!merchant) {
            console.error(`[Pages Seed] Merchant not found: ${SINGLE_MERCHANT_EMAIL}`);
            if (exitOnDone) process.exit(1);
            return;
        }

        const store = await Store.findOne({ merchantId: merchant._id });
        if (!store) {
            console.error('[Pages Seed] Store not found. Run seedSingleStore.js first.');
            if (exitOnDone) process.exit(1);
            return;
        }

        const themeId = store.activeTheme?.themeId || '';
        let created = 0;
        let updated = 0;

        for (const def of DEFAULT_PAGES) {
            const existing = await StorePage.findOne({
                storeId: store._id,
                slug: def.slug,
                themeId,
            });

            if (existing) {
                if (!existing.content && def.content) {
                    existing.content = def.content;
                    existing.title = def.title;
                    existing.visibility = 'published';
                    await existing.save();
                    updated += 1;
                }
                continue;
            }

            await StorePage.create({
                merchantId: merchant._id,
                storeId: store._id,
                themeId,
                slug: def.slug,
                title: def.title,
                content: def.content,
                isHomePage: !!def.isHomePage,
                visibility: 'published',
                sections: [],
            });
            created += 1;
        }

        console.log(`[Pages Seed] Created ${created}, updated ${updated} pages for ${store.storeName}`);
        if (exitOnDone) process.exit(0);
    } catch (error) {
        console.error('[Pages Seed] Failed:', error.message);
        if (exitOnDone) process.exit(1);
        throw error;
    }
};

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
    seedStorePages();
}

export default seedStorePages;
