import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Subscriber must belong to a store']
    },
    email: {
        type: String,
        required: [true, 'Please add an email address'],
        trim: true,
        lowercase: true
    }
}, {
    timestamps: true
});

// Ensure a user can subscribe only once per store
subscriberSchema.index({ store: 1, email: 1 }, { unique: true });

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
