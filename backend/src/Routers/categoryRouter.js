import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage } from '../Controllers/categoryController.js';
import { protectMerchant } from '../Helpers/merchantAuthMiddleware.js';
import { uploadCategoryImageMiddleware } from '../Helpers/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protectMerchant, uploadCategoryImageMiddleware, uploadCategoryImage);

router.route('/')
    .get(protectMerchant, getCategories)
    .post(protectMerchant, createCategory);

router.route('/:id')
    .put(protectMerchant, updateCategory)
    .delete(protectMerchant, deleteCategory);

export default router;
