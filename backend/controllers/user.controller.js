const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get all students
// @route   GET /api/users
// @access  Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ role: 'student' }).select('-password');
  
  res.status(200).json({
    success: true,
    message: 'Users fetched successfully',
    data: users
  });
});

// @desc    Get user details
// @route   GET /api/users/:id
// @access  Admin / Self
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'User details fetched successfully',
    data: user
  });
});

// @desc    Block or Unblock a user
// @route   PUT /api/users/:id/block
// @access  Admin
exports.toggleBlockUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  user.isBlocked = !user.isBlocked;
  await user.save({ validateBeforeSave: false });
  
  res.status(200).json({
    success: true,
    message: `User successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`,
    data: { id: user._id, isBlocked: user.isBlocked }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'User successfully deleted',
    data: null
  });
});
