const mongoose = require('mongoose');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all published mock tests with student attempt metadata
// @route   GET /api/tests
// @access  Public / Student
exports.getAllTests = asyncHandler(async (req, res) => {
  const { category, difficulty, search } = req.query;
  const filter = { isPublished: true };

  if (category && category !== 'all') {
    filter.category = category;
  }
  if (difficulty && difficulty !== 'All') {
    filter.difficulty = difficulty;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { companyTags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const tests = await Test.find(filter)
    .select('-questions')
    .sort({ createdAt: -1 });

  // If user is authenticated, attach their best attempt data
  let userResultsMap = {};
  if (req.user) {
    const userResults = await Result.find({
      userId: req.user._id,
      testId: { $in: tests.map(t => t._id) }
    }).select('testId obtainedMarks percentage status submittedAt totalMarks');

    userResults.forEach(r => {
      if (r.testId) {
        const tid = r.testId.toString();
        if (!userResultsMap[tid] || r.obtainedMarks > userResultsMap[tid].obtainedMarks) {
          userResultsMap[tid] = r;
        }
      }
    });
  }

  const formattedTests = tests.map(t => {
    const obj = t.toObject();
    const bestAttempt = userResultsMap[t._id.toString()] || null;
    obj.isAttempted = !!bestAttempt;
    obj.bestScore = bestAttempt ? bestAttempt.obtainedMarks : null;
    obj.bestPercentage = bestAttempt ? bestAttempt.percentage : null;
    obj.status = bestAttempt ? bestAttempt.status : 'Unattempted';
    return obj;
  });

  res.status(200).json({
    success: true,
    count: formattedTests.length,
    data: formattedTests
  });
});

// @desc    Get test detail & questions for taking test (strips answers for integrity)
// @route   GET /api/tests/:id
// @access  Private / Student
exports.getTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId ? { _id: id } : { slug: id };

  const test = await Test.findOne(query).populate('questions');

  if (!test) {
    throw new ApiError(404, 'Mock test not found');
  }

  // Sanitize questions for student test-taking: remove answers and explanations
  const sanitizedQuestions = (test.questions || []).map((q, idx) => ({
    _id: q._id,
    questionIndex: idx + 1,
    questionText: q.questionText || q.question,
    question: q.questionText || q.question,
    options: q.options,
    topic: q.topic || q.category || 'General',
    difficulty: q.difficulty || 'Medium',
    moduleType: q.moduleType || 'Aptitude',
    marks: q.marks || 1
  }));

  const testData = test.toObject();
  testData.questions = sanitizedQuestions;
  testData.totalQuestions = sanitizedQuestions.length;

  res.status(200).json({
    success: true,
    data: testData
  });
});

// @desc    Submit mock test and calculate dynamic score with negative marking
// @route   POST /api/tests/:id/submit
// @access  Private / Student
exports.submitTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { answers = {}, timeTaken = 0 } = req.body;
  const userId = req.user._id;

  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId ? { _id: id } : { slug: id };

  const test = await Test.findOne(query).populate('questions');
  if (!test) {
    throw new ApiError(404, 'Mock test not found');
  }

  const questions = test.questions || [];
  const totalQuestions = questions.length;
  const negativeMarking = typeof test.negativeMarking === 'number' ? test.negativeMarking : 0.25;

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  let obtainedMarks = 0;
  const totalMarks = totalQuestions;

  const detailedAnswers = [];
  const topicStats = {};

  questions.forEach(q => {
    const qId = q._id.toString();
    const selectedOption = answers[qId] || null;
    const isAnswered = selectedOption !== null && selectedOption !== undefined && selectedOption !== '';
    const isCorrect = isAnswered && selectedOption === q.correctAnswer;
    const topicKey = q.topic || q.category || 'General';

    if (!topicStats[topicKey]) {
      topicStats[topicKey] = { topic: topicKey, total: 0, correct: 0, wrong: 0 };
    }
    topicStats[topicKey].total += 1;

    if (!isAnswered) {
      unattemptedCount += 1;
    } else if (isCorrect) {
      correctCount += 1;
      obtainedMarks += 1;
      topicStats[topicKey].correct += 1;
    } else {
      wrongCount += 1;
      obtainedMarks -= negativeMarking;
      topicStats[topicKey].wrong += 1;
    }

    detailedAnswers.push({
      questionId: q._id,
      questionText: q.questionText || q.question,
      options: q.options,
      selectedOption: selectedOption || 'Unattempted',
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation || 'No explanation provided.',
      topic: topicKey
    });
  });

  obtainedMarks = Math.max(0, parseFloat(obtainedMarks.toFixed(2)));
  const percentage = Math.round((obtainedMarks / totalMarks) * 100);
  const attemptedCount = correctCount + wrongCount;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const passingPercentage = test.passingPercentage || 60;
  const status = percentage >= passingPercentage ? 'Passed' : 'Needs Improvement';

  const topicAnalysis = Object.values(topicStats).map(t => ({
    topic: t.topic,
    total: t.total,
    correct: t.correct,
    wrong: t.wrong,
    percentage: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0
  }));

  // Create Result record in MongoDB
  const result = await Result.create({
    userId,
    testId: test._id,
    testType: 'mock_test',
    title: test.title,
    topic: test.category || 'Mixed Placement Mock',
    totalQuestions,
    attemptedCount,
    correctCount,
    wrongCount,
    unattemptedCount,
    totalMarks,
    obtainedMarks,
    percentage,
    accuracy,
    timeTaken,
    status,
    topicAnalysis,
    answers: detailedAnswers
  });

  // Increment test attempts count
  test.attemptsCount = (test.attemptsCount || 0) + 1;
  await test.save();

  // Log Activity
  await Activity.create({
    userId,
    type: 'test',
    module: test.category || 'Mock Test',
    title: `Completed Mock Test: ${test.title}`,
    metadata: { testId: test._id, resultId: result._id, score: obtainedMarks, percentage }
  });

  // Update User Streak & Progress
  await User.findByIdAndUpdate(userId, { $inc: { streak: 1 } });
  await Progress.findOneAndUpdate(
    { userId },
    {
      $inc: { 'assessments.completed': 1, 'assessments.totalScore': obtainedMarks },
      $set: { lastActive: new Date() }
    },
    { upsert: true, new: true }
  );

  res.status(201).json({
    success: true,
    message: 'Test submitted and graded successfully',
    data: result
  });
});

// @desc    Get dynamic leaderboard for a specific mock test
// @route   GET /api/tests/:id/leaderboard
// @access  Public / Student
exports.getTestLeaderboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId ? { _id: id } : { slug: id };

  const test = await Test.findOne(query);
  if (!test) {
    throw new ApiError(404, 'Mock test not found');
  }

  // Aggregate highest score per student
  const results = await Result.aggregate([
    { $match: { testId: test._id } },
    { $sort: { obtainedMarks: -1, timeTaken: 1, submittedAt: 1 } },
    {
      $group: {
        _id: '$userId',
        bestResultId: { $first: '$_id' },
        highestScore: { $first: '$obtainedMarks' },
        totalMarks: { $first: '$totalMarks' },
        percentage: { $first: '$percentage' },
        accuracy: { $first: '$accuracy' },
        timeTaken: { $first: '$timeTaken' },
        status: { $first: '$status' },
        submittedAt: { $first: '$submittedAt' }
      }
    },
    { $sort: { highestScore: -1, timeTaken: 1 } },
    { $limit: 100 }
  ]);

  // Populate user profile info
  const userIds = results.map(r => r._id);
  const users = await User.find({ _id: { $in: userIds } }).select('name email avatar profileImage college branch');
  const userMap = {};
  users.forEach(u => { userMap[u._id.toString()] = u; });

  let myRank = null;
  const currentUserId = req.user ? req.user._id.toString() : null;

  const leaderboard = results.map((r, idx) => {
    const u = userMap[r._id.toString()] || {};
    const rank = idx + 1;
    if (currentUserId && r._id.toString() === currentUserId) {
      myRank = {
        rank,
        score: r.highestScore,
        percentage: r.percentage,
        accuracy: r.accuracy,
        timeTaken: r.timeTaken
      };
    }

    return {
      rank,
      userId: r._id,
      name: u.name || 'Anonymous Student',
      avatar: u.profileImage || u.avatar || 'default.jpg',
      college: u.college || 'Engineering Institute',
      branch: u.branch || 'CSE',
      score: r.highestScore,
      totalMarks: r.totalMarks,
      percentage: r.percentage,
      accuracy: r.accuracy,
      timeTaken: r.timeTaken,
      status: r.status,
      submittedAt: r.submittedAt
    };
  });

  res.status(200).json({
    success: true,
    test: {
      _id: test._id,
      title: test.title,
      totalQuestions: test.totalQuestions,
      totalMarks: test.totalMarks,
      duration: test.duration
    },
    myRank,
    count: leaderboard.length,
    data: leaderboard
  });
});

// @desc    Get student historical attempts for all tests
// @route   GET /api/tests/my-attempts
// @access  Private / Student
exports.getMyAttempts = asyncHandler(async (req, res) => {
  const results = await Result.find({
    userId: req.user._id,
    testType: 'mock_test'
  })
    .populate('testId', 'title slug duration category difficulty')
    .sort({ submittedAt: -1 });

  res.status(200).json({
    success: true,
    count: results.length,
    data: results
  });
});

// @desc    Create test (Admin)
// @route   POST /api/tests
// @access  Admin
exports.createTest = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  const test = await Test.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Test created successfully',
    data: test
  });
});

// @desc    Update test (Admin)
// @route   PUT /api/tests/:id
// @access  Admin
exports.updateTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!test) {
    throw new ApiError(404, 'Test not found');
  }

  res.status(200).json({
    success: true,
    message: 'Test updated successfully',
    data: test
  });
});

// @desc    Delete test (Admin)
// @route   DELETE /api/tests/:id
// @access  Admin
exports.deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndDelete(req.params.id);

  if (!test) {
    throw new ApiError(404, 'Test not found');
  }

  res.status(200).json({
    success: true,
    message: 'Test deleted successfully',
    data: null
  });
});
