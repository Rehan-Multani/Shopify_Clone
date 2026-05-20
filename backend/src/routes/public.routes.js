import { Router } from 'express';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import Announcement from '../models/Announcement.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

const router = Router();

router.get('/stores/:slug', asyncHandler(async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug, status: 'active' });
  if (!store) throw ApiError.notFound('Store not found');
  res.json(ok(store));
}));

router.get('/stores/:slug/products', asyncHandler(async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug, status: 'active' });
  if (!store) throw ApiError.notFound('Store not found');

  const { page, limit, skip } = getPagination(req);
  const filter = { store: store._id, status: 'active' };
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [products, total] = await Promise.all([
    Product.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json(ok(products, 'Products fetched', buildMeta({ page, limit, total })));
}));

router.get('/announcements', asyncHandler(async (req, res) => {
  const items = await Announcement.find({
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  }).sort('-publishedAt').limit(10);
  res.json(ok(items));
}));

export default router;
