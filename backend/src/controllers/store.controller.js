import Store from '../models/Store.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import cloudinary from '../config/cloudinary.js';

export const createStore = asyncHandler(async (req, res) => {
  const payload = { ...req.body, owner: req.user._id };
  const store = await Store.create(payload);
  res.status(201).json(created(store, 'Store created'));
});

export const listMyStores = asyncHandler(async (req, res) => {
  const stores = await Store.find({
    $or: [{ owner: req.user._id }, { staff: req.user._id }],
  }).populate('plan');
  res.json(ok(stores));
});

export const getStore = asyncHandler(async (req, res) => {
  res.json(ok(req.store));
});

export const updateStore = asyncHandler(async (req, res) => {
  const allowed = [
    'name', 'description', 'industry', 'currency', 'country',
    'address', 'contactEmail', 'contactPhone', 'socials', 'onboarding', 'domain',
  ];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  const store = await Store.findByIdAndUpdate(req.store._id, update, { new: true, runValidators: true });
  res.json(ok(store, 'Store updated'));
});

export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Logo file is required');
  if (req.store.logo?.publicId) {
    await cloudinary.uploader.destroy(req.store.logo.publicId).catch(() => {});
  }
  req.store.logo = { url: req.file.path, publicId: req.file.filename };
  await req.store.save();
  res.json(ok(req.store, 'Logo updated'));
});

export const deleteStore = asyncHandler(async (req, res) => {
  if (req.store.owner.toString() !== req.user._id.toString() && req.user.role !== 'master_admin') {
    throw ApiError.forbidden('Only owner can delete the store');
  }
  await Store.findByIdAndDelete(req.store._id);
  res.json(ok(null, 'Store deleted'));
});
