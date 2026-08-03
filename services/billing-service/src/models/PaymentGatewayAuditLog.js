import mongoose from 'mongoose';

const paymentGatewayAuditLogSchema = new mongoose.Schema({
    actorType: {
        type: String,
        enum: ['merchant', 'vendor', 'system'],
        required: true
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    ownerType: {
        type: String,
        enum: ['merchant', 'vendor'],
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    gateway: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: ['create', 'update', 'delete', 'enable', 'disable', 'test', 'set_default'],
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

paymentGatewayAuditLogSchema.index({ ownerType: 1, ownerId: 1, createdAt: -1 });

const PaymentGatewayAuditLog = mongoose.model('PaymentGatewayAuditLog', paymentGatewayAuditLogSchema);
export default PaymentGatewayAuditLog;
