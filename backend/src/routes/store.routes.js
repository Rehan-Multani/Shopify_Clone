import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { resolveStore } from '../middleware/storeContext.js';
import { upload } from '../middleware/upload.js';
import {
  createStore, listMyStores, getStore, updateStore, uploadLogo, deleteStore,
} from '../controllers/store.controller.js';

const router = Router();
router.use(protect);

router.post('/', createStore);
router.get('/', listMyStores);
router.get('/:storeId', resolveStore, getStore);
router.patch('/:storeId', resolveStore, updateStore);
router.post('/:storeId/logo', resolveStore, upload.single('logo'), uploadLogo);
router.delete('/:storeId', resolveStore, deleteStore);

export default router;
