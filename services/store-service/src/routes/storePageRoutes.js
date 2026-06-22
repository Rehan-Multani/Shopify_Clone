import express from 'express';
import { getPages, getPageBySlug, updatePage } from '../controllers/storePageController.js';

const router = express.Router();

router.route('/')
    .get(getPages);

router.route('/:slug')
    .get(getPageBySlug)
    .put(updatePage);

export default router;
