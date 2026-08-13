/**
 * Wave 5 — section impact + field-level remapping (deterministic only).
 * Never execute arbitrary functions from MongoDB.
 */

import { listMigrations, compareSemver } from './themeMigration.js';

export const FIELD_MAPPINGS = [
    {
        from: 'LegacyBanner',
        fromType: 'image-banner-old',
        to: 'ImageBanner',
        toType: 'image-banner',
        fieldMap: {
            title: 'title',
            heading: 'title',
            imageUrl: 'imageUrl',
            image: 'imageUrl',
            buttonText: 'buttonLabel',
            buttonLabel: 'buttonLabel',
            buttonUrl: 'buttonLink',
            buttonLink: 'buttonLink',
        },
    },
    {
        from: 'TestimonialsLegacy',
        fromType: 'testimonials-legacy',
        to: 'Testimonials',
        toType: 'testimonials',
        fieldMap: {
            title: 'title',
            heading: 'title',
        },
    },
    {
        from: 'OldProductSection',
        fromType: 'old-product-section',
        to: 'FeaturedProducts',
        toType: 'featured-products',
        fieldMap: {
            title: 'title',
            heading: 'title',
            limit: 'limit',
            columns: 'columns',
        },
        transforms: {
            // Predefined only — never from DB
            columns: (value) => {
                if (value && typeof value === 'object') return value;
                const n = Number(value) || 4;
                return { desktop: n, tablet: Math.max(2, n - 1), mobile: 2 };
            },
        },
    },
    {
        from: 'ProductGridLegacy',
        fromType: 'product-grid-legacy',
        to: 'ProductGrid',
        toType: 'featured-products',
        fieldMap: {
            title: 'title',
            columns: 'columns',
        },
        transforms: {
            columns: (value) => {
                if (value && typeof value === 'object') return value;
                const n = Number(value) || 4;
                return { desktop: n, tablet: Math.max(2, n - 1), mobile: 2 };
            },
        },
    },
];

const norm = (v) => String(v || '').trim().toLowerCase();

export const findFieldMapping = (section = {}) => {
    const type = norm(section.type);
    const component = norm(section.component);
    return FIELD_MAPPINGS.find(
        (m) => norm(m.fromType) === type
            || norm(m.from) === component
            || norm(m.toType) === type
    ) || null;
};

/**
 * Apply field map + predefined transforms. Returns report.
 */
export const applyFieldMapping = (settings = {}, mapping) => {
    const report = { migrated: [], changed: [], unsupported: [], settings: { ...settings } };
    if (!mapping) return report;

    const next = { ...settings };
    const fieldMap = mapping.fieldMap || {};
    const transforms = mapping.transforms || {};

    for (const [fromKey, toKey] of Object.entries(fieldMap)) {
        if (settings[fromKey] === undefined) continue;
        let value = settings[fromKey];
        if (typeof transforms[fromKey] === 'function') {
            value = transforms[fromKey](value, { settings });
            report.changed.push(`${fromKey} → ${toKey} (transformed)`);
        } else if (fromKey !== toKey) {
            report.migrated.push(`${fromKey} → ${toKey}`);
        } else {
            report.migrated.push(fromKey);
        }
        next[toKey] = value;
        if (fromKey !== toKey) delete next[fromKey];
    }

    // Known unsupported keys
    const known = new Set([...Object.keys(fieldMap), ...Object.values(fieldMap)]);
    for (const key of Object.keys(settings)) {
        if (!known.has(key) && ['customEffect', 'legacyAnimation', 'unsafeHtml'].includes(key)) {
            report.unsupported.push(key);
            delete next[key];
        }
    }

    report.settings = next;
    return report;
};

export const IMPACT = {
    SAFE: 'SAFE',
    WARNING: 'WARNING',
    REQUIRES_ACTION: 'REQUIRES_ACTION',
};

/**
 * Build per-section upgrade impact report.
 */
export const buildUpgradeImpactReport = ({
    sections = [],
    supportedSections = null,
    fromVersion,
    toVersion,
    themeFolder,
    changelog = [],
} = {}) => {
    const migrationSteps = listMigrations(themeFolder, fromVersion, toVersion);
    const items = [];
    const allowed = Array.isArray(supportedSections) && supportedSections.length
        ? new Set(supportedSections.map(norm))
        : null;

    for (const sec of sections || []) {
        if (!sec || ['header', 'footer'].includes(norm(sec.type))) {
            items.push({
                sectionId: sec?.sectionId,
                name: sec?.name || sec?.type || 'Section',
                type: sec?.type,
                status: IMPACT.SAFE,
                notes: ['Compatible'],
            });
            continue;
        }

        const keys = [sec.type, sec.component].filter(Boolean).map(norm);
        const unsupported = allowed && !keys.some((k) => allowed.has(k));
        const mapping = findFieldMapping(sec);
        const notes = [];
        let status = IMPACT.SAFE;

        if (unsupported) {
            status = IMPACT.REQUIRES_ACTION;
            notes.push('Remapping required');
            if (mapping) {
                notes.push(`${mapping.from || sec.component} → ${mapping.to || mapping.toType}`);
            } else {
                notes.push('No safe remap suggestion');
            }
        } else if (mapping && mapping.transforms && Object.keys(mapping.transforms).length) {
            status = IMPACT.WARNING;
            notes.push('Settings shape changed');
            Object.keys(mapping.transforms).forEach((k) => notes.push(`${k} may be transformed`));
        } else {
            notes.push('Compatible');
            if (compareSemver(toVersion, fromVersion) > 0 && (sec.type === 'hero' || sec.type === 'featured-products')) {
                notes.push('New typography / responsive settings available');
            }
        }

        items.push({
            sectionId: sec.sectionId || sec._id,
            name: sec.name || sec.type || sec.component,
            type: sec.type,
            component: sec.component,
            status,
            notes,
            mapping: mapping
                ? { from: mapping.from, to: mapping.to, toType: mapping.toType, fieldMap: mapping.fieldMap }
                : null,
        });
    }

    const requiresAction = items.filter((i) => i.status === IMPACT.REQUIRES_ACTION).length;
    const warnings = items.filter((i) => i.status === IMPACT.WARNING).length;
    const overall = requiresAction > 0
        ? IMPACT.REQUIRES_ACTION
        : warnings > 0
            ? IMPACT.WARNING
            : IMPACT.SAFE;

    return {
        fromVersion,
        toVersion,
        themeFolder,
        overall,
        summary: {
            safe: items.filter((i) => i.status === IMPACT.SAFE).length,
            warning: warnings,
            requiresAction,
        },
        changelog,
        migrationSteps: migrationSteps.map((s) => `${s.from}→${s.to}`),
        sections: items,
    };
};

/**
 * Remap section with field mapping + backup.
 */
export const remapSectionWithFields = (original, suggestion) => {
    if (!original || !suggestion) return null;
    const backup = JSON.parse(JSON.stringify(original));
    const mapping = findFieldMapping(original)
        || FIELD_MAPPINGS.find((m) => norm(m.toType) === norm(suggestion.type) || norm(m.to) === norm(suggestion.component));
    const fieldReport = applyFieldMapping(original.settings || {}, mapping);

    const remapped = {
        ...JSON.parse(JSON.stringify(original)),
        sectionId: Math.random().toString(36).slice(2, 11),
        type: suggestion.type || mapping?.toType,
        component: suggestion.component || mapping?.to || '',
        name: suggestion.label || suggestion.type,
        enabled: true,
        settings: fieldReport.settings,
        blocks: Array.isArray(original.blocks) ? JSON.parse(JSON.stringify(original.blocks)) : [],
        _remappedFrom: {
            sectionId: backup.sectionId || backup._id,
            type: backup.type,
            component: backup.component,
            settings: backup.settings,
            blocks: backup.blocks,
            preservedAt: new Date().toISOString(),
        },
        _migrationReport: {
            migrated: fieldReport.migrated,
            changed: fieldReport.changed,
            unsupported: fieldReport.unsupported,
            preserved: true,
        },
    };

    return { remapped, originalBackup: backup, migrationReport: remapped._migrationReport };
};

export default {
    FIELD_MAPPINGS,
    findFieldMapping,
    applyFieldMapping,
    buildUpgradeImpactReport,
    remapSectionWithFields,
    IMPACT,
};
