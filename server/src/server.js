// server/src/server.js
import { createApp } from './app.js';
import { connectDB } from './config/database.js';
import { ENV } from './config/environment.js';
import { logger } from './utils/logger.js';
import { startOverdueTicketsScheduler } from './jobs/overdueTicketsJob.js';
import { startReportCleanupScheduler } from './jobs/reportCleanupJob.js';

const app = createApp();

async function start() {
  await connectDB();

  startOverdueTicketsScheduler(120000);
  startReportCleanupScheduler(3600000);

  if (process.env.STANDALONE_SERVER === 'true') {
    app.listen(ENV.PORT, '0.0.0.0', () => {
      logger.info(`ParkGuard API Server running standalone at http://0.0.0.0:${ENV.PORT}`);
    });
  }
}

start().catch((err) => {
  logger.error('Fatal error during server startup — is MongoDB reachable at MONGODB_URI?', err);
  process.exit(1);
});

export { app };
