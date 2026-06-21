import Merchant from '../Models/Merchant.js';
import Subscription from '../Models/Subscription.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { sendEmail } from '../Utils/sendEmail.js';
import generateToken from '../Utils/generateToken.js';

// @desc    Get all merchants
// @route   GET /api/merchants
// @access  Private/MasterAdmin
export const getMerchants = async (req, res) => {
    try {
        const merchants = await Merchant.find({}).populate('plan');
        res.json(merchants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a merchant
// @route   POST /api/merchants
// @access  Private/MasterAdmin
export const createMerchant = async (req, res) => {
    try {
        const { name, email, mobile, profile, address, plan, status, revenue, gstNumber, password } = req.body;

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
            plan: plan || null,
            status: status || 'active',
            revenue: revenue !== undefined ? revenue : 0,
            gstNumber: gstNumber || '',
            password: rawPassword
        });

        const createdMerchant = await merchant.save();

        // If a plan is assigned, create a Subscription record
        if (plan) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + 30); // 30 days billing cycle

            await Subscription.create({
                merchant: createdMerchant._id,
                plan,
                startDate,
                endDate,
                status: 'active'
            });
        }

        const populatedMerchant = await Merchant.findById(createdMerchant._id).populate('plan');

        // Send email with credentials
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
        
        // Send email asynchronously
        sendEmail({ to: email, subject: emailSubject, text: emailText, html: emailHtml });

        res.status(201).json(populatedMerchant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a merchant
// @route   PUT /api/merchants/:id
// @access  Private/MasterAdmin
export const updateMerchant = async (req, res) => {
    try {
        const { name, email, mobile, profile, address, plan, status, revenue, gstNumber, password } = req.body;

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

            // Check if plan has changed
            const planChanged = plan !== undefined && String(plan) !== String(merchant.plan || '');

            merchant.name = name !== undefined ? name : merchant.name;
            merchant.email = email !== undefined ? email : merchant.email;
            merchant.mobile = mobile !== undefined ? mobile : merchant.mobile;
            merchant.profile = profile !== undefined ? profile : merchant.profile;
            merchant.address = address !== undefined ? address : merchant.address;
            merchant.plan = plan !== undefined ? (plan === '' ? null : plan) : merchant.plan;
            merchant.status = status !== undefined ? status : merchant.status;
            merchant.revenue = revenue !== undefined ? revenue : merchant.revenue;
            merchant.gstNumber = gstNumber !== undefined ? gstNumber : merchant.gstNumber;
            if (password !== undefined) merchant.password = password;

            const updatedMerchant = await merchant.save();

            if (planChanged) {
                // Deactivate previous active subscriptions
                await Subscription.updateMany(
                    { merchant: merchant._id, status: 'active' },
                    { status: 'inactive' }
                );

                // If new plan is selected, create a new Subscription record
                if (plan && plan !== '') {
                    const startDate = new Date();
                    const endDate = new Date();
                    endDate.setDate(startDate.getDate() + 30); // 30 days billing cycle

                    await Subscription.create({
                        merchant: merchant._id,
                        plan,
                        startDate,
                        endDate,
                        status: 'active'
                    });
                }
            }

            const populatedMerchant = await Merchant.findById(updatedMerchant._id).populate('plan');
            res.json(populatedMerchant);
        } else {
            res.status(404).json({ message: 'Merchant not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a merchant
// @route   DELETE /api/merchants/:id
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

// @desc    Upload merchant profile picture (converts to webp and saves locally)
// @route   POST /api/merchants/upload
// @access  Private/MasterAdmin
export const uploadMerchantProfile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image file' });
        }

        // Ensure public/uploads folder exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate clean webp filename
        const filename = `merchant-profile-${Date.now()}.webp`;
        const filepath = path.join(uploadDir, filename);

        // Convert the buffer to webp and save to file using sharp
        await sharp(req.file.buffer)
            .webp({ quality: 80 })
            .toFile(filepath);

        // Send back relative path
        res.json({
            url: `/uploads/${filename}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Merchant Login
// @route   POST /api/merchants/login
// @access  Public
export const merchantLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }
        const merchant = await Merchant.findOne({ email }).populate('plan');
        if (!merchant || !(await merchant.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials. Merchant not found.' });
        }
        if (merchant.status === 'suspended') {
            return res.status(403).json({ message: 'Your account is suspended. Please contact support.' });
        }

        const token = generateToken(merchant._id);

        // Set httpOnly cookie
        res.cookie('jwt_merchant', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            message: 'Login successful',
            token,
            merchant
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Merchant Forgot Password (sends OTP email)
// @route   POST /api/merchants/forgot-password
// @access  Public
export const merchantForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Please provide email address' });
        }
        const merchant = await Merchant.findOne({ email });
        if (!merchant) {
            return res.status(404).json({ message: 'Merchant with this email address does not exist.' });
        }

        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save OTP and expiration (10 minutes)
        merchant.resetPasswordOTP = otp;
        merchant.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await merchant.save();

        // Send email with OTP
        const emailSubject = 'Storify - Password Recovery Verification Code';
        const emailText = `Hello ${merchant.name},\n\nWe received a request to recover your password.\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nRegards,\nStorify Team`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
            <h2 style="color: #0d9488; text-align: center;">Password Recovery Code</h2>
            <p>Hello <strong>${merchant.name}</strong>,</p>
            <p>We received a request to recover your password for your Storify Merchant Account.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 5px 0;"><strong>Your Verification Code is:</strong></p>
              <h1 style="color: #111827; letter-spacing: 4px; margin: 10px 0;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes. Do not share it with anyone.</p>
            <p>Regards,<br/><strong>Storify Team</strong></p>
          </div>
        `;

        await sendEmail({ to: email, subject: emailSubject, text: emailText, html: emailHtml });

        res.json({ message: 'Verification code sent to email successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Merchant OTP
// @route   POST /api/merchants/verify-otp
// @access  Public
export const merchantVerifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }
        
        const merchant = await Merchant.findOne({ email });
        if (!merchant) {
            return res.status(404).json({ message: 'Invalid request' });
        }

        if (merchant.resetPasswordOTP !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (merchant.resetPasswordExpire < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Merchant Password
// @route   POST /api/merchants/reset-password
// @access  Public
export const merchantResetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
        }
        
        const merchant = await Merchant.findOne({ email });
        if (!merchant) {
            return res.status(404).json({ message: 'Invalid request' });
        }

        if (merchant.resetPasswordOTP !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (merchant.resetPasswordExpire < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        merchant.password = newPassword;
        merchant.resetPasswordOTP = undefined;
        merchant.resetPasswordExpire = undefined;
        await merchant.save();

        res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
