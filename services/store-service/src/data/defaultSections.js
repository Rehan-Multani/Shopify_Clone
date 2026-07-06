export const DEFAULT_HOME_SECTIONS = [
    { 
        type: 'hero', 
        order: 1, 
        enabled: true, 
        settings: { 
            backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600',
            alignment: 'center'
        },
        blocks: [
            { type: 'heading', settings: { text: 'Elevate Your Style <br/>Every Single Day' } },
            { type: 'subheading', settings: { text: 'Discover the latest trends in fashion, electronics, accessories and more - curated just for you.' } },
            { type: 'button', settings: { label: 'Shop Now →', link: '/catalog' } },
            { type: 'button', settings: { label: 'View Collection', link: '/catalog' } }
        ]
    },
    { 
        type: 'categories', 
        order: 2, 
        enabled: true, 
        settings: { 
            title: 'Shop by Category', 
            columns: 4 
        },
        blocks: []
    },
    { 
        type: 'features-grid', 
        order: 3, 
        enabled: true, 
        settings: { 
            title: 'Why Shop With Us', 
            subtitle: "We offer premium quality, fast shipping, and exceptional customer support."
        },
        blocks: [
            { type: 'feature', settings: { title: 'Free Shipping', text: 'Orders above ₹999 shipped free. No hidden charges.', icon: 'truck' } },
            { type: 'feature', settings: { title: 'Easy Returns', text: '30‑day hassle‑free returns. If it’s not right, we’ll fix it.', icon: 'rotate-ccw' } },
            { type: 'feature', settings: { title: 'Secure Payments', text: 'Your data is safe with 256‑bit SSL. Pay your way, worry‑free.', icon: 'shield-check' } },
            { type: 'feature', settings: { title: '24/7 Support', text: 'Friendly experts ready to help anytime. Chat, call, or email.', icon: 'phone' } },
            { type: 'feature', settings: { title: 'Premium Quality', text: 'Every product meets strict quality standards. Your satisfaction matters.', icon: 'heart-pulse' } },
            { type: 'feature', settings: { title: 'Express Delivery', text: 'Same‑day dispatch & real‑time tracking. Shipped fast.', icon: 'lightning' } }
        ]
    },
    { 
        type: 'featured-products', 
        order: 4, 
        enabled: true, 
        settings: { 
            title: 'Featured Products', 
            limit: 8 
        },
        blocks: []
    },
    { 
        type: 'testimonials', 
        order: 5, 
        enabled: true, 
        settings: { 
            title: 'What Our Customers Say'
        },
        blocks: [
            { type: 'testimonial', settings: { author: 'John D.', text: 'Absolutely love the premium quality and fast shipping! Will buy again.' } },
            { type: 'testimonial', settings: { author: 'Emma W.', text: 'Incredibly fast customer support and super easy return process.' } }
        ]
    },
    { 
        type: 'newsletter', 
        order: 6, 
        enabled: true, 
        settings: { 
            title: 'Join Our Newsletter', 
            subtitle: 'Be the first to know about new products, exclusive collection launches, and special offers.' 
        },
        blocks: []
    }
];
