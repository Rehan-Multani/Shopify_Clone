import Razorpay from 'razorpay';
import crypto from 'crypto';
import Subscription from '../Models/Subscription.js';
import Merchant from '../Models/Merchant.js';
import Plan from '../Models/Plan.js';
import Store from '../Models/Store.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

// @desc    Create a Razorpay order for plan subscription
// @route   POST /api/payments/create-order
// @access  Private/Merchant
export const createOrder = async (req, res) => {
    try {
        const { planId } = req.body;
        const merchantId = req.merchant._id;

        if (!planId) {
            return res.status(400).json({ message: 'Plan ID is required' });
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        const amountInPaise = Math.round(plan.planPrice * 100); // Razorpay expects paise

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${merchantId}_${Date.now()}`,
            notes: {
                merchantId: merchantId.toString(),
                planId: planId,
                planName: plan.planName
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            planName: plan.planName,
            planPrice: plan.planPrice,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ message: 'Failed to create payment order. ' + error.message });
    }
};

// @desc    Verify Razorpay payment and activate subscription
// @route   POST /api/payments/verify
// @access  Private/Merchant
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
        const merchantId = req.merchant._id;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        // Deactivate any existing active subscriptions
        await Subscription.updateMany(
            { merchant: merchantId, status: 'active' },
            { status: 'inactive' }
        );

        // Create new subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30); // 30 day billing cycle

        const subscription = await Subscription.create({
            merchant: merchantId,
            plan: planId,
            startDate,
            endDate,
            status: 'active',
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            amount: plan.planPrice
        });

        // Update merchant's plan
        await Merchant.findByIdAndUpdate(merchantId, { plan: planId, status: 'active' });

        res.json({
            message: 'Payment successful! Subscription activated.',
            subscription
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get payment history for a merchant
// @route   GET /api/payments/history
// @access  Private/Merchant
export const getPaymentHistory = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ merchant: req.merchant._id })
            .populate('plan')
            .sort({ createdAt: -1 });

        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active subscription
// @route   GET /api/payments/active-subscription
// @access  Private/Merchant
export const getActiveSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            merchant: req.merchant._id,
            status: 'active'
        }).populate('plan');

        res.json(subscription || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Razorpay payment and create store with active subscription
// @route   POST /api/payments/verify-store-payment
// @access  Private/Merchant
export const verifyStorePayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            planId, 
            storeDetails 
        } = req.body;
        const merchantId = req.merchant._id;

        if (!storeDetails || !storeDetails.storeName || !storeDetails.storeName.trim()) {
            return res.status(400).json({ message: 'Store name is required' });
        }

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        // Create the Store
        const store = await Store.create({
            merchantId,
            plan: planId,
            planType: plan.planType,
            storeName: storeDetails.storeName.trim(),
            storeDescription: storeDetails.storeDescription || '',
            contactEmail: storeDetails.contactEmail || req.merchant.email,
            contactPhone: storeDetails.contactPhone || req.merchant.mobile,
            address: storeDetails.address || '',
            city: storeDetails.city || '',
            state: storeDetails.state || '',
            pincode: storeDetails.pincode || '',
            storeLogo: storeDetails.storeLogo || '',
            storeBanner: storeDetails.storeBanner || '',
            socialLinks: storeDetails.socialLinks || {}
        });

        // Create the Subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30); // 30 day billing cycle

        const subscription = await Subscription.create({
            merchant: merchantId,
            store: store._id,
            plan: planId,
            startDate,
            endDate,
            status: 'active',
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            amount: plan.planPrice
        });

        res.status(201).json({
            message: 'Payment verified and store created successfully!',
            store,
            subscription
        });
    } catch (error) {
        console.error('Verify store payment error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A store with a similar name already exists. Please choose a different name.' });
        }
        res.status(500).json({ message: error.message });
    }
};
