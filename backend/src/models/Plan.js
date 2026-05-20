import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    monthlyPrice: { type: Number, required: true, min: 0 },
    yearlyPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true },
    trialDays: { type: Number, default: 0, min: 0 },
    features: { type: [String], default: [] },
    limits: {
      products: { type: Number, default: -1 },
      staffAccounts: { type: Number, default: -1 },
      storage: { type: Number, default: -1 },
    },
    transactionFeePercent: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
