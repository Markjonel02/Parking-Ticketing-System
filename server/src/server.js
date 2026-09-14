// server/src/server.js
import { createApp } from './app.js';
import { ENV } from './config/environment.js';
import { logger } from './utils/logger.js';
import { startOverdueTicketsScheduler } from './jobs/overdueTicketsJob.js';
import { startReportCleanupScheduler } from './jobs/reportCleanupJob.js';

const app = createApp();
const PORT = ENV.PORT || 3000;

startOverdueTicketsScheduler(120000); // Check overdue citations every 2 mins
startReportCleanupScheduler(3600000);

if (process.env.STANDALONE_SERVER === 'true') {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`ParkGuard API Server running standalone at http://0.0.0.0:${PORT}`);
  });
}

export { app };
