const Question = require('../models/Question');
const TopicNote = require('../models/TopicNote');
const Result = require('../models/Result');
const Progress = require('../models/Progress');
const Bookmark = require('../models/Bookmark');
const Activity = require('../models/Activity');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Exact 15 Canonical Topics List
const APTITUDE_TOPICS = [
  { name: 'Number System', abbr: 'NS', slug: 'number-system', desc: 'Divisibility rules, HCF/LCM, prime factors, remainders, and unit digit concepts.' },
  { name: 'Percentage', abbr: '%', slug: 'percentage', desc: 'Fraction conversions, successive percentage, population and consumption formulas.' },
  { name: 'Profit & Loss', abbr: 'P&L', slug: 'profit-and-loss', desc: 'Cost price, selling price, marked price, discounts, and margin calculations.' },
  { name: 'Average', abbr: 'Avg', slug: 'average', desc: 'Arithmetic mean, weighted averages, replacement and member addition problems.' },
  { name: 'Ratio & Proportion', abbr: 'x:y', slug: 'ratio-and-proportion', desc: 'Direct/inverse proportions, mean proportions, and mixture ratios.' },
  { name: 'Time & Work', abbr: 'T&W', slug: 'time-and-work', desc: 'Work efficiency, man-days, combined work, and pipes & cisterns analogies.' },
  { name: 'Time, Speed & Distance', abbr: 'TSD', slug: 'time-speed-and-distance', desc: 'Relative speed, average speed, trains, and boats & streams scenarios.' },
  { name: 'Simple Interest (SI)', abbr: 'SI', slug: 'simple-interest', desc: 'Linear interest accumulation, rate-time relationships, and principal discovery.' },
  { name: 'Compound Interest (CI)', abbr: 'CI', slug: 'compound-interest', desc: 'Exponential interest, compounding frequencies, and SI vs CI difference.' },
  { name: 'Probability', abbr: 'P()', slug: 'probability', desc: 'Sample space, independent events, cards, dice, coins, and Bayes basics.' },
  { name: 'Permutation', abbr: 'nPr', slug: 'permutation', desc: 'Arrangements, factorials, circular permutations, and constrained ordering.' },
  { name: 'Combination', abbr: 'nCr', slug: 'combination', desc: 'Selection principles, grouping problems, handshakes, and committee formation.' },
  { name: 'Calendar', abbr: 'Cal', slug: 'calendar', desc: 'Odd days, leap year cycles, reference day calculations, and recurring calendars.' },
  { name: 'Clock', abbr: 'Clk', slug: 'clock', desc: 'Angle between hands, coincidences, right angles, and fast/slow clock logic.' },
  { name: 'Partnership', abbr: 'Pt', slug: 'partnership', desc: 'Investment-time product ratios, profit sharing, and active vs sleeping partners.' }
];

// Helper to resolve canonical topic name from slug or name
function resolveTopic(input) {
  if (!input) return null;
  const clean = input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const matched = APTITUDE_TOPICS.find(t => t.slug === clean || t.name.toLowerCase() === input.toLowerCase());
  return matched ? matched.name : input;
}

function getSlug(name) {
  const found = APTITUDE_TOPICS.find(t => t.name === name);
  if (found) return found.slug;
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// @desc    Get All 15 Aptitude Topics with dynamic stats & student progress
// @route   GET /api/aptitude/topics
// @access  Protected
exports.getTopics = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Aggregate questions count per topic
  const questionCounts = await Question.aggregate([
    { $match: { moduleType: 'Aptitude' } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  const qMap = {};
  questionCounts.forEach(q => {
    if (q._id) qMap[q._id] = q.count;
  });

  // Check notes availability
  const availableNotes = await TopicNote.find({ moduleType: 'Aptitude' }).select('topic');
  const notesSet = new Set(availableNotes.map(n => n.topic));

  // Get student progress for each topic
  const userProgress = await Progress.find({ userId, moduleName: 'Aptitude' });
  const pMap = {};
  userProgress.forEach(p => {
    pMap[p.topic] = p;
  });

  const topicsWithData = APTITUDE_TOPICS.map((topic, index) => {
    const qCount = qMap[topic.name] || 0;
    const hasNotes = notesSet.has(topic.name);
    const prog = pMap[topic.name];

    let progressPercentage = 0;
    if (prog) {
      const notesScore = prog.notesRead ? 25 : 0;
      const mcqScore = prog.mcqsAttempted > 0 ? Math.min(35, (prog.mcqsAttempted / 10) * 35) : 0;
      const quizScore = prog.quizCompleted ? Math.min(40, (prog.quizScore / 100) * 40) : 0;
      progressPercentage = Math.round(notesScore + mcqScore + quizScore);
    }

    return {
      index: index + 1,
      name: topic.name,
      slug: topic.slug,
      abbr: topic.abbr,
      description: topic.desc,
      notesCount: hasNotes ? 1 : 0,
      totalMCQs: qCount,
      quizAvailable: qCount >= 5,
      progressPercentage,
      isCompleted: progressPercentage >= 80,
      studentStats: {
        notesRead: prog ? prog.notesRead : false,
        mcqsAttempted: prog ? prog.mcqsAttempted : 0,
        quizCompleted: prog ? prog.quizCompleted : false,
        bestQuizScore: prog ? prog.quizScore : 0
      }
    };
  });

  res.status(200).json({
    success: true,
    count: topicsWithData.length,
    data: topicsWithData
  });
});

// @desc    Get Specific Topic Details
// @route   GET /api/aptitude/topics/:topicSlug
// @access  Protected
exports.getTopicDetails = catchAsync(async (req, res, next) => {
  const topicName = resolveTopic(req.params.topicSlug);
  const topicInfo = APTITUDE_TOPICS.find(t => t.name === topicName) || {
    name: topicName,
    slug: req.params.topicSlug,
    desc: `Comprehensive aptitude preparation for ${topicName}.`
  };

  const [questionCount, noteDoc, userProgress] = await Promise.all([
    Question.countDocuments({ moduleType: 'Aptitude', category: topicName }),
    TopicNote.findOne({ moduleType: 'Aptitude', topic: topicName }),
    Progress.findOne({ userId: req.user.id, moduleName: 'Aptitude', topic: topicName })
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...topicInfo,
      hasNotes: !!noteDoc,
      questionCount,
      progress: userProgress || { notesRead: false, mcqsAttempted: 0, quizCompleted: false, progressPercentage: 0 }
    }
  });
});

// @desc    Get Complete Notes for a Topic
// @route   GET /api/aptitude/topics/:topicSlug/notes
// @access  Protected
exports.getTopicNotes = catchAsync(async (req, res, next) => {
  const topicName = resolveTopic(req.params.topicSlug);
  const userId = req.user.id;

  const note = await TopicNote.findOne({ moduleType: 'Aptitude', topic: topicName });

  // Update progress to mark notes as read
  await Progress.findOneAndUpdate(
    { userId, moduleName: 'Aptitude', topic: topicName },
    { 
      $set: { notesRead: true, lastActivityAt: new Date() },
      $inc: { attempts: 1 }
    },
    { upsert: true, new: true }
  );

  // Log activity
  await Activity.create({
    userId,
    title: `Studied ${topicName} theoretical notes & formulas`,
    type: 'lesson',
    module: 'Aptitude',
    metadata: { topic: topicName }
  }).catch(() => {});

  if (!note) {
    return res.status(200).json({
      success: true,
      message: 'Default conceptual note',
      data: {
        topic: topicName,
        slug: getSlug(topicName),
        introduction: `Comprehensive preparation guide for ${topicName}.`,
        concepts: [
          { title: 'Core Principles', content: `Fundamental theories and principles governing ${topicName} in placement exams.` }
        ],
        formulas: [
          { name: 'Standard Relationship', formula: 'Result = Base × Multiplier', description: 'Core calculation equation.' }
        ],
        rules: ['Read the question parameters carefully', 'Convert all units into uniform standard units before calculating'],
        shortcuts: [{ name: 'Direct Estimation', tip: 'Eliminate absurd options by quick approximation.', example: 'Estimate rounding to nearest 10.' }],
        solvedExamples: [{
          question: `Sample solved problem on ${topicName}`,
          solution: 'Step-by-step resolution.',
          explanation: 'Logical breakdown of each calculation stage.',
          shortcut: 'Formulaic shortcut method.'
        }],
        commonMistakes: ['Misinterpreting question constraints', 'Unit mismatch in intermediate steps'],
        placementTips: ['Frequently asked in TCS, Infosys, and Cognizant aptitude rounds.', 'Aim to solve within 45 seconds.'],
        practiceGuidance: 'Proceed to practice 20 MCQs to reinforce these concepts.'
      }
    });
  }

  res.status(200).json({
    success: true,
    data: note
  });
});

// @desc    Get MCQs for a Specific Topic
// @route   GET /api/aptitude/topics/:topicSlug/questions
// @access  Protected
exports.getTopicQuestions = catchAsync(async (req, res, next) => {
  const topicName = resolveTopic(req.params.topicSlug);
  const { difficulty, search, limit = 50 } = req.query;

  const query = { moduleType: 'Aptitude', category: topicName };
  if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    query.difficulty = difficulty;
  }
  if (search) {
    query.questionText = { $regex: search, $options: 'i' };
  }

  const questions = await Question.find(query).limit(parseInt(limit)).sort('createdAt');

  // Check bookmarks for this user
  const bookmarkedIds = new Set(
    (await Bookmark.find({ userId: req.user.id, itemType: 'Question' })).map(b => b.itemId.toString())
  );

  const formatted = questions.map(q => ({
    _id: q._id,
    id: q._id,
    questionText: q.questionText,
    options: q.options,
    correctAnswer: q.correctAnswer, // In practice mode student needs answer feedback
    explanation: q.explanation,
    difficulty: q.difficulty,
    topic: q.category,
    marks: q.marks || 1,
    isBookmarked: bookmarkedIds.has(q._id.toString())
  }));

  res.status(200).json({
    success: true,
    count: formatted.length,
    topic: topicName,
    data: formatted
  });
});

// @desc    Get 10-Question Timed Quiz for a Topic (Correct answers stripped for security!)
// @route   GET /api/aptitude/topics/:topicSlug/quiz
// @access  Protected
exports.getTopicQuiz = catchAsync(async (req, res, next) => {
  const topicName = resolveTopic(req.params.topicSlug);

  const allQuestions = await Question.find({ moduleType: 'Aptitude', category: topicName });

  if (allQuestions.length === 0) {
    return next(new AppError(`No questions available for ${topicName} quiz yet.`, 404));
  }

  // Shuffle and pick up to 10
  const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);

  // Strip answers for security
  const sanitized = shuffled.map((q, idx) => ({
    _id: q._id,
    id: q._id,
    number: idx + 1,
    questionText: q.questionText,
    options: q.options,
    difficulty: q.difficulty,
    topic: q.category
  }));

  res.status(200).json({
    success: true,
    topic: topicName,
    duration: 10, // 10 minutes
    totalQuestions: sanitized.length,
    data: sanitized
  });
});

// @desc    Submit Topic Quiz
// @route   POST /api/aptitude/quiz/submit
// @access  Protected
exports.submitQuiz = catchAsync(async (req, res, next) => {
  const { topic, answers, timeTaken = 0 } = req.body;
  const userId = req.user.id;
  const topicName = resolveTopic(topic) || topic;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return next(new AppError('Answers array is required', 400));
  }

  const qIds = answers.map(a => a.questionId);
  const questions = await Question.find({ _id: { $in: qIds } });
  const qMap = {};
  questions.forEach(q => { qMap[q._id.toString()] = q; });

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  const detailedAnswers = [];

  answers.forEach(ans => {
    const qDoc = qMap[ans.questionId];
    if (!qDoc) return;

    const isAttempted = ans.selectedOption !== undefined && ans.selectedOption !== null && ans.selectedOption !== '';
    const isCorrect = isAttempted && ans.selectedOption.trim().toLowerCase() === qDoc.correctAnswer.trim().toLowerCase();

    if (isCorrect) correctCount++;
    else if (isAttempted) wrongCount++;
    else unattemptedCount++;

    detailedAnswers.push({
      questionId: qDoc._id,
      questionText: qDoc.questionText,
      options: qDoc.options,
      selectedOption: ans.selectedOption || 'Not Attempted',
      correctAnswer: qDoc.correctAnswer,
      isCorrect,
      explanation: qDoc.explanation,
      topic: qDoc.category
    });
  });

  const totalQuestions = detailedAnswers.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const accuracy = (correctCount + wrongCount) > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0;
  const status = percentage >= 60 ? 'Passed' : 'Needs Improvement';

  // Create Result in MongoDB
  const result = await Result.create({
    userId,
    testType: 'topic_quiz',
    title: `${topicName} Topic Quiz`,
    topic: topicName,
    totalQuestions,
    attemptedCount: correctCount + wrongCount,
    correctCount,
    wrongCount,
    unattemptedCount,
    totalMarks: totalQuestions,
    obtainedMarks: correctCount,
    percentage,
    accuracy,
    timeTaken,
    status,
    answers: detailedAnswers
  });

  // Update Progress in MongoDB
  await Progress.findOneAndUpdate(
    { userId, moduleName: 'Aptitude', topic: topicName },
    {
      $set: {
        quizCompleted: true,
        quizScore: percentage,
        score: percentage,
        accuracy,
        lastActivityAt: new Date()
      },
      $inc: {
        mcqsAttempted: correctCount + wrongCount,
        mcqsCorrect: correctCount,
        attempts: 1
      }
    },
    { upsert: true }
  );

  // Log Activity
  await Activity.create({
    userId,
    title: `Scored ${percentage}% in ${topicName} Quiz`,
    type: 'test',
    module: 'Aptitude',
    metadata: { resultId: result._id, topic: topicName, score: percentage }
  }).catch(() => {});

  res.status(200).json({
    success: true,
    message: 'Quiz submitted successfully',
    data: {
      resultId: result._id,
      topic: topicName,
      totalQuestions,
      correctCount,
      wrongCount,
      unattemptedCount,
      percentage,
      accuracy,
      status,
      timeTaken,
      answers: detailedAnswers
    }
  });
});

// @desc    Get Full 30-Question Aptitude Mock Test (Correct answers stripped!)
// @route   GET /api/aptitude/mock-test
// @access  Protected
exports.getMockTest = catchAsync(async (req, res, next) => {
  // Query 2 questions from EACH of the 15 topics to guarantee exactly 30 questions
  const selectedQuestions = [];
  const usedIds = new Set();

  for (const topicObj of APTITUDE_TOPICS) {
    const topicQs = await Question.find({ moduleType: 'Aptitude', category: topicObj.name });
    if (topicQs.length > 0) {
      // Pick 2 random from this topic
      const shuffled = topicQs.filter(q => !usedIds.has(q._id.toString())).sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, 2);
      picked.forEach(p => {
        selectedQuestions.push(p);
        usedIds.add(p._id.toString());
      });
    }
  }

  // If there are fewer than 30 due to any empty topic, fill from global Aptitude pool without duplicates
  if (selectedQuestions.length < 30) {
    const remainingCount = 30 - selectedQuestions.length;
    const additional = await Question.find({
      moduleType: 'Aptitude',
      _id: { $nin: Array.from(usedIds) }
    }).limit(remainingCount);

    additional.forEach(a => {
      selectedQuestions.push(a);
      usedIds.add(a._id.toString());
    });
  }

  // Final check: slice to exactly 30 questions
  const final30 = selectedQuestions.slice(0, 30);

  if (final30.length === 0) {
    return next(new AppError('No questions available in Aptitude question bank. Please run seed.', 404));
  }

  // Strip answers for security before delivering to student
  const sanitized = final30.map((q, idx) => ({
    _id: q._id,
    id: q._id,
    number: idx + 1,
    questionText: q.questionText,
    options: q.options,
    difficulty: q.difficulty,
    topic: q.category
  }));

  res.status(200).json({
    success: true,
    title: 'Full Quantitative Aptitude Mock Test',
    duration: 30, // 30 minutes
    totalQuestions: sanitized.length,
    negativeMarking: 0.25,
    marksPerQuestion: 1,
    data: sanitized
  });
});

// @desc    Submit Full 30-Question Aptitude Mock Test
// @route   POST /api/aptitude/mock-test/submit
// @access  Protected
exports.submitMockTest = catchAsync(async (req, res, next) => {
  const { answers, timeTaken = 0 } = req.body;
  const userId = req.user.id;

  if (!answers || !Array.isArray(answers)) {
    return next(new AppError('Answers array is required', 400));
  }

  const qIds = answers.map(a => a.questionId);
  const questions = await Question.find({ _id: { $in: qIds } });
  const qMap = {};
  questions.forEach(q => { qMap[q._id.toString()] = q; });

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  const detailedAnswers = [];
  const topicBreakdown = {};

  answers.forEach(ans => {
    const qDoc = qMap[ans.questionId];
    if (!qDoc) return;

    const topic = qDoc.category || 'General';
    if (!topicBreakdown[topic]) {
      topicBreakdown[topic] = { total: 0, correct: 0, wrong: 0 };
    }
    topicBreakdown[topic].total++;

    const isAttempted = ans.selectedOption !== undefined && ans.selectedOption !== null && ans.selectedOption !== '';
    const isCorrect = isAttempted && ans.selectedOption.trim().toLowerCase() === qDoc.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      correctCount++;
      topicBreakdown[topic].correct++;
    } else if (isAttempted) {
      wrongCount++;
      topicBreakdown[topic].wrong++;
    } else {
      unattemptedCount++;
    }

    detailedAnswers.push({
      questionId: qDoc._id,
      questionText: qDoc.questionText,
      options: qDoc.options,
      selectedOption: ans.selectedOption || 'Not Attempted',
      correctAnswer: qDoc.correctAnswer,
      isCorrect,
      explanation: qDoc.explanation,
      topic
    });
  });

  const totalQuestions = detailedAnswers.length || 30;
  const attemptedCount = correctCount + wrongCount;
  // Negative marking: +1 for correct, -0.25 for wrong
  const rawMarks = (correctCount * 1) - (wrongCount * 0.25);
  const obtainedMarks = Math.max(0, parseFloat(rawMarks.toFixed(2)));
  const percentage = parseFloat(((obtainedMarks / totalQuestions) * 100).toFixed(2));
  const accuracy = attemptedCount > 0 ? parseFloat(((correctCount / attemptedCount) * 100).toFixed(2)) : 0;
  const status = percentage >= 60 ? 'Passed' : 'Needs Improvement';

  const topicAnalysis = Object.keys(topicBreakdown).map(t => ({
    topic: t,
    total: topicBreakdown[t].total,
    correct: topicBreakdown[t].correct,
    wrong: topicBreakdown[t].wrong,
    percentage: Math.round((topicBreakdown[t].correct / topicBreakdown[t].total) * 100)
  }));

  // Save Result to MongoDB
  const result = await Result.create({
    userId,
    testType: 'mock_test',
    title: 'Full Quantitative Aptitude Mock Test',
    topic: 'Comprehensive Aptitude',
    totalQuestions,
    attemptedCount,
    correctCount,
    wrongCount,
    unattemptedCount,
    totalMarks: totalQuestions,
    obtainedMarks,
    percentage,
    accuracy,
    timeTaken,
    status,
    topicAnalysis,
    answers: detailedAnswers
  });

  // Log Activity
  await Activity.create({
    userId,
    title: `Completed Aptitude Mock Test (Score: ${obtainedMarks}/${totalQuestions})`,
    type: 'test',
    module: 'Aptitude',
    metadata: { resultId: result._id, score: percentage }
  }).catch(() => {});

  // Update user streak & readiness score
  await User.findByIdAndUpdate(userId, { $inc: { streak: 1 } }).catch(() => {});

  res.status(200).json({
    success: true,
    message: 'Mock test evaluated and saved successfully',
    data: {
      resultId: result._id,
      title: result.title,
      totalQuestions,
      attemptedCount,
      correctCount,
      wrongCount,
      unattemptedCount,
      totalMarks: totalQuestions,
      obtainedMarks,
      percentage,
      accuracy,
      timeTaken,
      status,
      topicAnalysis,
      answers: detailedAnswers
    }
  });
});

// @desc    Get Student Aptitude Results History
// @route   GET /api/aptitude/results
// @access  Protected
exports.getResults = catchAsync(async (req, res, next) => {
  const results = await Result.find({ 
    userId: req.user.id,
    $or: [
      { testType: 'mock_test' },
      { testType: 'topic_quiz' },
      { module: 'Aptitude' }
    ]
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: results.length,
    data: results
  });
});

// @desc    Get Detailed Result by ID
// @route   GET /api/aptitude/results/:resultId
// @access  Protected
exports.getResultById = catchAsync(async (req, res, next) => {
  const result = await Result.findOne({
    _id: req.params.resultId,
    userId: req.user.id
  });

  if (!result) {
    return next(new AppError('Result not found or access denied', 404));
  }

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get Comprehensive Student Aptitude Progress
// @route   GET /api/aptitude/progress
// @access  Protected
exports.getProgress = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const [progressDocs, results] = await Promise.all([
    Progress.find({ userId, moduleName: 'Aptitude' }),
    Result.find({ userId, testType: 'mock_test' }).sort('-createdAt')
  ]);

  const topicsCompleted = progressDocs.filter(p => p.completed || p.notesRead).length;
  const totalMCQsAttempted = progressDocs.reduce((a, b) => a + (b.mcqsAttempted || 0), 0);
  const totalMCQsCorrect = progressDocs.reduce((a, b) => a + (b.mcqsCorrect || 0), 0);
  const accuracy = totalMCQsAttempted > 0 ? Math.round((totalMCQsCorrect / totalMCQsAttempted) * 100) : 0;
  const bestScore = results.length > 0 ? Math.max(...results.map(r => r.obtainedMarks)) : 0;
  const averageScore = results.length > 0 ? Math.round(results.reduce((a, b) => a + b.percentage, 0) / results.length) : 0;

  res.status(200).json({
    success: true,
    data: {
      totalTopics: 15,
      topicsCompleted,
      totalMCQsAttempted,
      totalMCQsCorrect,
      accuracy,
      mockTestsAttempted: results.length,
      bestScore,
      averageScore,
      topicProgressList: progressDocs
    }
  });
});

// @desc    Bookmark / Unbookmark Question
// @route   POST /api/aptitude/bookmark
// @access  Protected
exports.toggleBookmark = catchAsync(async (req, res, next) => {
  const { questionId } = req.body;
  const userId = req.user.id;

  if (!questionId) {
    return next(new AppError('questionId is required', 400));
  }

  const existing = await Bookmark.findOne({ userId, itemId: questionId });
  if (existing) {
    await existing.deleteOne();
    return res.status(200).json({
      success: true,
      bookmarked: false,
      message: 'Bookmark removed'
    });
  }

  await Bookmark.create({
    userId,
    itemId: questionId,
    itemType: 'Question'
  });

  res.status(200).json({
    success: true,
    bookmarked: true,
    message: 'Question bookmarked'
  });
});

// Admin Controllers
exports.adminCreateQuestion = catchAsync(async (req, res, next) => {
  const { questionText, options, correctAnswer, category, topic, difficulty, explanation } = req.body;

  if (!questionText || !options || !Array.isArray(options) || options.length !== 4) {
    return next(new AppError('Question text and exactly 4 options are required', 400));
  }
  if (!correctAnswer || !options.includes(correctAnswer)) {
    return next(new AppError('Correct answer must match one of the 4 options', 400));
  }

  const newQ = await Question.create({
    moduleType: 'Aptitude',
    category: category || topic || 'Number System',
    topic: topic || category || 'Number System',
    difficulty: difficulty || 'Medium',
    questionText,
    options,
    correctAnswer,
    explanation: explanation || '',
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Question created successfully',
    data: newQ
  });
});

exports.adminUpdateQuestion = catchAsync(async (req, res, next) => {
  const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) return next(new AppError('Question not found', 404));

  res.status(200).json({
    success: true,
    message: 'Question updated successfully',
    data: updated
  });
});

exports.adminDeleteQuestion = catchAsync(async (req, res, next) => {
  const deleted = await Question.findByIdAndDelete(req.params.id);
  if (!deleted) return next(new AppError('Question not found', 404));

  res.status(200).json({
    success: true,
    message: 'Question deleted successfully'
  });
});
