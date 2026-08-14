/**
 * Production environment gate — fail clearly when critical config is missing.
 * Never log secret values.
 */
import { isProductionEnv, getRedisBackend } from './redisClient.js';

const DEFAULT_JWT = 'super_secret_jwt_key_for_storify_2026';

/**
 * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
 */
export const auditProductionEnv = ({ strict = isProductionEnv() } = {}) => {
    const errors = [];
    const warnings = [];

    const jwt = process.env.JWT_SECRET || '';
    if (!jwt || jwt === DEFAULT_JWT) {
        (strict ? errors : warnings).push('JWT_SECRET must be set to a non-default value');
    }

    if (!process.env.MONGODB_URL && !process.env.MONGODB_URI) {
        (strict ? errors : warnings).push('MONGODB_URL is required');
    }

    if (strict) {
        if (!process.env.REDIS_URL && !process.env.REDIS_URI) {
            warnings.push('REDIS_URL missing — preview tokens/queues fail closed; store APIs still start');
        } else if (getRedisBackend() !== 'redis') {
            warnings.push('Redis backend unhealthy — preview tokens fail closed (no memory fallback)');
        }

        if (!process.env.PREVIEW_TOKEN_SECRET && jwt) {
            warnings.push('PREVIEW_TOKEN_SECRET unset — deriving from JWT_SECRET (prefer dedicated secret)');
        }
    }

    return { ok: errors.length === 0, errors, warnings, strict };
};

/**
 * Call at boot. Exit only when the service cannot serve stores (missing Mongo).
 * Missing Redis must NOT take down my-stores / theme audit — preview mint already fail-closes.
 */
export const assertProductionEnvOrExit = () => {
    const result = auditProductionEnv();
    for (const w of result.warnings) {
        console.warn('[prod-env]', w);
    }
    for (const e of result.errors) {
        console.error('[prod-env] CRITICAL:', e);
    }
    const fatal = result.errors.filter((e) => /MONGODB/i.test(e));
    if (fatal.length && result.strict) {
        console.error('[prod-env] Refusing to start without a database URL');
        process.exit(1);
    }
    return result;
};

export default {
    auditProductionEnv,
    assertProductionEnvOrExit,
};
