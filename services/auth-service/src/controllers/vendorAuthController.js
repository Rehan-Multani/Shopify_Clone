import Vendor from '../models/Vendor.js';
import generateToken from '../../../shared/generateToken.js';
import bcrypt from 'bcryptjs';

// @desc    Vendor Login
// @route   POST /api/auth/vendor/login
// @access  Public
export const vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        const vendor = await Vendor.findOne({ email }).select('+password');
        if (!vendor) {
            return res.status(401).json({ message: 'Invalid credentials. Vendor not found.' });
        }

        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials. Password mismatch.' });
        }

        if (!vendor.isActive) {
            return res.status(403).json({ message: 'Your vendor account is deactivated. Please contact support.' });
        }

        const token = generateToken(vendor._id);

        res.cookie('jwt_vendor', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            message: 'Login successful',
            token,
            vendor: {
                _id: vendor._id,
                email: vendor.email,
                isActive: vendor.isActive,
                store: vendor.store
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
