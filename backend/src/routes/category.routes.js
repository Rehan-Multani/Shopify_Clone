import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { resolveStore } from '../middleware/storeContext.js';
import {
  createCategory, listCategories, updateCategory, deleteCategory,
} from '../controllers/category.controller.js';

const router = Router({ mergeParams: true });
router.use(protect, resolveStore);

router.route('/').get(listCategories).post(createCategory);
router.route('/:id').patch(updateCategory).delete(deleteCategory);

export default router;
