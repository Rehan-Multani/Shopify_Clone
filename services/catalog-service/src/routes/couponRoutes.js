import express from 'express';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus, validateCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.get('/validate', validateCoupon);

router.route('/')
    .get(getCoupons)
    .post(createCoupon);

router.patch('/:id/toggle', toggleCouponStatus);

router.route('/:id')
    .put(updateCoupon)
    .delete(deleteCoupon);

export default router;
