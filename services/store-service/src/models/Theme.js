import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        unique: true
    },
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: false
    },
    themeName: {
        type: String,
        default: 'Dawn'
    },
    primaryColor: {
        type: String,
        default: '#008060'
    },
    secondaryColor: {
        type: String,
        default: '#faf9f6'
    },
    accentColor: {
        type: String,
        default: '#059669'
    },
    fontFamily: {
        type: String,
        default: 'Outfit'
    },
    borderRadius: {
        type: String,
        default: '12px'
    },
    headerStyle: {
        type: String,
        default: 'style1'
    },
    footerStyle: {
        type: String,
        default: 'style1'
    },
    productCardStyle: {
        type: String,
        default: 'style1'
    },
    categoryColumns: {
        type: Number,
        default: 4
    },
    logo: {
        type: String,
        default: ''
    },
    favicon: {
        type: String,
        default: ''
    },
    // Extended configuration options for No-Code builder
    typography: {
        headingFont: { type: String, default: 'Inter' },
        bodyFont: { type: String, default: 'Inter' },
        headingWeight: { type: String, default: '700' },
        bodyWeight: { type: String, default: '400' },
        lineHeight: { type: String, default: '1.5' },
        letterSpacing: { type: String, default: '0px' },
        responsive: { type: Boolean, default: true }
    },
    buttons: {
        size: { type: String, default: 'medium' }, // small, medium, large
        borderRadius: { type: String, default: '8px' },
        shadow: { type: String, default: 'sm' }, // none, sm, md, lg
        hoverEffect: { type: String, default: 'brightness' }, // none, brightness, translate, scale
        ripple: { type: Boolean, default: true },
        gradient: { type: Boolean, default: false }
    },
    spacing: {
        containerWidth: { type: String, default: '1280px' },
        sectionPadding: { type: String, default: '40px' },
        gridGap: { type: String, default: '24px' }
    },
    headerConfig: {
        logoUrl: { type: String, default: '' },
        height: { type: String, default: '70px' },
        sticky: { type: Boolean, default: true },
        transparent: { type: Boolean, default: false },
        searchEnabled: { type: Boolean, default: true },
        cartEnabled: { type: Boolean, default: true },
        wishlistEnabled: { type: Boolean, default: true },
        profileEnabled: { type: Boolean, default: true },
        menuItems: {
            type: Array,
            default: [
                { label: 'Home', link: '/' },
                { label: 'Catalog', link: '/catalog' },
                { label: 'About', link: '/about-us' },
                { label: 'Contact', link: '/contact-us' }
            ]
        },
        announcementBar: {
            enabled: { type: Boolean, default: true },
            text: { type: String, default: 'Free shipping on orders above ₹1599 📞 1800-123-4567 Hygiene & Care you can trust' },
            backgroundColor: { type: String, default: '#008060' },
            textColor: { type: String, default: '#ffffff' }
        }
    },
    footerConfig: {
        logoUrl: { type: String, default: '' },
        columns: {
            type: Array,
            default: [
                {
                    title: 'Quick Links',
                    type: 'links',
                    links: [
                        { label: 'About Us', link: '/about' },
                        { label: 'Blog', link: '/blog' },
                        { label: 'Careers', link: '/careers' },
                        { label: 'Press', link: '/press' },
                        { label: 'Sitemap', link: '/sitemap' }
                    ]
                },
                {
                    title: 'Customer Service',
                    type: 'links',
                    links: [
                        { label: 'Help Center', link: '/help' },
                        { label: 'Returns & Refunds', link: '/returns' },
                        { label: 'Shipping Info', link: '/shipping' },
                        { label: 'Track Order', link: '/track-order' },
                        { label: 'FAQs', link: '/faq' }
                    ]
                },
                {
                    title: 'My Account',
                    type: 'links',
                    links: [
                        { label: 'Sign In', link: '/login' },
                        { label: 'Create Account', link: '/register' },
                        { label: 'Wishlist', link: '/wishlist' },
                        { label: 'My Orders', link: '/orders' },
                        { label: 'Settings', link: '/settings' }
                    ]
                },
                {
                    title: 'Stay Connected',
                    type: 'newsletter',
                    text: 'Subscribe for health tips, new products, and exclusive offers.'
                }
            ]
        },
        copyrightText: { type: String, default: '© 2026 QubanHC. All rights reserved.' },
        showPaymentIcons: { type: Boolean, default: true },
        showSocialIcons: { type: Boolean, default: true }
    },
    globalStyles: {
        customCss: { type: String, default: '' },
        customJs: { type: String, default: '' }
    }
}, {
    timestamps: true
});

const Theme = mongoose.model('Theme', themeSchema);
export default Theme;
