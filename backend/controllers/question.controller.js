const Question = require('../models/Question');
const AppError = require('../utils/appError');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private
exports.getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find();
    res.status(200).json({
      success: true,
      message: 'Questions fetched successfully',
      data: questions,
      meta: { count: questions.length }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new question
// @route   POST /api/questions
// @access  Private/Admin
exports.createQuestion = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const question = await Question.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    next(error);
  }
};
