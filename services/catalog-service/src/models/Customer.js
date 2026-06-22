import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: [true, 'Customer must belong to a merchant']
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Customer must belong to a store']
    },
    name: {
        type: String,
        required: [true, 'Please add a customer name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email address'],
        trim: true,
        lowercase: true
    },
    number: {
        type: String,
        required: [true, 'Please add a phone number'],
        trim: true
    },
    image: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness per store
customerSchema.index({ store: 1, email: 1 }, { unique: true });
customerSchema.index({ store: 1, number: 1 }, { unique: true });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
