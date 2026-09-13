const { isValidEmail, isStrongPassword } = require('../utils/password');
const ApiError = require('../utils/ApiError');

const validateLogin = (req, res, next) => {
  const { email, password, role } = req.body;
  if (!isValidEmail(email)) return next(new ApiError(400, 'A valid email is required'));
  if (!password || typeof password !== 'string') return next(new ApiError(400, 'Password is required'));
  if (role && !['student', 'admin'].includes(role)) return next(new ApiError(400, 'Invalid role selection'));
  next();
};

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || name.trim().length < 2) return next(new ApiError(400, 'Name is required'));
  if (!isValidEmail(email)) return next(new ApiError(400, 'A valid email is required'));
  if (!isStrongPassword(password))
    return next(
      new ApiError(400, 'Password must be 8+ chars with uppercase, lowercase, number and symbol')
    );
  next();
};

const validateNewPassword = (req, res, next) => {
  const { password } = req.body;
  if (!isStrongPassword(password))
    return next(
      new ApiError(400, 'Password must be 8+ chars with uppercase, lowercase, number and symbol')
    );
  next();
};

module.exports = { validateLogin, validateRegister, validateNewPassword };
