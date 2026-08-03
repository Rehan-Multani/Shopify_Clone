import Merchant from '../models/Merchant.js';
import Store from '../models/Store.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { sendMerchantMail, signupWelcomeEmail } from '../../../shared/merchantEmails.js';

// @desc    Get all merchants
// @route   GET /api/admin/merchants
// @access  Private/MasterAdmin
export const getMerchants = async (req, res) => {
    try {
        const merchants = await Merchant.find({});
        res.json(merchants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function createMerchantAccount(payload, { status = 'trial' } = {}) {
    const { name, email, mobile, profile, address, planType, revenue, gstNumber, password: bodyPassword } = payload;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
        const err = new Error('Mobile number must be exactly 10 digits');
        err.status = 400;
        throw err;
    }

    const existingMerchant = await Merchant.findOne({ $or: [{ email }, { mobile }] });
    if (existingMerchant) {
        const err = new Error(
            existingMerchant.email === email
                ? 'Merchant email already exists'
                : 'Merchant mobile number already exists'
        );
        err.status = 400;
        throw err;
    }

    const rawPassword = bodyPassword || Math.random().toString(36).slice(-10);
    const merchant = new Merchant({
        name,
        email,
        mobile,
        profile: profile || '',
        address: address || '',
        planType: planType || 'Single Vendor',
        status: payload.status || status,
        revenue: revenue !== undefined ? revenue : 0,
        gstNumber: gstNumber || '',
        password: rawPassword
    });

    const createdMerchant = await merchant.save();
    const populatedMerchant = await Merchant.findById(createdMerchant._id);

    await sendMerchantMail(signupWelcomeEmail({
        name,
        email,
        password: rawPassword
    }));

    return populatedMerchant;
}

// @desc    Create a merchant (Superadmin)
// @route   POST /api/admin/merchants
// @access  Private/MasterAdmin
export const createMerchant = async (req, res) => {
    try {
        const populatedMerchant = await createMerchantAccount(
            { ...req.body, status: req.body.status || 'active' },
            { status: 'active' }
        );
        res.status(201).json(populatedMerchant);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

// @desc    Public merchant signup
// @route   POST /api/admin/merchants/signup
// @access  Public
export const publicMerchantSignup = async (req, res) => {
    try {
        const { name, email, mobile, planType, gstNumber, address, profile } = req.body;
        if (!name || !email || !mobile) {
            return res.status(400).json({ message: 'Name, email and mobile are required' });
        }

        const merchant = await createMerchantAccount({
            name,
            email: String(email).toLowerCase().trim(),
            mobile,
            planType,
            gstNumber,
            address,
            profile,
            status: 'trial'
        }, { status: 'trial' });

        res.status(201).json({
            message: 'Account created successfully. Check your email for login credentials.',
            merchant: {
                _id: merchant._id,
                name: merchant.name,
                email: merchant.email,
                mobile: merchant.mobile,
                planType: merchant.planType,
                status: merchant.status
            }
        });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

// @desc    Update a merchant
// @route   PUT /api/admin/merchants/:id
// @access  Private/MasterAdmin
export const updateMerchant = async (req, res) => {
    try {
        const { name, email, mobile, profile, address, planType, status, revenue, gstNumber, password } = req.body;

        const merchant = await Merchant.findById(req.params.id);

        if (merchant) {
            if (mobile && !/^\d{10}$/.test(mobile)) {
                return res.status(400).json({ message: 'Mobile number must be exactly 10 digits' });
            }

            if ((email && email !== merchant.email) || (mobile && mobile !== merchant.mobile)) {
                const query = { $or: [] };
                if (email && email !== merchant.email) query.$or.push({ email });
                if (mobile && mobile !== merchant.mobile) query.$or.push({ mobile });

                if (query.$or.length > 0) {
                    const existingMerchant = await Merchant.findOne(query);
                    if (existingMerchant) {
                        if (email && existingMerchant.email === email) {
                            return res.status(400).json({ message: 'Merchant email already exists' });
                        }
                        if (mobile && existingMerchant.mobile === mobile) {
                            return res.status(400).json({ message: 'Merchant mobile number already exists' });
                        }
                    }
                }
            }

            merchant.name = name !== undefined ? name : merchant.name;
            merchant.email = email !== undefined ? email : merchant.email;
            merchant.mobile = mobile !== undefined ? mobile : merchant.mobile;
            merchant.profile = profile !== undefined ? profile : merchant.profile;
            merchant.address = address !== undefined ? address : merchant.address;
            merchant.planType = planType !== undefined ? planType : merchant.planType;
            merchant.status = status !== undefined ? status : merchant.status;
            merchant.revenue = revenue !== undefined ? revenue : merchant.revenue;
            merchant.gstNumber = gstNumber !== undefined ? gstNumber : merchant.gstNumber;
            if (password !== undefined) merchant.password = password;

            const updatedMerchant = await merchant.save();
            const populatedMerchant = await Merchant.findById(updatedMerchant._id);
            res.json(populatedMerchant);
        } else {
            res.status(404).json({ message: 'Merchant not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a merchant
// @route   DELETE /api/admin/merchants/:id
// @access  Private/MasterAdmin
export const deleteMerchant = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.params.id);

        if (merchant) {
            await Merchant.deleteOne({ _id: merchant._id });
            res.json({ message: 'Merchant removed successfully' });
        } else {
            res.status(404).json({ message: 'Merchant not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload merchant profile picture
// @route   POST /api/admin/merchants/upload
// @access  Private/MasterAdmin
export const uploadMerchantProfile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image file' });
        }

        const uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `merchant-profile-${Date.now()}.webp`;
        const filepath = path.join(uploadDir, filename);

        await sharp(req.file.buffer)
            .webp({ quality: 80 })
            .toFile(filepath);

        res.json({
            url: `/uploads/${filename}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all stores
// @route   GET /api/admin/stores/all
// @access  Private/MasterAdmin
export const getAllStores = async (req, res) => {
    try {
        const stores = await Store.find({}).populate('merchantId', 'name email mobile').sort({ createdAt: -1 });
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

