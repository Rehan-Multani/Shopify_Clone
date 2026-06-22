import express from 'express';
import { getPages, getPageBySlug, updatePage, deletePage } from '../controllers/storePageController.js';

const router = express.Router();

router.route('/')
    .get(getPages);

router.route('/:slug')
    .get(getPageBySlug)
    .put(updatePage)
    .delete(deletePage);

export default router;
