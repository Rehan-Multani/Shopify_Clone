import MasterAdmin from '../models/MasterAdmin.js';

// @desc    Get master admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
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
