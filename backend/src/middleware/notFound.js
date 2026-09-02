const ApiError = require('../utils/ApiError');

// 404 handler for unmatched routes.
function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = notFound;
