/**
 * Theme package validation — never executes theme code.
 * node services/store-service/src/utils/themePackageValidation.js
 */
import fs from 'fs';
import path from 'path';

const FORBIDDEN_KEYS = new Set(['customJS', 'customJs', 'script', 'eval', 'backendHook', 'serverCode']);

export const validateThemePackage = (folderPath) => {
    const errors = [];
    const warnings = [];

    if (!folderPath || !fs.existsSync(folderPath)) {
        return { ok: false, errors: ['Theme folder missing'], warnings };
    }

    const manifestPath = path.join(folderPath, 'manifest.json');
    const schemaPath = path.join(folderPath, 'schema.json');
    if (!fs.existsSync(manifestPath)) errors.push('manifest.json required');
    if (!fs.existsSync(schemaPath)) warnings.push('schema.json missing');

    let manifest = {};
    try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
        errors.push('manifest.json invalid');
    }

    if (!manifest.version) errors.push('manifest.version required');
    if (!manifest.name && !manifest.themeName) warnings.push('manifest name missing');

    // Reject customJS in settings files
    const walk = (dir) => {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir)) {
            const full = path.join(dir, entry);
            const st = fs.statSync(full);
            if (st.isDirectory()) walk(full);
            else if (entry.endsWith('.json')) {
                try {
                    const raw = fs.readFileSync(full, 'utf8');
                    for (const key of FORBIDDEN_KEYS) {
                        if (raw.includes(`"${key}"`)) {
                            errors.push(`${entry}: forbidden key ${key}`);
                        }
                    }
                } catch {
                    /* skip */
                }
            }
        }
    };
    walk(folderPath);

    // Assets must be static — no .php/.py execution
    const assetsDir = path.join(folderPath, 'assets');
    if (fs.existsSync(assetsDir)) {
        for (const f of fs.readdirSync(assetsDir)) {
            if (/\.(php|py|rb|exe|sh)$/i.test(f)) {
                errors.push(`assets/${f}: executable asset rejected`);
            }
        }
    }

    return { ok: errors.length === 0, errors, warnings, version: manifest.version || null };
};

export default validateThemePackage;
