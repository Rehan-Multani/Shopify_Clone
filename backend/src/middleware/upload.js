import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const allowedMime = /^image\/(jpe?g|png|webp|gif|svg\+xml)$|^video\/(mp4|webm|quicktime)$|^application\/(pdf)$/;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: `${env.cloudinary.folder}/${req.user?._id || 'public'}`,
      resource_type: isVideo ? 'video' : isImage ? 'image' : 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp4', 'webm', 'mov', 'pdf'],
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedMime.test(file.mimetype)) {
    return cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxFileSizeMb * 1024 * 1024 },
});

export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: env.upload.maxFileSizeMb * 1024 * 1024 },
});
