import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import storeRoutes from './routes/storeRoutes.js';
import storePageRoutes from './routes/storePageRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import { getThemeStore } from './controllers/themeController.js';
import jwt from 'jsonwebtoken';
import { verifyPreviewToken } from './utils/previewToken.js';
import { getRedisBackend, assertPreviewTokenBackend } from './utils/redisClient.js';
import mongoose from 'mongoose';

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/**
 * Auth middleware:
 * 1) Gateway headers
 * 2) Merchant Bearer JWT (Authorization / cookies) — full merchant access
 * 3) Dedicated short-lived previewToken query — read-only draft preview (NOT merchant JWT)
 */
app.use(async (req, res, next) => {
    try {
        if (req.headers['x-merchant-id']) {
            req.merchant = { _id: req.headers['x-merchant-id'] };
        }
        if (req.headers['x-admin-id']) {
            req.admin = { _id: req.headers['x-admin-id'] };
        }
        if (req.headers['x-vendor-id']) {
            req.vendor = { _id: req.headers['x-vendor-id'] };
            if (req.headers['x-store-id']) {
                req.vendor.store = req.headers['x-store-id'];
            }
        }

        // Wave 5/6 — dedicated preview tokens (never treat as merchant session JWT)
        if (req.query && req.query.previewToken) {
            const urlPath = String(req.path || req.originalUrl || '').split('?')[0];
            const storeFromPath = (urlPath.match(/\/api\/stores\/([a-fA-F0-9]{24})/) || [])[1]
                || (urlPath.match(/\/stores\/([a-fA-F0-9]{24})/) || [])[1];
            const result = await verifyPreviewToken(String(req.query.previewToken), {
                storeId: req.query.storeId || storeFromPath || req.headers['x-store-id'],
                themeId: req.query.themeId || req.query.previewThemeId,
            });
            if (result.ok) {
                req.previewAuth = result.claims;
            } else {
                req.previewAuthError = result;
            }
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
                    if (decoded && decoded.purpose === 'theme-preview') {
                        req.previewAuthError = { ok: false, status: 403, message: 'Use previewToken query, not Bearer' };
                    } else if (decoded && decoded.id) {
                        if (decoded.type === 'vendor' || req.cookies?.jwt_vendor) {
                            req.vendor = { _id: decoded.id, store: decoded.storeId };
                        } else {
                            req.merchant = { _id: decoded.id };
                            req.admin = { _id: decoded.id };
                        }
                    }
                } catch (err) {
                    console.error('JWT Verification Error in store-service:', err.message);
                }
            }
        }

        // Preview tokens are read-only — block mutating methods
        if (req.previewAuth && !req.merchant) {
            const method = String(req.method || 'GET').toUpperCase();
            if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
                const path = req.path || '';
                const allow =
                    (method === 'POST' && path.includes('/analytics/events'))
                    || (method === 'POST' && path.includes('/consent'));
                if (!allow) {
                    return res.status(403).json({
                        success: false,
                        message: 'Preview access is read-only',
                    });
                }
            }
        }

        next();
    } catch (err) {
        next(err);
    }
});

app.use('/api/stores', storeRoutes);
app.use('/api/store-pages', storePageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api', shippingRoutes);
app.get('/api/theme-store', getThemeStore);

app.get('/api/store/health', (req, res) => {
    const mongoReady = mongoose.connection.readyState === 1;
    const redisBackend = getRedisBackend();
    const previewGate = assertPreviewTokenBackend();
    // Liveness: process is up. Do not 503 the whole store API because Redis is missing —
    // nginx/PM2 would 502 my-stores and theme audit. Preview tokens still fail closed.
    const alive = true;
    const serving = mongoReady;
    res.status(serving ? 200 : 503).json({
        status: serving ? 'success' : 'degraded',
        message: 'Store service health',
        alive,
        dependencies: {
            mongodb: mongoReady ? 'ok' : 'down',
            redis: redisBackend,
            previewTokens: previewGate.ok ? 'ok' : 'unavailable',
        },
    });
});

app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on store service!`,
    });
});

export default app;
