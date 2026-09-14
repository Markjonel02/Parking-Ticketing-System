// server/src/middleware/roleMiddleware.js
import { ROLE_PERMISSIONS } from '../constants/roles.js';

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role verification.'
      });
    }

    if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
    });
  };
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const perms = ROLE_PERMISSIONS[req.user.role] || [];
    if (perms.includes('all') || perms.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Forbidden: Missing required permission [${permission}].`
    });
  };
}
