const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { isStrongPassword } = require('../utils/password');

// @desc    Get logged in user's profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    user: user.toSafeJSON(),
    data: user.toSafeJSON(),
  });
});

// @desc    Update logged in user's profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const {
    name,
    phone,
    college,
    branch,
    course,
    semester,
    graduationYear,
    registrationNumber,
    bio,
    skills,
    targetCompanies,
    profileImage,
  } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      throw new ApiError(400, 'Name must be at least 2 characters long');
    }
    user.name = name.trim();
  }

  if (phone !== undefined) user.phone = String(phone).trim();
  if (college !== undefined) user.college = String(college).trim();
  if (branch !== undefined) user.branch = String(branch).trim();
  if (course !== undefined) user.course = String(course).trim();
  if (semester !== undefined) user.semester = String(semester).trim();
  if (graduationYear !== undefined) user.graduationYear = String(graduationYear).trim();
  if (registrationNumber !== undefined) user.registrationNumber = String(registrationNumber).trim();
  if (bio !== undefined) user.bio = String(bio).trim();

  if (skills !== undefined) {
    if (Array.isArray(skills)) {
      user.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      user.skills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  if (targetCompanies !== undefined) {
    if (Array.isArray(targetCompanies)) {
      user.targetCompanies = targetCompanies.map((c) => String(c).trim()).filter(Boolean);
    } else if (typeof targetCompanies === 'string') {
      user.targetCompanies = targetCompanies
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
    }
  }

  if (profileImage !== undefined && typeof profileImage === 'string') {
    user.profileImage = profileImage;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: user.toSafeJSON(),
    data: user.toSafeJSON(),
  });
});

// @desc    Change logged in user's password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.authProvider !== 'local') {
    throw new ApiError(400, 'Social login accounts cannot change password directly');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  if (!isStrongPassword(newPassword)) {
    throw new ApiError(
      400,
      'Password must be 8+ chars with uppercase, lowercase, number and symbol'
    );
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordChangedAt = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Get all students (Admin)
// @route   GET /api/users
// @access  Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'student' }).select('-password');

  res.status(200).json({
    success: true,
    message: 'Users fetched successfully',
    data: users,
  });
});

// @desc    Get user details (Admin / Self)
// @route   GET /api/users/:id
// @access  Admin / Self
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new ApiError(404, 'No user found with that ID');
  }

  res.status(200).json({
    success: true,
    message: 'User details fetched successfully',
    data: user,
  });
});

// @desc    Block or Unblock a user (Admin)
// @route   PUT /api/users/:id/block
// @access  Admin
exports.toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'No user found with that ID');
  }

  user.isBlocked = !user.isBlocked;
  user.accountStatus = user.isBlocked ? 'suspended' : 'active';
  await user.save();

  res.status(200).json({
    success: true,
    message: `User successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`,
    data: { id: user._id, isBlocked: user.isBlocked, accountStatus: user.accountStatus },
  });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new ApiError(404, 'No user found with that ID');
  }

  res.status(200).json({
    success: true,
    message: 'User successfully deleted',
    data: null,
  });
});
