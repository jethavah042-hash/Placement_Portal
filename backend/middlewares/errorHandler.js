const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err);

  if (err instanceof ApiError || err.statusCode) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      details: err.details || [],
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation failed', details: err.errors });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Account with this email already exists' });
  }

  return res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
