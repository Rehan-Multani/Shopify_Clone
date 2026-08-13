/**
 * Wave 5 — migrationImpact backend smoke
 * node services/store-service/src/utils/migrationImpact.smoke.js
 */
import {
    buildUpgradeImpactReport,
    applyFieldMapping,
    FIELD_MAPPINGS,
    IMPACT,
} from './migrationImpact.js';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

const impact = buildUpgradeImpactReport({
    sections: [
        { type: 'hero' },
        { type: 'old-product-section', component: 'OldProductSection' },
    ],
    supportedSections: ['hero', 'featured-products'],
    fromVersion: '1.0.0',
    toVersion: '1.1.0',
    themeFolder: 'luxury-commerce',
});
assert(impact.overall === IMPACT.REQUIRES_ACTION, 'overall');
assert(impact.summary.requiresAction >= 1, 'requires action count');

const mapping = FIELD_MAPPINGS.find((m) => m.fromType === 'old-product-section');
const report = applyFieldMapping({ columns: 4, title: 'T', unsafeHtml: '<b>' }, mapping);
assert(report.settings.columns.desktop === 4, 'transform');
assert(report.unsupported.includes('unsafeHtml'), 'unsafe stripped');

console.log('migrationImpact.smoke.js — all assertions passed');
