import express from 'express';
import { getProducts, createProduct, getProduct, updateProduct, deleteProduct, uploadProductImages, getProductCountInternal } from '../controllers/productController.js';
import { uploadProductImagesMiddleware } from '../../../shared/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', uploadProductImagesMiddleware, uploadProductImages);

// Internal routes (e.g. for store-service stats)
router.get('/internal/count', getProductCountInternal);

router.route('/')
    .get(getProducts)
    .post(createProduct);

router.route('/:id')
    .get(getProduct)
    .put(updateProduct)
    .delete(deleteProduct);

export default router;
