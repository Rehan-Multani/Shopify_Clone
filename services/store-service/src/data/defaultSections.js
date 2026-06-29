export const DEFAULT_HOME_SECTIONS = [
    { 
        type: 'hero', 
        order: 1, 
        enabled: true, 
        settings: { 
            backgroundImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1600',
            alignment: 'center'
        },
        blocks: [
            { type: 'heading', settings: { text: 'Comfort & Care for Every Step' } },
            { type: 'subheading', settings: { text: 'Premium adult diapers, baby care, hygiene essentials, and mobility aids – delivered with love to your doorstep.' } },
            { type: 'button', settings: { label: 'Shop Now →', link: '/catalog' } },
            { type: 'button', settings: { label: 'View Deals', link: '/catalog' } }
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
            title: 'Why QubanHC', 
            subtitle: "We're not just a store – we're a commitment to your family's health and comfort."
        },
        blocks: [
            { type: 'feature', settings: { title: 'Free Shipping', text: 'Orders above ₹999 shipped free. No hidden charges, just care.', icon: 'truck' } },
            { type: 'feature', settings: { title: 'Easy Returns', text: '30‑day hassle‑free returns. If it’s not right, we’ll make it right.', icon: 'rotate-ccw' } },
            { type: 'feature', settings: { title: 'Secure Payments', text: 'Your data is safe with 256‑bit SSL. Pay your way, worry‑free.', icon: 'shield-check' } },
            { type: 'feature', settings: { title: '24/7 Support', text: 'Friendly experts ready to help anytime. Chat, call, or email.', icon: 'phone' } },
            { type: 'feature', settings: { title: 'Medical‑Grade Quality', text: 'Every product meets strict healthcare standards. Your well‑being matters.', icon: 'heart-pulse' } },
            { type: 'feature', settings: { title: 'Express Delivery', text: 'Same‑day dispatch & real‑time tracking. Care delivered fast.', icon: 'lightning' } }
        ]
    },
    { 
        type: 'featured-products', 
        order: 4, 
        enabled: true, 
        settings: { 
            title: 'Featured Hygiene Essentials', 
            limit: 8 
        },
        blocks: []
    },
    { 
        type: 'testimonials', 
        order: 5, 
        enabled: true, 
        settings: { 
            title: 'What Our Families Say'
        },
        blocks: [
            { type: 'testimonial', settings: { author: 'Sarah K.', text: 'Absolutely love the diapers and wipes, extremely soft and durable!' } },
            { type: 'testimonial', settings: { author: 'Rajesh M.', text: 'Express delivery was incredibly fast. Customer support is very friendly and supportive.' } }
        ]
    },
    { 
        type: 'newsletter', 
        order: 6, 
        enabled: true, 
        settings: { 
            title: 'Stay in the Care Loop', 
            subtitle: 'Be the first to know about new hygiene products, baby & adult care, and exclusive offers from QubanHC.' 
        },
        blocks: []
    }
];
