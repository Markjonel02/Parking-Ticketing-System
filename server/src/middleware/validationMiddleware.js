// server/src/middleware/validationMiddleware.js
export function validateRequest(validatorFn) {
  return (req, res, next) => {
    const { isValid, errors } = validatorFn(req.body);
    if (!isValid) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed for one or more fields.',
        errors
      });
    }
    next();
  };
}
