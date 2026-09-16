// server/src/utils/jwt.js
import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment.js';

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ENV.JWT_SECRET);
}
