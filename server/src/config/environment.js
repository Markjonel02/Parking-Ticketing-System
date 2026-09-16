// server/src/config/environment.js
import dotenv from 'dotenv';
dotenv.config();

import { decryptWithPassword } from '../utils/secretCrypto.js';

function required(name, fallbackForDev) {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return fallbackForDev;
}

/**
 * Resolves the JWT signing secret. Two supported setups:
 *
 * 1. Encrypted at rest (recommended for anything beyond local dev):
 *    JWT_SECRET_ENCRYPTED holds a "salt:iv:ciphertext" blob (produced by
 *    scripts/generate-jwt-secret.js) and SECRET_ENCRYPTION_PASSWORD holds
 *    the master password that unlocks it. SECRET_ENCRYPTION_PASSWORD
 *    should be injected by your process manager / secrets store, not
 *    committed alongside JWT_SECRET_ENCRYPTED in the same .env file —
 *    otherwise the encryption buys nothing.
 *
 * 2. Plain JWT_SECRET env var — simpler, fine for local development.
 *
 * If neither is configured, the app refuses to start in production and
 * falls back to an insecure, clearly-labeled dev default otherwise.
 */
function resolveJwtSecret() {
  const encryptedSecret = process.env.JWT_SECRET_ENCRYPTED;
  const encryptionPassword = process.env.SECRET_ENCRYPTION_PASSWORD;

  if (encryptedSecret) {
    if (!encryptionPassword) {
      throw new Error(
        'JWT_SECRET_ENCRYPTED is set but SECRET_ENCRYPTION_PASSWORD is missing — cannot decrypt the JWT secret.',
      );
    }
    try {
      return decryptWithPassword(encryptionPassword, encryptedSecret);
    } catch (err) {
      throw new Error(`Failed to decrypt JWT_SECRET_ENCRYPTED: ${err.message}`);
    }
  }

  return required('JWT_SECRET', 'dev-only-insecure-secret-do-not-use-in-production');
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',

  MONGODB_URI: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/parkguard'),

  JWT_SECRET: resolveJwtSecret(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',

  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 mins
  RATE_LIMIT_MAX_REQUESTS: 300,
};

if (ENV.NODE_ENV !== 'production' && ENV.JWT_SECRET === 'dev-only-insecure-secret-do-not-use-in-production') {
  // eslint-disable-next-line no-console
  console.warn(
    '[config] JWT_SECRET is not set — using an insecure development default. ' +
      'Run scripts/generate-jwt-secret.js (or set JWT_SECRET) before deploying.',
  );
}
