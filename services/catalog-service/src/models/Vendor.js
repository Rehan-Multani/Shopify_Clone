import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vendorSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: [true, 'Vendor must belong to a merchant']
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Vendor must belong to a store']
    },
    name: {
        type: String,
        required: [true, 'Please add a vendor name'],
        trim: true
    },
    businessName: {
        type: String,
        required: [true, 'Please add a business name'],
        trim: true
    },
    businessProfile: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    profileImage: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: [true, 'Please add a vendor email'],
        trim: true,
        lowercase: true
    },
    mobile: {
        type: String,
        required: [true, 'Please add a phone number'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    commission: {
        type: Number,
        default: 10
    },
    gstNumber: {
        type: String,
        default: ''
    },
    panNumber: {
        type: String,
        default: ''
    },
    bankDetails: {
        accountNumber: { type: String, default: '' },
        bankName: { type: String, default: '' },
        accountHolderName: { type: String, default: '' },
        ifscCode: { type: String, default: '' }
    },
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    pincode: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    paymentSettings: {
        razorpay: {
            enabled: { type: Boolean, default: false },
            keyId: { type: String, default: '' },
            keySecret: { type: String, default: '' }
        },
        cashfree: {
            enabled: { type: Boolean, default: false },
            appId: { type: String, default: '' },
            secretKey: { type: String, default: '' }
        },
        phonepe: {
            enabled: { type: Boolean, default: false },
            merchantId: { type: String, default: '' },
            saltKey: { type: String, default: '' },
            saltIndex: { type: String, default: '1' }
        },
        payu: {
            enabled: { type: Boolean, default: false },
            merchantKey: { type: String, default: '' },
            merchantSalt: { type: String, default: '' }
        },
        stripe: {
            enabled: { type: Boolean, default: false },
            publishableKey: { type: String, default: '' },
            secretKey: { type: String, default: '' }
        },
        cod: {
            enabled: { type: Boolean, default: false }
        }
    },
    gstPercentage: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness of email per store
vendorSchema.index({ store: 1, email: 1 }, { unique: true });

// Pre-save hook to hash the password
vendorSchema.pre('save', async function() {
    if (!this.password || !this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
vendorSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
