const { generateMockResponse } = require('../providers/mock.provider');

// @desc    Placeholder for Resume Review AI
// @route   POST /api/ai/resume-review
// @access  Private
exports.reviewResume = async (req, res, next) => {
  try {
    const aiResponse = await generateMockResponse('resume-review', req.body);
    res.status(200).json({
      success: true,
      message: 'Resume reviewed successfully via AI mock provider',
      data: aiResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Placeholder for Skill Gap Analysis
// @route   POST /api/ai/skill-gap
// @access  Private
exports.analyzeSkillGap = async (req, res, next) => {
  try {
    // Determine provider based on ENV later (e.g., if (process.env.AI_PROVIDER === 'openai'))
    const aiResponse = await generateMockResponse('skill-gap', req.body);
    res.status(200).json({
      success: true,
      message: 'Skill gap analyzed successfully',
      data: aiResponse
    });
  } catch (error) {
    next(error);
  }
};
