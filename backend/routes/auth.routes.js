const express = require('express');
const passport = require('passport');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validateLogin, validateRegister, validateNewPassword } = require('../middlewares/validate');
const {
  loginLimiter,
  otpLimiter,
  resendOtpLimiter,
  forgotPasswordLimiter,
} = require('../middlewares/rateLimiter');

router.post('/register', validateRegister, authController.register);
router.post('/login', loginLimiter, validateLogin, authController.login);
router.post('/verify-otp', otpLimiter, authController.verifyOtp);
router.post('/resend-otp', resendOtpLimiter, authController.resendOtp);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);

router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', validateNewPassword, authController.resetPassword);

const getClientBaseUrl = (req) => {
  if (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost')) {
    return process.env.CLIENT_URL.split(',')[0].trim().replace(/\/+$/, '');
  }
  if (req && req.headers && req.headers.origin) {
    return req.headers.origin.replace(/\/+$/, '');
  }
  if (req && req.headers && req.headers.referer) {
    try {
      const u = new URL(req.headers.referer);
      return `${u.protocol}//${u.host}`;
    } catch (e) {}
  }
  return (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/+$/, '');
};

// Google OAuth
const handleGoogleAuth = (req, res, next) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!googleClientId || !googleClientSecret) {
    return res.redirect(`${getClientBaseUrl(req)}/login?error=Google+login+is+not+configured`);
  }
  const callbackURL =
    process.env.GOOGLE_CALLBACK_URL?.trim() ||
    `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}/api/auth/google/callback`;

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    callbackURL,
  })(req, res, next);
};

const handleGoogleCallback = (req, res, next) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!googleClientId || !googleClientSecret) {
    return res.redirect(`${getClientBaseUrl(req)}/login?error=Google+login+is+not+configured`);
  }
  const callbackURL =
    process.env.GOOGLE_CALLBACK_URL?.trim() ||
    `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}/api/auth/google/callback`;

  passport.authenticate('google', {
    session: false,
    callbackURL,
    failureRedirect: `${getClientBaseUrl(req)}/login?error=google`,
  })(req, res, () => authController.oauthSuccess(req, res, next));
};

router.get('/google', handleGoogleAuth);
router.get('/google/callback', handleGoogleCallback);

// GitHub OAuth
const handleGithubAuth = (req, res, next) => {
  const githubClientId = process.env.GITHUB_CLIENT_ID?.trim();
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!githubClientId || !githubClientSecret) {
    return res.redirect(`${getClientBaseUrl(req)}/login?error=GitHub+login+is+not+configured`);
  }
  const callbackURL =
    process.env.GITHUB_CALLBACK_URL?.trim() ||
    `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}/api/auth/github/callback`;

  passport.authenticate('github', {
    scope: ['user:email'],
    session: false,
    callbackURL,
  })(req, res, next);
};

const handleGithubCallback = (req, res, next) => {
  const githubClientId = process.env.GITHUB_CLIENT_ID?.trim();
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!githubClientId || !githubClientSecret) {
    return res.redirect(`${getClientBaseUrl(req)}/login?error=GitHub+login+is+not+configured`);
  }
  const callbackURL =
    process.env.GITHUB_CALLBACK_URL?.trim() ||
    `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}/api/auth/github/callback`;

  passport.authenticate('github', {
    session: false,
    callbackURL,
    failureRedirect: `${getClientBaseUrl(req)}/login?error=github`,
  })(req, res, () => authController.oauthSuccess(req, res, next));
};

router.get('/github', handleGithubAuth);
router.get('/github/callback', handleGithubCallback);

module.exports = router;
