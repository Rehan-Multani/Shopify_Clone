import express from 'express';
import { getTheme, updateTheme, resetTheme } from '../controllers/themeController.js';

const router = express.Router();

router.route('/')
    .get(getTheme)
    .put(updateTheme)
    .delete(resetTheme);

export default router;
