// server/src/models/AuditLog.js
import { db } from '../config/database.js';

export class AuditLogModel {
  static findAll(filter = {}) {
    return db.find('auditLogs', (log) => {
      if (filter.entityType && log.entityType !== filter.entityType) return false;
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.action && log.action !== filter.action) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          (log.userName && log.userName.toLowerCase().includes(q)) ||
          (log.details && log.details.toLowerCase().includes(q)) ||
          (log.entityId && log.entityId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  static create(logData) {
    return db.insert('auditLogs', {
      ...logData,
      timestamp: logData.timestamp || new Date().toISOString()
    });
  }
}
