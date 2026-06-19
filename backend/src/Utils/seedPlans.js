import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../Models/Plan.js';
import connectDB from '../Config/db.js';

dotenv.config({ path: '../../.env' }); // Adjust depending on from where this is run
dotenv.config();

const plans = [
    {
        planName: 'Starter',
        planPrice: 499,
        description: 'Perfect for new businesses just getting started.',
        features: ['1 online store', 'Basic reporting', 'Community support', 'Standard themes'],
        productsCount: 50,
        vendorsLimit: 1,
        isPopular: false,
        isRecommended: false,
        planType: 'Single Vendor'
    },
    {
        planName: 'Growth',
        planPrice: 1499,
        description: 'Everything you need to grow your growing business.',
        features: ['Up to 3 online stores', 'Professional reporting', '24/7 Email support', 'Custom themes', 'Abandoned cart recovery'],
        productsCount: 500,
        vendorsLimit: 3,
        isPopular: true,
        isRecommended: false,
        planType: 'Single Vendor'
    },
    {
        planName: 'Advanced',
        planPrice: 2999,
        description: 'Advanced features for scaling merchants.',
        features: ['Up to 10 online stores', 'Advanced report builder', '24/7 Priority support', 'API access', 'Third-party calculated shipping rates'],
        productsCount: 5000,
        vendorsLimit: 10,
        isPopular: false,
        isRecommended: true,
        planType: 'Multi Vendor'
    },
    {
        planName: 'Enterprise',
        planPrice: 9999,
        description: 'Enterprise-grade power and limits.',
        features: ['Unlimited online stores', 'Custom analytics', 'Dedicated success manager', 'SLA guarantees', 'Wholesale/B2B channel'],
        productsCount: 0, // 0 = Unlimited
        vendorsLimit: 0, // 0 = Unlimited
        isPopular: false,
        isRecommended: false,
        planType: 'Multi Vendor'
    }
];

const seedPlans = async () => {
    try {
        await connectDB();
        await Plan.deleteMany(); // Clear existing plans
        console.log('Existing plans deleted...');

        await Plan.insertMany(plans);

        console.log('4 new plans seeded successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedPlans();
