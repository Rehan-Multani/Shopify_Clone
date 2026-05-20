import mongoose from 'mongoose';
import slugify from 'slugify';

const storeSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, unique: true, index: true },
    domain: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    description: { type: String, maxlength: 1000 },
    logo: { url: String, publicId: String },
    banner: { url: String, publicId: String },
    industry: { type: String, trim: true },
    currency: { type: String, default: 'USD', uppercase: true, maxlength: 3 },
    country: { type: String, trim: true },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    socials: {
      instagram: String,
      facebook: String,
      twitter: String,
      tiktok: String,
    },
    onboarding: {
      sellingChannels: [String],
      businessType: { type: String, enum: ['new', 'existing_business'] },
      currentPlatforms: [String],
      productTypes: [String],
      completed: { type: Boolean, default: false },
    },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    status: {
      type: String,
      enum: ['active', 'trial', 'suspended', 'closed'],
      default: 'trial',
      index: true,
    },
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

storeSchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(`${this.name}-${this._id.toString().slice(-6)}`, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Store', storeSchema);
