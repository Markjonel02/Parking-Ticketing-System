// server/src/services/auditService.js
import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';
import { getPagination } from '../utils/pagination.js';

export class AuditService {
  static async log({ user, action, entityType, entityId, details, req }) {
    try {
      const ip = req ? req.ip || req.headers['x-forwarded-for'] || 'unknown' : 'SYSTEM';
      const entry = await AuditLog.create({
        user: user ? user._id : undefined,
        userName: user ? user.name : 'System Scheduler',
        userRole: user ? user.role : 'SYSTEM',
        action,
        entityType,
        entityId,
        details,
        ipAddress: ip,
      });
      logger.info(`AUDIT: [${action}] on ${entityType}:${entityId} by ${user ? user.name : 'SYSTEM'}`);
      return entry;
    } catch (err) {
      // Audit logging failures must never break the primary operation.
      logger.error('Failed to write audit log entry', err);
      return null;
    }
  }

  static async getRecentLogs({ entityType, userId, action, search, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (entityType) filter.entityType = entityType;
    if (userId) filter.user = userId;
    if (action) filter.action = action;
    if (search) filter.$text = { $search: search };

    const { skip, limit: pageSize, buildMeta } = getPagination(page, limit);

    const [logs, totalItems] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(pageSize),
      AuditLog.countDocuments(filter),
    ]);

    return { data: logs, pagination: buildMeta(totalItems) };
  }
}

export default AuditService;
