/**
 * Experiment lifecycle transitions (Wave 6).
 * Statuses: draft | scheduled | running | paused | completed | cancelled
 */

export const EXPERIMENT_STATUSES = [
    'draft',
    'scheduled',
    'running',
    'paused',
    'completed',
    'cancelled',
];

const TRANSITIONS = {
    draft: ['scheduled', 'running', 'cancelled'],
    scheduled: ['running', 'cancelled', 'draft'],
    running: ['paused', 'completed', 'cancelled'],
    paused: ['running', 'completed', 'cancelled'],
    completed: [],
    cancelled: [],
};

export const canTransitionExperiment = (from, to) => {
    const allowed = TRANSITIONS[from] || [];
    return allowed.includes(to);
};

export const validateExperimentVariants = (variants, { installedThemes = [] } = {}) => {
    if (!Array.isArray(variants) || variants.length < 2 || variants.length > 4) {
        return { ok: false, message: 'Experiments require 2–4 variants' };
    }
    const totalWeight = variants.reduce((s, v) => s + (Number(v.weight) || 0), 0);
    if (totalWeight !== 100) {
        return { ok: false, message: 'Variant weights must sum to 100' };
    }
    for (const v of variants) {
        if (!v.key) return { ok: false, message: 'Each variant needs a key' };
        if (!v.themeId && !v.themeFolder) {
            return { ok: false, message: 'Each variant needs themeId or themeFolder' };
        }
        if (installedThemes.length) {
            const match = installedThemes.find((t) =>
                String(t.themeId) === String(v.themeId)
                || String(t.folder) === String(v.themeFolder)
                || String(t.folder) === String(v.themeId)
            );
            if (!match) {
                return { ok: false, message: `Theme not available for variant ${v.key}` };
            }
        }
    }
    return { ok: true };
};

/**
 * Running / scheduled with start window — used by assign.
 */
export const isExperimentAssignable = (experiment, now = new Date()) => {
    if (!experiment) return { ok: false, message: 'Experiment not found' };
    const status = experiment.status;
    if (status === 'scheduled') {
        if (experiment.startAt && now < new Date(experiment.startAt)) {
            return { ok: false, message: 'Experiment not started' };
        }
        // Auto-eligible once startAt passed (controller may promote)
    }
    if (status !== 'running' && status !== 'scheduled') {
        return { ok: false, message: 'Experiment is not running' };
    }
    if (status === 'scheduled' && experiment.startAt && now >= new Date(experiment.startAt)) {
        // treat as assignable; controller should promote to running
    } else if (status === 'scheduled') {
        return { ok: false, message: 'Experiment not started' };
    }
    if (experiment.startAt && now < new Date(experiment.startAt)) {
        return { ok: false, message: 'Experiment not started' };
    }
    if (experiment.endAt && now > new Date(experiment.endAt)) {
        return { ok: false, message: 'Experiment ended' };
    }
    return { ok: true };
};

export default {
    EXPERIMENT_STATUSES,
    canTransitionExperiment,
    validateExperimentVariants,
    isExperimentAssignable,
};
