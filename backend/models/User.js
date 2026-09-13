const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/, 'Invalid email address'],
    },
    password: {
      type: String,
      required: function () {
        return (this.authProvider || 'local') === 'local';
      },
      select: false,
    },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },

    googleId: { type: String, index: true, sparse: true },
    githubId: { type: String, index: true, sparse: true },
    profileImage: { type: String },
    avatar: { type: String, default: 'default.jpg' },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },

    isEmailVerified: { type: Boolean, default: false },
    isTwoFactorEnabled: { type: Boolean, default: false },

    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'disabled'],
      default: 'active',
    },
    isBlocked: { type: Boolean, default: false },

    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    passwordChangedAt: { type: Date },

    phone: String,
    college: String,
    branch: String,
    graduationYear: String,
    targetCompanies: [{ type: String }],
    streak: { type: Number, default: 0 },
    readinessScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// NO pre-save bcrypt hook — controller hashes password explicitly before create/save

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profileImage: this.profileImage || this.avatar,
    avatar: this.avatar,
    authProvider: this.authProvider || 'local',
    isEmailVerified: this.isEmailVerified,
    isTwoFactorEnabled: this.isTwoFactorEnabled,
    accountStatus: this.accountStatus || 'active',
    isBlocked: this.isBlocked,
    phone: this.phone,
    college: this.college,
    branch: this.branch,
    graduationYear: this.graduationYear,
    targetCompanies: this.targetCompanies,
    streak: this.streak,
    readinessScore: this.readinessScore,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
