import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { items = [], ...rest } = req.body;
  if (!items.length) throw ApiError.badRequest('Order must contain at least one item');

  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds }, store: req.store._id });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const enrichedItems = items.map((item) => {
    const p = productMap.get(item.product);
    if (!p) throw ApiError.badRequest(`Product ${item.product} not found`);
    const price = item.price ?? p.price;
    const subtotal = price * item.quantity;
    return {
      product: p._id,
      variantId: item.variantId,
      title: p.title,
      sku: p.sku,
      image: p.images?.[0]?.url,
      quantity: item.quantity,
      price,
      subtotal,
    };
  });

  const subtotal = enrichedItems.reduce((sum, i) => sum + i.subtotal, 0);
  const discountTotal = rest.discountTotal || 0;
  const shippingTotal = rest.shippingTotal || 0;
  const taxTotal = rest.taxTotal || 0;
  const total = subtotal - discountTotal + shippingTotal + taxTotal;

  const order = await Order.create({
    ...rest,
    store: req.store._id,
    items: enrichedItems,
    subtotal,
    discountTotal,
    shippingTotal,
    taxTotal,
    total,
  });

  res.status(201).json(created(order, 'Order created'));
});

export const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = { store: req.store._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.fulfillmentStatus) filter.fulfillmentStatus = req.query.fulfillmentStatus;
  if (req.query.search) filter.orderNumber = { $regex: req.query.search, $options: 'i' };

  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('customer'),
    Order.countDocuments(filter),
  ]);
  res.json(ok(orders, 'Orders fetched', buildMeta({ page, limit, total })));
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, store: req.store._id }).populate('customer');
  if (!order) throw ApiError.notFound('Order not found');
  res.json(ok(order));
});

export const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, store: req.store._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!order) throw ApiError.notFound('Order not found');
  res.json(ok(order, 'Order updated'));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, store: req.store._id });
  if (!order) throw ApiError.notFound('Order not found');
  order.status = 'cancelled';
  order.fulfillmentStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason;
  await order.save();
  res.json(ok(order, 'Order cancelled'));
});
