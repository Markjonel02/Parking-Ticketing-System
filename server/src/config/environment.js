// server/src/config/environment.js
import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/parkguard',
  JWT_SECRET: process.env.JWT_SECRET || 'parkguard-enterprise-secure-key-2026',
  TOKEN_EXPIRY: '24h',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 mins
  RATE_LIMIT_MAX_REQUESTS: 300,
};
