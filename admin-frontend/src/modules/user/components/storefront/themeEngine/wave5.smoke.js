/**
 * Wave 5 smoke — preview tokens, migration impact, field mapping.
 * Run: node src/modules/user/components/storefront/themeEngine/wave5.smoke.js
 *
 * Note: JWT mint/verify lives on store-service — FE mirrors impact helpers only.
 */
import {
    buildUpgradeImpactReport,
    applyFieldMapping,
    remapSectionWithFields,
    FIELD_MAPPINGS,
    IMPACT,
} from './migrationImpact.js';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

// Impact levels
const sections = [
    { sectionId: '1', type: 'hero', name: 'Hero', enabled: true },
    { sectionId: '2', type: 'featured-products', name: 'Products', enabled: true },
    { sectionId: '3', type: 'testimonials-legacy', component: 'TestimonialsLegacy', name: 'TestimonialsLegacy', enabled: true },
];
const impact = buildUpgradeImpactReport({
    sections,
    supportedSections: ['hero', 'featured-products', 'testimonials'],
    fromVersion: '1.0.0',
    toVersion: '1.1.0',
    themeFolder: 'luxury-commerce',
    changelog: ['test'],
});
assert(impact.overall === IMPACT.REQUIRES_ACTION, 'legacy requires action');
assert(impact.sections.find((s) => s.type === 'hero')?.status === IMPACT.SAFE, 'hero safe');
assert(impact.sections.find((s) => s.type === 'testimonials-legacy')?.status === IMPACT.REQUIRES_ACTION, 'legacy action');

// Field mapping
const mapping = FIELD_MAPPINGS.find((m) => m.fromType === 'old-product-section');
const fieldReport = applyFieldMapping({ title: 'X', columns: 5, customEffect: 'spin' }, mapping);
assert(fieldReport.settings.title === 'X', 'title kept');
assert(fieldReport.settings.columns.desktop === 5, 'columns transformed');
assert(fieldReport.unsupported.includes('customEffect'), 'unsupported stripped');
assert(fieldReport.changed.some((c) => c.includes('columns')), 'changed noted');

const remap = remapSectionWithFields(
    { sectionId: 'x', type: 'testimonials-legacy', component: 'TestimonialsLegacy', settings: { title: 'Hi' }, blocks: [] },
    { type: 'testimonials', component: 'Testimonials', label: 'Testimonials' }
);
assert(remap.originalBackup.type === 'testimonials-legacy', 'backup');
assert(remap.remapped.type === 'testimonials', 'remapped');
assert(remap.remapped._remappedFrom, 'preserved meta');
assert(remap.migrationReport.preserved === true, 'report preserved');

console.log('wave5.smoke.js — all assertions passed');
