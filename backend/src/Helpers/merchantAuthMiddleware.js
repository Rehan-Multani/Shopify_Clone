import jwt from 'jsonwebtoken';
import Merchant from '../Models/Merchant.js';

export const protectMerchant = async (req, res, next) => {
    let token;

    // Check cookie first, then Authorization header
    if (req.cookies.jwt_merchant) {
        token = req.cookies.jwt_merchant;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token && token !== 'null' && token !== 'undefined') {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development');
            req.merchant = await Merchant.findById(decoded.id).select('-password');
            if (!req.merchant) {
                return res.status(401).json({ message: 'Not authorized, merchant not found' });
            }
            if (req.merchant.status === 'suspended') {
                return res.status(403).json({ message: 'Your account is suspended. Please contact support.' });
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
