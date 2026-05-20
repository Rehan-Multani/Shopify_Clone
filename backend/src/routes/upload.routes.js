import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  uploadSingle, uploadMany, deleteAsset, listAssets,
} from '../controllers/upload.controller.js';

const router = Router();
router.use(protect);

router.get('/', listAssets);
router.post('/single', upload.single('file'), uploadSingle);
router.post('/multiple', upload.array('files', 10), uploadMany);
router.delete('/:id', deleteAsset);

export default router;
