/**
 * Wave 6 — audit + analytics helper smoke
 * node services/store-service/src/utils/wave6.smoke.js
 */
import { AUDIT_ACTIONS } from './themeAuditActions.js';
import { buildThemeEventPayload, stripSensitiveMeta } from './themeAnalyticsHelpers.js';
import { canTransitionExperiment } from './experimentLifecycle.js';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

assert(AUDIT_ACTIONS.includes('THEME_PUBLISHED'), 'audit publish');
assert(AUDIT_ACTIONS.includes('EXPERIMENT_STARTED'), 'audit experiment');
assert(AUDIT_ACTIONS.includes('THEME_ROLLED_BACK'), 'audit rollback');

const payload = buildThemeEventPayload({
    storeId: '507f1f77bcf86cd799439011',
    themeId: 'luxury-commerce',
    themeVersion: '1.1.0',
    eventType: 'page_view',
    meta: { email: 'x@y.com', path: '/' },
});
assert(!payload.meta.email && payload.meta.path === '/', 'pii stripped');
assert(stripSensitiveMeta({ phone: '1', sku: 'A' }).sku === 'A', 'sku kept');

assert(canTransitionExperiment('draft', 'scheduled'), 'schedule');
assert(canTransitionExperiment('running', 'cancelled'), 'cancel');

console.log('wave6.smoke.js — all assertions passed');
