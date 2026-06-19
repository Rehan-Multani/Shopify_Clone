import express from 'express';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } from '../Controllers/couponController.js';
import { protectMerchant } from '../Helpers/merchantAuthMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protectMerchant, getCoupons)
    .post(protectMerchant, createCoupon);

router.patch('/:id/toggle', protectMerchant, toggleCouponStatus);

router.route('/:id')
    .put(protectMerchant, updateCoupon)
    .delete(protectMerchant, deleteCoupon);

export default router;
