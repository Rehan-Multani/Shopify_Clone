import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
const uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(uploadDir));

import jwt from 'jsonwebtoken';
import Vendor from './models/Vendor.js';

// Reconstruct merchant and admin objects from trusted Gateway headers or decode directly if bypassed
app.use(async (req, res, next) => {
    if (req.headers['x-merchant-id']) {
        req.merchant = { _id: req.headers['x-merchant-id'] };
    }
    if (req.headers['x-vendor-id']) {
        req.vendor = { _id: req.headers['x-vendor-id'] };
    }
    if (req.headers['x-admin-id']) {
        req.admin = { _id: req.headers['x-admin-id'] };
    }

    if (!req.merchant && !req.admin && !req.vendor) {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && (req.cookies.jwt_merchant || req.cookies.jwt_admin || req.cookies.jwt_vendor)) {
            token = req.cookies.jwt_merchant || req.cookies.jwt_admin || req.cookies.jwt_vendor;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_storify_2026');
                if (decoded && decoded.id) {
                    const isVendor = await Vendor.findById(decoded.id);
                    if (isVendor) {
                        req.vendor = { _id: decoded.id };
                    } else {
                        req.merchant = { _id: decoded.id };
                        req.admin = { _id: decoded.id };
                    }
                }
            } catch (err) {
                // Ignore token errors
            }
        }
    }
    next();
});


// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/vendors', vendorRoutes);

// Health check
app.get('/api/catalog/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Catalog service is running' });
});

// 404 handler
app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on catalog service!`
    });
});

export default app;
