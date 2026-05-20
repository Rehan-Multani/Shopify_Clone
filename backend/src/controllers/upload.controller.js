import cloudinary from '../config/cloudinary.js';
import FileAsset from '../models/FileAsset.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('File is required');

  const asset = await FileAsset.create({
    store: req.body.storeId,
    uploadedBy: req.user._id,
    url: req.file.path,
    publicId: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    bytes: req.file.size,
    width: req.file.width,
    height: req.file.height,
    format: req.file.format,
    resourceType: req.file.resource_type || 'image',
    folder: req.file.folder,
  });
  res.status(201).json(created(asset, 'Uploaded'));
});

export const uploadMany = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw ApiError.badRequest('Files are required');
  const assets = await FileAsset.insertMany(
    req.files.map((f) => ({
      store: req.body.storeId,
      uploadedBy: req.user._id,
      url: f.path,
      publicId: f.filename,
      originalName: f.originalname,
      mimeType: f.mimetype,
      bytes: f.size,
      resourceType: f.resource_type || 'image',
    }))
  );
  res.status(201).json(created(assets, 'Uploaded'));
});

export const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await FileAsset.findById(req.params.id);
  if (!asset) throw ApiError.notFound('File not found');
  await cloudinary.uploader.destroy(asset.publicId, {
    resource_type: asset.resourceType,
  }).catch(() => {});
  await asset.deleteOne();
  res.json(ok(null, 'File deleted'));
});

export const listAssets = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.storeId) filter.store = req.query.storeId;
  const items = await FileAsset.find(filter).sort('-createdAt').limit(200);
  res.json(ok(items));
});
