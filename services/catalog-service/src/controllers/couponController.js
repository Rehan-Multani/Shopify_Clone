import Coupon from '../models/Coupon.js';

// @desc    Get all coupons for logged-in merchant
// @route   GET /api/coupons
// @access  Private/Merchant
export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ merchant: req.merchant._id }).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Merchant
export const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minimumOrderAmount, usageLimit, startDate, endDate, isActive, description } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        if (!discountValue || Number(discountValue) <= 0) {
            return res.status(400).json({ message: 'Discount value must be greater than 0' });
        }

        if (discountType === 'percentage' && Number(discountValue) > 100) {
            return res.status(400).json({ message: 'Percentage discount cannot exceed 100%' });
        }

        // Check for duplicate code within this merchant
        const existing = await Coupon.findOne({ merchant: req.merchant._id, code: code.trim().toUpperCase() });
        if (existing) {
            return res.status(400).json({ message: 'A coupon with this code already exists' });
        }

        const coupon = await Coupon.create({
            merchant: req.merchant._id,
            code: code.trim().toUpperCase(),
            discountType: discountType || 'percentage',
            discountValue: Number(discountValue),
            minimumOrderAmount: minimumOrderAmount ? Number(minimumOrderAmount) : 0,
            usageLimit: usageLimit ? Number(usageLimit) : null,
            startDate: startDate || new Date(),
            endDate: endDate || null,
            isActive: isActive !== undefined ? isActive : true,
            description: description || ''
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Merchant
export const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ _id: req.params.id, merchant: req.merchant._id });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const { code, discountType, discountValue, minimumOrderAmount, usageLimit, startDate, endDate, isActive, description } = req.body;

        // If code is changing, check for duplicates
        if (code && code.trim().toUpperCase() !== coupon.code) {
            const existing = await Coupon.findOne({
                merchant: req.merchant._id,
                code: code.trim().toUpperCase(),
                _id: { $ne: coupon._id }
            });
            if (existing) {
                return res.status(400).json({ message: 'A coupon with this code already exists' });
            }
        }

        if (discountType === 'percentage' && discountValue !== undefined && Number(discountValue) > 100) {
            return res.status(400).json({ message: 'Percentage discount cannot exceed 100%' });
        }

        coupon.code = code !== undefined ? code.trim().toUpperCase() : coupon.code;
        coupon.discountType = discountType !== undefined ? discountType : coupon.discountType;
        coupon.discountValue = discountValue !== undefined ? Number(discountValue) : coupon.discountValue;
        coupon.minimumOrderAmount = minimumOrderAmount !== undefined ? Number(minimumOrderAmount) : coupon.minimumOrderAmount;
        coupon.usageLimit = usageLimit !== undefined ? (usageLimit === '' || usageLimit === null ? null : Number(usageLimit)) : coupon.usageLimit;
        coupon.startDate = startDate !== undefined ? startDate : coupon.startDate;
        coupon.endDate = endDate !== undefined ? (endDate === '' || endDate === null ? null : endDate) : coupon.endDate;
        coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;
        coupon.description = description !== undefined ? description : coupon.description;

        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Merchant
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ _id: req.params.id, merchant: req.merchant._id });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        await Coupon.deleteOne({ _id: coupon._id });
        res.json({ message: 'Coupon removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle coupon active/inactive status
// @route   PATCH /api/coupons/:id/toggle
// @access  Private/Merchant
export const toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ _id: req.params.id, merchant: req.merchant._id });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        coupon.isActive = !coupon.isActive;
        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
