import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: [true, 'Product must belong to a merchant']
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Product must belong to a store']
    },
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    images: {
        type: [String],
        validate: {
            validator: function (v) {
                return v.length <= 5;
            },
            message: 'A product can have a maximum of 5 images'
        },
        default: []
    },
    description: {
        type: String,
        default: '',
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    brandName: {
        type: String,
        default: '',
        trim: true
    },
    sku: {
        type: String,
        default: '',
        trim: true,
        uppercase: true
    },
    actualPrice: {
        type: Number,
        required: [true, 'Please add the actual price'],
        min: [0, 'Price cannot be negative']
    },
    sellingPrice: {
        type: Number,
        required: [true, 'Please add the selling price'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: {
        type: [String],
        default: []
    },
    weight: {
        type: String,
        default: ''
    },
    slug: {
        type: String
    }
}, {
    timestamps: true
});

productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

productSchema.index(
    { store: 1, sku: 1 },
    { unique: true, partialFilterExpression: { sku: { $ne: '' } } }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
