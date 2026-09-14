// server/src/middleware/rateLimitMiddleware.js
const requestCounts = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 180; // 180 requests per min

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const now = Date.now();

  const record = requestCounts.get(ip) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + WINDOW_MS;
  } else {
    record.count += 1;
  }

  requestCounts.set(ip, record);

  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Too many requests, please slow down.'
    });
  }

  next();
}
