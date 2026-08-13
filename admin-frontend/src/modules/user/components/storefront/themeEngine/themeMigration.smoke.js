/**
 * Wave 4 smoke — themeMigration (updated changelog shape).
 */
import {
    migrateThemeConfig,
    withThemeVersionMeta,
    listMigrations,
} from './themeMigration.js';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

const base = { themeId: 'luxury-commerce', primaryColor: '#111111', custom: 'keep' };
const stamped = withThemeVersionMeta(base, { folder: 'luxury-commerce', version: '1.0.0' });
assert(stamped.themeVersion === '1.0.0', 'themeVersion stamped');
assert(base.themeVersion === undefined, 'no mutate');

assert(listMigrations('luxury-commerce', '1.0.0', '1.1.0').length === 1, 'path exists');

const noop = migrateThemeConfig({ ...stamped }, 'luxury-commerce', '1.0.0', '1.0.0');
assert(noop.ok === true, 'same-version ok');
assert(Array.isArray(noop.applied) && noop.applied.length === 0, 'no steps');

const up = migrateThemeConfig({ ...stamped }, 'luxury-commerce', '1.0.0', '1.1.0');
assert(up.ok, 'upgrade ok');
assert(up.config.themeVersion === '1.1.0', 'version');
assert(up.changelog.length > 0, 'changelog');

console.log('themeMigration.smoke.js — all assertions passed');
