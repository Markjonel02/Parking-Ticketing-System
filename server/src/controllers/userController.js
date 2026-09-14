// server/src/controllers/userController.js
import { UserModel } from '../models/User.js';
import { AuditService } from '../services/auditService.js';
import { paginate } from '../utils/pagination.js';

export class UserController {
  static async getUsers(req, res, next) {
    try {
      const { role, status, search, page = 1, limit = 10 } = req.query;
      const users = UserModel.findAll({ role, status, search });
      const result = paginate(users, page, limit);
      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const user = UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Staff member not found' });
      }
      return res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req, res, next) {
    try {
      const existing = UserModel.findByEmail(req.body.email);
      if (existing) {
        return res.status(409).json({ success: false, message: 'A staff member with this email already exists' });
      }

      const created = UserModel.create(req.body);
      await AuditService.log({
        user: req.user,
        action: 'USER_CREATED',
        entityType: 'USER',
        entityId: created.id,
        details: `Created new staff account for ${created.name} as ${created.role}`,
        req
      });

      return res.status(201).json({
        success: true,
        message: 'Staff profile provisioned',
        data: created
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const updated = UserModel.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await AuditService.log({
        user: req.user,
        action: 'USER_UPDATED',
        entityType: 'USER',
        entityId: updated.id,
        details: `Updated staff profile for ${updated.name}`,
        req
      });

      return res.json({ success: true, message: 'Staff profile updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async toggleStatus(req, res, next) {
    try {
      const user = UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const updated = UserModel.update(user.id, { status: newStatus });

      await AuditService.log({
        user: req.user,
        action: 'USER_STATUS_TOGGLED',
        entityType: 'USER',
        entityId: user.id,
        details: `Account status for ${user.name} changed to ${newStatus}`,
        req
      });

      return res.json({ success: true, message: `User status changed to ${newStatus}`, data: updated });
    } catch (err) {
      next(err);
    }
  }
}
