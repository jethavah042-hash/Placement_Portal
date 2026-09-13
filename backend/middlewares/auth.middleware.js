const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const authMiddleware = asyncHandler(async (req, res, next) => {
  // Support both new 'accessToken' cookie and legacy 'token' cookie
  let token = req.cookies?.accessToken || req.cookies?.token;

  // Also support Authorization: Bearer header for API clients
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) throw new ApiError(401, 'Not authenticated');

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, 'Session expired, please log in again');
  }

  const user = await User.findById(decoded.sub || decoded.id);
  if (!user || (user.accountStatus && user.accountStatus !== 'active') || user.isBlocked) {
    throw new ApiError(401, 'Account not accessible');
  }

  req.user = user;
  next();
});

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden: Administrator privileges required to access this resource');
  }
  next();
};

module.exports = authMiddleware;
module.exports.protect = authMiddleware;
module.exports.requireAdmin = requireAdmin;
module.exports.admin = requireAdmin;
