// server/src/services/auditService.js
import { AuditLogModel } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export class AuditService {
  static async log({ user, action, entityType, entityId, details, req }) {
    try {
      const ip = req ? (req.ip || req.headers['x-forwarded-for'] || '127.0.0.1') : 'SYSTEM';
      const entry = AuditLogModel.create({
        userId: user ? user.id : 'SYSTEM',
        userName: user ? user.name : 'System Scheduler',
        userRole: user ? user.role : 'SYSTEM',
        action,
        entityType,
        entityId,
        details,
        ipAddress: ip
      });
      logger.info(`AUDIT: [${action}] on ${entityType}:${entityId} by ${user ? user.name : 'SYSTEM'}`);
      return entry;
    } catch (err) {
      logger.error('Failed to write audit log entry', err);
    }
  }

  static getRecentLogs(filter = {}) {
    return AuditLogModel.findAll(filter);
  }
}
