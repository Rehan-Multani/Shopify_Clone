import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    title: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'free_shipping', 'bxgy'],
      default: 'percentage',
    },
    value: { type: Number, required: true, min: 0 },
    appliesTo: {
      type: String,
      enum: ['all', 'specific_products', 'specific_collections'],
      default: 'all',
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    minPurchaseAmount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: -1 },
    usageCount: { type: Number, default: 0 },
    onePerCustomer: { type: Boolean, default: false },
    startsAt: { type: Date, default: Date.now },
    endsAt: Date,
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

discountSchema.index({ store: 1, code: 1 }, { unique: true });

export default mongoose.model('Discount', discountSchema);
