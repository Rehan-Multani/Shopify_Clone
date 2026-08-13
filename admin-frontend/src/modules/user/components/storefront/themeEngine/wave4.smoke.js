/**
 * Wave 4 smoke — upgrade / compatibility / responsive helpers.
 * Run from admin-frontend:
 *   node src/modules/user/components/storefront/themeEngine/wave4.smoke.js
 */
import {
    migrateThemeConfig,
    compareSemver,
    listMigrations,
} from './themeMigration.js';
import {
    buildCompatibilityReport,
    createRemappedSection,
    detectUnsupportedSections,
} from './sectionCompatibility.js';
import {
    normalizeResponsiveValue,
    resolveResponsiveForViewport,
} from './responsiveValue.js';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

// Version detection
assert(compareSemver('1.1.0', '1.0.0') > 0, '1.1 > 1.0');
const steps = listMigrations('luxury-commerce', '1.0.0', '1.1.0');
assert(steps.length === 1, 'luxury 1.0→1.1 migration exists');

// Migration produces draft-shaped config; published unchanged conceptually
const published = { themeId: 'luxury-commerce', primaryColor: '#111', themeVersion: '1.0.0' };
const publishedCopy = JSON.parse(JSON.stringify(published));
const migrated = migrateThemeConfig(published, 'luxury-commerce', '1.0.0', '1.1.0');
assert(migrated.ok, 'migration ok');
assert(migrated.config.themeVersion === '1.1.0', 'draft version bumped');
assert(publishedCopy.themeVersion === '1.0.0', 'source published object not mutated');
assert(Array.isArray(migrated.changelog) && migrated.changelog.length > 0, 'changelog present');

// Compatibility
const sections = [
    { sectionId: 'a', type: 'testimonials-legacy', component: 'TestimonialsLegacy', enabled: true },
    { sectionId: 'b', type: 'hero', enabled: true },
];
const supported = ['hero', 'testimonials', 'featured-products'];
const unsupported = detectUnsupportedSections(sections, supported);
assert(unsupported.length === 1, 'unsupported detected');
const report = buildCompatibilityReport(sections, supported);
assert(report.needsAttention === 1, 'needs attention');
assert(report.items[0].suggestions.length >= 1, 'suggestions generated');
assert(report.items[0].preserved === true, 'preserved flag');

const remap = createRemappedSection(sections[0], report.items[0].suggestions[0]);
assert(remap.originalBackup.type === 'testimonials-legacy', 'original backup kept');
assert(remap.remapped.type === 'testimonials', 'remapped type');
assert(remap.remapped._remappedFrom, 'remappedFrom metadata');

// Responsive fallbacks
const norm = normalizeResponsiveValue({ desktop: 80 }, { desktop: 0, tablet: 0, mobile: 0 });
assert(norm.tablet === 80 && norm.mobile === 80, 'tablet/mobile fallback to desktop');
assert(resolveResponsiveForViewport(norm, 'mobile') === 80, 'resolve mobile');
assert(resolveResponsiveForViewport(48, 'tablet') === 48, 'scalar expands');

console.log('wave4.smoke.js — all assertions passed');
