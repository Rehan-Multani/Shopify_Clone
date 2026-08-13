/**
 * Theme versioning + migration foundation (frontend mirror of store-service).
 * Global theme updates must NOT auto-mutate merchant store configs.
 */

export const parseSemver = (version = '0.0.0') => {
    const [major = '0', minor = '0', patch = '0'] = String(version || '0.0.0').replace(/^v/i, '').split('.');
    return {
        major: Number(major) || 0,
        minor: Number(minor) || 0,
        patch: Number(patch) || 0,
        raw: String(version || '0.0.0'),
    };
};

export const compareSemver = (a, b) => {
    const A = parseSemver(a);
    const B = parseSemver(b);
    if (A.major !== B.major) return A.major - B.major;
    if (A.minor !== B.minor) return A.minor - B.minor;
    return A.patch - B.patch;
};

export const THEME_MIGRATIONS = {
    'luxury-commerce': [
        {
            from: '1.0.0',
            to: '1.1.0',
            changelog: [
                'New header sticky & navigation options',
                'Improved luxury product card spacing tokens',
                'New section spacing scale defaults',
                'Expanded theme settings labels',
            ],
            migrate: (config) => {
                const next = { ...config };
                next.spacingScale = next.spacingScale || 'roomy';
                next.shadowPreset = next.shadowPreset || 'soft';
                if (next.headerConfig && typeof next.headerConfig === 'object') {
                    next.headerConfig = {
                        ...next.headerConfig,
                        sticky: next.headerConfig.sticky !== false,
                    };
                }
                next.themeVersion = '1.1.0';
                next.version = '1.1.0';
                return next;
            },
        },
    ],
    'electronics-pro': [],
    'furniture-premium': [],
};

export const listMigrations = (themeFolder, fromVersion, toVersion) => {
    const list = THEME_MIGRATIONS[themeFolder] || [];
    return list
        .filter((m) =>
            compareSemver(m.from, fromVersion) >= 0
            && compareSemver(m.to, toVersion) <= 0
            && compareSemver(m.from, m.to) < 0
        )
        .sort((a, b) => compareSemver(a.from, b.from));
};

export const migrateThemeConfig = (config, themeFolder, fromVersion, toVersion) => {
    if (!config || typeof config !== 'object') {
        return { ok: false, message: 'Invalid config', config, applied: [], changelog: [] };
    }
    if (compareSemver(fromVersion, toVersion) === 0) {
        return { ok: true, message: 'Already on target version', config: { ...config }, applied: [], changelog: [] };
    }
    if (compareSemver(fromVersion, toVersion) > 0) {
        return { ok: false, message: 'Downgrade not supported', config, applied: [], changelog: [] };
    }

    const steps = listMigrations(themeFolder, fromVersion, toVersion);
    if (!steps.length) {
        const next = JSON.parse(JSON.stringify(config));
        next.themeFolder = themeFolder;
        next.themeId = next.themeId || themeFolder;
        next.themeVersion = toVersion;
        next.version = toVersion;
        return {
            ok: true,
            message: 'No migrations defined; version metadata updated only',
            config: next,
            applied: [],
            changelog: [`Version metadata updated to ${toVersion}`],
        };
    }

    if (compareSemver(steps[0].from, fromVersion) !== 0) {
        return {
            ok: false,
            message: `No migration path from ${fromVersion}`,
            config,
            applied: [],
            changelog: [],
        };
    }

    let next = JSON.parse(JSON.stringify(config));
    const applied = [];
    const changelog = [];
    let cursor = fromVersion;

    for (const step of steps) {
        if (compareSemver(step.from, cursor) !== 0) {
            return {
                ok: false,
                message: `Broken migration chain at ${cursor}`,
                config: next,
                applied,
                changelog,
            };
        }
        if (typeof step.migrate === 'function') {
            next = step.migrate(next) || next;
        }
        applied.push(`${step.from}→${step.to}`);
        (step.changelog || []).forEach((c) => changelog.push(c));
        cursor = step.to;
        if (compareSemver(cursor, toVersion) === 0) break;
    }

    if (compareSemver(cursor, toVersion) !== 0) {
        return {
            ok: false,
            message: `Incomplete migration path: reached ${cursor}, target ${toVersion}`,
            config: next,
            applied,
            changelog,
        };
    }

    next.themeFolder = themeFolder;
    next.themeId = next.themeId || themeFolder;
    next.themeVersion = toVersion;
    next.version = toVersion;

    return {
        ok: true,
        message: applied.length ? `Applied: ${applied.join(', ')}` : 'Done',
        config: next,
        applied,
        changelog,
    };
};

export const withThemeVersionMeta = (settings = {}, { folder, version, themeId } = {}) => ({
    ...settings,
    themeFolder: folder || settings.themeFolder || '',
    themeId: themeId || settings.themeId || folder || '',
    themeVersion: version || settings.themeVersion || settings.version || '1.0.0',
    version: version || settings.version || settings.themeVersion || '1.0.0',
});

export default {
    parseSemver,
    compareSemver,
    migrateThemeConfig,
    listMigrations,
    withThemeVersionMeta,
    THEME_MIGRATIONS,
};
