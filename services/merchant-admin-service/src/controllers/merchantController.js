import Merchant from '../models/Merchant.js';
import Store from '../models/Store.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { sendEmail } from '../../../shared/sendEmail.js';

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

// @desc    Create a merchant
// @route   POST /api/admin/merchants
// @access  Private/MasterAdmin
export const createMerchant = async (req, res) => {
    try {
        const { name, email, mobile, profile, address, planType, status, revenue, gstNumber } = req.body;

        if (!mobile || !/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ message: 'Mobile number must be exactly 10 digits' });
        }

        const existingMerchant = await Merchant.findOne({ $or: [{ email }, { mobile }] });
        if (existingMerchant) {
            if (existingMerchant.email === email) {
                return res.status(400).json({ message: 'Merchant email already exists' });
            }
            if (existingMerchant.mobile === mobile) {
                return res.status(400).json({ message: 'Merchant mobile number already exists' });
            }
        }

        const rawPassword = Math.random().toString(36).slice(-10);
        const merchant = new Merchant({
            name,
            email,
            mobile,
            profile: profile || '',
            address: address || '',
            planType: planType || 'Single Vendor',
            status: status || 'active',
            revenue: revenue !== undefined ? revenue : 0,
            gstNumber: gstNumber || '',
            password: rawPassword
        });

        const createdMerchant = await merchant.save();
        const populatedMerchant = await Merchant.findById(createdMerchant._id);

        const emailSubject = 'Welcome to Storify - Your Merchant Account Credentials';
        const emailText = `Hello ${name},\n\nYour merchant account has been successfully created by the Superadmin.\n\nYou can log in to your dashboard at http://localhost:5173/admin/login using these credentials:\n\nEmail: ${email}\nPassword: ${rawPassword}\n\nRegards,\nStorify Team`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
            <h2 style="color: #0d9488; text-align: center;">Welcome to Storify!</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your merchant account has been successfully created by the Superadmin.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="http://localhost:5173/admin/login">http://localhost:5173/admin/login</a></p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${rawPassword}</code></p>
            </div>
            <p>We recommend logging in and updating your password under your profile settings.</p>
            <p>Regards,<br/><strong>Storify Team</strong></p>
          </div>
        `;
        
        sendEmail({ to: email, subject: emailSubject, text: emailText, html: emailHtml });

        res.status(201).json(populatedMerchant);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

