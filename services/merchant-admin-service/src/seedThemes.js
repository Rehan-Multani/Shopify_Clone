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
        thumbnail: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop",
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
        thumbnail: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop",
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
        thumbnail: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop",
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
        thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop",
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
        thumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop",
        shortDescription: "A fast, user-friendly storefront layout optimized for grocery stores, supermarkets, and organic markets.",
        features: ["Responsive", "Sticky Header", "RTL", "Mega Menu", "Newsletter"],
        status: "published",
        visibility: "visible",
        version: "1.0.0"
    },
    {
        folder: "jewellery",
        themeName: "Jewellery Store",
        displayName: "Lumière Jewelry",
        type: "free",
        price: 0,
        industry: "Jewellery",
        thumbnail: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
        shortDescription: "An exquisite, high-end theme designed for luxury jewelry stores, diamond boutiques, and bespoke accessory brands.",
        features: ["Mega Menu", "Zoom Effect", "Sticky Header", "Responsive", "Testimonials"],
        status: "published",
        visibility: "visible",
        version: "1.0.0"
    },
    {
        folder: "sports",
        themeName: "Sports Store",
        displayName: "Velocity Fitness",
        type: "free",
        price: 0,
        industry: "Sports",
        thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
        shortDescription: "A high-performance, dynamic theme optimized for sports equipment, gym apparel, and outdoor fitness gear stores.",
        features: ["Sticky Header", "Countdown Sale", "Responsive", "Newsletter", "Product Zoom"],
        status: "published",
        visibility: "visible",
        version: "1.0.0"
    },
    {
        folder: "books",
        themeName: "Books Store",
        displayName: "Inkwell Bookstore",
        type: "free",
        price: 0,
        industry: "Books",
        thumbnail: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=600&auto=format&fit=crop",
        shortDescription: "A cozy, literary-focused theme crafted for online bookstores, stationery shops, and independent publishers.",
        features: ["Responsive", "Custom Story Section", "Newsletter", "Testimonials", "Mega Menu"],
        status: "published",
        visibility: "visible",
        version: "1.0.0"
    },
    {
        folder: "petstore",
        themeName: "Pet Store",
        displayName: "Pawsome Pet Supplies",
        type: "free",
        price: 0,
        industry: "Pet Store",
        thumbnail: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=600&auto=format&fit=crop",
        shortDescription: "A warm, pet-friendly theme designed for pet food shops, organic treats, accessories, and grooming services.",
        features: ["Responsive", "Sticky Header", "Newsletter", "Wishlist", "Features Grid"],
        status: "published",
        visibility: "visible",
        version: "1.0.0"
    },
    {
        folder: "kids",
        themeName: "Kids Store",
        displayName: "Playbox Kids & Toys",
        type: "free",
        price: 0,
        industry: "Kids & Toys",
        thumbnail: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600&auto=format&fit=crop",
        shortDescription: "A colorful, highly engaging theme built for educational toys, children clothing, games, and creative nursery items.",
        features: ["Bubbly Animations", "Countdown Banner", "Features Grid", "Responsive", "Mega Menu"],
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
        
        console.log(`Successfully seeded ${themesData.length} themes!`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding themes:', err);
        process.exit(1);
    }
};

seed();
