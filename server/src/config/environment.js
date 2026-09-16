// server/src/config/environment.js
import dotenv from 'dotenv';
dotenv.config();

function required(name, fallbackForDev) {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return fallbackForDev;
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',

  MONGODB_URI: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/parkguard'),

  JWT_SECRET: required(
    'JWT_SECRET',
    'dev-only-insecure-secret-do-not-use-in-production',
  ),
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
      'Set JWT_SECRET in your .env before deploying.',
  );
}
