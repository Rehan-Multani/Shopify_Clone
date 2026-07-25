import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../../shared/connectDB.js';
import app from './app.js';
import seedMasterAdmin from './seedMasterAdmin.js';

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    await connectDB(mongoose);
    await seedMasterAdmin();

    const server = app.listen(PORT, () => {
        console.log(`Auth service running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.error(`Auth Service Error: ${err.message}`);
        server.close(() => process.exit(1));
    });
};

startServer();
