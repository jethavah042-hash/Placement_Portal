const Progress = require('../models/Progress');
const Result = require('../models/Result');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/analytics/admin
// @access  Admin
exports.getAdminAnalytics = catchAsync(async (req, res, next) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalTestsTaken = await Result.countDocuments();
  
  // Aggregate mock logic
  // A production app would have more complex aggregations here
  const recentResults = await Result.find()
    .sort('-createdAt')
    .limit(5)
    .populate('userId', 'name email');

  res.status(200).json({
    success: true,
    message: 'Admin analytics fetched successfully',
    data: {
      totalStudents,
      totalTestsTaken,
      recentResults
    }
  });
});

// @desc    Get Student Dashboard Analytics
// @route   GET /api/analytics/my
// @access  Protected
exports.getStudentAnalytics = catchAsync(async (req, res, next) => {
  const progressLogs = await Progress.find({ userId: req.user.id });
  const results = await Result.find({ userId: req.user.id });
  
  // Mock calculate readiness score
  const readinessScore = req.user.readinessScore || 0;
  
  res.status(200).json({
    success: true,
    message: 'Student analytics fetched successfully',
    data: {
      progressLogs,
      testsTaken: results.length,
      averageScore: results.reduce((acc, val) => acc + val.score, 0) / (results.length || 1),
      readinessScore
    }
  });
});
