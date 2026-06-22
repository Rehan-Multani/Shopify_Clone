import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
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
    }
}, {
    timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
