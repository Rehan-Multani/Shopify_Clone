import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    password: {
        type: String,
        minlength: 6,
        select: false
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

// Pre-save hook to hash the password
customerSchema.pre('save', async function() {
    if (!this.password || !this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
customerSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
