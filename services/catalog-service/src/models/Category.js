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
    isApproved: {
        type: Boolean,
        default: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        default: null
    },
    slug: {
        type: String,
        unique: false
    }
}, {
    timestamps: true
});

categorySchema.pre('save', function () {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

categorySchema.index({ store: 1, slug: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
