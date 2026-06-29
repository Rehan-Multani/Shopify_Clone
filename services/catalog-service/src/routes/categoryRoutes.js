import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage, approveCategory } from '../controllers/categoryController.js';
import { uploadCategoryImageMiddleware } from '../../../shared/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', uploadCategoryImageMiddleware, uploadCategoryImage);

router.put('/:id/approve', approveCategory);

router.route('/')
    .get(getCategories)
    .post(createCategory);

router.route('/:id')
    .put(updateCategory)
    .delete(deleteCategory);

export default router;
