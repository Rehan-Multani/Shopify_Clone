/**
 * Experiment endAt auto-completion.
 * Uses BullMQ when Redis is available; otherwise a safe in-process poller (dev).
 * Do not add a second queue system.
 */
import { Queue, Worker } from 'bullmq';
import { getRedisClient, getRedisBackend, isProductionEnv } from '../utils/redisClient.js';
import { completeExpiredExperiments } from './experimentAutoComplete.js';

const QUEUE_NAME = 'theme-experiment-autocomplete';
let queue = null;
let worker = null;
let poller = null;

export const startExperimentAutoCompleteJobs = async () => {
    const backend = getRedisBackend();
    const connection = getRedisClient();

    if (backend === 'redis' && connection) {
        try {
            queue = new Queue(QUEUE_NAME, { connection });
            worker = new Worker(
                QUEUE_NAME,
                async () => completeExpiredExperiments(),
                { connection, concurrency: 1 }
            );
            worker.on('failed', (job, err) => {
                console.error('[ExperimentAutoComplete] job failed:', err.message);
            });

            // Repeatable every 60s
            await queue.add(
                'scan-expired',
                {},
                {
                    repeat: { every: 60_000 },
                    removeOnComplete: 20,
                    removeOnFail: 50,
                    jobId: 'experiment-autocomplete-scan',
                }
            );
            console.log('[ExperimentAutoComplete] BullMQ worker started');
            return { mode: 'bullmq' };
        } catch (err) {
            console.warn('[ExperimentAutoComplete] BullMQ failed, using poller:', err.message);
        }
    }

    if (isProductionEnv() && backend !== 'redis') {
        console.warn('[ExperimentAutoComplete] Redis unavailable in production — starting fallback poller');
    }

    if (poller) clearInterval(poller);
    poller = setInterval(() => {
        completeExpiredExperiments().catch((err) => {
            console.error('[ExperimentAutoComplete] poller:', err.message);
        });
    }, 60_000);
    // Run once on boot
    completeExpiredExperiments().catch(() => {});
    console.log('[ExperimentAutoComplete] in-process poller started');
    return { mode: 'poller' };
};

export const stopExperimentAutoCompleteJobs = async () => {
    if (poller) {
        clearInterval(poller);
        poller = null;
    }
    if (worker) {
        await worker.close();
        worker = null;
    }
    if (queue) {
        await queue.close();
        queue = null;
    }
};

export default startExperimentAutoCompleteJobs;
