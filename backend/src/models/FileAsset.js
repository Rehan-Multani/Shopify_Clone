import mongoose from 'mongoose';

const fileAssetSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    url: { type: String, required: true },
    publicId: { type: String, required: true, index: true },
    originalName: String,
    mimeType: String,
    bytes: Number,
    width: Number,
    height: Number,
    format: String,
    resourceType: { type: String, default: 'image' },
    folder: String,
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model('FileAsset', fileAssetSchema);
