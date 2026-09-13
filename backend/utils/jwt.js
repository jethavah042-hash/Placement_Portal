const jwt = require('jsonwebtoken');

const JWT_SECRET =
  process.env.JWT_SECRET || 'fallback_placement_portal_jwt_secret_key_2026_production';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'fallback_placement_portal_jwt_refresh_secret_key_2026_production';

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
}

function signRefreshToken(payload, rememberMe) {
  const expiresIn = rememberMe
    ? process.env.JWT_REFRESH_EXPIRES_LONG || '30d'
    : process.env.JWT_REFRESH_EXPIRES_SHORT || '1d';
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
