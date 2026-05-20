import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    status: {
      type: String,
      enum: ['trialing', 'active', 'past_due', 'cancelled', 'expired'],
      default: 'trialing',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    trialEndsAt: Date,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelledAt: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    paymentProvider: String,
    providerSubscriptionId: String,
  },
  { timestamps: true }
);

export default mongoose.model('Subscription', subscriptionSchema);
