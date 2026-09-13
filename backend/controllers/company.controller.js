const Company = require('../models/Company');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Create company
// @route   POST /api/companies
// @access  Admin
exports.createCompany = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  const company = await Company.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Company profile created successfully',
    data: company
  });
});

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public/Student
exports.getAllCompanies = catchAsync(async (req, res, next) => {
  const companies = await Company.find();
  
  res.status(200).json({
    success: true,
    message: 'Companies fetched successfully',
    results: companies.length,
    data: companies
  });
});

// @desc    Get one company
// @route   GET /api/companies/:id
// @access  Public/Student
exports.getCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findById(req.params.id);
  
  if (!company) {
    return next(new AppError('No company found with that ID', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Company details fetched successfully',
    data: company
  });
});

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Admin
exports.updateCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!company) {
    return next(new AppError('No company found with that ID', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Company updated successfully',
    data: company
  });
});

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Admin
exports.deleteCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  
  if (!company) {
    return next(new AppError('No company found with that ID', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Company deleted successfully',
    data: null
  });
});
