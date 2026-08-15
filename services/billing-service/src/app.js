import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import billingRoutes from './routes/billingRoutes.js';
import paymentGatewayRoutes from './routes/paymentGatewayRoutes.js';
import jwt from 'jsonwebtoken';

const app = express();

/** Shared secret between gateway ↔ billing. Dev default only outside production. */
function gatewayTrustSecret() {
    const fromEnv = String(
        process.env.GATEWAY_INTERNAL_SECRET || process.env.INTERNAL_SERVICE_SECRET || ''
    ).trim();
    if (fromEnv) return fromEnv;
    if (process.env.NODE_ENV === 'production') return '';
    return 'dev-gateway-secret';
}

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
}));

// Capture raw body for webhook signature verification
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        if (req.originalUrl && req.originalUrl.includes('/webhooks/')) {
            req.rawBody = buf.toString('utf8');
        }
    }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/**
 * Identity: JWT always trusted when valid.
 * x-merchant-id / x-vendor-id only trusted when request carries matching x-gateway-secret
 * (set by API gateway after JWT verify) — prevents direct spoof of billing :5005.
 */
app.use((req, res, next) => {
    const trustSecret = gatewayTrustSecret();
    const fromGateway = Boolean(trustSecret)
        && String(req.headers['x-gateway-secret'] || '').trim() === trustSecret;

    // JWT first
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
                if (decoded.type === 'vendor' || req.cookies?.jwt_vendor) {
                    req.vendor = { _id: decoded.id, store: decoded.storeId };
                } else {
                    req.merchant = { _id: decoded.id };
                    req.admin = { _id: decoded.id };
                }
            }
        } catch {
            /* ignore invalid token */
        }
    }

    // Trusted gateway headers only (after JWT — fill gaps for cookie-less gateway inject)
    if (fromGateway) {
        if (!req.merchant && req.headers['x-merchant-id']) {
            req.merchant = { _id: req.headers['x-merchant-id'] };
        }
        if (!req.admin && req.headers['x-admin-id']) {
            req.admin = { _id: req.headers['x-admin-id'] };
        }
        if (!req.vendor && req.headers['x-vendor-id']) {
            req.vendor = { _id: req.headers['x-vendor-id'] };
            if (req.headers['x-store-id']) {
                req.vendor.store = req.headers['x-store-id'];
            }
        }
    }

    next();
});

// Existing SaaS billing routes
app.use('/api/billing', billingRoutes);

// Payment gateway configuration + checkout + webhooks
// Mounted both under /api/billing/* (legacy) and top-level /api/* aliases
app.use('/api/billing', paymentGatewayRoutes);
app.use('/api', paymentGatewayRoutes);

// Health check
app.get('/api/billing/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Billing service is running' });
});

// 404 handler
app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on billing service!`
    });
});

export default app;
