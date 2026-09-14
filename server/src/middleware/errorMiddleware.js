// server/src/middleware/errorMiddleware.js
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`Unhandled Exception [${req.method} ${req.originalUrl}]:`, err);

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal system error occurred. Please try again.',
    error: process.env.NODE_ENV === 'production' ? null : {
      name: err.name,
      details: err.details || null
    }
  });
}
