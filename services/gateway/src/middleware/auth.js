import jwt from 'jsonwebtoken';

export const gatewayAuthMiddleware = async (req, res, next) => {
    const path = req.path;
    const method = req.method;
    
    let requiredAuth = null; // default public
    
    if (path === '/api/master-admin/profile' || path === '/api/master-admin/analytics') {
        requiredAuth = 'admin';
    } else if (path.startsWith('/api/merchants')) {
        const publicMerchantPaths = [
            '/api/merchants/login',
            '/api/merchants/forgot-password',
            '/api/merchants/verify-otp',
            '/api/merchants/reset-password'
        ];
        if (publicMerchantPaths.includes(path)) {
            requiredAuth = null;
        } else if (method === 'PUT' && path.match(/^\/api\/merchants\/[a-f0-9]{24}$/i)) {
            requiredAuth = 'merchant_or_admin';
        } else {
            requiredAuth = 'admin'; // e.g. admin managing merchants
        }
    } else if (path.startsWith('/api/plans')) {
        if (method === 'GET') {
            requiredAuth = null;
        } else {
            requiredAuth = 'admin';
        }
    } else if (path === '/api/stores/admin/all') {
        requiredAuth = 'admin';
    } else if (path.startsWith('/api/stores')) {
        // GET specific store is public; other actions (or list my-stores, dashboard-stats etc.) require merchant
        if (method === 'GET' && (path.match(/^\/api\/stores\/[a-f0-9]{24}$/i) || path === '/api/stores/domain/resolve')) {
            requiredAuth = null;
        } else {
            requiredAuth = 'merchant';
        }
    } else if (path.startsWith('/api/products')) {
        requiredAuth = method === 'GET' ? null : 'merchant_or_vendor';
    } else if (path.startsWith('/api/categories')) {
        requiredAuth = method === 'GET' ? null : 'merchant_or_vendor';
    } else if (path.startsWith('/api/coupons')) {
        requiredAuth = method === 'GET' ? null : 'merchant_or_vendor';
    } else if (path.startsWith('/api/store-pages')) {
        requiredAuth = method === 'GET' ? null : 'merchant_or_vendor';
    } else if (path.startsWith('/api/customers')) {
        if (
            (method === 'POST' && (path.endsWith('/subscribe') || path.endsWith('/register') || path.endsWith('/login'))) ||
            path.match(/^\/api\/customers\/[a-f0-9]{24}(\/.*)?$/i)
        ) {
            requiredAuth = null;
        } else {
            requiredAuth = 'merchant';
        }
    } else if (path.startsWith('/api/payments') || path.startsWith('/api/billing')) {
        requiredAuth = 'merchant';
    } else if (path.startsWith('/api/themes/admin')) {
        requiredAuth = 'admin';
    } else if (path.startsWith('/api/themes')) {
        if (method === 'GET' && (path === '/api/themes' || path === '/api/themes/marketplace' || path.match(/^\/api\/themes\/marketplace\/[a-zA-Z0-9_-]+(\/.*)?$/))) {
            requiredAuth = null;
        } else {
            requiredAuth = 'merchant';
        }
    }
    
    // Extract token if present (even for public paths to populate identity headers if they exist)
    const tokenInfo = extractToken(req);
    
    if (!requiredAuth) {
        if (tokenInfo) {
            try {
                let verified = await verifyTokenWithAuthService(tokenInfo.token, tokenInfo.type);
                if (!verified.valid) {
                    verified = await verifyTokenWithAuthService(tokenInfo.token);
                }
                if (verified.valid) {
                    if (verified.type === 'admin') {
                        req.headers['x-admin-id'] = verified.id;
                    } else if (verified.type === 'merchant') {
                        req.headers['x-merchant-id'] = verified.id;
                    } else if (verified.type === 'vendor') {
                        req.headers['x-vendor-id'] = verified.id;
                        req.headers['x-store-id'] = verified.storeId;
                    }
                }
            } catch (err) {
                // Ignore errors for public paths
            }
        }
        return next();
    }
    
    if (!tokenInfo) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    try {
        let verified = await verifyTokenWithAuthService(tokenInfo.token, tokenInfo.type);
        if (!verified.valid) {
            verified = await verifyTokenWithAuthService(tokenInfo.token);
        }
        if (!verified.valid) {
            return res.status(401).json({ message: verified.message || 'Not authorized, token failed' });
        }
        
        // Enforce required roles
        if (requiredAuth === 'admin' && verified.type !== 'admin') {
            return res.status(401).json({ message: 'Not authorized, admin privileges required' });
        } else if (requiredAuth === 'merchant_or_vendor' && verified.type !== 'merchant' && verified.type !== 'vendor') {
            return res.status(401).json({ message: 'Not authorized, merchant or vendor privileges required' });
        }
        
        // Inject trusted headers for downstream services
        if (verified.type === 'admin') {
            req.headers['x-admin-id'] = verified.id;
        } else if (verified.type === 'merchant') {
            req.headers['x-merchant-id'] = verified.id;
        } else if (verified.type === 'vendor') {
            req.headers['x-vendor-id'] = verified.id;
            req.headers['x-store-id'] = verified.storeId;
        }
        
        next();
    } catch (error) {
        console.error('Gateway auth error:', error);
        return res.status(500).json({ message: 'Internal server error during authentication' });
    }
};

function extractToken(req) {
    // Check cookies first
    if (req.cookies && req.cookies.jwt_admin) {
        return { token: req.cookies.jwt_admin, type: 'admin' };
    }
    if (req.cookies && req.cookies.jwt_merchant) {
        return { token: req.cookies.jwt_merchant, type: 'merchant' };
    }
    if (req.cookies && req.cookies.jwt_vendor) {
        return { token: req.cookies.jwt_vendor, type: 'vendor' };
    }
    
    // Fallback to authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        if (token && token !== 'null' && token !== 'undefined') {
            // Guess type from path
            const path = req.path;
            if (path.startsWith('/api/master-admin') || (path.startsWith('/api/merchants') && !path.includes('/login'))) {
                return { token, type: 'admin' };
            }
            if (path.startsWith('/api/auth/vendor') || path.includes('vendor')) {
                return { token, type: 'vendor' };
            }
            return { token, type: 'merchant' };
        }
    }
    return null;
}

async function verifyTokenWithAuthService(token, type) {
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, type })
        });
        
        const data = await response.json();
        if (!response.ok) {
            return { valid: false, message: data.message };
        }
        return data; // returns { valid: true, id, type }
    } catch (error) {
        console.error('Error calling auth-service:', error);
        return { valid: false, message: 'Auth service communication error' };
    }
}
