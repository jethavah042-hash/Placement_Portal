const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Otp = require('../models/Otp');
const RefreshToken = require('../models/RefreshToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateOtp, hashOtp, compareOtp } = require('../utils/otp');
const { sendOtpEmail, sendResetEmail } = require('../utils/email');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000,
  path: '/',
};

function refreshCookieOpts(rememberMe) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    path: '/api/auth',
  };
}

async function issueTokens(res, user, rememberMe) {
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ sub: user._id.toString() }, rememberMe);
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ userId: user._id, tokenHash, expiresAt });
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTS);
  res.cookie('refreshToken', refreshToken, refreshCookieOpts(rememberMe));
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'An account with this email already exists');
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: 'student',
    authProvider: 'local',
    accountStatus: 'active',
  });
  await issueTokens(res, user, false);
  res.status(201).json({ success: true, user: user.toSafeJSON() });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password, role, rememberMe } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.password) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (user.isLocked()) {
    const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new ApiError(423, `Account temporarily locked. Try again in ${mins} minute(s).`);
  }
  if (user.accountStatus !== 'active') {
    throw new ApiError(403, 'Account is not active. Contact support.');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    throw new ApiError(401, 'Invalid email or password');
  }
  if (role && user.role !== role) {
    throw new ApiError(403, `Selected role (${role}) does not match this account (${user.role})`);
  }
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();
  if (user.isTwoFactorEnabled) {
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    await Otp.deleteMany({ userId: user._id, purpose: 'login_2fa' });
    await Otp.create({
      userId: user._id,
      otpHash,
      purpose: 'login_2fa',
      expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRES_MIN || 5) * 60 * 1000),
    });
    await sendOtpEmail(user.email, otp);
    return res.json({
      success: true,
      twoFactorRequired: true,
      userId: user._id,
      rememberMe: !!rememberMe,
      message: 'OTP sent to your registered email',
    });
  }
  await issueTokens(res, user, !!rememberMe);
  res.json({ success: true, user: user.toSafeJSON() });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp, rememberMe } = req.body;
  if (!userId || !otp) throw new ApiError(400, 'userId and otp are required');
  const otpDoc = await Otp.findOne({ userId, purpose: 'login_2fa', consumed: false }).sort({ createdAt: -1 });
  if (!otpDoc) throw new ApiError(400, 'OTP expired or not found. Please request a new one.');
  if (otpDoc.expiresAt < new Date()) {
    await otpDoc.deleteOne();
    throw new ApiError(400, 'OTP expired. Please request a new one.');
  }
  if (otpDoc.attempts >= Number(process.env.OTP_MAX_ATTEMPTS || 5)) {
    await otpDoc.deleteOne();
    throw new ApiError(429, 'Too many incorrect attempts. Please request a new OTP.');
  }
  const isMatch = await compareOtp(otp, otpDoc.otpHash);
  if (!isMatch) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    throw new ApiError(400, 'Incorrect OTP');
  }
  otpDoc.consumed = true;
  await otpDoc.save();
  await Otp.deleteMany({ userId, purpose: 'login_2fa' });
  const user = await User.findById(userId);
  if (!user || user.accountStatus !== 'active') throw new ApiError(403, 'Account not accessible');
  await issueTokens(res, user, !!rememberMe);
  res.json({ success: true, user: user.toSafeJSON() });
});

exports.resendOtp = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  const lastOtp = await Otp.findOne({ userId, purpose: 'login_2fa' }).sort({ createdAt: -1 });
  if (lastOtp) {
    const secondsSince = (Date.now() - lastOtp.lastSentAt.getTime()) / 1000;
    if (secondsSince < Number(process.env.OTP_RESEND_COOLDOWN_SEC || 60)) {
      const wait = Math.ceil(Number(process.env.OTP_RESEND_COOLDOWN_SEC || 60) - secondsSince);
      throw new ApiError(429, `Please wait ${wait}s before requesting another OTP.`);
    }
  }
  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  await Otp.deleteMany({ userId, purpose: 'login_2fa' });
  await Otp.create({
    userId,
    otpHash,
    purpose: 'login_2fa',
    expiresAt: new Date(Date.now() + Number(process.env.OTP_EXPIRES_MIN || 5) * 60 * 1000),
    lastSentAt: new Date(),
  });
  await sendOtpEmail(user.email, otp);
  res.json({ success: true, message: 'A new OTP has been sent to your email' });
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token provided');
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const stored = await RefreshToken.findOne({ userId: decoded.sub, tokenHash, revoked: false });
  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Session expired, please log in again');
  }
  const user = await User.findById(decoded.sub);
  if (!user || user.accountStatus !== 'active') throw new ApiError(401, 'Account not accessible');
  stored.revoked = true;
  await stored.save();
  const rememberMe = stored.expiresAt - stored.createdAt > 2 * 24 * 60 * 60 * 1000;
  await issueTokens(res, user, rememberMe);
  res.json({ success: true, message: 'Token refreshed' });
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await RefreshToken.updateOne({ tokenHash }, { revoked: true });
  }
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ success: true, message: 'Logged out' });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase(), authProvider: 'local' });
  const genericResponse = {
    success: true,
    message: 'If an account exists for this email, a reset link has been sent.',
  };
  if (!user) return res.json(genericResponse);
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await PasswordResetToken.deleteMany({ userId: user._id });
  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + Number(process.env.RESET_TOKEN_EXPIRES_MIN || 30) * 60 * 1000),
  });
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}&uid=${user._id}`;
  await sendResetEmail(user.email, resetUrl);
  res.json(genericResponse);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { userId, token, password } = req.body;
  if (!userId || !token || !password) throw new ApiError(400, 'Missing required fields');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const resetDoc = await PasswordResetToken.findOne({ userId, tokenHash, used: false });
  if (!resetDoc || resetDoc.expiresAt < new Date()) {
    throw new ApiError(400, 'Reset link is invalid or has expired');
  }
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');
  user.password = await bcrypt.hash(password, 12);
  user.passwordChangedAt = new Date();
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();
  resetDoc.used = true;
  await resetDoc.save();
  await RefreshToken.updateMany({ userId }, { revoked: true });
  res.json({ success: true, message: 'Password has been reset. Please log in.' });
});

exports.oauthSuccess = asyncHandler(async (req, res) => {
  const user = req.user;
  await issueTokens(res, user, true);
  res.redirect(`${process.env.CLIENT_URL}/oauth-success?role=${user.role}`);
});
