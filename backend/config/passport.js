const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL?.trim();

if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              user.profileImage = user.profileImage || profile.photos?.[0]?.value;
              await user.save();
            }
          } else {
            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              profileImage: profile.photos?.[0]?.value,
              authProvider: 'google',
              role: 'student',
              isEmailVerified: true,
              accountStatus: 'active',
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

const githubClientId = process.env.GITHUB_CLIENT_ID?.trim();
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
const githubCallbackUrl = process.env.GITHUB_CALLBACK_URL?.trim();

if (githubClientId && githubClientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: githubClientId,
        clientSecret: githubClientSecret,
        callbackURL: githubCallbackUrl || '/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.[0]?.value?.toLowerCase() || `${profile.username}@users.noreply.github.com`;
          let user = await User.findOne({ $or: [{ githubId: profile.id }, { email }] });

          if (user) {
            if (!user.githubId) {
              user.githubId = profile.id;
              user.profileImage = user.profileImage || profile.photos?.[0]?.value;
              await user.save();
            }
          } else {
            user = await User.create({
              name: profile.displayName || profile.username,
              email,
              githubId: profile.id,
              profileImage: profile.photos?.[0]?.value,
              authProvider: 'github',
              role: 'student',
              isEmailVerified: true,
              accountStatus: 'active',
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

module.exports = passport;
