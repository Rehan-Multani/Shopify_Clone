import express from 'express';
import { 
    getThemes, 
    getThemeById, 
    getThemeFolders, 
    getFolderManifest, 
    registerTheme, 
    updateTheme, 
    deleteTheme 
} from '../controllers/themeController.js';

const router = express.Router();

// Folder helper endpoints
router.get('/folders', getThemeFolders);
router.get('/folders/:folder/manifest', getFolderManifest);

// CRUD endpoints
router.route('/')
    .get(getThemes)
    .post(registerTheme);

router.route('/:id')
    .get(getThemeById)
    .put(updateTheme)
    .delete(deleteTheme);

export default router;
