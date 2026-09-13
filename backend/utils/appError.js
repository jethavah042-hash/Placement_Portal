// Backward-compatible shim — old controllers call new AppError(message, statusCode)
// while ApiError uses new ApiError(statusCode, message)
const ApiError = require('./ApiError');

class AppError extends ApiError {
  constructor(message, statusCode) {
    super(statusCode, message);
  }
}

module.exports = AppError;
