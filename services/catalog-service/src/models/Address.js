import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true
    },
    fullName: {
        type: String,
        required: [true, 'Please add a full name']
    },
    addressLine1: {
        type: String,
        required: [true, 'Please add address line 1']
    },
    addressLine2: {
        type: String
    },
    city: {
        type: String,
        required: [true, 'Please add a city']
    },
    state: {
        type: String,
        required: [true, 'Please add a state']
    },
    postalCode: {
        type: String,
        required: [true, 'Please add a postal code']
    },
    country: {
        type: String,
        required: true,
        default: 'India'
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Address = mongoose.model('Address', addressSchema);
export default Address;
