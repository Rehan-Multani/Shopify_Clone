/**
 * Idempotent experiment auto-completion when endAt is reached.
 * Used by BullMQ worker and in-process poller.
 */
import ThemeExperiment from '../models/ThemeExperiment.js';
import { recordThemeAudit } from '../utils/themeAudit.js';
import { canTransitionExperiment } from '../utils/experimentLifecycle.js';

export const completeExpiredExperiments = async ({ now = new Date() } = {}) => {
    const due = await ThemeExperiment.find({
        status: { $in: ['running', 'scheduled'] },
        endAt: { $exists: true, $ne: null, $lte: now },
    }).limit(100);

    const completed = [];
    for (const experiment of due) {
        const from = experiment.status === 'ended' ? 'completed' : experiment.status;
        if (!canTransitionExperiment(from === 'scheduled' ? 'scheduled' : 'running', 'completed')
            && from !== 'running'
            && from !== 'scheduled'
            && from !== 'paused') {
            // still allow scheduled/running → completed
        }
        // Force complete from running/scheduled
        if (!['running', 'scheduled', 'paused'].includes(experiment.status)) continue;

        // Idempotent: only transition if still open
        const updated = await ThemeExperiment.findOneAndUpdate(
            {
                _id: experiment._id,
                status: { $in: ['running', 'scheduled', 'paused'] },
                endAt: { $lte: now },
            },
            {
                $set: { status: 'completed' },
            },
            { new: true }
        );
        if (!updated) continue;

        await recordThemeAudit({
            storeId: updated.storeId,
            actorId: 'system',
            action: 'EXPERIMENT_AUTO_COMPLETED',
            metadata: {
                experimentId: String(updated._id),
                name: updated.name,
                endAt: updated.endAt,
                from: experiment.status,
            },
        });
        completed.push(String(updated._id));
    }
    return { completed, count: completed.length };
};

export default completeExpiredExperiments;
