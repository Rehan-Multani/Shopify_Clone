import Plan from './models/Plan.js';

const DEFAULT_PLANS = [
    {
        planName: 'Single Store',
        planPrice: 999,
        description: 'Perfect for a single-vendor online store',
        planType: 'Single Vendor',
        isPopular: true,
        isRecommended: false,
        features: [
            '1 online store',
            'Unlimited products',
            'Custom domain support',
            'Theme customization',
            'Order & inventory management',
            'Email support',
        ],
    },
    {
        planName: 'Multi Vendor',
        planPrice: 2499,
        description: 'Marketplace plan for multiple vendors on one store',
        planType: 'Multi Vendor',
        isPopular: false,
        isRecommended: true,
        features: [
            'Multi-vendor marketplace',
            'Unlimited vendors',
            'Vendor dashboards',
            'Commission management',
            'Unlimited products',
            'Custom domain support',
            'Priority support',
        ],
    },
];

/**
 * Ensure default Single Vendor and Multi Vendor plans exist.
 * Runs on every merchant-admin-service startup — seeds only missing types.
 */
const seedPlans = async () => {
    try {
        for (const plan of DEFAULT_PLANS) {
            const existing = await Plan.findOne({ planType: plan.planType });

            if (existing) {
                console.log(`[Plans] ${plan.planType} plan already exists (${existing.planName})`);
                continue;
            }

            await Plan.create(plan);
            console.log(`[Plans] Seeded ${plan.planType} plan (${plan.planName} — ₹${plan.planPrice})`);
        }
    } catch (error) {
        console.error(`[Plans] Failed to seed plans: ${error.message}`);
    }
};

export default seedPlans;
