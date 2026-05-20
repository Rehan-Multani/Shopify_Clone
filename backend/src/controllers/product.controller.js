import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import cloudinary from '../config/cloudinary.js';

export const createProduct = asyncHandler(async (req, res) => {
  const images = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));
  const product = await Product.create({
    ...req.body,
    store: req.store._id,
    images: req.body.images?.length ? req.body.images : images,
  });
  res.status(201).json(created(product, 'Product created'));
});

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = { store: req.store._id };

  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const sort = req.query.sort || '-createdAt';

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  res.json(ok(products, 'Products fetched', buildMeta({ page, limit, total })));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, store: req.store._id }).populate('category');
  if (!product) throw ApiError.notFound('Product not found');
  res.json(ok(product));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, store: req.store._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) throw ApiError.notFound('Product not found');
  res.json(ok(product, 'Product updated'));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, store: req.store._id });
  if (!product) throw ApiError.notFound('Product not found');

  const publicIds = (product.images || []).map((i) => i.publicId).filter(Boolean);
  await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id).catch(() => {})));
  res.json(ok(null, 'Product deleted'));
});

export const addProductImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw ApiError.badRequest('No images uploaded');
  const product = await Product.findOne({ _id: req.params.id, store: req.store._id });
  if (!product) throw ApiError.notFound('Product not found');

  const images = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
  product.images.push(...images);
  await product.save();
  res.json(ok(product, 'Images added'));
});

export const removeProductImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;
  const product = await Product.findOne({ _id: id, store: req.store._id });
  if (!product) throw ApiError.notFound('Product not found');

  const img = product.images.id(imageId);
  if (!img) throw ApiError.notFound('Image not found');

  if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(() => {});
  img.deleteOne();
  await product.save();
  res.json(ok(product, 'Image removed'));
});
