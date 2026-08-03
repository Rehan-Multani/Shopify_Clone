import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../../shared/connectDB.js';
import { initTransactionalEmail } from '../../shared/transactionalEmail.js';
import app from './app.js';

// Load env vars (updated with JWT secret)
dotenv.config();

// Connect to database
connectDB(mongoose);
initTransactionalEmail(mongoose);

mongoose.connection.once('open', async () => {
    try {
        await mongoose.connection.db.collection('storepages').dropIndex('storeId_1_slug_1');
        console.log('[Store Service] Successfully dropped old unique index storeId_1_slug_1');
    } catch (err) {
        console.log('[Store Service] Index drop info:', err.message);
    }
});

const PORT = process.env.PORT || 5004;

const server = app.listen(PORT, () => {
    console.log(`Store service running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Store Service Error: ${err.message}`);
    server.close(() => process.exit(1));
});
