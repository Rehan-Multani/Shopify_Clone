import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== 'production',
    });
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('[db] Connection failed:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[db] Mongo error:', err.message);
});
