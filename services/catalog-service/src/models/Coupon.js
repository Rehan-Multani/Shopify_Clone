import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: [true, 'Coupon must belong to a merchant']
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Coupon must belong to a store']
    },
    code: {
        type: String,
        required: [true, 'Please add a coupon code'],
        trim: true,
        uppercase: true,
        maxlength: [30, 'Coupon code cannot exceed 30 characters']
    },
    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        required: [true, 'Please select a discount type'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: [true, 'Please add the discount value'],
        min: [0, 'Discount value cannot be negative']
    },
    minimumOrderAmount: {
        type: Number,
        default: 0,
        min: [0, 'Minimum order amount cannot be negative']
    },
    usageLimit: {
        type: Number,
        default: null // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        default: '',
        maxlength: [500, 'Description cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

couponSchema.index({ store: 1, code: 1 }, { unique: true });

couponSchema.virtual('isValid').get(function () {
    const now = new Date();
    const notExpired = !this.endDate || this.endDate > now;
    const started = !this.startDate || this.startDate <= now;
    const withinLimit = this.usageLimit === null || this.usedCount < this.usageLimit;
    return this.isActive && notExpired && started && withinLimit;
});

couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
