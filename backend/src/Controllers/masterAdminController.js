import MasterAdmin from '../Models/MasterAdmin.js';
import generateToken from '../Utils/generateToken.js';

// @desc    Auth master admin & get token
// @route   POST /api/master-admin/login
// @access  Public
export const authMasterAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const admin = await MasterAdmin.findOne({ email }).select('+password');

        if (admin && (await admin.matchPassword(password))) {
            const token = generateToken(admin._id);
            
            // Set cookie if needed (optional, keeping it simple for now and sending in response)
            res.cookie('jwt_admin', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get master admin profile
// @route   GET /api/master-admin/profile
// @access  Private
export const getMasterAdminProfile = async (req, res) => {
    try {
        const admin = await MasterAdmin.findById(req.admin._id);

        if (admin) {
            res.json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout admin / clear cookie
// @route   POST /api/master-admin/logout
// @access  Private
export const logoutAdmin = (req, res) => {
    res.cookie('jwt_admin', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
