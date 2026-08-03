import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    merchant: mongoose.Schema.Types.ObjectId,
    store: mongoose.Schema.Types.ObjectId,
    code: String,
    discountType: String,
    discountValue: Number,
    minimumOrderAmount: Number,
    usageLimit: Number,
    usedCount: Number,
    startDate: Date,
    endDate: Date,
    isActive: Boolean,
    isApproved: Boolean
}, {
    strict: false,
    collection: 'coupons'
});

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export default Coupon;
