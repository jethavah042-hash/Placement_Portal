const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Create notification
// @route   POST /api/notifications
// @access  Admin
exports.createNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: notification
  });
});

// @desc    Get logged in user notifications
// @route   GET /api/notifications/my
// @access  Protected
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const notifications = await Notification.find({ 
    $or: [
      { userId: userId },
      { targetUsers: userId },
      { type: 'global' },
      { type: 'role_based', targetRoles: req.user.role }
    ]
  }).sort('-createdAt').limit(50);
  
  res.status(200).json({
    success: true,
    message: 'Notifications fetched successfully',
    results: notifications.length,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Protected
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(new AppError('No notification found with that ID', 404));
  }
  
  if (!notification.readBy.includes(req.user.id)) {
    notification.readBy.push(req.user.id);
    await notification.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Admin
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  
  if (!notification) {
    return next(new AppError('No notification found with that ID', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully',
    data: null
  });
});
