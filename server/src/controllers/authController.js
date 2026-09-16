// server/src/controllers/authController.js
import { User } from '../models/User.js';
import { signAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuditService } from '../services/auditService.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export class AuthController {
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // select('+password ...') because the schema excludes these by default.
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+password +failedLoginAttempts +lockedUntil',
    );

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (user.isLocked()) {
      throw ApiError.forbidden(
        'This account is temporarily locked due to repeated failed login attempts. Try again later.',
      );
    }

    if (user.status === 'SUSPENDED') {
      throw ApiError.forbidden('This account has been administratively suspended.');
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      }
      await user.save({ validateBeforeSave: false });
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (user.status === 'INACTIVE') {
      throw ApiError.forbidden('This account is inactive. Contact an administrator.');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signAccessToken(user);

    await AuditService.log({
      user,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user._id,
      details: `${user.name} (${user.role}) logged in successfully.`,
      req,
    });

    return res.json({
      success: true,
      message: 'Authentication successful.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  });

  static getCurrentUser = asyncHandler(async (req, res) => {
    return res.json({ success: true, data: req.user });
  });

  static forgotPassword = asyncHandler(async (req, res) => {
    // Always respond identically whether or not the email exists, to
    // avoid leaking which accounts are registered (account enumeration).
    // Actual password-reset delivery (email/SMS) is not wired up yet —
    // this endpoint intentionally does not claim to have sent anything.
    return res.json({
      success: true,
      message:
        'If that email is registered, an administrator will need to help you regain access. Password reset delivery is not yet configured for this deployment — please contact your system administrator.',
    });
  });

  static logout = asyncHandler(async (req, res) => {
    if (req.user) {
      await AuditService.log({
        user: req.user,
        action: 'USER_LOGOUT',
        entityType: 'USER',
        entityId: req.user._id,
        details: `${req.user.name} signed out.`,
        req,
      });
    }
    // JWTs are stateless — logging out is a client-side action (discard the
    // token). We record the audit event but there is nothing server-side
    // to invalidate without a token blocklist, which this deployment does
    // not maintain.
    return res.json({ success: true, message: 'Logged out successfully.' });
  });
}

export default AuthController;
