/**
 * node services/store-service/src/utils/experimentAssignment.smoke.js
 */
import { assignVariant, isExperimentAssignable } from './experimentAssignment.js';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

const variants = [
    { key: 'A', themeId: 'lux-1', themeFolder: 'luxury-commerce', themeVersion: '1.0.0', weight: 50 },
    { key: 'B', themeId: 'lux-2', themeFolder: 'luxury-commerce', themeVersion: '1.1.0', weight: 50 },
];

const a1 = assignVariant('exp1', 'visitor-abc', variants);
const a2 = assignVariant('exp1', 'visitor-abc', variants);
assert(a1.variantKey === a2.variantKey, 'consistent assignment');
assert(a1.bucket === a2.bucket, 'same bucket');

const disabled = isExperimentAssignable({ status: 'paused', variants });
assert(!disabled.ok, 'paused rejected');

const notStarted = isExperimentAssignable({
    status: 'running',
    startAt: new Date(Date.now() + 86400000),
    variants,
});
assert(!notStarted.ok, 'future start rejected');

const ended = isExperimentAssignable({
    status: 'running',
    endAt: new Date(Date.now() - 1000),
    variants,
});
assert(!ended.ok, 'ended rejected');

const ok = isExperimentAssignable({ status: 'running', variants });
assert(ok.ok, 'running allowed');

console.log('experimentAssignment.smoke.js — all assertions passed');
