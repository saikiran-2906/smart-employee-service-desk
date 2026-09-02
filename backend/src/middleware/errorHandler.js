const config = require('../config');

// Maps common MySQL driver errors to friendly HTTP responses.
function translateDbError(err) {
  switch (err.code) {
    case 'ER_DUP_ENTRY':
      return { statusCode: 409, message: 'A record with the same unique value already exists.' };
    case 'ER_NO_REFERENCED_ROW_2':
    case 'ER_NO_REFERENCED_ROW':
      return { statusCode: 400, message: 'A referenced record (foreign key) does not exist.' };
    case 'ER_ROW_IS_REFERENCED_2':
    case 'ER_ROW_IS_REFERENCED':
      return { statusCode: 409, message: 'This record is referenced by other records and cannot be modified.' };
    case 'ECONNREFUSED':
    case 'ER_ACCESS_DENIED_ERROR':
      return { statusCode: 503, message: 'Database connection error. Please try again later.' };
    default:
      return null;
  }
}

// Central error handler. Must be the LAST middleware registered.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Normalize raw database errors into clean responses.
  if (!err.isOperational && err.code) {
    const translated = translateDbError(err);
    if (translated) {
      statusCode = translated.statusCode;
      message = translated.message;
    }
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', err);
  }

  const body = {
    success: false,
    error: {
      message,
      ...(details ? { details } : {}),
    },
  };

  // Expose stack traces only outside of production.
  if (config.env !== 'production' && statusCode >= 500) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
