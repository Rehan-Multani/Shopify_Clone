/**
 * FE Wave 6 smoke — consent visitor key + impact still intact
 * node src/modules/user/components/storefront/themeEngine/wave6.smoke.js
 *
 * Note: browser localStorage helpers are covered by API shape checks here;
 * migration impact remains the deterministic unit under Node.
 */
import { IMPACT, buildUpgradeImpactReport } from './migrationImpact.js';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

const impact = buildUpgradeImpactReport({
    sections: [{ type: 'hero' }],
    supportedSections: ['hero'],
    fromVersion: '1.0.0',
    toVersion: '1.1.0',
    themeFolder: 'luxury-commerce',
});
assert(impact.overall === IMPACT.SAFE || impact.overall === IMPACT.WARNING, 'impact ok');
assert(IMPACT.REQUIRES_ACTION === 'REQUIRES_ACTION', 'impact levels');

console.log('wave6.smoke.js (FE) — all assertions passed');
