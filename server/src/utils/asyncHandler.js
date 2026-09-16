// server/src/utils/asyncHandler.js
/**
 * Wraps an async Express handler so any rejected promise is forwarded to
 * next(err) automatically, instead of every controller repeating the same
 * try/catch block.
 */
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;
