const { sendError } = require('../utils/helpers');

function errorMiddleware(err, req, res, next) {
  console.error('API Error:', err);

  const status = err.status || 500;
  const message = err.message || 'An unexpected server error occurred';
  const errors = err.errors || null;

  return sendError(res, message, status, errors);
}

function notFoundMiddleware(req, res) {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
}

module.exports = {
  errorMiddleware,
  notFoundMiddleware,
};
