// server/src/middleware/errorMiddleware.js
import { logger } from '../utils/logger.js';
import { ENV } from '../config/environment.js';

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An internal server error occurred.';
  let errors = err.errors || null;

  // Translate common Mongoose errors into clean, expected API responses
  // instead of leaking driver internals to the client.
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed for one or more fields.';
    errors = Object.fromEntries(
      Object.entries(err.errors || {}).map(([field, e]) => [field, e.message]),
    );
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  if (statusCode >= 500) {
    logger.error(`Unhandled Exception [${req.method} ${req.originalUrl}]:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(ENV.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
