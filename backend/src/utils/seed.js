import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MasterAdmin from '../Models/MasterAdmin.js';
import connectDB from '../Config/db.js';

dotenv.config({ path: '../../.env' }); // Adjust depending on from where this is run

// Fallback to normal .env in current dir
dotenv.config();

const seedMasterAdmin = async () => {
    try {
        await connectDB();
        await MasterAdmin.deleteMany(); // Clear existing master admins

        const admin = new MasterAdmin({
            name: 'Master Admin',
            email: 'admin@storify.com',
            password: 'password123', // Will be hashed by pre-save hook
            role: 'master_admin'
        });

        await admin.save();

        console.log('Master Admin Seeded Successfully!');
        console.log('Email: admin@storify.com');
        console.log('Password: password123');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedMasterAdmin();
