import User from '../models/User.js';
import Store from '../models/Store.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Subscription from '../models/Subscription.js';
import Announcement from '../models/Announcement.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

export const overview = asyncHandler(async (req, res) => {
  const [merchants, stores, activeStores, totalProducts, totalOrders, revenueAgg] = await Promise.all([
    User.countDocuments({ role: 'merchant' }),
    Store.countDocuments(),
    Store.countDocuments({ status: 'active' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, gmv: { $sum: '$total' } } },
    ]),
  ]);
  res.json(ok({
    merchants,
    stores,
    activeStores,
    totalProducts,
    totalOrders,
    gmv: revenueAgg[0]?.gmv || 0,
  }));
});

export const listMerchants = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = { role: 'merchant' };
  if (req.query.search) {
    const s = req.query.search;
    filter.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
    ];
  }
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'suspended') filter.isActive = false;

  const [merchants, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json(ok(merchants, 'Merchants fetched', buildMeta({ page, limit, total })));
});

export const toggleMerchantStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'merchant') throw ApiError.notFound('Merchant not found');
  user.isActive = !user.isActive;
  await user.save();
  res.json(ok(user, `Merchant ${user.isActive ? 'activated' : 'suspended'}`));
});

export const listStores = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [stores, total] = await Promise.all([
    Store.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('owner', 'name email').populate('plan'),
    Store.countDocuments(filter),
  ]);
  res.json(ok(stores, 'Stores fetched', buildMeta({ page, limit, total })));
});

export const updateStoreStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const store = await Store.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!store) throw ApiError.notFound('Store not found');
  res.json(ok(store, 'Store status updated'));
});

export const listSubscriptions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const [subs, total] = await Promise.all([
    Subscription.find().sort('-createdAt').skip(skip).limit(limit).populate('store').populate('plan'),
    Subscription.countDocuments(),
  ]);
  res.json(ok(subs, 'Subscriptions fetched', buildMeta({ page, limit, total })));
});

export const listAnnouncements = asyncHandler(async (req, res) => {
  const items = await Announcement.find().sort('-createdAt');
  res.json(ok(items));
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const a = await Announcement.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(created(a, 'Announcement created'));
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const a = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!a) throw ApiError.notFound('Announcement not found');
  res.json(ok(a, 'Announcement updated'));
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const a = await Announcement.findByIdAndDelete(req.params.id);
  if (!a) throw ApiError.notFound('Announcement not found');
  res.json(ok(null, 'Announcement deleted'));
});
