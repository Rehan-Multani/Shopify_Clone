import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: [true, 'Category must belong to a merchant']
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Category must belong to a store']
    },
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true,
        maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    image: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: '',
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    slug: {
        type: String,
        unique: false
    }
}, {
    timestamps: true
});

// Generate slug from name before saving
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Compound index: slug unique per store
categorySchema.index({ store: 1, slug: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
