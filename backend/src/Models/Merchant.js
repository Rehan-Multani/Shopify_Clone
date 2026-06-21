import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const merchantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    mobile: {
        type: String,
        required: [true, 'Please add a mobile number'],
        unique: true,
        match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits']
    },
    profile: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'trial', 'suspended'],
        default: 'active'
    },
    revenue: {
        type: Number,
        default: 0
    },
    gstNumber: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        default: 'password123'
    },
    resetPasswordOTP: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
merchantSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
merchantSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Merchant = mongoose.model('Merchant', merchantSchema);

export default Merchant;
