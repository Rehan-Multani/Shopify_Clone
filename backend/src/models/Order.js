import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    title: String,
    sku: String,
    image: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    contactEmail: String,
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    discountTotal: { type: Number, default: 0, min: 0 },
    shippingTotal: { type: Number, default: 0, min: 0 },
    taxTotal: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true },
    shippingAddress: {
      firstName: String,
      lastName: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String,
    },
    billingAddress: {
      firstName: String,
      lastName: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'refunded', 'partially_refunded', 'failed'],
      default: 'pending',
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ['unfulfilled', 'partial', 'fulfilled', 'cancelled', 'returned'],
      default: 'unfulfilled',
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'archived', 'cancelled'],
      default: 'open',
      index: true,
    },
    paymentMethod: String,
    transactionId: String,
    discountCode: String,
    notes: String,
    tags: [String],
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);

orderSchema.index({ store: 1, orderNumber: 1 }, { unique: true });

orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `#${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
