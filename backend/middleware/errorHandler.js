// middleware/errorHandler.js
//
// Centralized error handler. Controllers call next(err) when
// something goes wrong, and Express routes it here instead of
// every controller having to format its own error response.
//
// This is what keeps raw database errors from leaking to the
// frontend (see project rule: "never expose raw database errors").

function errorHandler(err, req, res, next) {
    console.error('Error:', err.message); // full detail stays in the server log

    // If a controller attached a specific status code, use it.
    // Otherwise default to 500 (unexpected server/database error).
    const statusCode = err.statusCode || 500;

    const message = statusCode === 500
        ? 'Something went wrong on the server. Please try again later.'
        : err.message;

    res.status(statusCode).json({ message });
}

module.exports = errorHandler;
