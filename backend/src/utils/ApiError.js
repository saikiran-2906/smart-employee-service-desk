// Small typed error carrying an HTTP status code so controllers/services
// can throw meaningful errors that the central error handler understands.
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new ApiError(403, message);
  }

  static unauthorized(message = 'Authentication required.') {
    return new ApiError(401, message);
  }
}

module.exports = ApiError;
