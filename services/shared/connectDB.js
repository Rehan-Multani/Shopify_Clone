import mongoose from 'mongoose';

const connectDB = async (mongooseInstance) => {
    const db = mongooseInstance || mongoose;
    try {
        const conn = await db.connect(process.env.MONGODB_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
