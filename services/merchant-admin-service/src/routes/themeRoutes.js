import express from 'express';
import { 
    getThemes, 
    getThemeById, 
    getThemeFolders, 
    getFolderManifest, 
    registerTheme, 
    updateTheme, 
    deleteTheme,
    uploadThemeThumbnail
} from '../controllers/themeController.js';
import { uploadCategoryImageMiddleware } from '../../../shared/uploadMiddleware.js';

const router = express.Router();

// Folder helper endpoints
router.get('/folders', getThemeFolders);
router.get('/folders/:folder/manifest', getFolderManifest);

// Upload endpoint
router.post('/upload', uploadCategoryImageMiddleware, uploadThemeThumbnail);

// CRUD endpoints
router.route('/')
    .get(getThemes)
    .post(registerTheme);

router.route('/:id')
    .get(getThemeById)
    .put(updateTheme)
    .delete(deleteTheme);

export default router;
