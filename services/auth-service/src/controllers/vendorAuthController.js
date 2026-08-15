import Vendor from '../models/Vendor.js';
import generateToken from '../../../shared/generateToken.js';
import { sendTransactionalEmail } from '../../../shared/transactionalEmail.js';
import bcrypt from 'bcryptjs';

function buildOtpEmail({ name, otp, audience }) {
  const emailSubject = `Storify - ${audience} Password Recovery Code`;
  const emailText = `Hello ${name},\n\nWe received a request to recover your password.\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nRegards,\nStorify Team`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #0d9488; text-align: center;">Password Recovery Code</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to recover your password for your Storify ${audience} Account.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 5px 0;"><strong>Your Verification Code is:</strong></p>
        <h1 style="color: #111827; letter-spacing: 4px; margin: 10px 0;">${otp}</h1>
      </div>
      <p>This code will expire in 10 minutes. Do not share it with anyone.</p>
      <p>Regards,<br/><strong>Storify Team</strong></p>
    </div>
  `;
  return { emailSubject, emailText, emailHtml };
}

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
            maxAge: 30 * 24 * 60 * 60 * 1000
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

// @desc    Vendor Forgot Password (sends OTP via Brevo SMTP)
// @route   POST /api/auth/vendor/forgot-password
// @access  Public
export const vendorForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Please provide email address' });
        }

        const vendor = await Vendor.findOne({ email: String(email).toLowerCase().trim() });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor with this email address does not exist.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        vendor.resetPasswordOTP = otp;
        vendor.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await vendor.save();

        const name = vendor.email.split('@')[0];
        const { emailSubject, emailText, emailHtml } = buildOtpEmail({
            name,
            otp,
            audience: 'Vendor'
        });

        try {
            // Storify vendor portal OTP — platform SMTP only (no vendor/merchant fallback)
            await sendTransactionalEmail({
                to: vendor.email,
                subject: emailSubject,
                text: emailText,
                html: emailHtml,
                event: 'forgot_password_otp'
            });
        } catch (mailErr) {
            vendor.resetPasswordOTP = undefined;
            vendor.resetPasswordExpire = undefined;
            await vendor.save();
            return res.status(502).json({
                message: 'Could not send verification email. Please try again later.',
                code: mailErr.code || 'EMAIL_SEND_FAILED'
            });
        }

        res.json({ message: 'Verification code sent to email successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Vendor OTP
// @route   POST /api/auth/vendor/verify-otp
// @access  Public
export const vendorVerifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        const vendor = await Vendor.findOne({ email: String(email).toLowerCase().trim() });
        if (!vendor) {
            return res.status(404).json({ message: 'Invalid request' });
        }

        if (vendor.resetPasswordOTP !== String(otp).trim()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (!vendor.resetPasswordExpire || vendor.resetPasswordExpire < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Vendor Password
// @route   POST /api/auth/vendor/reset-password
// @access  Public
export const vendorResetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const vendor = await Vendor.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
        if (!vendor) {
            return res.status(404).json({ message: 'Invalid request' });
        }

        if (vendor.resetPasswordOTP !== String(otp).trim()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (!vendor.resetPasswordExpire || vendor.resetPasswordExpire < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        const salt = await bcrypt.genSalt(10);
        vendor.password = await bcrypt.hash(newPassword, salt);
        vendor.resetPasswordOTP = undefined;
        vendor.resetPasswordExpire = undefined;
        await vendor.save();

        res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
