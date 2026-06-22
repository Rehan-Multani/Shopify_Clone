import dotenv from 'dotenv';
import connectDB from '../../shared/connectDB.js';
import app from './app.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`Auth service running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Auth Service Error: ${err.message}`);
    server.close(() => process.exit(1));
});
