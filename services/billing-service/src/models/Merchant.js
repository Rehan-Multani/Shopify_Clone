import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    planType: {
        type: String,
        default: 'Single Vendor'
    },
    status: {
        type: String,
        default: 'active'
    }
}, {
    timestamps: true
});

const Merchant = mongoose.model('Merchant', merchantSchema);
export default Merchant;
