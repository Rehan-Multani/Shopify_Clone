import dotenv from 'dotenv';
import app from './app.js';

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Gateway running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Gateway Error: ${err.message}`);
    server.close(() => process.exit(1));
});
