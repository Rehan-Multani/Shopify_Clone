import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const start = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`[server] Storify API listening on http://localhost:${env.port}${env.apiPrefix}`);
    console.log(`[server] Environment: ${env.nodeEnv}`);
  });

  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (err) => {
    console.error('[server] Unhandled rejection:', err);
  });
  process.on('uncaughtException', (err) => {
    console.error('[server] Uncaught exception:', err);
    server.close(() => process.exit(1));
  });
};

start();
