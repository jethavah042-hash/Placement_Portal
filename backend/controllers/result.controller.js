const Result = require('../models/Result');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Submit test and generate result
// @route   POST /api/results
// @access  Student
exports.submitResult = asyncHandler(async (req, res) => {
  req.body.userId = req.user._id;
  const result = await Result.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Test submitted and result recorded',
    data: result
  });
});

// @desc    Get user's results
// @route   GET /api/results/my
// @access  Student
exports.getMyResults = asyncHandler(async (req, res) => {
  const results = await Result.find({ userId: req.user._id })
    .populate('testId', 'title')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    message: 'Results fetched successfully',
    results: results.length,
    data: results
  });
});

// @desc    Get all results (Admin)
// @route   GET /api/results
// @access  Admin
exports.getAllResults = asyncHandler(async (req, res) => {
  const results = await Result.find()
    .populate('userId', 'name email')
    .populate('testId', 'title')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    message: 'All results fetched successfully',
    results: results.length,
    data: results
  });
});

// @desc    Get specific result
// @route   GET /api/results/:id
// @access  Student / Admin
exports.getResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('testId', 'title');
  
  if (!result) {
    throw new ApiError(404, 'Result not found');
  }
  
  res.status(200).json({
    success: true,
    message: 'Result fetched successfully',
    data: result
  });
});
