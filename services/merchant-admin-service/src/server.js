import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../../shared/connectDB.js';
import app from './app.js';
import themeService from './services/themeService.js';
import seedPlans from './seedPlans.js';
import seedMerchants from './seedMerchants.js';
import seedThemeStore from './seedThemeStore.js';

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5002;

const startServer = async () => {
    await connectDB(mongoose);
    await seedPlans();
    await seedMerchants();
    await seedThemeStore();

    // Load built-in themes from /themes directory
    themeService.loadThemes().then(() => {
        console.log('[Server] Built-in themes initialized');
    });

    const server = app.listen(PORT, () => {
        console.log(`Merchant Admin service running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.error(`Merchant Admin Service Error: ${err.message}`);
        server.close(() => process.exit(1));
    });
};

startServer();
