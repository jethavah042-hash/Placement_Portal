const dns = require('dns');

// Configure reliable DNS servers for MongoDB Atlas SRV resolution across all ISPs & Node.js scripts
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
} catch (e) {}

require('dotenv').config();

process.env.MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
process.env.MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
process.env.JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
process.env.JWT_REFRESH_EXPIRES_SHORT = process.env.JWT_REFRESH_EXPIRES_SHORT || '1d';
process.env.JWT_REFRESH_EXPIRES_LONG = process.env.JWT_REFRESH_EXPIRES_LONG || '30d';
process.env.OTP_EXPIRES_MIN = process.env.OTP_EXPIRES_MIN || '5';
process.env.OTP_MAX_ATTEMPTS = process.env.OTP_MAX_ATTEMPTS || '5';
process.env.OTP_RESEND_COOLDOWN_SEC = process.env.OTP_RESEND_COOLDOWN_SEC || '60';
process.env.RESET_TOKEN_EXPIRES_MIN = process.env.RESET_TOKEN_EXPIRES_MIN || '30';

module.exports = process.env;
