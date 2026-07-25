/**
 * Generates all 20 Theme Store packages under /themes
 * Run: node scripts/generateThemeStore.js  (from repo root)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const THEMES_DIR = path.join(ROOT, 'themes');

const SECTION_SOURCES = {
  hero: 'fashion',
  header: 'fashion',
  footer: 'fashion',
  'category-grid': 'fashion',
  'featured-products': 'fashion',
  'best-sellers': 'electronics',
  newsletter: 'fashion',
  testimonials: 'beauty',
  'image-banner': 'fashion',
  'rich-text': 'fashion',
  carousel: 'electronics',
  'video-banner': 'electronics',
  'features-grid': 'electronics',
  countdown: 'grocery',
  'social-icons': 'beauty',
};

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, data) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
};
const copyFile = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (fs.existsSync(from)) fs.copyFileSync(from, to);
};

const makeHero = (heading, subheading, btn, image, badge1, badge2, badge3, height = '640px', align = 'center') => ({
  name: 'Hero Banner',
  type: 'hero',
  settings: {
    backgroundImage: image,
    alignment: align,
    overlayOpacity: '0.35',
    height,
    showTrustBadges: true,
    badge1Text: badge1,
    badge2Text: badge2,
    badge3Text: badge3,
  },
  blocks: [
    {
      type: 'heading',
      settings: {
        text: heading,
        style: { tag: 'h1', fontSize: 48, color: '#ffffff', fontWeight: '900', textAlign: align },
      },
    },
    {
      type: 'subheading',
      settings: {
        text: subheading,
        style: { fontSize: 16, color: '#ffffff', fontWeight: '400', textAlign: align },
      },
    },
    {
      type: 'button',
      settings: {
        label: btn,
        link: '/catalog',
        style: {
          backgroundColor: '#ffffff',
          textColor: '#111111',
          borderRadius: '8px',
          paddingY: 14,
          paddingX: 28,
          fontSize: 13,
          shadow: 'lg',
        },
      },
    },
  ],
});

const THEMES = [
  // ——— FREE (15) ———
  {
    id: 'nova',
    name: 'Nova',
    type: 'free',
    price: 0,
    category: 'General Store',
    industry: 'General',
    desc: 'Modern high-conversion storefront for growing D2C brands.',
    features: ['Announcement Bar', 'Sticky Header', 'Quick View', 'Wishlist', 'Responsive'],
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter',
    colors: { primary: '#0f172a', secondary: '#f8fafc', accent: '#0ea5e9' },
    radius: '8px',
    sticky: true,
    transparent: false,
    announcement: 'Free shipping on orders above ₹999',
    sections: ['hero', 'featured-products', 'best-sellers', 'image-banner', 'testimonials', 'newsletter'],
    hero: makeHero(
      'Build Your Brand With Nova',
      'Clean layouts designed to convert visitors into customers.',
      'Shop Now',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600',
      'Free Shipping',
      'Secure Payments',
      'Easy Returns',
      '620px',
      'left'
    ),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    type: 'free',
    price: 0,
    category: 'Luxury',
    industry: 'General',
    desc: 'Editorial white-space theme for premium and art brands.',
    features: ['Large Typography', 'Minimal Nav', 'Editorial Layout', 'Responsive'],
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    fonts: 'Cormorant Garamond',
    colors: { primary: '#171717', secondary: '#ffffff', accent: '#737373' },
    radius: '0px',
    sticky: false,
    transparent: true,
    announcement: 'New arrivals — quietly curated',
    sections: ['hero', 'rich-text', 'featured-products', 'image-banner', 'newsletter'],
    hero: makeHero(
      'Less, But Better',
      'A quiet storefront that lets your products speak.',
      'Discover',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600',
      'Curated',
      'Timeless',
      'Limited',
      '760px',
      'center'
    ),
  },
  {
    id: 'fashion',
    name: 'Fashion',
    type: 'free',
    price: 0,
    category: 'Fashion',
    industry: 'Fashion',
    desc: 'Magazine-style fashion editorial for clothing and accessories.',
    features: ['Lookbook', 'Full-width Images', 'Mega Menu', 'Wishlist'],
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
    fonts: 'Playfair Display',
    colors: { primary: '#111111', secondary: '#fafaf9', accent: '#d4af37' },
    radius: '0px',
    sticky: true,
    transparent: false,
    announcement: 'AW Collection is live — Free shipping over ₹2000',
    sections: ['hero', 'category-grid', 'featured-products', 'image-banner', 'best-sellers', 'rich-text', 'testimonials', 'newsletter'],
    hero: makeHero(
      'THE NEW STANDARD OF COUTURE',
      'Explore the curated Autumn-Winter collection.',
      'Explore Collection',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600',
      'Prestige Shipping',
      'Curated Selection',
      'Bespoke Service',
      '700px',
      'center'
    ),
  },
  {
    id: 'luxe',
    name: 'Luxe',
    type: 'free',
    price: 0,
    category: 'Luxury',
    industry: 'Jewellery',
    desc: 'Dark luxury theme for jewelry, watches, and high-end brands.',
    features: ['Dark Mode', 'Premium Typography', 'Zoom', 'Sticky Header'],
    thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    fonts: 'Cormorant Garamond',
    colors: { primary: '#f5f5f4', secondary: '#0c0a09', accent: '#c9a227' },
    radius: '0px',
    sticky: true,
    transparent: true,
    announcement: 'Complimentary gift wrapping on all orders',
    sections: ['hero', 'featured-products', 'image-banner', 'best-sellers', 'testimonials', 'newsletter'],
    hero: makeHero(
      'Crafted For Forever',
      'Fine jewelry that defines elegance.',
      'Shop Jewelry',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600',
      'Certified',
      'Insured Shipping',
      'Lifetime Care',
      '720px',
      'center'
    ),
  },
  {
    id: 'street',
    name: 'Street',
    type: 'free',
    price: 0,
    category: 'Fashion',
    industry: 'Fashion',
    desc: 'Bold urban theme for sneakers, streetwear, and drops.',
    features: ['Bold Typography', 'Drop Countdown', 'Strong CTAs', 'Responsive'],
    thumbnail: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop',
    fonts: 'Outfit',
    colors: { primary: '#ffffff', secondary: '#09090b', accent: '#ef4444' },
    radius: '4px',
    sticky: true,
    transparent: false,
    announcement: '🔥 DROP LIVE — Limited pairs. Act fast.',
    sections: ['hero', 'countdown', 'featured-products', 'category-grid', 'best-sellers', 'newsletter'],
    hero: makeHero(
      'OWN THE STREETS',
      'Limited drops. Maximum heat. No compromises.',
      'Shop Drop',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600',
      'Limited',
      'Authentic',
      'Fast Ship',
      '680px',
      'left'
    ),
  },
  {
    id: 'fresh',
    name: 'Fresh',
    type: 'free',
    price: 0,
    category: 'Food',
    industry: 'Grocery',
    desc: 'Bright friendly theme for food, grocery, and lifestyle.',
    features: ['Colorful Cards', 'Promo Blocks', 'Sticky Header', 'Newsletter'],
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
    fonts: 'Outfit',
    colors: { primary: '#166534', secondary: '#f0fdf4', accent: '#eab308' },
    radius: '16px',
    sticky: true,
    transparent: false,
    announcement: 'Same-day delivery on orders before 2 PM',
    sections: ['hero', 'category-grid', 'featured-products', 'countdown', 'best-sellers', 'testimonials', 'newsletter'],
    hero: makeHero(
      'Farm Fresh To Your Door',
      'Groceries and everyday essentials, delivered fast.',
      'Start Shopping',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600',
      'Fresh Daily',
      'Fast Delivery',
      'Best Prices',
      '560px',
      'left'
    ),
  },
  {
    id: 'tech',
    name: 'Tech',
    type: 'free',
    price: 0,
    category: 'Electronics',
    industry: 'Electronics',
    desc: 'Futuristic product-focused theme for gadgets and hardware.',
    features: ['Feature Grid', 'Video Banner', 'Specs Focus', 'Dark UI'],
    thumbnail: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter',
    colors: { primary: '#38bdf8', secondary: '#020617', accent: '#a78bfa' },
    radius: '8px',
    sticky: true,
    transparent: false,
    announcement: 'New arrivals — 10% off with code TECH10',
    sections: ['carousel', 'category-grid', 'featured-products', 'video-banner', 'features-grid', 'best-sellers', 'newsletter'],
    hero: makeHero(
      'Next-Gen Gear',
      'Gadgets engineered for performance.',
      'Browse Tech',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600',
      'Warranty',
      'Genuine',
      'Support',
      '600px',
      'left'
    ),
  },
  {
    id: 'home',
    name: 'Home',
    type: 'free',
    price: 0,
    category: 'Home & Living',
    industry: 'Furniture',
    desc: 'Warm lifestyle theme for furniture and home decor.',
    features: ['Room Inspiration', 'Large Images', 'Wishlist', 'Responsive'],
    thumbnail: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop',
    fonts: 'DM Serif Display',
    colors: { primary: '#78350f', secondary: '#fffbeb', accent: '#b45309' },
    radius: '4px',
    sticky: true,
    transparent: false,
    announcement: 'Design your space — Free design consult this week',
    sections: ['hero', 'category-grid', 'featured-products', 'image-banner', 'features-grid', 'best-sellers', 'newsletter'],
    hero: makeHero(
      'Spaces Worth Coming Home To',
      'Furniture and decor for modern living.',
      'Shop Home',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600',
      'Free Design Tips',
      'Quality Craft',
      'Easy Returns',
      '680px',
      'center'
    ),
  },
  {
    id: 'beauty',
    name: 'Beauty',
    type: 'free',
    price: 0,
    category: 'Beauty',
    industry: 'Beauty',
    desc: 'Soft elegant theme for cosmetics, skincare, and makeup.',
    features: ['Carousel', 'Social Icons', 'Testimonials', 'Newsletter'],
    thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
    fonts: 'Playfair Display',
    colors: { primary: '#9d174d', secondary: '#fdf2f8', accent: '#f9a8d4' },
    radius: '24px',
    sticky: true,
    transparent: false,
    announcement: 'Glow season — Buy 2 get 1 free on skincare',
    sections: ['hero', 'category-grid', 'featured-products', 'best-sellers', 'testimonials', 'social-icons', 'newsletter'],
    hero: makeHero(
      'Glow From Within',
      'Skincare and beauty essentials for every routine.',
      'Shop Beauty',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600',
      'Clean Beauty',
      'Dermatologist Tested',
      'Cruelty Free',
      '640px',
      'center'
    ),
  },
  {
    id: 'kids',
    name: 'Kids',
    type: 'free',
    price: 0,
    category: 'Kids',
    industry: 'Kids & Toys',
    desc: 'Fun colorful theme for toys, kids clothing, and baby products.',
    features: ['Bright Design', 'Gift Sections', 'Countdown', 'Features Grid'],
    thumbnail: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=800&auto=format&fit=crop',
    fonts: 'Outfit',
    colors: { primary: '#7c3aed', secondary: '#faf5ff', accent: '#f59e0b' },
    radius: '16px',
    sticky: true,
    transparent: false,
    announcement: '🎁 Gift finder live — Perfect presents for every age',
    sections: ['hero', 'category-grid', 'countdown', 'featured-products', 'features-grid', 'best-sellers', 'testimonials', 'newsletter'],
    hero: makeHero(
      'Play Bigger. Dream Louder.',
      'Toys and essentials that spark joy.',
      'Shop Kids',
      'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=1600',
      'Safe Materials',
      'Age Guides',
      'Gift Wrap',
      '600px',
      'center'
    ),
  },
  {
    id: 'sports',
    name: 'Sports',
    type: 'free',
    price: 0,
    category: 'Sports',
    industry: 'Sports',
    desc: 'Energetic performance theme for fitness and sportswear.',
    features: ['Countdown', 'Specs Focus', 'Sticky Header', 'Newsletter'],
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    fonts: 'Outfit',
    colors: { primary: '#ffffff', secondary: '#14532d', accent: '#22c55e' },
    radius: '8px',
    sticky: true,
    transparent: false,
    announcement: 'Train harder — Extra 15% off training gear',
    sections: ['hero', 'countdown', 'featured-products', 'features-grid', 'best-sellers', 'newsletter'],
    hero: makeHero(
      'Train Beyond Limits',
      'Gear built for athletes who never quit.',
      'Shop Gear',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600',
      'Performance',
      'Durable',
      'Athlete Tested',
      '640px',
      'left'
    ),
  },
  {
    id: 'organic',
    name: 'Organic',
    type: 'free',
    price: 0,
    category: 'Food',
    industry: 'Organic',
    desc: 'Earthy clean theme for organic and natural products.',
    features: ['Sustainability Blocks', 'Ingredient Story', 'Newsletter'],
    thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter',
    colors: { primary: '#365314', secondary: '#f7fee7', accent: '#84cc16' },
    radius: '8px',
    sticky: true,
    transparent: false,
    announcement: '100% organic — From farm to you',
    sections: ['hero', 'rich-text', 'category-grid', 'featured-products', 'features-grid', 'testimonials', 'newsletter'],
    hero: makeHero(
      'Naturally Better',
      'Organic products with transparent sourcing.',
      'Shop Organic',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1600',
      'Certified Organic',
      'No Chemicals',
      'Sustainable',
      '600px',
      'center'
    ),
  },
  {
    id: 'handmade',
    name: 'Handmade',
    type: 'free',
    price: 0,
    category: 'Handmade',
    industry: 'Handmade',
    desc: 'Artisan story-driven theme for crafts and makers.',
    features: ['Maker Story', 'Process Section', 'Testimonials'],
    thumbnail: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=800&auto=format&fit=crop',
    fonts: 'DM Serif Display',
    colors: { primary: '#7c2d12', secondary: '#fff7ed', accent: '#ea580c' },
    radius: '4px',
    sticky: false,
    transparent: false,
    announcement: 'Made by hand — Each piece is one of a kind',
    sections: ['hero', 'rich-text', 'featured-products', 'image-banner', 'testimonials', 'newsletter'],
    hero: makeHero(
      'Made With Hands & Heart',
      'Unique artisan goods from independent makers.',
      'Meet The Makers',
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1600',
      'Handmade',
      'Unique',
      'Fair Trade',
      '640px',
      'left'
    ),
  },
  {
    id: 'electronics',
    name: 'Electronics',
    type: 'free',
    price: 0,
    category: 'Electronics',
    industry: 'Electronics',
    desc: 'High-conversion product-heavy theme for electronics stores.',
    features: ['Deals Countdown', 'Comparison Ready', 'Video Banner', 'Offers'],
    thumbnail: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter',
    colors: { primary: '#1d4ed8', secondary: '#eff6ff', accent: '#f97316' },
    radius: '8px',
    sticky: true,
    transparent: false,
    announcement: '⚡ Mega deals — Ends midnight tonight',
    sections: ['hero', 'countdown', 'category-grid', 'featured-products', 'video-banner', 'best-sellers', 'features-grid', 'newsletter'],
    hero: makeHero(
      'Deals That Power Up',
      'Top gadgets at prices that convert.',
      'View Deals',
      'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600',
      'Best Price',
      'Official Warranty',
      'Easy EMI',
      '580px',
      'left'
    ),
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    type: 'free',
    price: 0,
    category: 'General Store',
    industry: 'Marketplace',
    desc: 'Category-heavy layout for multi-category marketplaces.',
    features: ['Mega Menu', 'Flash Deals', 'Multi Collection', 'Category Grid'],
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter',
    colors: { primary: '#b45309', secondary: '#fffbeb', accent: '#dc2626' },
    radius: '8px',
    sticky: true,
    transparent: false,
    announcement: 'Flash deals every hour — Shop across 100+ categories',
    sections: ['hero', 'category-grid', 'countdown', 'featured-products', 'best-sellers', 'features-grid', 'newsletter'],
    hero: makeHero(
      'Everything. One Marketplace.',
      'Browse categories, catch flash deals, shop smarter.',
      'Explore Categories',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600',
      'Wide Selection',
      'Trusted Sellers',
      'Fast Delivery',
      '560px',
      'center'
    ),
  },

  // ——— PREMIUM (5) ———
  {
    id: 'prestige',
    name: 'Prestige',
    type: 'paid',
    price: 4999,
    category: 'Luxury',
    industry: 'Luxury',
    desc: 'Cinematic editorial luxury theme with advanced storytelling.',
    features: ['Cinematic Hero', 'Full-screen Video', 'Premium Animations', 'Editorial Collections', 'Large Typography'],
    thumbnail: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
    fonts: 'Cormorant Garamond',
    colors: { primary: '#fafaf9', secondary: '#1c1917', accent: '#a8a29e' },
    radius: '0px',
    sticky: true,
    transparent: true,
    announcement: 'Private clientele — Complimentary worldwide shipping',
    sections: ['hero', 'video-banner', 'rich-text', 'featured-products', 'image-banner', 'testimonials', 'newsletter'],
    hero: makeHero(
      'PRESTIGE UNCOMPROMISED',
      'A cinematic storefront for the world’s most exclusive brands.',
      'Enter Prestige',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600',
      'Private Client',
      'White Glove',
      'Atelier Quality',
      '820px',
      'center'
    ),
  },
  {
    id: 'empire',
    name: 'Empire',
    type: 'paid',
    price: 5999,
    category: 'General Store',
    industry: 'Marketplace',
    desc: 'Enterprise marketplace theme with advanced mega navigation.',
    features: ['Advanced Mega Menu', 'Multi-level Nav', 'Promotional Blocks', 'Large Catalog'],
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter',
    colors: { primary: '#1e3a8a', secondary: '#f8fafc', accent: '#f59e0b' },
    radius: '4px',
    sticky: true,
    transparent: false,
    announcement: 'Enterprise catalog tools — Built for scale',
    sections: ['hero', 'category-grid', 'featured-products', 'countdown', 'features-grid', 'best-sellers', 'carousel', 'newsletter'],
    hero: makeHero(
      'Scale Without Limits',
      'Powerful layouts for large catalogs and marketplaces.',
      'Start Selling',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600',
      'Enterprise',
      'Multi Vendor Ready',
      'Catalog Scale',
      '600px',
      'left'
    ),
  },
  {
    id: 'velocity',
    name: 'Velocity',
    type: 'paid',
    price: 4499,
    category: 'General Store',
    industry: 'Conversion',
    desc: 'Conversion-first theme with sticky cart, quick buy, and upsells.',
    features: ['Sticky Add to Cart', 'Quick Buy', 'Quick View', 'Countdown', 'Trust Badges', 'Upsells'],
    thumbnail: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter',
    colors: { primary: '#059669', secondary: '#ecfdf5', accent: '#111827' },
    radius: '8px',
    sticky: true,
    transparent: false,
    announcement: '⚡ Limited offer ends soon — Checkout faster with Velocity',
    sections: ['hero', 'countdown', 'featured-products', 'features-grid', 'best-sellers', 'testimonials', 'newsletter'],
    hero: makeHero(
      'Built To Convert',
      'Every section optimized for speed and sales.',
      'Boost Sales',
      'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1600',
      'Quick Buy',
      'Trust Badges',
      'Sticky Cart',
      '580px',
      'left'
    ),
  },
  {
    id: 'aurora',
    name: 'Aurora',
    type: 'paid',
    price: 5499,
    category: 'Fashion',
    industry: 'Modern D2C',
    desc: 'Artistic asymmetric layouts with scroll-driven storytelling.',
    features: ['Asymmetric Layouts', 'Scroll Animations', 'Editorial Story', 'Interactive Sections'],
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    fonts: 'Playfair Display',
    colors: { primary: '#4c1d95', secondary: '#f5f3ff', accent: '#c026d3' },
    radius: '16px',
    sticky: false,
    transparent: true,
    announcement: 'Art meets commerce — Aurora exclusive drops',
    sections: ['hero', 'image-banner', 'rich-text', 'featured-products', 'carousel', 'testimonials', 'newsletter'],
    hero: makeHero(
      'Where Design Meets Desire',
      'Creative D2C storytelling that feels like a magazine.',
      'Experience Aurora',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600',
      'Editorial',
      'Asymmetric',
      'Animated',
      '740px',
      'center'
    ),
  },
  {
    id: 'monarch',
    name: 'Monarch',
    type: 'paid',
    price: 6999,
    category: 'Luxury',
    industry: 'Premium Brand',
    desc: 'Brand-focused premium theme with lookbook and advanced promo sections.',
    features: ['Lookbook', 'Brand Storytelling', 'Advanced Nav', 'Promo Sections', 'Premium Typography'],
    thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop',
    fonts: 'Playfair Display',
    colors: { primary: '#1a1a1a', secondary: '#fafafa', accent: '#b45309' },
    radius: '0px',
    sticky: true,
    transparent: false,
    announcement: 'The house of Monarch — New lookbook available',
    sections: ['hero', 'rich-text', 'image-banner', 'featured-products', 'video-banner', 'best-sellers', 'testimonials', 'newsletter'],
    hero: makeHero(
      'RULE YOUR BRAND',
      'A powerful storefront for iconic premium labels.',
      'View Lookbook',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600',
      'Lookbook',
      'Brand Story',
      'Premium Nav',
      '760px',
      'center'
    ),
  },
];

function getSectionJson(sectionName) {
  const src = SECTION_SOURCES[sectionName] || 'fashion';
  const p = path.join(THEMES_DIR, src, 'sections', `${sectionName}.json`);
  if (fs.existsSync(p)) return readJson(p);
  // Fallback minimal section
  return {
    name: sectionName,
    type: sectionName,
    settings: { title: sectionName.replace(/-/g, ' ') },
    blocks: [],
  };
}

function buildSchema(theme) {
  return {
    name: `${theme.name} Theme Settings`,
    settings: [
      {
        name: 'Colors',
        settings: [
          { id: 'primaryColor', type: 'color', label: 'Primary Accent Color', default: theme.colors.primary },
          { id: 'secondaryColor', type: 'color', label: 'Secondary Background Color', default: theme.colors.secondary },
          { id: 'accentColor', type: 'color', label: 'Link & Highlights Color', default: theme.colors.accent },
        ],
      },
      {
        name: 'Typography & Border',
        settings: [
          {
            id: 'fontFamily',
            type: 'select',
            label: 'Primary Font Family',
            options: [
              { value: 'Inter', label: 'Inter' },
              { value: 'Outfit', label: 'Outfit' },
              { value: 'Playfair Display', label: 'Playfair Display' },
              { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
              { value: 'DM Serif Display', label: 'DM Serif Display' },
              { value: 'Roboto', label: 'Roboto' },
            ],
            default: theme.fonts,
          },
          {
            id: 'borderRadius',
            type: 'select',
            label: 'Border Radius Style',
            options: [
              { value: '0px', label: 'Sharp (0px)' },
              { value: '4px', label: 'Soft (4px)' },
              { value: '8px', label: 'Rounded (8px)' },
              { value: '16px', label: 'Circular (16px)' },
              { value: '24px', label: 'Pill (24px)' },
            ],
            default: theme.radius,
          },
        ],
      },
      {
        name: 'Header Settings',
        settings: [
          { id: 'headerConfig.sticky', type: 'toggle', label: 'Sticky Header', default: theme.sticky },
          { id: 'headerConfig.transparent', type: 'toggle', label: 'Transparent Header', default: theme.transparent },
          { id: 'headerConfig.announcementBar.enabled', type: 'toggle', label: 'Show Announcement Bar', default: true },
          { id: 'headerConfig.announcementBar.text', type: 'text', label: 'Announcement Text', default: theme.announcement },
        ],
      },
    ],
  };
}

function generateTheme(theme) {
  const dir = path.join(THEMES_DIR, theme.id);
  fs.mkdirSync(path.join(dir, 'sections'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'pages'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'previews'), { recursive: true });

  writeJson(path.join(dir, 'manifest.json'), {
    id: theme.id,
    name: theme.name,
    version: '1.0.0',
    industry: theme.industry,
    category: theme.category,
    type: theme.type === 'paid' ? 'paid' : 'free',
    price: theme.price,
    thumbnail: 'thumbnail.webp',
    schema: 'schema.json',
    supports: {
      announcementBar: true,
      megaMenu: theme.id === 'empire' || theme.id === 'marketplace',
      quickView: theme.id === 'velocity' || theme.id === 'nova',
      wishlist: true,
      productReviews: true,
      countdown: theme.sections.includes('countdown'),
    },
    templates: { home: true, product: true, collection: true, cart: true, search: true, '404': true },
  });

  writeJson(path.join(dir, 'defaultSettings.json'), {
    primaryColor: theme.colors.primary,
    secondaryColor: theme.colors.secondary,
    accentColor: theme.colors.accent,
    borderRadius: theme.radius,
    fontFamily: theme.fonts,
    headerConfig: {
      enabled: true,
      sticky: theme.sticky,
      transparent: theme.transparent,
      backgroundColor: theme.transparent ? 'transparent' : theme.colors.secondary,
      textColor: theme.colors.primary,
      logoWidth: 'auto',
      logoHeight: '36px',
      announcementBar: {
        enabled: true,
        text: theme.announcement,
        backgroundColor: theme.colors.primary,
        textColor: theme.colors.secondary,
      },
    },
    footerConfig: {
      backgroundColor: theme.colors.primary,
      textColor: theme.colors.secondary,
    },
  });

  writeJson(path.join(dir, 'schema.json'), buildSchema(theme));

  const pageSections = ['header', ...theme.sections, 'footer'];
  writeJson(path.join(dir, 'pages', 'index.json'), {
    title: 'Home Page',
    sections: pageSections,
  });

  // Always write header/footer + listed sections
  const needed = new Set(['header', 'footer', ...theme.sections]);
  for (const sec of needed) {
    if (sec === 'hero' && theme.hero) {
      writeJson(path.join(dir, 'sections', 'hero.json'), theme.hero);
      continue;
    }
    const data = getSectionJson(sec);
    writeJson(path.join(dir, 'sections', `${sec}.json`), data);
  }

  // Minimal CSS/JS placeholders
  fs.writeFileSync(
    path.join(dir, 'assets', 'theme.css'),
    `/* ${theme.name} theme styles */\n:root { --theme-primary: ${theme.colors.primary}; }\n`
  );
  fs.writeFileSync(path.join(dir, 'assets', 'theme.js'), `/* ${theme.name} theme scripts */\n`);

  // Seed catalog entry helper file
  return {
    folder: theme.id,
    themeName: `${theme.name} Theme`,
    displayName: theme.name,
    type: theme.type === 'paid' ? 'paid' : 'free',
    price: theme.price,
    industry: theme.category,
    thumbnail: theme.thumbnail,
    previewImages: [theme.thumbnail],
    shortDescription: theme.desc,
    longDescription: theme.desc,
    features: theme.features,
    status: 'published',
    visibility: 'visible',
    version: '1.0.0',
  };
}

console.log('Generating 20 Theme Store packages...');
const catalog = THEMES.map((t) => {
  const entry = generateTheme(t);
  console.log(`  ✓ ${t.name} (${t.type}${t.price ? ` ₹${t.price}` : ''}) → themes/${t.id}`);
  return entry;
});

writeJson(path.join(THEMES_DIR, 'theme-store-catalog.json'), catalog);
console.log(`\nDone. ${catalog.length} themes generated.`);
console.log(`Free: ${catalog.filter((c) => c.type === 'free').length} | Premium: ${catalog.filter((c) => c.type === 'paid').length}`);
