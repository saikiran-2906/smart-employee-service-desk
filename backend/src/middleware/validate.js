const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs a list of express-validator chains, then aggregates any errors
// into a single 400 response with field-level details.
const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const details = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  return next(ApiError.badRequest('Validation failed', details));
};

module.exports = validate;
