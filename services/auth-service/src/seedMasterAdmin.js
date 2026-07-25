import MasterAdmin from './models/MasterAdmin.js';

const DEFAULT_ADMIN = {
    name: 'Master Admin',
    email: 'admin@storify.com',
    password: 'password123',
};

/**
 * Ensure default master admin exists in DB.
 * Runs on every auth-service startup — seeds only if missing.
 */
const seedMasterAdmin = async () => {
    try {
        const existing = await MasterAdmin.findOne({ email: DEFAULT_ADMIN.email });

        if (existing) {
            console.log(`[Auth] Default master admin already exists (${DEFAULT_ADMIN.email})`);
            return;
        }

        await MasterAdmin.create(DEFAULT_ADMIN);
        console.log(`[Auth] Default master admin seeded (${DEFAULT_ADMIN.email})`);
    } catch (error) {
        console.error(`[Auth] Failed to seed master admin: ${error.message}`);
    }
};

export default seedMasterAdmin;
