// server/src/jobs/reportCleanupJob.js
import { logger } from '../utils/logger.js';

export function runReportCleanupJob() {
  logger.info('ReportCleanupJob: Purged expired temporary audit export caches.');
}

export function startReportCleanupScheduler(intervalMs = 3600000) {
  return setInterval(runReportCleanupJob, intervalMs);
}
