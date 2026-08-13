/**
 * Wave 6 — experiment lifecycle + assignment smoke
 * node services/store-service/src/utils/experimentLifecycle.smoke.js
 */
import {
    canTransitionExperiment,
    validateExperimentVariants,
    isExperimentAssignable,
    EXPERIMENT_STATUSES,
} from './experimentLifecycle.js';
import { assignVariant, getExperimentVariant } from './experimentAssignment.js';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

assert(canTransitionExperiment('draft', 'running'), 'draft→running');
assert(canTransitionExperiment('running', 'paused'), 'running→paused');
assert(canTransitionExperiment('paused', 'completed'), 'paused→completed');
assert(!canTransitionExperiment('completed', 'running'), 'completed locked');
assert(!canTransitionExperiment('cancelled', 'draft'), 'cancelled locked');
assert(EXPERIMENT_STATUSES.includes('scheduled'), 'scheduled status');

const bad = validateExperimentVariants([{ key: 'A', weight: 50 }]);
assert(!bad.ok, 'min 2 variants');

const weights = validateExperimentVariants([
    { key: 'A', themeId: 't1', weight: 40 },
    { key: 'B', themeId: 't2', weight: 50 },
]);
assert(!weights.ok, 'weights must be 100');

const okVar = validateExperimentVariants([
    { key: 'A', themeId: 't1', themeFolder: 'luxury-commerce', weight: 50 },
    { key: 'B', themeId: 't2', themeFolder: 'electronics-pro', weight: 50 },
], {
    installedThemes: [
        { themeId: 't1', folder: 'luxury-commerce' },
        { themeId: 't2', folder: 'electronics-pro' },
    ],
});
assert(okVar.ok, 'valid variants');

const paused = isExperimentAssignable({ status: 'paused', variants: [] });
assert(!paused.ok, 'paused not assignable');

const running = isExperimentAssignable({ status: 'running', variants: [{ key: 'A', weight: 100 }] });
assert(running.ok, 'running ok');

const a1 = assignVariant('exp1', 'visitor-x', [
    { key: 'A', weight: 50, themeId: 't1' },
    { key: 'B', weight: 50, themeId: 't2' },
]);
const a2 = assignVariant('exp1', 'visitor-x', [
    { key: 'A', weight: 50, themeId: 't1' },
    { key: 'B', weight: 50, themeId: 't2' },
]);
assert(a1.variantKey === a2.variantKey, 'consistent');

const run = async () => {
    const result = await getExperimentVariant({
        experiment: {
            _id: 'exp1',
            status: 'running',
            variants: [
                { key: 'A', weight: 50, themeId: 't1', themeFolder: 'luxury-commerce', themeVersion: '1.0.0' },
                { key: 'B', weight: 50, themeId: 't2', themeFolder: 'luxury-commerce', themeVersion: '1.1.0' },
            ],
        },
        visitorKey: 'visitor-x',
    });
    assert(result.ok && result.presentation, 'getExperimentVariant');
    console.log('experimentLifecycle.smoke.js — all assertions passed');
};

run().catch((e) => { console.error(e); process.exit(1); });
