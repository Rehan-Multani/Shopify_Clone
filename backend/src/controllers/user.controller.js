import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import cloudinary from '../config/cloudinary.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone'];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
  res.json(ok(user, 'Profile updated'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw ApiError.badRequest('Both passwords are required');

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  res.json(ok(null, 'Password updated'));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Avatar file is required');

  const user = await User.findById(req.user._id);
  if (user.avatar?.publicId) {
    await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});
  }
  user.avatar = { url: req.file.path, publicId: req.file.filename };
  await user.save();
  res.json(ok(user, 'Avatar updated'));
});
