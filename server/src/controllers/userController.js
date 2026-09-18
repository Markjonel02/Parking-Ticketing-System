// server/src/controllers/userController.js
import { User } from '../models/User.js';
import { AuditService } from '../services/auditService.js';
import { getPagination } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function buildUserFilter({ role, status, search }) {
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };
  return filter;
}

export class UserController {
  static getUsers = asyncHandler(async (req, res) => {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    const filter = buildUserFilter({ role, status, search });
    const { skip, limit: pageSize, buildMeta } = getPagination(page, limit);

    const [users, totalItems] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      User.countDocuments(filter),
    ]);

    return res.json({ success: true, data: users, pagination: buildMeta(totalItems) });
  });

  static getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound('Staff member not found.');
    return res.json({ success: true, data: user });
  });

  static createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, badgeNumber, phone, department } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw ApiError.conflict('A staff member with this email already exists.');
    }

    // Password hashing happens in the User model's pre-save hook.
    const created = await User.create({
      name,
      email,
      password,
      role,
      badgeNumber,
      phone,
      department,
    });

    await AuditService.log({
      user: req.user,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: created._id,
      details: `Created new staff account for ${created.name} as ${created.role}.`,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Staff profile provisioned.',
      data: created.toJSON(),
    });
  });

  static updateUser = asyncHandler(async (req, res) => {
    const { password, ...rest } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound('User not found.');

    const wasActiveAdmin = user.role === 'ADMIN' && user.status === 'ACTIVE';

    Object.assign(user, rest);
    if (password) {
      user.password = password; // re-hashed by pre-save hook
    }

    // updateUser can also change role/status directly (e.g. from an edit
    // form), which would otherwise bypass the same guard in toggleStatus.
    const willBeActiveAdmin = user.role === 'ADMIN' && user.status === 'ACTIVE';
    if (wasActiveAdmin && !willBeActiveAdmin) {
      const otherActiveAdmins = await User.countDocuments({
        role: 'ADMIN',
        status: 'ACTIVE',
        _id: { $ne: user._id },
      });
      if (otherActiveAdmins === 0) {
        throw ApiError.conflict(
          'Cannot change the role or status of the last active administrator account. Promote another staff member to ADMIN first.'
        );
      }
    }

    await user.save();

    await AuditService.log({
      user: req.user,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: user._id,
      details: `Updated staff profile for ${user.name}.`,
      req,
    });

    return res.json({ success: true, message: 'Staff profile updated.', data: user.toJSON() });
  });

  static toggleStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound('User not found.');

    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    // Never allow the system to end up with zero active admins — that
    // would lock everyone out of admin-only actions (staff management,
    // reports, etc.) with no way back in short of a direct DB edit.
    if (nextStatus === 'SUSPENDED' && user.role === 'ADMIN') {
      const otherActiveAdmins = await User.countDocuments({
        role: 'ADMIN',
        status: 'ACTIVE',
        _id: { $ne: user._id },
      });
      if (otherActiveAdmins === 0) {
        throw ApiError.conflict(
          'Cannot suspend the last active administrator account. Promote another staff member to ADMIN first.'
        );
      }
    }

    user.status = nextStatus;
    await user.save();

    await AuditService.log({
      user: req.user,
      action: 'USER_STATUS_TOGGLED',
      entityType: 'USER',
      entityId: user._id,
      details: `Account status for ${user.name} changed to ${user.status}.`,
      req,
    });

    return res.json({
      success: true,
      message: `User status changed to ${user.status}.`,
      data: user.toJSON(),
    });
  });
}

export default UserController;
