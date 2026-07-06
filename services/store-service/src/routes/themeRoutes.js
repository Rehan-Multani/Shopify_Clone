import express from 'express';
import {
    getThemeSettings,
    updateThemeSettings,
    publishThemeSettings,
    installTheme,
    getThemeStore
} from '../controllers/themeController.js';

const router = express.Router();

// Theme Store for Merchants
router.get('/store', getThemeStore);

// Theme customizer settings management
router.get('/settings', getThemeSettings);
router.put('/settings', updateThemeSettings);
router.post('/publish', publishThemeSettings);
router.post('/install', installTheme);

export default router;
