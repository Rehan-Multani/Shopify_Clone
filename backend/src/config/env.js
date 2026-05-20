import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const optional = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

const missingRequired = required.filter((key) => !process.env[key]);
const missingOptional = optional.filter((key) => !process.env[key]);

if (missingRequired.length) {
  console.error(`[env] Missing REQUIRED env vars: ${missingRequired.join(', ')}`);
  console.error('[env] Create a .env file (copy .env.example) and fill in the values.');
  process.exit(1);
}
if (missingOptional.length && process.env.NODE_ENV !== 'test') {
  console.warn(`[env] Cloudinary not configured (${missingOptional.join(', ')}). Uploads will fail until set.`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  mongoUri: process.env.MONGO_URI,

  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',

  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
  cookieSecure: process.env.COOKIE_SECURE === 'true',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'storify',
  },

  upload: {
    maxFileSizeMb: parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || '10', 10),
  },
};

export const isProd = env.nodeEnv === 'production';
