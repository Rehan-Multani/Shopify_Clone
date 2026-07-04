import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../../shared/connectDB.js';
import Theme from './models/Theme.js';

dotenv.config();

const themesData = [
    {
        folder: "fashion",
        themeName: "Fashion Store",
        displayName: "Modern Fashion",
        type: "free",
        price: 0,
        industry: "Fashion",
        thumbnail: "thumbnail.webp",
        shortDescription: "A sleek, premium and highly customizable theme optimized for fashion and apparel storefronts.",
        features: ["Mega Menu", "Sticky Header", "Wishlist", "Responsive", "Quick View"],
        status: "published",
        visibility: "visible",
        version: "1.0.0"
    },
    {
        folder: "electronics",
        themeName: "Electronics Store",
        displayName: "Quantum Tech",
        type: "free",
        price: 0,
        industry: "Electronics",
        thumbnail: "thumbnail.webp",
        shortDescription: "A high-performance eCommerce theme designed specifically for electronics, gadgets, and tech stores.",
        features: ["Product Zoom", "Dark Mode", "Quick View", "Responsive", "Sticky Header"],
        status: "published",
        visibility: "visible",
        version: "1.0.0"
    },
    {
        folder: "furniture",
        themeName: "Furniture Store",
        displayName: "Deco Living",
        type: "free",
        price: 0,
        industry: "Furniture",
        thumbnail: "thumbnail.webp",
        shortDescription: "A beautiful, minimalist theme crafted for furniture, home decor, and interior design storefronts.",
        features: ["Responsive", "Mega Menu", "Multi Language", "Wishlist", "Testimonials"],
        status: "published",
        visibility: "visible",
        version: "1.0.0"
    },
    {
        folder: "beauty",
        themeName: "Beauty Store",
        displayName: "Glow Cosmetics",
        type: "free",
        price: 0,
        industry: "Beauty",
        thumbnail: "thumbnail.webp",
        shortDescription: "A clean, elegant theme designed for beauty salons, organic cosmetics, and skincare brands.",
        features: ["Responsive", "Dark Mode", "Newsletter", "Blog", "Testimonials"],
        status: "published",
        visibility: "visible",
        version: "1.0.0"
    },
    {
        folder: "grocery",
        themeName: "Grocery Store",
        displayName: "Fresh Mart",
        type: "free",
        price: 0,
        industry: "Grocery",
        thumbnail: "thumbnail.webp",
        shortDescription: "A fast, user-friendly storefront layout optimized for grocery stores, supermarkets, and organic markets.",
        features: ["Responsive", "Sticky Header", "RTL", "Mega Menu", "Newsletter"],
        status: "published",
        visibility: "visible",
        version: "1.0.0"
    }
];

const seed = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB(mongoose);
        
        console.log('Clearing existing theme registrations...');
        await Theme.deleteMany({});
        
        console.log('Inserting themes...');
        await Theme.insertMany(themesData);
        
        console.log('Successfully seeded 5 themes!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding themes:', err);
        process.exit(1);
    }
};

seed();
