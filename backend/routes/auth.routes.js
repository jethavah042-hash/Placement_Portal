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

// Google OAuth
const handleGoogleAuth = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=Google+login+is+not+configured`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
};

const handleGoogleCallback = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=Google+login+is+not+configured`);
  }
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google`,
  })(req, res, () => authController.oauthSuccess(req, res, next));
};

router.get('/google', handleGoogleAuth);
router.get('/google/callback', handleGoogleCallback);

// GitHub OAuth
const handleGithubAuth = (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=GitHub+login+is+not+configured`);
  }
  passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next);
};

const handleGithubCallback = (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=GitHub+login+is+not+configured`);
  }
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=github`,
  })(req, res, () => authController.oauthSuccess(req, res, next));
};

router.get('/github', handleGithubAuth);
router.get('/github/callback', handleGithubCallback);

module.exports = router;
