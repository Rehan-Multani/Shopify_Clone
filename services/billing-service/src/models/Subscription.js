import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: [true, 'Subscription must belong to a merchant']
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Subscription must belong to a store']
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: [true, 'Subscription must have a plan']
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
    },
    paymentId: {
        type: String,
        default: ''
    },
    orderId: {
        type: String,
        default: ''
    },
    amount: {
        type: Number,
        default: 0
    },
    autoRenew: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
