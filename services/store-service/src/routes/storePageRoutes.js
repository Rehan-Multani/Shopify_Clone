import express from 'express';
import { 
    getPages, 
    getPageBySlug, 
    updatePage, 
    deletePage, 
    updatePageSections, 
    updateSectionSettings 
} from '../controllers/storePageController.js';

const router = express.Router();

router.route('/')
    .get(getPages);

router.route('/:slug')
    .get(getPageBySlug)
    .put(updatePage)
    .delete(deletePage);

router.route('/:slug/sections')
    .put(updatePageSections);

router.route('/:slug/sections/:sectionId')
    .put(updateSectionSettings);

export default router;
