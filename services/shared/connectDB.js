import mongoose from 'mongoose';

const connectDB = async (mongooseInstance) => {
    const db = mongooseInstance || mongoose;
    try {
        const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
        if (!mongoUrl) {
            throw new Error('MONGODB_URL is not set');
        }
        const conn = await db.connect(mongoUrl);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
