// server/src/utils/logger.js
export const logger = {
  info: (msg, meta = {}) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? meta : '');
  },
  warn: (msg, meta = {}) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? meta : '');
  },
  error: (msg, error = {}) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, error.message || error);
  },
  debug: (msg, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] [${new Date().toISOString()}] ${msg}`, meta);
    }
  }
};
