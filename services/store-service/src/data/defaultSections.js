export const DEFAULT_HOME_SECTIONS = [
    { 
        type: 'hero', 
        order: 1, 
        enabled: true, 
        settings: { 
            backgroundImage: '',
            alignment: 'left'
        },
        blocks: [
            { type: 'heading', settings: { text: 'Welcome to Our Store' } },
            { type: 'subheading', settings: { text: 'Discover our latest arrivals and premium products curated just for you.' } },
            { type: 'button', settings: { label: 'Shop Now', link: '/products' } }
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
        type: 'featured-products', 
        order: 3, 
        enabled: true, 
        settings: { 
            title: 'Featured Products', 
            limit: 8 
        },
        blocks: []
    },
    { 
        type: 'testimonials', 
        order: 4, 
        enabled: true, 
        settings: { 
            title: 'What Our Customers Say'
        },
        blocks: [
            { type: 'testimonial', settings: { author: 'Jane D.', text: 'Amazing quality! Highly recommend shopping here.' } },
            { type: 'testimonial', settings: { author: 'John S.', text: 'Fast shipping and beautiful products.' } }
        ]
    },
    { 
        type: 'newsletter', 
        order: 5, 
        enabled: true, 
        settings: { 
            title: 'Subscribe to Our Newsletter', 
            subtitle: 'Get updates on new items and special promotions.' 
        },
        blocks: []
    }
];
