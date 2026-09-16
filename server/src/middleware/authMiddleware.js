// server/src/middleware/authMiddleware.js
import { User } from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verifies the Bearer JWT on the request, loads the corresponding user
 * from the database, and attaches it to req.user. There is no "no header
 * = demo admin" fallback: a missing or invalid token is always rejected.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token was not provided.');
  }

  const token = authHeader.slice('Bearer '.length).trim();

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired authentication token.');
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw ApiError.unauthorized('The account for this token no longer exists.');
  }

  if (user.status === 'SUSPENDED') {
    throw ApiError.forbidden('This account has been administratively suspended.');
  }

  if (user.status === 'INACTIVE') {
    throw ApiError.forbidden('This account is inactive.');
  }

  req.user = user;
  next();
});

/**
 * Like authenticate, but does not reject the request when no/invalid
 * token is present — useful for endpoints that are public but behave
 * differently for a logged-in caller (none currently used, kept for
 * forward compatibility rather than duplicating auth logic).
 */
export const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return next();

  try {
    const payload = verifyAccessToken(authHeader.slice('Bearer '.length).trim());
    const user = await User.findById(payload.sub);
    if (user && user.status === 'ACTIVE') {
      req.user = user;
    }
  } catch {
    // Ignore invalid tokens on optional-auth routes.
  }
  next();
});
