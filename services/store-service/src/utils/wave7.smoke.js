/**
 * Wave 7 smoke tests
 * node services/store-service/src/utils/wave7.smoke.js
 */
import { assertPreviewTokenBackend, isProductionEnv } from './redisClient.js';
import {
    mintPreviewToken,
    verifyPreviewToken,
    revokePreviewToken,
} from './previewToken.js';
import { canTransitionExperiment } from './experimentLifecycle.js';
import { completeExpiredExperiments } from '../jobs/experimentAutoComplete.js';
import { validateThemePackage } from './themePackageValidation.js';
import { buildThemeEventPayload, ALLOWED_THEME_EVENTS } from './themeAnalyticsHelpers.js';
import { AUDIT_ACTIONS } from './themeAuditActions.js';
import path from 'path';
import { fileURLToPath } from 'url';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const run = async () => {
    // Redis production gate (dev allows memory)
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    assert(assertPreviewTokenBackend().ok, 'dev allows fallback');

    process.env.NODE_ENV = 'production';
    delete process.env.REDIS_URL;
    delete process.env.REDIS_URI;
    const prodGate = assertPreviewTokenBackend();
    assert(!prodGate.ok && prodGate.status === 503, 'production requires redis');
    process.env.NODE_ENV = prev || 'development';

    // Preview tokens (memory in dev)
    const minted = await mintPreviewToken({
        storeId: 'store1',
        themeId: 'theme1',
        merchantId: 'm1',
        ttlSec: 120,
    });
    assert((await verifyPreviewToken(minted.token, { storeId: 'store1' })).ok, 'validate');
    await revokePreviewToken({ tokenId: minted.tokenId, merchantId: 'm1' });
    assert(!(await verifyPreviewToken(minted.token, { storeId: 'store1' })).ok, 'revoked');

    // Lifecycle
    assert(canTransitionExperiment('running', 'completed'), 'complete');
    assert(AUDIT_ACTIONS.includes('EXPERIMENT_WINNER_APPLIED'), 'winner audit');
    assert(AUDIT_ACTIONS.includes('EXPERIMENT_AUTO_COMPLETED'), 'auto complete audit');
    assert(AUDIT_ACTIONS.includes('CONSENT_UPDATED'), 'consent audit');

    // Analytics attribution payload
    assert(ALLOWED_THEME_EVENTS.has('session_start'), 'session event');
    assert(ALLOWED_THEME_EVENTS.has('purchase'), 'purchase event');
    const payload = buildThemeEventPayload({
        storeId: '507f1f77bcf86cd799439011',
        themeId: 'luxury-commerce',
        themeVersion: '1.1.0',
        eventType: 'purchase',
        meta: { email: 'x@y.com', source: 'order' },
        sessionKey: 's-abc',
        revenue: 1200,
    });
    assert(!payload.meta.email, 'no PII');
    assert(payload.revenue === 1200, 'revenue');
    assert(payload.sessionKey === 's-abc', 'session');

    // Theme package validation against luxury-commerce if present
    const themeDir = path.resolve(__dirname, '../../../../themes/luxury-commerce');
    const validation = validateThemePackage(themeDir);
    assert(validation.ok, `theme package: ${validation.errors.join(',')}`);

    // Auto-complete function is callable (empty DB ok)
    assert(typeof completeExpiredExperiments === 'function', 'autocomplete fn');

    console.log('wave7.smoke.js — all assertions passed');
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
