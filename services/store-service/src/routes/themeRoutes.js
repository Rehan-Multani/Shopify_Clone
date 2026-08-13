import express from 'express';
import {
    getThemeSettings,
    updateThemeSettings,
    publishThemeSettings,
    installTheme,
    getThemeStore,
    checkThemeUpdates,
    previewThemeUpgrade,
    upgradeTheme,
    rollbackTheme,
    createPreviewToken,
    revokePreviewTokenHandler,
    activateTheme,
    removeTheme,
} from '../controllers/themeController.js';
import {
    trackThemeEvent,
    recordConsentBeacon,
    getThemeAnalyticsSummary,
    compareThemeVersions,
    assignExperimentVariant,
    getActiveExperiment,
    listExperiments,
    getExperiment,
    createExperiment,
    updateExperiment,
    transitionExperiment,
    getExperimentResults,
    applyExperimentWinner,
    listThemeAudit,
} from '../controllers/themeAnalyticsController.js';

const router = express.Router();

router.get('/store', getThemeStore);

router.get('/settings', getThemeSettings);
router.put('/settings', updateThemeSettings);
router.post('/publish', publishThemeSettings);
router.post('/install', installTheme);
router.post('/activate', activateTheme);
router.post('/remove', removeTheme);

// Wave 4 lifecycle
router.get('/updates', checkThemeUpdates);
router.post('/upgrade/preview', previewThemeUpgrade);
router.post('/upgrade', upgradeTheme);
router.post('/rollback', rollbackTheme);

// Wave 5/6 — secure preview + analytics + experiments + audit
router.post('/preview-token', createPreviewToken);
router.post('/preview-token/revoke', revokePreviewTokenHandler);
router.post('/analytics/events', trackThemeEvent);
router.post('/consent', recordConsentBeacon);
router.get('/analytics/summary', getThemeAnalyticsSummary);
router.get('/analytics/compare', compareThemeVersions);
router.get('/audit', listThemeAudit);

router.get('/experiments/active', getActiveExperiment);
router.post('/experiments/assign', assignExperimentVariant);
router.get('/experiments', listExperiments);
router.post('/experiments', createExperiment);
router.get('/experiments/:id', getExperiment);
router.patch('/experiments/:id', updateExperiment);
router.post('/experiments/:id/transition', transitionExperiment);
router.get('/experiments/:id/results', getExperimentResults);
router.post('/experiments/:id/apply-winner', applyExperimentWinner);

export default router;
