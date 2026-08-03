import mongoose from 'mongoose';

// Lightweight Vendor projection for billing-service (same `vendors` collection)
const vendorSchema = new mongoose.Schema({
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    name: String,
    businessName: String,
    email: String,
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    collection: 'vendors'
});

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
export default Vendor;
