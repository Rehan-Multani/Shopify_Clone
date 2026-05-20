import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true },
    sessionId: { type: String, index: true },
    items: { type: [cartItemSchema], default: [] },
    discountCode: String,
    currency: { type: String, default: 'USD', uppercase: true },
    abandonedAt: Date,
    convertedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

export default mongoose.model('Cart', cartSchema);
