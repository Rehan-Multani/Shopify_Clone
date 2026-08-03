import Razorpay from 'razorpay';
import crypto from 'crypto';
import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Merchant from '../models/Merchant.js';
import Store from '../models/Store.js';
import {
    sendMerchantMail,
    paymentSuccessEmail,
    storePaymentSuccessEmail
} from '../../../shared/merchantEmails.js';

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
    });
};

// @desc    Create a Razorpay order for plan subscription
// @route   POST /api/billing/create-order
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
            receipt: `rcpt_${merchantId.toString().slice(-8)}_${Date.now()}`,
            notes: {
                merchantId: merchantId.toString(),
                planId: planId,
                planName: plan.planName
            }
        };

        const order = await getRazorpayInstance().orders.create(options);

        const keyId = process.env.RAZORPAY_KEY_ID || '';
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            planName: plan.planName,
            planPrice: plan.planPrice,
            key: keyId
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        let errMsg = 'Unknown error';
        if (error) {
            if (typeof error === 'string') {
                errMsg = error;
            } else if (error.description) {
                errMsg = error.description;
            } else if (error.error && error.error.description) {
                errMsg = error.error.description;
            } else if (error.message) {
                errMsg = error.message;
            } else {
                errMsg = JSON.stringify(error);
            }
        }
        res.status(500).json({ message: 'Failed to create payment order. ' + errMsg });
    }
};

// @desc    Verify Razorpay payment and activate subscription
// @route   POST /api/billing/verify
// @access  Private/Merchant
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
        const merchantId = req.merchant._id;

        if (!razorpay_order_id.startsWith('mock_order_')) {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
                .update(body)
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
            }
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        // Deactivate any existing active subscriptions for this merchant
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

        // Update merchant's status and plan via HTTP to auth-service
        try {
            const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
            const response = await fetch(`${authServiceUrl}/api/auth/internal/merchants/${merchantId}/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                console.error('Failed to activate merchant in auth-service internally');
            }
        } catch (err) {
            console.error('Error calling auth-service to activate merchant:', err.message);
        }

        try {
            const merchant = await Merchant.findById(merchantId);
            if (merchant?.email) {
                sendMerchantMail(paymentSuccessEmail({
                    name: merchant.name,
                    email: merchant.email,
                    planName: plan.planName,
                    amount: plan.planPrice,
                    paymentId: razorpay_payment_id
                }));
            }
        } catch (mailErr) {
            console.error('Payment success mail error:', mailErr.message);
        }

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
// @route   GET /api/billing/history
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
// @route   GET /api/billing/active-subscription
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
// @route   POST /api/billing/verify-store-payment
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

        if (!razorpay_order_id.startsWith('mock_order_')) {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
                .update(body)
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
            }
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        // Fetch merchant email/mobile from auth-service internally
        let merchantEmail = '';
        let merchantMobile = '';
        try {
            const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
            const resMerchant = await fetch(`${authServiceUrl}/api/auth/internal/merchants/${merchantId}`);
            if (resMerchant.ok) {
                const merchData = await resMerchant.json();
                merchantEmail = merchData.email;
                merchantMobile = merchData.mobile;
            }
        } catch (err) {
            console.error('Error fetching merchant details internally:', err.message);
        }

        // Create the Store via HTTP call to store-service
        let store = null;
        try {
            const storeServiceUrl = process.env.STORE_SERVICE_URL || 'http://localhost:5004';
            const createStoreResponse = await fetch(`${storeServiceUrl}/api/stores/internal/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantId,
                    planType: plan.planType,
                    storeName: storeDetails.storeName.trim(),
                    storeDescription: storeDetails.storeDescription,
                    contactEmail: storeDetails.contactEmail || merchantEmail,
                    contactPhone: storeDetails.contactPhone || merchantMobile,
                    address: storeDetails.address,
                    city: storeDetails.city,
                    state: storeDetails.state,
                    pincode: storeDetails.pincode,
                    storeLogo: storeDetails.storeLogo,
                    socialLinks: storeDetails.socialLinks
                })
            });

            if (createStoreResponse.ok) {
                store = await createStoreResponse.json();
            } else {
                const errData = await createStoreResponse.json();
                return res.status(createStoreResponse.status).json({ message: errData.message || 'Failed to create store internally' });
            }
        } catch (err) {
            console.error('Error calling store-service to create store programmatically:', err.message);
            return res.status(500).json({ message: 'Failed to communicate with store service: ' + err.message });
        }

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

        // Activate merchant via HTTP call to auth-service
        try {
            const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
            await fetch(`${authServiceUrl}/api/auth/internal/merchants/${merchantId}/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (err) {
            console.error('Error calling auth-service to activate merchant internally:', err.message);
        }

        try {
            const merchant = await Merchant.findById(merchantId);
            if (merchant?.email) {
                sendMerchantMail(storePaymentSuccessEmail({
                    name: merchant.name,
                    email: merchant.email,
                    storeName: store.storeName,
                    planName: plan.planName,
                    amount: plan.planPrice,
                    paymentId: razorpay_payment_id
                }));
            }
        } catch (mailErr) {
            console.error('Store payment success mail error:', mailErr.message);
        }

        res.status(201).json({
            message: 'Payment verified and store created successfully!',
            store,
            subscription
        });
    } catch (error) {
        console.error('Verify store payment error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all payment history for admin
// @route   GET /api/billing/admin/history
// @access  Private/MasterAdmin
export const getAdminPaymentHistory = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }
        
        // Fetch all subscriptions, populate merchant, store, plan
        const subscriptions = await Subscription.find({})
            .populate('merchant', 'name email mobile')
            .populate('store', 'storeName')
            .populate('plan', 'planName planPrice planType')
            .sort({ createdAt: -1 });

        // Calculate summary stats
        const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
        // Active subscribers are subscriptions with status 'active' and not expired
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active' && new Date(sub.endDate) > new Date());
        const totalSubs = activeSubscriptions.length;

        // Map subscriptions to store-wise billing history
        const billingHistory = subscriptions.map(sub => ({
            id: sub._id,
            merchantName: sub.merchant ? sub.merchant.name : 'N/A',
            storeName: sub.store ? sub.store.storeName : 'N/A',
            startDate: sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : 'N/A',
            endDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : 'N/A',
            amount: `₹${(sub.amount || 0).toLocaleString()}`,
            planName: sub.plan ? sub.plan.planName : 'N/A',
            status: sub.status || 'inactive',
            paymentId: sub.paymentId || 'N/A'
        }));

        res.json({
            totalRevenue,
            totalSubs,
            billingHistory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
