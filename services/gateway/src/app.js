import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { gatewayAuthMiddleware } from './middleware/auth.js';

const app = express();

// Global Middlewares (No body parser here to avoid proxy issues with POST/PUT requests)
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
}));

app.use(helmet({
    crossOriginResourcePolicy: false // Allow loading local assets in frontend
}));

app.use(morgan('dev'));
app.use(cookieParser());

// Serve uploaded images statically
// We point this to the shared uploads folder in the gateway's public directory
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Gateway Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API Gateway is running' });
});

// Authentication middleware applied globally to /api routes (except health check)
app.use('/api', gatewayAuthMiddleware);

// Define service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const MERCHANT_ADMIN_SERVICE_URL = process.env.MERCHANT_ADMIN_SERVICE_URL || 'http://localhost:5002';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5003';
const STORE_SERVICE_URL = process.env.STORE_SERVICE_URL || 'http://localhost:5004';
const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:5005';

// Helper function to create proxies
const createServiceProxy = (target, pathRewrite = null) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: pathRewrite || ((path, req) => req.originalUrl),
        on: {
            proxyReq: (proxyReq, req, res) => {
                // Forward trusted headers from gateway to downstream services
                if (req.headers['x-admin-id']) {
                    proxyReq.setHeader('x-admin-id', req.headers['x-admin-id']);
                }
                if (req.headers['x-merchant-id']) {
                    proxyReq.setHeader('x-merchant-id', req.headers['x-merchant-id']);
                }
            },
            error: (err, req, res) => {
                console.error(`Proxy error for target ${target}:`, err.message);
                res.status(502).json({ message: 'Bad Gateway: Service unavailable' });
            }
        }
    });
};

// ==================== Proxy Rules & Path Aliases ====================

// 1. Auth Service Routes
// Handle Auth APIs and alias old login/forgot/reset paths
app.use('/api/auth', createServiceProxy(AUTH_SERVICE_URL));

// Aliases for monorepo login/logout/forgot-password/reset-password paths
app.use('/api/master-admin/login', createServiceProxy(AUTH_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/master-admin/login', '/api/auth/admin/login');
}));
app.use('/api/master-admin/logout', createServiceProxy(AUTH_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/master-admin/logout', '/api/auth/admin/logout');
}));
app.use('/api/merchants/login', createServiceProxy(AUTH_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/merchants/login', '/api/auth/merchant/login');
}));
app.use('/api/merchants/forgot-password', createServiceProxy(AUTH_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/merchants/forgot-password', '/api/auth/merchant/forgot-password');
}));
app.use('/api/merchants/verify-otp', createServiceProxy(AUTH_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/merchants/verify-otp', '/api/auth/merchant/verify-otp');
}));
app.use('/api/merchants/reset-password', createServiceProxy(AUTH_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/merchants/reset-password', '/api/auth/merchant/reset-password');
}));

// 2. Merchant Admin Service Routes
// Handle Admin CRUD and Master Admin Profile
app.use('/api/master-admin/profile', createServiceProxy(MERCHANT_ADMIN_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/master-admin/profile', '/api/admin/profile');
}));
app.use('/api/merchants/upload', createServiceProxy(MERCHANT_ADMIN_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/merchants/upload', '/api/admin/merchants/upload');
}));
app.use('/api/merchants', createServiceProxy(MERCHANT_ADMIN_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/merchants', '/api/admin/merchants');
}));
app.use('/api/plans', createServiceProxy(MERCHANT_ADMIN_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/plans', '/api/admin/plans');
}));
app.use('/api/stores/admin/all', createServiceProxy(MERCHANT_ADMIN_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/stores/admin/all', '/api/admin/stores/all');
}));

// 3. Catalog Service Routes
app.use('/api/products', createServiceProxy(CATALOG_SERVICE_URL));
app.use('/api/categories', createServiceProxy(CATALOG_SERVICE_URL));
app.use('/api/coupons', createServiceProxy(CATALOG_SERVICE_URL));
app.use('/api/customers', createServiceProxy(CATALOG_SERVICE_URL));
app.use('/api/banners', createServiceProxy(CATALOG_SERVICE_URL));

// 4. Store Service Routes
app.use('/api/themes', createServiceProxy(STORE_SERVICE_URL));
app.use('/api/stores', createServiceProxy(STORE_SERVICE_URL));
app.use('/api/store-pages', createServiceProxy(STORE_SERVICE_URL));
app.use('/api/orders', createServiceProxy(STORE_SERVICE_URL));

// 5. Billing Service Routes
// Remap /api/payments to /api/billing
app.use('/api/payments', createServiceProxy(BILLING_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/payments', '/api/billing');
}));
app.use('/api/billing', createServiceProxy(BILLING_SERVICE_URL));

// 6. Support Tickets Proxy
app.use('/api/support-tickets', createServiceProxy(MERCHANT_ADMIN_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/support-tickets', '/api/admin/support-tickets');
}));


// 404 Handler for everything else
app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

export default app;
