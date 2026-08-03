import mongoose from 'mongoose';

// Same `products` collection as catalog-service (shared MongoDB)
const productSchema = new mongoose.Schema({
    merchant: mongoose.Schema.Types.ObjectId,
    store: mongoose.Schema.Types.ObjectId,
    name: String,
    sellingPrice: Number,
    isActive: Boolean,
    vendor: mongoose.Schema.Types.ObjectId
}, {
    strict: false,
    collection: 'products'
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
