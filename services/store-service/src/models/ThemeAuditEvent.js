/**
 * Theme / experiment lifecycle audit (lightweight, no PII).
 */
import mongoose from 'mongoose';
import { AUDIT_ACTIONS } from '../utils/themeAuditActions.js';

const themeAuditSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true,
    },
    actorId: { type: String, default: '', maxlength: 64 },
    action: {
        type: String,
        required: true,
        enum: AUDIT_ACTIONS,
        index: true,
    },
    themeId: { type: String, default: '', maxlength: 120 },
    themeVersion: { type: String, default: '', maxlength: 40 },
    previousVersion: { type: String, default: '', maxlength: 40 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false } });

themeAuditSchema.index({ storeId: 1, createdAt: -1 });
themeAuditSchema.index({ storeId: 1, action: 1, createdAt: -1 });

const ThemeAuditEvent = mongoose.model('ThemeAuditEvent', themeAuditSchema);
export default ThemeAuditEvent;
