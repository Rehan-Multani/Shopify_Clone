import mongoose from 'mongoose';
import validator from 'validator';

const addressSchema = new mongoose.Schema(
  {
    label: String,
    firstName: String,
    lastName: String,
    company: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const customerSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Invalid email'],
    },
    phone: String,
    notes: String,
    tags: { type: [String], default: [] },
    addresses: [addressSchema],
    acceptsMarketing: { type: Boolean, default: false },
    totalSpent: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

customerSchema.index({ store: 1, email: 1 }, { unique: true, sparse: true });

export default mongoose.model('Customer', customerSchema);
