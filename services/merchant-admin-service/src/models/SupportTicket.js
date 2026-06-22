import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: false
    },
    title: {
        type: String,
        required: [true, 'Please enter a ticket title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please enter a ticket description'],
        trim: true
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    createdBy: {
        type: String,
        enum: ['merchant', 'admin'],
        default: 'merchant'
    },
    messages: [{
        sender: {
            type: String,
            enum: ['merchant', 'admin'],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
