import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import Store from '../models/Store.js';

export const resolveStore = asyncHandler(async (req, res, next) => {
  const storeId = req.params.storeId || req.headers['x-store-id'] || req.query.storeId;
  if (!storeId) throw ApiError.badRequest('Store id is required');

  const store = await Store.findById(storeId);
  if (!store) throw ApiError.notFound('Store not found');

  if (req.user?.role !== 'master_admin') {
    const isOwner = store.owner.toString() === req.user._id.toString();
    const isStaff = store.staff.some((s) => s.toString() === req.user._id.toString());
    if (!isOwner && !isStaff) throw ApiError.forbidden('You do not have access to this store');
  }

  req.store = store;
  next();
});
