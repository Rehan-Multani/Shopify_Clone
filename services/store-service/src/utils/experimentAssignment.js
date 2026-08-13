/**
 * Deterministic anonymous experiment assignment (no PII).
 * Presentation/theme only — never touches commerce data.
 */
import crypto from 'crypto';
import { isExperimentAssignable as lifecycleAssignable } from './experimentLifecycle.js';

/**
 * @param {string} experimentId
 * @param {string} visitorKey
 * @param {Array<{ key: string, weight: number, themeId?: string, themeFolder?: string, themeVersion?: string }>} variants
 */
export const assignVariant = (experimentId, visitorKey, variants = []) => {
    if (!experimentId || !visitorKey || !Array.isArray(variants) || variants.length < 1) {
        throw new Error('experimentId, visitorKey, and variants required');
    }
    const hash = crypto.createHash('sha256')
        .update(`${experimentId}:${visitorKey}`)
        .digest('hex');
    const bucket = parseInt(hash.slice(0, 8), 16) % 100;
    let cursor = 0;
    let chosen = variants[0];
    for (const v of variants) {
        cursor += Number(v.weight) || 0;
        if (bucket < cursor) {
            chosen = v;
            break;
        }
    }
    return {
        variantKey: chosen.key,
        themeId: chosen.themeId || '',
        themeFolder: chosen.themeFolder || '',
        themeVersion: chosen.themeVersion || '',
        bucket,
    };
};

export const isExperimentAssignable = lifecycleAssignable;

/**
 * Central assignment service — never trusts client-chosen variant.
 */
export const getExperimentVariant = async ({
    experiment,
    visitorKey,
    now = new Date(),
} = {}) => {
    const gate = isExperimentAssignable(experiment, now);
    if (!gate.ok) return { ok: false, message: gate.message };
    const chosen = assignVariant(String(experiment._id), String(visitorKey), experiment.variants);
    return {
        ok: true,
        experimentId: String(experiment._id),
        variantKey: chosen.variantKey,
        themeId: chosen.themeId,
        themeFolder: chosen.themeFolder,
        themeVersion: chosen.themeVersion,
        // presentation only
        presentation: {
            themeId: chosen.themeId,
            themeFolder: chosen.themeFolder,
            themeVersion: chosen.themeVersion,
        },
    };
};

export default { assignVariant, isExperimentAssignable, getExperimentVariant };
