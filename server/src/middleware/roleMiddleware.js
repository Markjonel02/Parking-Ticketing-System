// server/src/middleware/roleMiddleware.js
import { ROLE_PERMISSIONS } from '../constants/roles.js';
import { ApiError } from '../utils/ApiError.js';

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required before role verification.'));
    }

    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return next(
      ApiError.forbidden(
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      ),
    );
  };
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    const perms = ROLE_PERMISSIONS[req.user.role] || [];
    if (perms.includes('all') || perms.includes(permission)) {
      return next();
    }

    return next(ApiError.forbidden(`Missing required permission: [${permission}].`));
  };
}
