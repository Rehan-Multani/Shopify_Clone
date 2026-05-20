import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import Store from '../models/Store.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ isActive: true }).sort('sortOrder monthlyPrice');
  res.json(ok(plans));
});

export const getPlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findOne({ slug: req.params.slug, isActive: true });
  if (!plan) throw ApiError.notFound('Plan not found');
  res.json(ok(plan));
});

export const createPlan = asyncHandler(async (req, res) => {
  const plan = await Plan.create(req.body);
  res.status(201).json(created(plan, 'Plan created'));
});

export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!plan) throw ApiError.notFound('Plan not found');
  res.json(ok(plan, 'Plan updated'));
});

export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!plan) throw ApiError.notFound('Plan not found');
  res.json(ok(null, 'Plan archived'));
});

export const subscribe = asyncHandler(async (req, res) => {
  const { storeId, planId, billingCycle = 'monthly' } = req.body;
  const store = await Store.findOne({ _id: storeId, owner: req.user._id });
  if (!store) throw ApiError.notFound('Store not found');
  const plan = await Plan.findById(planId);
  if (!plan) throw ApiError.notFound('Plan not found');

  const now = new Date();
  const periodMs = billingCycle === 'yearly' ? 365 * 86400000 : 30 * 86400000;
  const subscription = await Subscription.create({
    store: store._id,
    plan: plan._id,
    billingCycle,
    status: plan.trialDays ? 'trialing' : 'active',
    startedAt: now,
    trialEndsAt: plan.trialDays ? new Date(now.getTime() + plan.trialDays * 86400000) : null,
    currentPeriodStart: now,
    currentPeriodEnd: new Date(now.getTime() + periodMs),
  });

  store.plan = plan._id;
  store.status = subscription.status === 'trialing' ? 'trial' : 'active';
  await store.save();

  res.status(201).json(created(subscription, 'Subscribed'));
});
