/**
 * Advanced Theme Store — 20 production themes with unique engine configs.
 * Run: node scripts/generateAdvancedThemes.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = path.join(__dirname, '..', 'themes');

// Interaction + visual-language profiles are intentionally different per theme.
// These values are consumed by the storefront theme engine, not just stored as metadata.
const EXPERIENCE_PROFILES = {
  nova: { bodyFont: 'Inter', navFont: 'Manrope', priceFont: 'DM Sans', motion: 'spring', hover: 'lift-swap', carousel: 'peek', image: 'crisp', section: 'cards', mobile: 'bottom-bar', density: 'balanced' },
  atelier: { bodyFont: 'Manrope', navFont: 'Inter', priceFont: 'Inter', motion: 'editorial', hover: 'mask-reveal', carousel: 'editorial', image: 'portrait', section: 'asymmetric', mobile: 'minimal', density: 'airy' },
  prestige: { bodyFont: 'Libre Baskerville', navFont: 'Manrope', priceFont: 'Manrope', motion: 'cinematic', hover: 'slow-zoom', carousel: 'center', image: 'cinematic', section: 'borderless', mobile: 'minimal', density: 'airy' },
  velocity: { bodyFont: 'DM Sans', navFont: 'Sora', priceFont: 'Sora', motion: 'snappy', hover: 'cta-rise', carousel: 'multi', image: 'high-contrast', section: 'conversion', mobile: 'sticky-cta', density: 'compact' },
  empire: { bodyFont: 'Inter', navFont: 'Archivo', priceFont: 'Archivo', motion: 'functional', hover: 'details', carousel: 'multi', image: 'catalog', section: 'boxed', mobile: 'drawer', density: 'dense' },
  aurora: { bodyFont: 'DM Sans', navFont: 'Space Grotesk', priceFont: 'Space Grotesk', motion: 'fluid', hover: 'tilt', carousel: 'center', image: 'duotone', section: 'floating', mobile: 'swipe', density: 'airy' },
  monarch: { bodyFont: 'Newsreader', navFont: 'Manrope', priceFont: 'Manrope', motion: 'regal', hover: 'curtain', carousel: 'fullscreen', image: 'campaign', section: 'story', mobile: 'minimal', density: 'airy' },
  street: { bodyFont: 'Archivo', navFont: 'Archivo Black', priceFont: 'Space Grotesk', motion: 'punchy', hover: 'glitch', carousel: 'horizontal', image: 'gritty', section: 'brutalist', mobile: 'bottom-bar', density: 'compact' },
  technova: { bodyFont: 'Inter', navFont: 'Sora', priceFont: 'Sora', motion: 'tech', hover: 'scan', carousel: 'vertical', image: 'glow', section: 'panels', mobile: 'drawer', density: 'dense' },
  horizon: { bodyFont: 'Inter', navFont: 'Inter', priceFont: 'Inter', motion: 'quiet', hover: 'fade', carousel: 'minimal', image: 'soft', section: 'whitespace', mobile: 'minimal', density: 'airy' },
  haven: { bodyFont: 'Newsreader', navFont: 'DM Sans', priceFont: 'DM Sans', motion: 'warm', hover: 'zoom', carousel: 'room', image: 'warm', section: 'lifestyle', mobile: 'swipe', density: 'airy' },
  bloom: { bodyFont: 'DM Sans', navFont: 'Plus Jakarta Sans', priceFont: 'DM Sans', motion: 'gentle', hover: 'soft-lift', carousel: 'center', image: 'pastel', section: 'soft', mobile: 'bottom-bar', density: 'balanced' },
  organica: { bodyFont: 'Manrope', navFont: 'Manrope', priceFont: 'Manrope', motion: 'organic', hover: 'grow', carousel: 'natural', image: 'natural', section: 'organic', mobile: 'sticky-cta', density: 'balanced' },
  playroom: { bodyFont: 'Plus Jakarta Sans', navFont: 'Sora', priceFont: 'Sora', motion: 'playful', hover: 'bounce', carousel: 'peek', image: 'colorful', section: 'bubbles', mobile: 'bottom-bar', density: 'balanced' },
  motion: { bodyFont: 'Sora', navFont: 'Archivo', priceFont: 'Archivo', motion: 'kinetic', hover: 'speed', carousel: 'horizontal', image: 'dynamic', section: 'angled', mobile: 'sticky-cta', density: 'compact' },
  'marketplace-pro': { bodyFont: 'Roboto', navFont: 'Roboto', priceFont: 'Roboto', motion: 'deal-flow', hover: 'price-pop', carousel: 'deal-strip', image: 'marketplace', section: 'bazaar', mobile: 'drawer', density: 'dense' },
  craft: { bodyFont: 'Newsreader', navFont: 'DM Sans', priceFont: 'DM Sans', motion: 'handmade', hover: 'paper', carousel: 'story', image: 'textured', section: 'paper', mobile: 'minimal', density: 'airy' },
  flash: { bodyFont: 'Archivo', navFont: 'Archivo Black', priceFont: 'Archivo Black', motion: 'urgent', hover: 'cta-rise', carousel: 'deal', image: 'high-contrast', section: 'sale', mobile: 'sticky-cta', density: 'compact' },
  grid: { bodyFont: 'Inter', navFont: 'Space Grotesk', priceFont: 'Space Grotesk', motion: 'systematic', hover: 'grid-shift', carousel: 'multi', image: 'uniform', section: 'grid', mobile: 'drawer', density: 'dense' },
  signature: { bodyFont: 'Manrope', navFont: 'Manrope', priceFont: 'DM Sans', motion: 'signature', hover: 'magnetic', carousel: 'adaptive', image: 'premium', section: 'modular', mobile: 'adaptive', density: 'balanced' },
};

const SECTION_SOURCES = {
  hero: 'fashion', header: 'fashion', footer: 'fashion',
  'category-grid': 'fashion', 'featured-products': 'fashion',
  'best-sellers': 'electronics', newsletter: 'fashion', testimonials: 'beauty',
  'image-banner': 'fashion', 'rich-text': 'fashion', carousel: 'electronics',
  'video-banner': 'electronics', 'features-grid': 'electronics',
  countdown: 'grocery', 'social-icons': 'beauty',
};

const ADVANCED_SECTIONS_BY_THEME = {
  nova: ['storytelling'], atelier: ['lookbook'], prestige: ['storytelling', 'shoppable-video'],
  velocity: ['shoppable-video'], empire: ['storytelling'], aurora: ['lookbook'],
  monarch: ['lookbook', 'storytelling'], street: ['shoppable-video'], technova: ['shoppable-video'],
  horizon: ['storytelling'], haven: ['lookbook'], bloom: ['before-after'],
  organica: ['storytelling'], playroom: ['lookbook'], motion: ['shoppable-video'],
  'marketplace-pro': ['shoppable-video'], craft: ['storytelling'], flash: ['shoppable-video'],
  grid: ['storytelling'], signature: ['lookbook', 'shoppable-video', 'storytelling'],
};

const ADVANCED_SECTION_DEFAULTS = {
  lookbook: {
    name: 'Shoppable Lookbook', type: 'lookbook',
    settings: { title: 'Shop the Look', subtitle: 'Explore products directly from the story.', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600' },
    blocks: [
      { type: 'hotspot', settings: { x: 34, y: 38, label: 'Featured Style', price: 'Explore', link: '/catalog' } },
      { type: 'hotspot', settings: { x: 66, y: 70, label: 'Complete the Look', price: 'Shop now', link: '/catalog' } },
    ],
  },
  'before-after': {
    name: 'Before / After', type: 'before-after',
    settings: { title: 'See the Transformation', beforeImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400', afterImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400' },
    blocks: [],
  },
  storytelling: {
    name: 'Brand Story', type: 'storytelling',
    settings: { eyebrow: 'Our story', title: 'Made with intention.', subtitle: 'From first idea to finished product.' },
    blocks: [
      { type: 'chapter', settings: { eyebrow: '01 — Origin', title: 'How it started', text: 'A simple idea shaped by care, craft, and purpose.' } },
      { type: 'chapter', settings: { eyebrow: '02 — Process', title: 'How we make it', text: 'Thoughtful materials and trusted makers.' } },
      { type: 'chapter', settings: { eyebrow: '03 — Promise', title: 'Why it matters', text: 'Quality designed to last beyond the season.' } },
    ],
  },
  'shoppable-video': {
    name: 'Shoppable Video', type: 'shoppable-video',
    settings: { title: 'See it in motion', autoplay: true, loop: true, controls: false, videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-with-a-green-jacket-39875-large.mp4' },
    blocks: [{ type: 'product', settings: { title: 'Shop the featured collection', price: 'Explore now', link: '/catalog' } }],
  },
};

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, data) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
};

const hero = (heading, sub, btn, img, badges, height = '640px', align = 'center', layout = 'overlay') => ({
  name: 'Hero Banner', type: 'hero',
  settings: {
    backgroundImage: img, alignment: align, overlayOpacity: '0.4', height,
    layout,
    showTrustBadges: true, badge1Text: badges[0], badge2Text: badges[1], badge3Text: badges[2],
  },
  blocks: [
    { type: 'heading', settings: { text: heading, style: { tag: 'h1', fontSize: 48, color: '#fff', fontWeight: '900', textAlign: align } } },
    { type: 'subheading', settings: { text: sub, style: { fontSize: 16, color: '#fff', fontWeight: '400', textAlign: align } } },
    { type: 'button', settings: { label: btn, link: '/catalog', style: { backgroundColor: '#fff', textColor: '#111', borderRadius: '8px', paddingY: 14, paddingX: 28, fontSize: 13 } } },
  ],
});

const getSec = (name) => {
  if (ADVANCED_SECTION_DEFAULTS[name]) return ADVANCED_SECTION_DEFAULTS[name];
  const src = SECTION_SOURCES[name] || 'fashion';
  const p = path.join(THEMES_DIR, src, 'sections', `${name}.json`);
  if (fs.existsSync(p)) return readJson(p);
  return { name, type: name, settings: { title: name }, blocks: [] };
};

/**
 * 20 advanced themes — each with unique:
 * headerStyle, productCardStyle, productPageLayout, collectionLayout, cartStyle, heroStyle, spacing, sections
 */
const THEMES = [
  { id: 'nova', name: 'Nova', type: 'free', price: 0, category: 'General Store', industry: 'Modern D2C',
    desc: 'Modern conversion-focused D2C storefront with floating header and quick-add cards.',
    features: ['Floating Header', 'Hover Image Swap', 'Quick Add', 'Product Carousel', 'Sticky Mobile Cart'],
    thumb: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter', headingFont: 'Inter', colors: { p: '#0f172a', s: '#f8fafc', a: '#0ea5e9' }, radius: '8px',
    engine: { headerStyle: 'floating', productCardStyle: 'hoverSwap', productPageLayout: 'sticky', collectionLayout: 'grid', cartStyle: 'drawer', heroStyle: 'split', spacingScale: 'normal', buttonStyle: 'solid' },
    sticky: true, transparent: false, announcement: 'Free shipping on orders above ₹999',
    sections: ['hero', 'category-grid', 'featured-products', 'image-banner', 'best-sellers', 'features-grid', 'testimonials', 'newsletter'],
    hero: hero('Build Faster. Sell Smarter.', 'A modern D2C storefront engineered to convert.', 'Shop Now', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600', ['Free Ship', 'Secure Pay', 'Easy Returns'], '620px', 'left', 'split') },

  { id: 'atelier', name: 'Atelier', type: 'free', price: 0, category: 'Fashion', industry: 'Editorial Fashion',
    desc: 'Luxury fashion magazine layout with asymmetric editorial grids and image-first navigation.',
    features: ['Editorial Typography', 'Asymmetric Layouts', 'Lookbook', 'Minimal UI', 'Large Photography'],
    thumb: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
    fonts: 'Cormorant Garamond', headingFont: 'Playfair Display', colors: { p: '#1c1917', s: '#fafaf9', a: '#a8a29e' }, radius: '0px',
    engine: { headerStyle: 'centered', productCardStyle: 'editorial', productPageLayout: 'editorial', collectionLayout: 'editorial', cartStyle: 'page', heroStyle: 'cinematic', spacingScale: 'roomy', buttonStyle: 'outline' },
    sticky: false, transparent: true, announcement: 'New season lookbook is live',
    sections: ['hero', 'rich-text', 'featured-products', 'image-banner', 'best-sellers', 'testimonials', 'newsletter'],
    hero: hero('THE ATELIER EDIT', 'Editorial fashion for the considered wardrobe.', 'Explore', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600', ['Curated', 'Limited', 'Bespoke'], '780px', 'center') },

  { id: 'prestige', name: 'Prestige', type: 'paid', price: 4999, category: 'Luxury', industry: 'Luxury',
    desc: 'Cinematic luxury commerce for jewellery, watches, and premium brands.',
    features: ['Cinematic Hero', 'Luxury Cards', 'Craftsmanship Blocks', 'Premium Hover', 'Dark Mode Ready'],
    thumb: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    fonts: 'Cormorant Garamond', headingFont: 'Cormorant Garamond', colors: { p: '#f5f5f4', s: '#0c0a09', a: '#c9a227' }, radius: '0px',
    engine: { headerStyle: 'transparent', productCardStyle: 'luxury', productPageLayout: 'luxury', collectionLayout: 'editorial', cartStyle: 'page', heroStyle: 'cinematic', spacingScale: 'roomy', buttonStyle: 'square' },
    sticky: true, transparent: true, announcement: 'Complimentary gift wrapping worldwide',
    sections: ['hero', 'video-banner', 'featured-products', 'rich-text', 'image-banner', 'testimonials', 'newsletter'],
    hero: hero('CRAFTED FOR FOREVER', 'Fine jewellery that defines quiet luxury.', 'Discover', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600', ['Certified', 'Insured', 'Lifetime'], '820px', 'center') },

  { id: 'velocity', name: 'Velocity', type: 'paid', price: 4499, category: 'General Store', industry: 'Conversion',
    desc: 'High-conversion theme with countdown, quick buy, and sticky purchase flows.',
    features: ['Sticky ATC', 'Quick Buy', 'Countdown', 'Trust Badges', 'Cart Upsells'],
    thumb: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter', headingFont: 'Outfit', colors: { p: '#059669', s: '#ecfdf5', a: '#111827' }, radius: '8px',
    engine: { headerStyle: 'classic', productCardStyle: 'quickAdd', productPageLayout: 'sticky', collectionLayout: 'grid', cartStyle: 'sticky', heroStyle: 'promo', spacingScale: 'tight', buttonStyle: 'solid' },
    sticky: true, transparent: false, announcement: '⚡ Flash offer ends tonight — checkout faster',
    sections: ['hero', 'countdown', 'featured-products', 'best-sellers', 'features-grid', 'testimonials', 'newsletter'],
    hero: hero('BUILT TO CONVERT', 'Every section optimized for speed and sales.', 'Shop Deals', 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1600', ['Quick Buy', 'Trust', 'Sticky Cart'], '560px', 'left') },

  { id: 'empire', name: 'Empire', type: 'paid', price: 5999, category: 'General Store', industry: 'Large Catalog',
    desc: 'Enterprise catalog theme with mega navigation and dense product grids.',
    features: ['Mega Menu', 'Dense Grid', 'Sidebar Filters', 'Multi Carousels', 'Brand Directory'],
    thumb: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter', headingFont: 'Inter', colors: { p: '#1e3a8a', s: '#f8fafc', a: '#f59e0b' }, radius: '4px',
    engine: { headerStyle: 'mega', productCardStyle: 'marketplace', productPageLayout: 'classic', collectionLayout: 'sidebar', cartStyle: 'page', heroStyle: 'promo', spacingScale: 'tight', buttonStyle: 'solid' },
    sticky: true, transparent: false, announcement: 'Enterprise catalog tools — built for scale',
    sections: ['hero', 'category-grid', 'featured-products', 'countdown', 'carousel', 'best-sellers', 'features-grid', 'newsletter'],
    hero: hero('SCALE WITHOUT LIMITS', 'Powerful layouts for large catalogs.', 'Browse Catalog', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600', ['Enterprise', 'Filters', 'Dense Grid'], '540px', 'left') },

  { id: 'aurora', name: 'Aurora', type: 'free', price: 0, category: 'Fashion', industry: 'Creative D2C',
    desc: 'Artistic asymmetric layouts with scroll-friendly storytelling sections.',
    features: ['Asymmetric Grid', 'Floating Blocks', 'Editorial Cards', 'Motion-safe Animations'],
    thumb: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    fonts: 'Outfit', headingFont: 'Playfair Display', colors: { p: '#4c1d95', s: '#f5f3ff', a: '#c026d3' }, radius: '16px',
    engine: { headerStyle: 'floating', productCardStyle: 'editorial', productPageLayout: 'editorial', collectionLayout: 'masonry', cartStyle: 'drawer', heroStyle: 'cinematic', spacingScale: 'roomy', buttonStyle: 'pill' },
    sticky: false, transparent: true, announcement: 'Aurora exclusive drops — art meets commerce',
    sections: ['hero', 'image-banner', 'rich-text', 'featured-products', 'carousel', 'testimonials', 'newsletter'],
    hero: hero('WHERE DESIGN MEETS DESIRE', 'Creative D2C storytelling that feels editorial.', 'Experience', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600', ['Artistic', 'Asymmetric', 'Premium'], '740px', 'center') },

  { id: 'monarch', name: 'Monarch', type: 'paid', price: 6999, category: 'Luxury', industry: 'Premium Brand',
    desc: 'Flagship brand-first theme with campaign storytelling and lookbook sections.',
    features: ['Brand Hero', 'Lookbook', 'Campaign Sections', 'Premium Nav', 'Story Blocks'],
    thumb: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop',
    fonts: 'Playfair Display', headingFont: 'Playfair Display', colors: { p: '#1a1a1a', s: '#fafafa', a: '#b45309' }, radius: '0px',
    engine: { headerStyle: 'centered', productCardStyle: 'large', productPageLayout: 'luxury', collectionLayout: 'editorial', cartStyle: 'page', heroStyle: 'full', spacingScale: 'roomy', buttonStyle: 'square' },
    sticky: true, transparent: false, announcement: 'The house of Monarch — new lookbook available',
    sections: ['hero', 'rich-text', 'image-banner', 'featured-products', 'video-banner', 'best-sellers', 'testimonials', 'newsletter'],
    hero: hero('RULE YOUR BRAND', 'A powerful storefront for iconic labels.', 'View Lookbook', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600', ['Lookbook', 'Brand', 'Campaign'], '760px', 'center') },

  { id: 'street', name: 'Street', type: 'free', price: 0, category: 'Fashion', industry: 'Urban Fashion',
    desc: 'Bold streetwear theme for drops, sneakers, and youth culture brands.',
    features: ['Drop Announcement', 'Bold Type', 'Dark Theme', 'Horizontal Collections'],
    thumb: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop',
    fonts: 'Outfit', headingFont: 'Outfit', colors: { p: '#ffffff', s: '#09090b', a: '#ef4444' }, radius: '4px',
    engine: { headerStyle: 'dark', productCardStyle: 'sale', productPageLayout: 'classic', collectionLayout: 'dense', cartStyle: 'drawer', heroStyle: 'promo', spacingScale: 'tight', buttonStyle: 'solid' },
    sticky: true, transparent: false, announcement: '🔥 DROP LIVE — Limited pairs. Act fast.',
    sections: ['hero', 'countdown', 'featured-products', 'category-grid', 'best-sellers', 'social-icons', 'newsletter'],
    hero: hero('OWN THE STREETS', 'Limited drops. Maximum heat.', 'Shop Drop', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600', ['Limited', 'Authentic', 'Fast Ship'], '680px', 'left') },

  { id: 'technova', name: 'Technova', type: 'free', price: 0, category: 'Electronics', industry: 'Electronics',
    desc: 'Tech-focused storefront with specs highlights and comparison-ready layouts.',
    features: ['Spec Highlights', 'Feature Icons', 'Video Banner', 'Product-first Hero'],
    thumb: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter', headingFont: 'Inter', colors: { p: '#38bdf8', s: '#020617', a: '#a78bfa' }, radius: '8px',
    engine: { headerStyle: 'mega', productCardStyle: 'compact', productPageLayout: 'tech', collectionLayout: 'sidebar', cartStyle: 'page', heroStyle: 'split', spacingScale: 'normal', buttonStyle: 'solid' },
    sticky: true, transparent: false, announcement: 'New arrivals — 10% off with TECH10',
    sections: ['carousel', 'category-grid', 'featured-products', 'video-banner', 'features-grid', 'best-sellers', 'newsletter'],
    hero: hero('NEXT-GEN GEAR', 'Gadgets engineered for performance.', 'Browse Tech', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600', ['Warranty', 'Genuine', 'Support'], '600px', 'left', 'split') },

  { id: 'horizon', name: 'Horizon', type: 'free', price: 0, category: 'Luxury', industry: 'Minimal Premium',
    desc: 'Ultra-clean minimal premium theme with maximum whitespace and editorial type.',
    features: ['Max Whitespace', 'Minimal Nav', 'Editorial Type', 'Clean Cards'],
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter', headingFont: 'Cormorant Garamond', colors: { p: '#171717', s: '#ffffff', a: '#737373' }, radius: '0px',
    engine: { headerStyle: 'minimal', productCardStyle: 'minimal', productPageLayout: 'editorial', collectionLayout: 'editorial', cartStyle: 'page', heroStyle: 'minimal', spacingScale: 'roomy', buttonStyle: 'outline' },
    sticky: false, transparent: false, announcement: 'Quietly curated — new arrivals',
    sections: ['hero', 'rich-text', 'featured-products', 'image-banner', 'newsletter'],
    hero: hero('Less, But Better', 'A quiet storefront that lets products speak.', 'Discover', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600', ['Curated', 'Timeless', 'Limited'], '720px', 'center') },

  { id: 'haven', name: 'Haven', type: 'free', price: 0, category: 'Home & Living', industry: 'Home & Living',
    desc: 'Warm lifestyle theme for furniture and interior products with room inspiration.',
    features: ['Room Navigation', 'Lifestyle Cards', 'Warm Layout', 'Large Images'],
    thumb: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop',
    fonts: 'DM Serif Display', headingFont: 'DM Serif Display', colors: { p: '#78350f', s: '#fffbeb', a: '#b45309' }, radius: '4px',
    engine: { headerStyle: 'classic', productCardStyle: 'large', productPageLayout: 'split', collectionLayout: 'grid', cartStyle: 'page', heroStyle: 'full', spacingScale: 'roomy', buttonStyle: 'solid' },
    sticky: true, transparent: false, announcement: 'Design your space — free consult this week',
    sections: ['hero', 'category-grid', 'featured-products', 'image-banner', 'features-grid', 'best-sellers', 'newsletter'],
    hero: hero('Spaces Worth Coming Home To', 'Furniture and decor for modern living.', 'Shop Home', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600', ['Warm', 'Quality', 'Easy Returns'], '680px', 'center') },

  { id: 'bloom', name: 'Bloom', type: 'free', price: 0, category: 'Beauty', industry: 'Beauty',
    desc: 'Soft premium beauty theme with concern-based shopping and routine sections.',
    features: ['Concern Nav', 'Ingredient Story', 'Routine Blocks', 'Soft Cards'],
    thumb: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
    fonts: 'Playfair Display', headingFont: 'Playfair Display', colors: { p: '#9d174d', s: '#fdf2f8', a: '#f9a8d4' }, radius: '24px',
    engine: { headerStyle: 'centered', productCardStyle: 'standard', productPageLayout: 'sticky', collectionLayout: 'grid', cartStyle: 'drawer', heroStyle: 'full', spacingScale: 'normal', buttonStyle: 'pill' },
    sticky: true, transparent: false, announcement: 'Glow season — Buy 2 get 1 on skincare',
    sections: ['hero', 'category-grid', 'featured-products', 'best-sellers', 'testimonials', 'social-icons', 'newsletter'],
    hero: hero('Glow From Within', 'Skincare essentials for every routine.', 'Shop Beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600', ['Clean', 'Tested', 'Cruelty Free'], '640px', 'center') },

  { id: 'organica', name: 'Organica', type: 'free', price: 0, category: 'Food', industry: 'Organic',
    desc: 'Earthy natural theme for organic, wellness, and sustainable products.',
    features: ['Ingredient Blocks', 'Sustainability Badges', 'Farm Story'],
    thumb: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter', headingFont: 'DM Serif Display', colors: { p: '#365314', s: '#f7fee7', a: '#84cc16' }, radius: '8px',
    engine: { headerStyle: 'classic', productCardStyle: 'standard', productPageLayout: 'classic', collectionLayout: 'grid', cartStyle: 'page', heroStyle: 'full', spacingScale: 'normal', buttonStyle: 'solid' },
    sticky: true, transparent: false, announcement: '100% organic — from farm to you',
    sections: ['hero', 'rich-text', 'category-grid', 'featured-products', 'features-grid', 'testimonials', 'newsletter'],
    hero: hero('Naturally Better', 'Organic products with transparent sourcing.', 'Shop Organic', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1600', ['Certified', 'No Chemicals', 'Sustainable'], '600px', 'center') },

  { id: 'playroom', name: 'Playroom', type: 'free', price: 0, category: 'Kids', industry: 'Kids & Family',
    desc: 'Fun colorful theme for toys, kids fashion, and baby products.',
    features: ['Age Navigation', 'Gift Finder', 'Fun Cards', 'Family UX'],
    thumb: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=800&auto=format&fit=crop',
    fonts: 'Outfit', headingFont: 'Outfit', colors: { p: '#7c3aed', s: '#faf5ff', a: '#f59e0b' }, radius: '16px',
    engine: { headerStyle: 'classic', productCardStyle: 'quickAdd', productPageLayout: 'classic', collectionLayout: 'grid', cartStyle: 'drawer', heroStyle: 'promo', spacingScale: 'normal', buttonStyle: 'pill' },
    sticky: true, transparent: false, announcement: '🎁 Gift finder live — presents for every age',
    sections: ['hero', 'category-grid', 'countdown', 'featured-products', 'features-grid', 'best-sellers', 'testimonials', 'newsletter'],
    hero: hero('Play Bigger. Dream Louder.', 'Toys and essentials that spark joy.', 'Shop Kids', 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=1600', ['Safe', 'Age Guides', 'Gift Wrap'], '600px', 'center') },

  { id: 'motion', name: 'Motion', type: 'free', price: 0, category: 'Sports', industry: 'Sports & Fitness',
    desc: 'Energetic performance theme for sportswear and fitness equipment.',
    features: ['Athlete Hero', 'Performance Metrics', 'Bold CTAs', 'Feature Highlights'],
    thumb: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    fonts: 'Outfit', headingFont: 'Outfit', colors: { p: '#ffffff', s: '#14532d', a: '#22c55e' }, radius: '8px',
    engine: { headerStyle: 'dark', productCardStyle: 'hoverSwap', productPageLayout: 'sticky', collectionLayout: 'dense', cartStyle: 'sticky', heroStyle: 'split', spacingScale: 'tight', buttonStyle: 'solid' },
    sticky: true, transparent: false, announcement: 'Train harder — 15% off training gear',
    sections: ['hero', 'countdown', 'featured-products', 'features-grid', 'best-sellers', 'newsletter'],
    hero: hero('Train Beyond Limits', 'Gear built for athletes who never quit.', 'Shop Gear', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600', ['Performance', 'Durable', 'Tested'], '640px', 'left', 'split') },

  { id: 'marketplace-pro', name: 'Marketplace Pro', type: 'free', price: 0, category: 'General Store', industry: 'Marketplace',
    desc: 'Dense multi-category marketplace with mega menu and flash deals.',
    features: ['Mega Menu', 'Flash Deals', 'Dense IA', 'Brand Strip', 'Filters'],
    thumb: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter', headingFont: 'Inter', colors: { p: '#b45309', s: '#fffbeb', a: '#dc2626' }, radius: '8px',
    engine: { headerStyle: 'mega', productCardStyle: 'marketplace', productPageLayout: 'classic', collectionLayout: 'sidebar', cartStyle: 'page', heroStyle: 'promo', spacingScale: 'tight', buttonStyle: 'solid' },
    sticky: true, transparent: false, announcement: 'Flash deals every hour — 100+ categories',
    sections: ['hero', 'category-grid', 'countdown', 'featured-products', 'best-sellers', 'features-grid', 'newsletter'],
    hero: hero('Everything. One Marketplace.', 'Browse categories and catch flash deals.', 'Explore', 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600', ['Wide Range', 'Trusted', 'Fast'], '540px', 'center') },

  { id: 'craft', name: 'Craft', type: 'free', price: 0, category: 'Handmade', industry: 'Handmade',
    desc: 'Artisan storytelling theme for handmade products and makers.',
    features: ['Maker Story', 'Process Section', 'Origin Blocks', 'Warm Cards'],
    thumb: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=800&auto=format&fit=crop',
    fonts: 'DM Serif Display', headingFont: 'DM Serif Display', colors: { p: '#7c2d12', s: '#fff7ed', a: '#ea580c' }, radius: '4px',
    engine: { headerStyle: 'minimal', productCardStyle: 'editorial', productPageLayout: 'editorial', collectionLayout: 'editorial', cartStyle: 'page', heroStyle: 'full', spacingScale: 'roomy', buttonStyle: 'outline' },
    sticky: false, transparent: false, announcement: 'Made by hand — each piece is one of a kind',
    sections: ['hero', 'rich-text', 'featured-products', 'image-banner', 'testimonials', 'newsletter'],
    hero: hero('Made With Hands & Heart', 'Unique artisan goods from independent makers.', 'Meet Makers', 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1600', ['Handmade', 'Unique', 'Fair'], '640px', 'left') },

  { id: 'flash', name: 'Flash', type: 'free', price: 0, category: 'General Store', industry: 'Deals',
    desc: 'High-energy promotional theme with countdown and real stock urgency UI.',
    features: ['Live Countdown', 'Discount Badges', 'Deal Bar', 'Sale Cards'],
    thumb: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop',
    fonts: 'Outfit', headingFont: 'Outfit', colors: { p: '#dc2626', s: '#fef2f2', a: '#111827' }, radius: '8px',
    engine: { headerStyle: 'classic', productCardStyle: 'sale', productPageLayout: 'sticky', collectionLayout: 'dense', cartStyle: 'sticky', heroStyle: 'promo', spacingScale: 'tight', buttonStyle: 'solid' },
    sticky: true, transparent: false, announcement: '⚡ Mega sale — limited stock, real inventory',
    sections: ['hero', 'countdown', 'featured-products', 'best-sellers', 'category-grid', 'newsletter'],
    hero: hero('DEALS THAT MOVE FAST', 'Promotional commerce without the fluff.', 'Shop Sale', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600', ['Countdown', 'Real Stock', 'Savings'], '520px', 'left') },

  { id: 'grid', name: 'Grid', type: 'free', price: 0, category: 'General Store', industry: 'Modern Catalog',
    desc: 'Product-first organized catalog with multiple card densities and clean filters.',
    features: ['Advanced Grid', 'Multi Card Layouts', 'Powerful Filters', 'Clean Catalog'],
    thumb: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter', headingFont: 'Inter', colors: { p: '#1d4ed8', s: '#eff6ff', a: '#f97316' }, radius: '8px',
    engine: { headerStyle: 'classic', productCardStyle: 'compact', productPageLayout: 'classic', collectionLayout: 'dense', cartStyle: 'page', heroStyle: 'minimal', spacingScale: 'tight', buttonStyle: 'solid' },
    sticky: true, transparent: false, announcement: 'Organized shopping — find anything faster',
    sections: ['hero', 'category-grid', 'featured-products', 'best-sellers', 'features-grid', 'newsletter'],
    hero: hero('Catalog, Perfected', 'Dense, clean, product-first shopping.', 'Browse Grid', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600', ['Dense', 'Filters', 'Fast'], '500px', 'center') },

  { id: 'signature', name: 'Signature', type: 'paid', price: 7999, category: 'Luxury', industry: 'Premium Universal',
    desc: 'Flagship all-purpose premium theme with the richest section library and layouts.',
    features: ['Max Customization', 'Multiple Heroes', 'Lookbooks', 'Advanced Mobile', 'Full Section Library'],
    thumb: 'https://images.unsplash.com/photo-1441984904996-e0b14ba4ad60?q=80&w=800&auto=format&fit=crop',
    fonts: 'Inter', headingFont: 'Playfair Display', colors: { p: '#111827', s: '#ffffff', a: '#14b8a6' }, radius: '8px',
    engine: { headerStyle: 'floating', productCardStyle: 'hoverSwap', productPageLayout: 'sticky', collectionLayout: 'grid', cartStyle: 'drawer', heroStyle: 'cinematic', spacingScale: 'normal', buttonStyle: 'solid' },
    sticky: true, transparent: true, announcement: 'Signature — the most advanced Storify theme',
    sections: ['hero', 'category-grid', 'featured-products', 'video-banner', 'image-banner', 'countdown', 'features-grid', 'best-sellers', 'testimonials', 'rich-text', 'newsletter'],
    hero: hero('THE FLAGSHIP EXPERIENCE', 'One theme. Every capability. Signature.', 'Start Building', 'https://images.unsplash.com/photo-1441984904996-e0b14ba4ad60?w=1600', ['Complete', 'Premium', 'Flexible'], '700px', 'center') },
];

function generate(theme) {
  const experience = EXPERIENCE_PROFILES[theme.id];
  const themeSections = [...theme.sections, ...(ADVANCED_SECTIONS_BY_THEME[theme.id] || [])];
  const dir = path.join(THEMES_DIR, theme.id);
  fs.mkdirSync(path.join(dir, 'sections'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'pages'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });

  writeJson(path.join(dir, 'manifest.json'), {
    id: theme.id, name: theme.name, version: '2.0.0',
    industry: theme.industry, category: theme.category,
    type: theme.type === 'paid' ? 'paid' : 'free', price: theme.price,
    thumbnail: 'thumbnail.webp', schema: 'schema.json',
    engine: theme.engine,
    supports: { announcementBar: true, megaMenu: ['empire', 'marketplace-pro', 'technova'].includes(theme.id), quickView: true, wishlist: true, countdown: themeSections.includes('countdown'), lookbook: themeSections.includes('lookbook'), shoppableVideo: themeSections.includes('shoppable-video') },
    templates: { home: true, product: true, collection: true, cart: true },
  });

  writeJson(path.join(dir, 'defaultSettings.json'), {
    themeId: theme.id,
    designLanguage: theme.industry,
    primaryColor: theme.colors.p,
    secondaryColor: theme.colors.s,
    accentColor: theme.colors.a,
    borderRadius: theme.radius,
    fontFamily: theme.fonts,
    headingFont: theme.headingFont,
    bodyFont: experience.bodyFont,
    buttonFont: experience.navFont,
    navigationFont: experience.navFont,
    priceFont: experience.priceFont,
    headingLetterSpacing: experience.density === 'airy' ? '-0.02em' : experience.density === 'compact' ? '-0.04em' : '-0.025em',
    bodyLineHeight: experience.density === 'dense' ? 1.45 : 1.65,
    motionPreset: experience.motion,
    hoverPreset: experience.hover,
    carouselStyle: experience.carousel,
    imageTreatment: experience.image,
    sectionStyle: experience.section,
    mobileNavStyle: experience.mobile,
    contentDensity: experience.density,
    reducedMotionSupport: true,
    ...theme.engine,
    footerStyle: theme.engine.footerStyle || (
      theme.engine.headerStyle === 'dark' ? 'dark'
        : theme.engine.headerStyle === 'centered' || theme.engine.headerStyle === 'minimal' ? 'centered'
          : theme.engine.spacingScale === 'roomy' ? 'minimal'
            : 'columns'
    ),
    headerConfig: {
      enabled: true, sticky: theme.sticky, transparent: theme.transparent,
      backgroundColor: theme.transparent ? 'transparent' : theme.colors.s,
      textColor: theme.colors.p, logoWidth: 'auto', logoHeight: '36px',
      announcementBar: { enabled: true, text: theme.announcement, backgroundColor: theme.colors.p, textColor: theme.colors.s },
      showSearch: true, showCart: true, showWishlist: true,
    },
    footerConfig: { backgroundColor: theme.colors.p, textColor: theme.colors.s, enabled: true },
  });

  writeJson(path.join(dir, 'schema.json'), {
    name: `${theme.name} Theme Settings`,
    settings: [
      { name: 'Colors', settings: [
        { id: 'primaryColor', type: 'color', label: 'Primary', default: theme.colors.p },
        { id: 'secondaryColor', type: 'color', label: 'Background', default: theme.colors.s },
        { id: 'accentColor', type: 'color', label: 'Accent', default: theme.colors.a },
      ]},
      { name: 'Layout Engine', settings: [
        { id: 'headerStyle', type: 'select', label: 'Header Style', default: theme.engine.headerStyle,
          options: ['classic','centered','floating','transparent','minimal','mega','dark'].map(v => ({ value: v, label: v })) },
        { id: 'productCardStyle', type: 'select', label: 'Product Card', default: theme.engine.productCardStyle,
          options: ['standard','minimal','editorial','luxury','compact','hoverSwap','quickAdd','marketplace','sale','large'].map(v => ({ value: v, label: v })) },
        { id: 'productPageLayout', type: 'select', label: 'Product Page', default: theme.engine.productPageLayout,
          options: ['classic','sticky','editorial','split','tech','luxury'].map(v => ({ value: v, label: v })) },
        { id: 'collectionLayout', type: 'select', label: 'Collection Layout', default: theme.engine.collectionLayout,
          options: ['grid','dense','editorial','masonry','sidebar'].map(v => ({ value: v, label: v })) },
      ]},
      { name: 'Typography & Motion', settings: [
        { id: 'headingFont', type: 'font', label: 'Heading font', default: theme.headingFont },
        { id: 'bodyFont', type: 'font', label: 'Body font', default: experience.bodyFont },
        { id: 'navigationFont', type: 'font', label: 'Navigation font', default: experience.navFont },
        { id: 'priceFont', type: 'font', label: 'Price font', default: experience.priceFont },
        { id: 'motionPreset', type: 'select', label: 'Animation language', default: experience.motion,
          options: ['quiet','gentle','editorial','cinematic','fluid','snappy','kinetic','playful','functional'].map(v => ({ value: v, label: v })) },
        { id: 'hoverPreset', type: 'select', label: 'Hover language', default: experience.hover,
          options: ['fade','zoom','slow-zoom','lift-swap','mask-reveal','cta-rise','tilt','glitch','scan','bounce','magnetic'].map(v => ({ value: v, label: v })) },
      ]},
      { name: 'Header', settings: [
        { id: 'headerConfig.sticky', type: 'toggle', label: 'Sticky Header', default: theme.sticky },
        { id: 'headerConfig.announcementBar.enabled', type: 'toggle', label: 'Announcement Bar', default: true },
        { id: 'headerConfig.announcementBar.text', type: 'text', label: 'Announcement Text', default: theme.announcement },
      ]},
    ],
  });

  writeJson(path.join(dir, 'pages', 'index.json'), {
    title: 'Home Page',
    sections: ['header', ...themeSections, 'footer'],
  });

  const needed = new Set(['header', 'footer', ...themeSections]);
  for (const sec of needed) {
    if (sec === 'hero' && theme.hero) writeJson(path.join(dir, 'sections', 'hero.json'), theme.hero);
    else writeJson(path.join(dir, 'sections', `${sec}.json`), getSec(sec));
  }

  fs.writeFileSync(path.join(dir, 'assets', 'theme.css'), `/* ${theme.name} v2 */\n:root{--theme-primary:${theme.colors.p};--heading-font:${theme.headingFont};}\n`);
  fs.writeFileSync(path.join(dir, 'assets', 'theme.js'), `/* ${theme.name} */\n`);

  return {
    folder: theme.id, themeName: `${theme.name} Theme`, displayName: theme.name,
    type: theme.type === 'paid' ? 'paid' : 'free', price: theme.price,
    industry: theme.category, thumbnail: theme.thumb, previewImages: [theme.thumb],
    shortDescription: theme.desc, longDescription: theme.desc, features: theme.features,
    status: 'published', visibility: 'visible', version: '2.0.0',
  };
}

console.log('Generating 20 advanced themes...');
const catalog = THEMES.map((t) => {
  const e = generate(t);
  console.log(`  ✓ ${t.name} [${t.engine.headerStyle}/${t.engine.productCardStyle}/${t.engine.productPageLayout}]`);
  return e;
});
writeJson(path.join(THEMES_DIR, 'theme-store-catalog.json'), catalog);
console.log(`\nDone. Free ${catalog.filter(c=>c.type==='free').length} | Premium ${catalog.filter(c=>c.type==='paid').length}`);
