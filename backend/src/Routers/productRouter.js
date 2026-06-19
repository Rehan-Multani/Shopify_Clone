import express from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, uploadProductImages } from '../Controllers/productController.js';
import { protectMerchant } from '../Helpers/merchantAuthMiddleware.js';
import { uploadProductImagesMiddleware } from '../Helpers/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protectMerchant, uploadProductImagesMiddleware, uploadProductImages);

router.route('/')
    .get(protectMerchant, getProducts)
    .post(protectMerchant, createProduct);

router.route('/:id')
    .get(protectMerchant, getProduct)
    .put(protectMerchant, updateProduct)
    .delete(protectMerchant, deleteProduct);

export default router;
