import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { resolveStore } from '../middleware/storeContext.js';
import { upload } from '../middleware/upload.js';
import {
  createProduct, listProducts, getProduct, updateProduct, deleteProduct,
  addProductImages, removeProductImage,
} from '../controllers/product.controller.js';

const router = Router({ mergeParams: true });
router.use(protect, resolveStore);

router.route('/')
  .get(listProducts)
  .post(upload.array('images', 8), createProduct);

router.route('/:id')
  .get(getProduct)
  .patch(updateProduct)
  .delete(deleteProduct);

router.post('/:id/images', upload.array('images', 8), addProductImages);
router.delete('/:id/images/:imageId', removeProductImage);

export default router;
