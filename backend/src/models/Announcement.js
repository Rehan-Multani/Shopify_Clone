import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true },
    audience: {
      type: String,
      enum: ['all', 'merchants', 'customers', 'staff'],
      default: 'all',
    },
    severity: {
      type: String,
      enum: ['info', 'success', 'warning', 'critical'],
      default: 'info',
    },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
