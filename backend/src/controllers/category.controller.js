import Category from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createCategory = asyncHandler(async (req, res) => {
  const cat = await Category.create({ ...req.body, store: req.store._id });
  res.status(201).json(created(cat, 'Category created'));
});

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ store: req.store._id }).sort('name');
  res.json(ok(categories));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findOneAndUpdate(
    { _id: req.params.id, store: req.store._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!cat) throw ApiError.notFound('Category not found');
  res.json(ok(cat, 'Category updated'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findOneAndDelete({ _id: req.params.id, store: req.store._id });
  if (!cat) throw ApiError.notFound('Category not found');
  res.json(ok(null, 'Category deleted'));
});
