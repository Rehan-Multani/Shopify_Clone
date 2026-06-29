import jwt from 'jsonwebtoken';
import MasterAdmin from '../models/MasterAdmin.js';
import Merchant from '../models/Merchant.js';
import Vendor from '../models/Vendor.js';

// @desc    Verify JWT token & return user details
// @route   POST /api/auth/verify
// @access  Internal (called by gateway)
export const verifyToken = async (req, res) => {
    try {
        const { token, type } = req.body;
        if (!token) {
            return res.status(400).json({ valid: false, message: 'Token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development');

        if (type === 'admin') {
            const admin = await MasterAdmin.findById(decoded.id);
            if (!admin) {
                return res.status(401).json({ valid: false, message: 'Admin not found' });
            }
            return res.json({ valid: true, id: admin._id, type: 'admin' });
        } else if (type === 'merchant') {
            const merchant = await Merchant.findById(decoded.id);
            if (!merchant) {
                return res.status(401).json({ valid: false, message: 'Merchant not found' });
            }
            if (merchant.status === 'suspended') {
                return res.status(403).json({ valid: false, message: 'Your account is suspended. Please contact support.' });
            }
            return res.json({ valid: true, id: merchant._id, type: 'merchant' });
        } else if (type === 'vendor') {
            const vendor = await Vendor.findById(decoded.id);
            if (!vendor) {
                return res.status(401).json({ valid: false, message: 'Vendor not found' });
            }
            if (!vendor.isActive) {
                return res.status(403).json({ valid: false, message: 'Your vendor account is deactivated.' });
            }
            return res.json({ valid: true, id: vendor._id, type: 'vendor', storeId: vendor.store });
        } else {
            // Check admin first, then merchant, then vendor
            const admin = await MasterAdmin.findById(decoded.id);
            if (admin) {
                return res.json({ valid: true, id: admin._id, type: 'admin' });
            }

            const merchant = await Merchant.findById(decoded.id);
            if (merchant) {
                if (merchant.status === 'suspended') {
                    return res.status(403).json({ valid: false, message: 'Your account is suspended. Please contact support.' });
                }
                return res.json({ valid: true, id: merchant._id, type: 'merchant' });
            }

            const vendor = await Vendor.findById(decoded.id);
            if (vendor) {
                if (!vendor.isActive) {
                    return res.status(403).json({ valid: false, message: 'Your vendor account is deactivated.' });
                }
                return res.json({ valid: true, id: vendor._id, type: 'vendor', storeId: vendor.store });
            }

            return res.status(401).json({ valid: false, message: 'User not found' });
        }
    } catch (error) {
        return res.status(401).json({ valid: false, message: 'Token verification failed' });
    }
};

// @desc    Internal endpoint to activate a merchant (called by billing-service)
// @route   POST /api/auth/internal/merchants/:id/activate
// @access  Internal
export const activateMerchantInternal = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.params.id);
        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }
        
        merchant.status = 'active';
        await merchant.save();
        
        res.json({ success: true, message: 'Merchant activated successfully', merchant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Internal endpoint to fetch merchant profile (called by store-service/billing-service)
// @route   GET /api/auth/internal/merchants/:id
// @access  Internal
export const getMerchantInternal = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.params.id).select('-password');
        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }
        res.json(merchant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
