/**
 * Node smoke tests for Wave 2 schema helpers (no vitest required).
 * Run: node src/modules/user/components/storefront/themeEngine/sectionSchemas.smoke.js
 */
import {
    getSectionSchema,
    getSchemaDefaults,
    mergeSectionSettings,
    getVisibleFields,
    isFieldVisible,
} from './sectionSchemas.js';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

// Schema resolves
const hero = getSectionSchema('hero');
assert(hero && hero.label === 'Hero', 'hero schema missing');
assert(getSectionSchema('Hero')?.schemaKey === 'hero', 'Hero alias failed');
assert(getSectionSchema('ProductGrid')?.schemaKey === 'featured-products', 'ProductGrid alias failed');
assert(getSectionSchema('PromoBanner')?.schemaKey === 'image-banner', 'PromoBanner alias failed');

// Defaults
const defaults = getSchemaDefaults(hero);
assert(defaults.title === 'Welcome to Our Store', 'hero default title');
assert(defaults.showTrustBadges === true, 'hero default badges');

// Merge does not mutate
const original = { title: 'Custom' };
const merged = mergeSectionSettings(hero, original);
assert(merged.title === 'Custom', 'settings should win');
assert(merged.heroStyle === 'cinematic', 'defaults fill missing');
assert(original.heroStyle === undefined, 'must not mutate input');

// Conditional fields
const featured = getSectionSchema('featured-products');
const withoutCategory = getVisibleFields(featured, { source: 'latest' });
assert(!withoutCategory.some((f) => f.name === 'categoryId'), 'category hidden for latest');
assert(!withoutCategory.some((f) => f.name === 'productIds'), 'products hidden for latest');

const withCategory = getVisibleFields(featured, { source: 'category' });
assert(withCategory.some((f) => f.name === 'categoryId'), 'category shown for category source');

const withManual = getVisibleFields(featured, { source: 'manual' });
assert(withManual.some((f) => f.name === 'productIds'), 'products shown for manual');

const badgeField = hero.fields.find((f) => f.name === 'badge1Text');
assert(isFieldVisible(badgeField, { showTrustBadges: true }) === true, 'badge visible');
assert(isFieldVisible(badgeField, { showTrustBadges: false }) === false, 'badge hidden');

console.log('sectionSchemas.smoke.js — all assertions passed');
