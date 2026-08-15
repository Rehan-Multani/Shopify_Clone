import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import fs from 'fs';
import { gatewayAuthMiddleware } from './middleware/auth.js';
import rateLimit from 'express-rate-limit';

const app = express();

const previewTokenLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many preview token requests. Try again later.' },
});

const allowedOrigins = [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'http://localhost:5174', 
    'http://127.0.0.1:5174',
    'https://admin.cloudedata.in',
    'https://storify.cloudedata.in',
    'http://admin.cloudedata.in',
    'http://storify.cloudedata.in'
];

// Global Middlewares (No body parser here to avoid proxy issues with POST/PUT requests)
app.use(cors({
    origin: (origin, callback) => {
        // Production: allow only known admin/storefront origins (plus no-origin tools)
        if (process.env.NODE_ENV === 'production') {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        }
        // Development: keep permissive for local tooling
        return callback(null, true);
    },
    credentials: true,
}));

app.use(helmet({
    crossOriginResourcePolicy: false // Allow loading local assets in frontend
}));

// Redact preview tokens from access logs (never log secrets)
morgan.token('url-safe', (req) => {
    const raw = req.originalUrl || req.url || '';
    return String(raw).replace(/([?&]previewToken=)[^&]*/gi, '$1[REDACTED]');
});
app.use(morgan(':method :url-safe :status :response-time ms'));
app.use(cookieParser());

// Serve uploaded images statically
// We point this to the shared uploads folder in the gateway's public directory
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Serve theme pack assets (CSS/JS/thumbnails) for ThemeLoader
const themeAssetCandidates = [
    path.resolve(process.cwd(), '..', 'themes'),
    path.resolve(process.cwd(), '..', '..', 'themes'),
    path.resolve(process.cwd(), 'themes'),
];
const themesStaticRoot = themeAssetCandidates.find((p) => {
    try {
        return fs.existsSync(p);
    } catch {
        return false;
    }
});
if (themesStaticRoot) {
    app.use('/themes', express.static(themesStaticRoot, {
        maxAge: '1d',
        fallthrough: true,
    }));
}

// Gateway Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API Gateway is running' });
});

// Authentication middleware applied globally to /api routes (except health check)
app.use('/api', gatewayAuthMiddleware);

// Wave 6 — rate limit preview token minting at the gateway
app.use('/api/themes/preview-token', (req, res, next) => {
    if (req.method === 'POST' && !String(req.originalUrl || '').includes('revoke')) {
        return previewTokenLimiter(req, res, next);
    }
    return next();
});

// Define service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const MERCHANT_ADMIN_SERVICE_URL = process.env.MERCHANT_ADMIN_SERVICE_URL || 'http://localhost:5002';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:5003';
const STORE_SERVICE_URL = process.env.STORE_SERVICE_URL || 'http://localhost:5004';
const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:5005';

// Helper function to resolve service name from target URL
const getServiceName = (targetUrl) => {
    if (targetUrl.includes('5001')) return 'auth-service';
    if (targetUrl.includes('5002')) return 'merchant-admin-service';
    if (targetUrl.includes('5003')) return 'catalog-service';
    if (targetUrl.includes('5004')) return 'store-service';
    if (targetUrl.includes('5005')) return 'billing-service';
    return 'unknown-service';
};

// Helper function to create proxies
const createServiceProxy = (target, pathRewrite = null) => {
    const serviceName = getServiceName(target);
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: pathRewrite || ((path, req) => req.originalUrl),
        on: {
            proxyReq: (proxyReq, req, res) => {
                // Never forward client-spoofed identity; only what gatewayAuthMiddleware set
                proxyReq.removeHeader('x-merchant-id');
                proxyReq.removeHeader('x-vendor-id');
                proxyReq.removeHeader('x-admin-id');

                const gatewaySecret = String(
                    process.env.GATEWAY_INTERNAL_SECRET
                    || process.env.INTERNAL_SERVICE_SECRET
                    || (process.env.NODE_ENV === 'production' ? '' : 'dev-gateway-secret')
                ).trim();
                if (gatewaySecret) {
                    proxyReq.setHeader('x-gateway-secret', gatewaySecret);
                }

                // Forward trusted headers from gateway to downstream services
                if (req.headers['x-admin-id']) {
                    proxyReq.setHeader('x-admin-id', req.headers['x-admin-id']);
                }
                if (req.headers['x-merchant-id']) {
                    proxyReq.setHeader('x-merchant-id', req.headers['x-merchant-id']);
                }
                if (req.headers['x-vendor-id']) {
                    proxyReq.setHeader('x-vendor-id', req.headers['x-vendor-id']);
                }
                if (req.headers['x-store-id']) {
                    proxyReq.setHeader('x-store-id', req.headers['x-store-id']);
                }
            },
            proxyRes: (proxyRes, req, res) => {
                const origin = req.headers.origin;
                if (origin) {
                    proxyRes.headers['access-control-allow-origin'] = origin;
                    proxyRes.headers['access-control-allow-credentials'] = 'true';
                }
                // Add source service name in headers so frontend or inspector can trace it instantly
                proxyRes.headers['x-handled-by-service'] = serviceName;

                // Intercept data if downstream returns a non-2xx status to append service name in the response payload
                if (proxyRes.statusCode >= 400) {
                    const originalWrite = res.write;
                    const originalEnd = res.end;
                    let body = '';

                    // Override write and end to capture response chunk by chunk
                    res.write = function (chunk) {
                        body += chunk;
                    };

                    res.end = function (chunk) {
                        if (chunk) body += chunk;
                        try {
                            // Try to parse the JSON and add the service parameter
                            const json = JSON.parse(body);
                            json.service = serviceName;
                            const modifiedBody = JSON.stringify(json);
                            
                            res.setHeader('content-length', Buffer.byteLength(modifiedBody));
                            originalEnd.call(this, modifiedBody);
                        } catch (e) {
                            // If not JSON or fails parsing, fall back to default response
                            originalEnd.call(this, body);
                        }
                    };
                }
            },
            error: (err, req, res) => {
                console.error(`Proxy error for target ${target} (${serviceName}):`, err.message);
                res.status(502).json({ 
                    success: false, 
                    message: 'Bad Gateway: Service unavailable',
                    service: serviceName,
                    error: err.message
                });
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
app.use('/api/merchants/signup', createServiceProxy(MERCHANT_ADMIN_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/merchants/signup', '/api/admin/merchants/signup');
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
app.use('/api/vendors/forgot-password', createServiceProxy(AUTH_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/vendors/forgot-password', '/api/auth/vendor/forgot-password');
}));
app.use('/api/vendors/verify-otp', createServiceProxy(AUTH_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/vendors/verify-otp', '/api/auth/vendor/verify-otp');
}));
app.use('/api/vendors/reset-password', createServiceProxy(AUTH_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/vendors/reset-password', '/api/auth/vendor/reset-password');
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
app.use('/api/master-admin/analytics', createServiceProxy(MERCHANT_ADMIN_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/master-admin/analytics', '/api/admin/analytics');
}));
app.use('/api/master-admin/overview', createServiceProxy(MERCHANT_ADMIN_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/master-admin/overview', '/api/admin/overview');
}));


// Theme catalog (merchant-admin) vs store theme runtime (store-service)
const merchantThemeCatalogProxy = createServiceProxy(MERCHANT_ADMIN_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/themes', '/api/admin/themes');
});
const storeThemeRuntimeProxy = createServiceProxy(STORE_SERVICE_URL);

const isMerchantThemeCatalogRequest = (req) => {
    const pathOnly = String(req.originalUrl || '').split('?')[0];
    if (pathOnly.startsWith('/api/themes/marketplace') || pathOnly.startsWith('/api/themes/admin')) {
        return true;
    }
    if (req.method === 'GET' && pathOnly === '/api/themes') return true;
    if (req.method === 'GET' && /^\/api\/themes\/[a-f0-9]{24}$/i.test(pathOnly)) return true;
    return false;
};

app.use('/api/themes', (req, res, next) => {
    if (isMerchantThemeCatalogRequest(req)) {
        return merchantThemeCatalogProxy(req, res, next);
    }
    return storeThemeRuntimeProxy(req, res, next);
});

app.use('/api/admin', createServiceProxy(MERCHANT_ADMIN_SERVICE_URL));


app.use('/api/products', createServiceProxy(CATALOG_SERVICE_URL));
app.use('/api/categories', createServiceProxy(CATALOG_SERVICE_URL));
app.use('/api/coupons', createServiceProxy(CATALOG_SERVICE_URL));
app.use('/api/customers', createServiceProxy(CATALOG_SERVICE_URL));
app.use('/api/banners', createServiceProxy(CATALOG_SERVICE_URL));
app.use('/api/vendors', createServiceProxy(CATALOG_SERVICE_URL));

// 4. Store Service Routes
app.use('/api/stores', createServiceProxy(STORE_SERVICE_URL));
app.use('/api/store-pages', createServiceProxy(STORE_SERVICE_URL));
app.use('/api/orders', createServiceProxy(STORE_SERVICE_URL));

// 5. Billing Service Routes
// Remap /api/payments to /api/billing
app.use('/api/payments', createServiceProxy(BILLING_SERVICE_URL, (path, req) => {
    return req.originalUrl.replace('/api/payments', '/api/billing');
}));
app.use('/api/billing', createServiceProxy(BILLING_SERVICE_URL));

// Payment gateway + email configuration, checkout & webhooks (billing-service)
app.use('/api/merchant/payment-gateways', createServiceProxy(BILLING_SERVICE_URL));
app.use('/api/vendor/payment-gateways', createServiceProxy(BILLING_SERVICE_URL));
app.use('/api/merchant/email-config', createServiceProxy(BILLING_SERVICE_URL));
app.use('/api/vendor/email-config', createServiceProxy(BILLING_SERVICE_URL));
app.use('/api/merchant/shipping', createServiceProxy(STORE_SERVICE_URL));
app.use('/api/vendor/shipping', createServiceProxy(STORE_SERVICE_URL));
app.use('/api/shipping', createServiceProxy(STORE_SERVICE_URL));
app.use('/api/marketplace/payment-settings', createServiceProxy(BILLING_SERVICE_URL));
app.use('/api/checkout', createServiceProxy(BILLING_SERVICE_URL));
app.use('/api/webhooks', createServiceProxy(BILLING_SERVICE_URL));

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
