import jwt from 'jsonwebtoken';
import MasterAdmin from '../Models/MasterAdmin.js';

export const protectAdmin = async (req, res, next) => {
    let token;

    if (req.cookies.jwt_admin) {
        token = req.cookies.jwt_admin;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development');
            req.admin = await MasterAdmin.findById(decoded.id).select('-password');
            if (!req.admin) {
                return res.status(401).json({ message: 'Not authorized, admin not found' });
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
