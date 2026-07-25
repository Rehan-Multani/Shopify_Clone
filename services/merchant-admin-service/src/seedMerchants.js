import Merchant from './models/Merchant.js';

const DEFAULT_MERCHANTS = [
    {
        name: 'Single Vendor Merchant',
        email: 'single@storify.com',
        mobile: '9876543210',
        planType: 'Single Vendor',
        status: 'active',
        address: 'Mumbai, India',
        password: 'password123',
    },
    {
        name: 'Multi Vendor Merchant',
        email: 'multi@storify.com',
        mobile: '9876543211',
        planType: 'Multi Vendor',
        status: 'active',
        address: 'Delhi, India',
        password: 'password123',
    },
];

/**
 * Ensure one Single Vendor and one Multi Vendor demo merchant exist.
 * Runs on every merchant-admin-service startup — seeds only if missing.
 */
const seedMerchants = async () => {
    try {
        for (const merchant of DEFAULT_MERCHANTS) {
            const existing = await Merchant.findOne({
                $or: [{ email: merchant.email }, { mobile: merchant.mobile }],
            });

            if (existing) {
                console.log(`[Merchants] ${merchant.planType} merchant already exists (${existing.email})`);
                continue;
            }

            await Merchant.create(merchant);
            console.log(`[Merchants] Seeded ${merchant.planType} merchant (${merchant.email})`);
        }
    } catch (error) {
        console.error(`[Merchants] Failed to seed merchants: ${error.message}`);
    }
};

export default seedMerchants;
