import Customer from '../models/Customer.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

export const createCustomer = asyncHandler(async (req, res) => {
  const c = await Customer.create({ ...req.body, store: req.store._id });
  res.status(201).json(created(c, 'Customer created'));
});

export const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = { store: req.store._id };
  if (req.query.search) {
    const s = req.query.search;
    filter.$or = [
      { firstName: { $regex: s, $options: 'i' } },
      { lastName: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
    ];
  }
  const [customers, total] = await Promise.all([
    Customer.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);
  res.json(ok(customers, 'Customers fetched', buildMeta({ page, limit, total })));
});

export const getCustomer = asyncHandler(async (req, res) => {
  const c = await Customer.findOne({ _id: req.params.id, store: req.store._id });
  if (!c) throw ApiError.notFound('Customer not found');
  res.json(ok(c));
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const c = await Customer.findOneAndUpdate(
    { _id: req.params.id, store: req.store._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!c) throw ApiError.notFound('Customer not found');
  res.json(ok(c, 'Customer updated'));
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const c = await Customer.findOneAndDelete({ _id: req.params.id, store: req.store._id });
  if (!c) throw ApiError.notFound('Customer not found');
  res.json(ok(null, 'Customer deleted'));
});
