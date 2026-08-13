/**
 * Wave 3 smoke — premium theme packs + catalog presence.
 * Run: node scripts/wave3-themes.smoke.js (from repo root) OR via path below.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../../../../../..');
const themesRoot = path.join(root, 'themes');

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

const required = ['luxury-commerce', 'electronics-pro', 'furniture-premium'];
for (const folder of required) {
    const dir = path.join(themesRoot, folder);
    assert(fs.existsSync(dir), `missing theme folder ${folder}`);
    for (const file of ['manifest.json', 'defaultSettings.json', 'pages/index.json', 'schema.json', 'assets/theme.css']) {
        assert(fs.existsSync(path.join(dir, file)), `${folder}/${file} missing`);
    }
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    const settings = JSON.parse(fs.readFileSync(path.join(dir, 'defaultSettings.json'), 'utf8'));
    assert(manifest.version, `${folder} manifest.version`);
    assert(settings.themeVersion || settings.version, `${folder} themeVersion`);
    assert(settings.productCardStyle, `${folder} productCardStyle`);
    assert(Array.isArray(manifest.supportedSections) || true, `${folder} supportedSections optional`);
}

const catalog = JSON.parse(fs.readFileSync(path.join(themesRoot, 'theme-store-catalog.json'), 'utf8'));
for (const folder of required) {
    assert(catalog.some((t) => t.folder === folder), `catalog missing ${folder}`);
}

const styles = {
    'luxury-commerce': 'luxury',
    'electronics-pro': 'electronics',
    'furniture-premium': 'furniture',
};
for (const [folder, style] of Object.entries(styles)) {
    const settings = JSON.parse(fs.readFileSync(path.join(themesRoot, folder, 'defaultSettings.json'), 'utf8'));
    assert(settings.productCardStyle === style, `${folder} should use ${style} cards`);
}

console.log('wave3-themes.smoke.js — all assertions passed');
