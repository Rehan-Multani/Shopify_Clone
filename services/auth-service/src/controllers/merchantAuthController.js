import Merchant from '../models/Merchant.js';
import { sendEmail } from '../../../shared/sendEmail.js';
import generateToken from '../../../shared/generateToken.js';

// @desc    Merchant Login
// @route   POST /api/auth/merchant/login
// @access  Public
export const merchantLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }
        const merchant = await Merchant.findOne({ email });
        if (!merchant || !(await merchant.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials. Merchant not found.' });
        }
        if (merchant.status === 'suspended') {
            return res.status(403).json({ message: 'Your account is suspended. Please contact support.' });
        }

        const token = generateToken(merchant._id);

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
// @route   POST /api/auth/merchant/forgot-password
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

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        merchant.resetPasswordOTP = otp;
        merchant.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await merchant.save();

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
// @route   POST /api/auth/merchant/verify-otp
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
// @route   POST /api/auth/merchant/reset-password
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
