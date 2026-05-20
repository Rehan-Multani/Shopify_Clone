import mongoose from 'mongoose';
import slugify from 'slugify';

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, trim: true },
    title: { type: String, trim: true },
    option1: String,
    option2: String,
    option3: String,
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPerItem: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    weight: { type: Number, min: 0 },
    image: { url: String, publicId: String },
  },
  { _id: true, timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, index: true },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: { type: [String], default: [] },
    vendor: String,
    productType: String,
    images: [{ url: String, publicId: String, alt: String }],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    sku: { type: String, trim: true },
    barcode: String,
    stock: { type: Number, default: 0, min: 0 },
    trackInventory: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false },
    weight: { type: Number, min: 0 },
    options: [{ name: String, values: [String] }],
    variants: [variantSchema],
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
      index: true,
    },
    seo: {
      title: String,
      description: String,
    },
    ratingsAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ store: 1, slug: 1 }, { unique: true });
productSchema.index({ store: 1, title: 'text', description: 'text', tags: 'text' });

productSchema.pre('validate', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Product', productSchema);
