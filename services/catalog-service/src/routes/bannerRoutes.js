import express from 'express';
import { getBanners, createBanner, getBanner, updateBanner, deleteBanner, uploadBannerImage } from '../controllers/bannerController.js';
import { uploadProductImagesMiddleware } from '../../../shared/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', uploadProductImagesMiddleware, uploadBannerImage);

router.route('/')
    .get(getBanners)
    .post(createBanner);

router.route('/:id')
    .get(getBanner)
    .put(updateBanner)
    .delete(deleteBanner);

export default router;
