import './utils/loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../../shared/connectDB.js';
import { initTransactionalEmail } from '../../shared/transactionalEmail.js';
import app from './app.js';
import { assertProductionEnvOrExit } from './utils/prodEnv.js';

assertProductionEnvOrExit();

// Connect to database
await connectDB(mongoose);

await initTransactionalEmail(mongoose);

const PORT = process.env.PORT || 5004;

const server = app.listen(PORT, async () => {
    console.log(`Store service running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    try {
        const { default: startExperimentAutoCompleteJobs } = await import('./jobs/experimentJobRunner.js');
        await startExperimentAutoCompleteJobs();
    } catch (err) {
        console.warn('[Store Service] experiment jobs:', err.message);
    }
});

// Log rejections — do not kill store-service (Redis/BullMQ blips must not 502 my-stores)
process.on('unhandledRejection', (err) => {
    console.error(`Store Service unhandledRejection: ${err?.message || err}`);
});
