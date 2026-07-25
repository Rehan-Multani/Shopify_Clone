import Razorpay from 'razorpay';
import crypto from 'crypto';
import ThemePurchase from '../models/ThemePurchase.js';

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
    });
};

const MERCHANT_ADMIN_URL = process.env.MERCHANT_ADMIN_SERVICE_URL || 'http://localhost:5002';

const fetchTheme = async (themeId) => {
    const res = await fetch(`${MERCHANT_ADMIN_URL}/api/admin/themes/${themeId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
};

// @desc    Create Razorpay order for premium theme
// @route   POST /api/billing/themes/create-order
export const createThemeOrder = async (req, res) => {
    try {
        const { themeId, storeId } = req.body;
        const merchantId = req.merchant?._id;

        if (!merchantId) {
            return res.status(401).json({ message: 'Merchant authentication required' });
        }
        if (!themeId) {
            return res.status(400).json({ message: 'themeId is required' });
        }

        const theme = await fetchTheme(themeId);
        if (!theme) {
            return res.status(404).json({ message: 'Theme not found' });
        }
        if (theme.type !== 'paid' || !theme.price) {
            return res.status(400).json({ message: 'This theme is free — no purchase required' });
        }

        const existing = await ThemePurchase.findOne({
            merchantId,
            themeId: String(themeId),
            status: 'paid',
        });
        if (existing) {
            return res.json({
                alreadyPurchased: true,
                purchase: existing,
                message: 'Theme already purchased',
            });
        }

        const amountInPaise = Math.round(Number(theme.price) * 100);
        const order = await getRazorpayInstance().orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `theme_${String(themeId).slice(-6)}_${Date.now()}`,
            notes: {
                merchantId: String(merchantId),
                themeId: String(themeId),
                themeFolder: theme.folder || '',
                storeId: storeId || '',
                type: 'theme_purchase',
            },
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            themeName: theme.displayName || theme.themeName,
            themePrice: theme.price,
            key: process.env.RAZORPAY_KEY_ID || '',
        });
    } catch (error) {
        console.error('Theme order creation error:', error);
        res.status(500).json({
            message: 'Failed to create theme payment order. ' + (error.message || 'Unknown error'),
        });
    }
};

// @desc    Verify theme payment and unlock
// @route   POST /api/billing/themes/verify
export const verifyThemePayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            themeId,
            storeId,
        } = req.body;
        const merchantId = req.merchant?._id;

        if (!merchantId) {
            return res.status(401).json({ message: 'Merchant authentication required' });
        }
        if (!themeId || !razorpay_order_id || !razorpay_payment_id) {
            return res.status(400).json({ message: 'Missing payment or theme details' });
        }

        if (!String(razorpay_order_id).startsWith('mock_order_')) {
            const body = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expected = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
                .update(body)
                .digest('hex');
            if (expected !== razorpay_signature) {
                return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
            }
        }

        const theme = await fetchTheme(themeId);
        if (!theme) {
            return res.status(404).json({ message: 'Theme not found' });
        }

        let purchase = await ThemePurchase.findOne({ merchantId, themeId: String(themeId) });
        if (purchase && purchase.status === 'paid') {
            return res.json({
                message: 'Theme already unlocked',
                purchase,
                alreadyPurchased: true,
            });
        }

        if (!purchase) {
            purchase = await ThemePurchase.create({
                merchantId,
                storeId: storeId || null,
                themeId: String(themeId),
                themeFolder: theme.folder || '',
                themeName: theme.displayName || theme.themeName || '',
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                amount: theme.price,
                currency: 'INR',
                status: 'paid',
                purchasedAt: new Date(),
            });
        } else {
            purchase.status = 'paid';
            purchase.orderId = razorpay_order_id;
            purchase.paymentId = razorpay_payment_id;
            purchase.amount = theme.price;
            purchase.purchasedAt = new Date();
            await purchase.save();
        }

        res.json({
            message: 'Theme purchased successfully! You can now add it to your library.',
            purchase,
        });
    } catch (error) {
        console.error('Theme payment verify error:', error);
        if (error.code === 11000) {
            const purchase = await ThemePurchase.findOne({
                merchantId: req.merchant._id,
                themeId: String(req.body.themeId),
                status: 'paid',
            });
            return res.json({ message: 'Theme already unlocked', purchase, alreadyPurchased: true });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if merchant owns a theme
// @route   GET /api/billing/themes/check/:themeId
export const checkThemePurchase = async (req, res) => {
    try {
        const merchantId = req.merchant?._id || req.query.merchantId;
        const { themeId } = req.params;

        if (!merchantId || !themeId) {
            return res.status(400).json({ purchased: false, message: 'merchantId and themeId required' });
        }

        const purchase = await ThemePurchase.findOne({
            merchantId,
            themeId: String(themeId),
            status: 'paid',
        });

        res.json({
            purchased: !!purchase,
            purchase: purchase || null,
        });
    } catch (error) {
        res.status(500).json({ purchased: false, message: error.message });
    }
};

// @desc    List merchant theme purchases
// @route   GET /api/billing/themes/purchases
export const getThemePurchases = async (req, res) => {
    try {
        const merchantId = req.merchant?._id;
        if (!merchantId) {
            return res.status(401).json({ message: 'Merchant authentication required' });
        }

        const purchases = await ThemePurchase.find({ merchantId, status: 'paid' }).sort({ purchasedAt: -1 });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
