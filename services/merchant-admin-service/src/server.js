import dotenv from 'dotenv';
import connectDB from '../../shared/connectDB.js';
import app from './app.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
    console.log(`Merchant Admin service running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Merchant Admin Service Error: ${err.message}`);
    server.close(() => process.exit(1));
});
