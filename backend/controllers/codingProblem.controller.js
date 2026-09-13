const CodingProblem = require('../models/CodingProblem');
const CodingNote = require('../models/CodingNote');
const InterviewQuestion = require('../models/InterviewQuestion');
const CodingSubmission = require('../models/CodingSubmission');
const Progress = require('../models/Progress');
const Bookmark = require('../models/Bookmark');
const Activity = require('../models/Activity');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { runCodeOnTestCases } = require('../providers/codeExecution.provider');

// Exact 11 Canonical Topics List
const CODING_TOPICS = [
  { name: 'Arrays', abbr: '[]', slug: 'arrays', desc: 'Contiguous memory structures, two pointers, sliding window, prefix sums, and matrix algorithms.' },
  { name: 'Strings', abbr: '""', slug: 'strings', desc: 'Character sequences, palindromes, anagrams, substring patterns, and string parsing.' },
  { name: 'Linked List', abbr: '->', slug: 'linked-list', desc: 'Node pointer connections, cycle detection, list reversals, and slow/fast pointers.' },
  { name: 'Stack', abbr: 'LIFO', slug: 'stack', desc: 'Last-in first-out structures, monotonic stacks, parenthesis balancing, and min-stacks.' },
  { name: 'Queue', abbr: 'FIFO', slug: 'queue', desc: 'First-in first-out buffers, circular queues, deques, and BFS queue structures.' },
  { name: 'Trees', abbr: 'Tree', slug: 'trees', desc: 'Hierarchical node trees, binary search trees, traversals, depth/diameter, and LCA.' },
  { name: 'Graphs', abbr: 'V,E', slug: 'graphs', desc: 'Vertices and edges, BFS/DFS traversals, cycle detection, shortest paths, and topological sort.' },
  { name: 'Recursion', abbr: 'f(f)', slug: 'recursion', desc: 'Recursive state decomposition, base cases, call stack unwinding, and backtracking.' },
  { name: 'Sorting', abbr: 'Asc', slug: 'sorting', desc: 'Comparison and non-comparison sorting: Merge sort, Quick sort, Heap sort, and complexities.' },
  { name: 'Searching', abbr: 'f()', slug: 'searching', desc: 'Linear and binary search, search space reduction, rotated arrays, and lower/upper bounds.' },
  { name: 'Dynamic Programming', abbr: 'DP', slug: 'dynamic-programming', desc: 'Optimal substructure, memoization, tabulation, knapsack, LCS, and state transitions.' }
];

// Helper to resolve canonical topic name
function resolveTopic(input) {
  if (!input) return null;
  const clean = input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const matched = CODING_TOPICS.find(t => t.slug === clean || t.name.toLowerCase() === input.toLowerCase());
  return matched ? matched.name : input;
}

function getSlug(name) {
  const found = CODING_TOPICS.find(t => t.name === name);
  if (found) return found.slug;
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// @desc    Get All 11 Coding Topics with dynamic MongoDB stats & student progress
// @route   GET /api/coding/topics
// @access  Protected
exports.getTopics = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // 1. Aggregate problem counts per topic and difficulty
  const problemAgg = await CodingProblem.aggregate([
    {
      $group: {
        _id: { topic: '$topic', difficulty: '$difficulty' },
        count: { $sum: 1 }
      }
    }
  ]);

  const topicProblemsMap = {};
  problemAgg.forEach(p => {
    const t = p._id.topic;
    const d = p._id.difficulty;
    if (!topicProblemsMap[t]) {
      topicProblemsMap[t] = { total: 0, easy: 0, medium: 0, hard: 0 };
    }
    topicProblemsMap[t].total += p.count;
    if (d === 'Easy') topicProblemsMap[t].easy += p.count;
    if (d === 'Medium') topicProblemsMap[t].medium += p.count;
    if (d === 'Hard') topicProblemsMap[t].hard += p.count;
  });

  // 2. Count distinct solved problems per topic for this student
  const solvedAgg = await CodingSubmission.aggregate([
    { $match: { student: req.user._id, status: 'Accepted' } },
    { $group: { _id: { topic: '$topic', problem: '$problem' } } },
    { $group: { _id: '$_id.topic', count: { $sum: 1 } } }
  ]);

  const solvedMap = {};
  solvedAgg.forEach(s => {
    if (s._id) solvedMap[s._id] = s.count;
  });

  // 3. Check notes and interview questions availability
  const [availableNotes, interviewCounts] = await Promise.all([
    CodingNote.find().select('topic'),
    InterviewQuestion.aggregate([{ $group: { _id: '$topic', count: { $sum: 1 } } }])
  ]);

  const notesSet = new Set(availableNotes.map(n => n.topic));
  const interviewMap = {};
  interviewCounts.forEach(i => {
    if (i._id) interviewMap[i._id] = i.count;
  });

  const topicsWithData = CODING_TOPICS.map((topic, index) => {
    const probData = topicProblemsMap[topic.name] || { total: 0, easy: 0, medium: 0, hard: 0 };
    const solvedCount = solvedMap[topic.name] || 0;
    const progressPercentage = probData.total > 0 ? Math.round((solvedCount / probData.total) * 100) : 0;

    return {
      index: index + 1,
      name: topic.name,
      slug: topic.slug,
      abbr: topic.abbr,
      description: topic.desc,
      totalProblems: probData.total,
      easyProblems: probData.easy,
      mediumProblems: probData.medium,
      hardProblems: probData.hard,
      solvedProblems: solvedCount,
      progressPercentage,
      notesAvailable: notesSet.has(topic.name),
      interviewQuestionsCount: interviewMap[topic.name] || 0
    };
  });

  res.status(200).json({
    success: true,
    count: topicsWithData.length,
    data: topicsWithData
  });
});

// @desc    Get Specific Topic Details
// @route   GET /api/coding/topics/:topicSlug
// @access  Protected
exports.getTopicDetails = catchAsync(async (req, res, next) => {
  const topicName = resolveTopic(req.params.topicSlug);
  const topicInfo = CODING_TOPICS.find(t => t.name === topicName) || {
    name: topicName,
    slug: req.params.topicSlug,
    desc: `Comprehensive DSA preparation for ${topicName}.`
  };

  const [totalProblems, noteDoc, interviewCount, solvedCount] = await Promise.all([
    CodingProblem.countDocuments({ topic: topicName }),
    CodingNote.findOne({ topic: topicName }),
    InterviewQuestion.countDocuments({ topic: topicName }),
    CodingSubmission.distinct('problem', { student: req.user.id, topic: topicName, status: 'Accepted' })
  ]);

  const progressPercentage = totalProblems > 0 ? Math.round((solvedCount.length / totalProblems) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      ...topicInfo,
      totalProblems,
      solvedProblems: solvedCount.length,
      progressPercentage,
      hasNotes: !!noteDoc,
      interviewQuestionsCount: interviewCount
    }
  });
});

// @desc    Get Theoretical Notes for a Topic
// @route   GET /api/coding/topics/:topicSlug/notes
// @access  Protected
exports.getTopicNotes = catchAsync(async (req, res, next) => {
  const topicName = resolveTopic(req.params.topicSlug);
  const userId = req.user.id;

  const note = await CodingNote.findOne({ topic: topicName });

  // Update progress to mark notes as read
  await Progress.findOneAndUpdate(
    { userId, moduleName: 'Coding', topic: topicName },
    { 
      $set: { notesRead: true, lastActivityAt: new Date() },
      $inc: { attempts: 1 }
    },
    { upsert: true, new: true }
  );

  // Log activity
  await Activity.create({
    userId,
    title: `Studied ${topicName} theoretical notes & complexity guides`,
    type: 'lesson',
    module: 'Coding',
    metadata: { topic: topicName }
  }).catch(() => {});

  if (!note) {
    return res.status(200).json({
      success: true,
      message: 'Default conceptual note',
      data: {
        topic: topicName,
        slug: getSlug(topicName),
        introduction: `Comprehensive study notes for ${topicName}.`,
        definition: `${topicName} is a foundational data structure/algorithm in computer science.`,
        concepts: [
          { title: 'Core Principles', content: `Understanding the memory representation, traversal rules, and time/space constraints for ${topicName}.` }
        ],
        algorithms: [
          {
            name: `Standard ${topicName} Traversal`,
            description: 'Traverses each element in linear or logarithmic steps.',
            pseudocode: `function solve(data) {\n  for item in data {\n    process(item);\n  }\n}`,
            timeComplexity: { best: 'O(1)', average: 'O(N)', worst: 'O(N)' },
            spaceComplexity: 'O(1)'
          }
        ],
        complexityOverview: {
          timeSummary: [{ operation: 'Access/Lookup', best: 'O(1)', average: 'O(N)', worst: 'O(N)' }],
          spaceSummary: [{ operation: 'Auxiliary Memory', space: 'O(1)' }]
        },
        examples: [{
          title: `Basic ${topicName} Example`,
          input: '[1, 2, 3, 4]',
          output: '[4, 3, 2, 1]',
          explanation: 'Demonstrating operations and optimal traversal.',
          walkthrough: 'Step-by-step element evaluation.'
        }],
        commonMistakes: ['Off-by-one errors in boundary conditions', 'Ignoring empty or null inputs'],
        interviewTips: ['Always state time and space complexity before writing code.', 'Discuss trade-offs between iterative and recursive solutions.'],
        placementTips: ['Frequently asked in technical interview rounds of Amazon, Microsoft, and TCS.'],
        importantPatterns: [{ name: 'Two Pointers / Sliding Window', description: 'Optimal pointers management.', whenToUse: 'Linear array or string evaluations.' }],
        practiceGuidance: 'Proceed to solve Easy problems on this topic.'
      }
    });
  }

  res.status(200).json({
    success: true,
    data: note
  });
});

// @desc    Get Technical Interview Questions (with search & filters)
// @route   GET /api/coding/interview or GET /api/coding/topics/:topicSlug/interview
// @access  Protected
exports.getInterviewQuestions = catchAsync(async (req, res, next) => {
  const { topicSlug } = req.params;
  const { topic, difficulty, search, page = 1, limit = 50 } = req.query;

  const query = {};
  const activeTopic = topicSlug ? resolveTopic(topicSlug) : (topic ? resolveTopic(topic) : null);
  if (activeTopic) query.topic = activeTopic;
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (search) {
    query.$or = [
      { question: { $regex: search, $options: 'i' } },
      { answer: { $regex: search, $options: 'i' } },
      { explanation: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [questions, total] = await Promise.all([
    InterviewQuestion.find(query).skip(skip).limit(parseInt(limit)).sort('createdAt'),
    InterviewQuestion.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: questions.length,
    total,
    page: parseInt(page),
    data: questions
  });
});

// @desc    Get Coding Problems Catalog (with filters & student solved status)
// @route   GET /api/coding/problems
// @access  Protected
exports.getAllCodingProblems = catchAsync(async (req, res, next) => {
  const { topic, difficulty, status, bookmarked, search, page = 1, limit = 50 } = req.query;
  const userId = req.user.id;

  const query = {};
  if (topic && topic !== 'All') query.topic = resolveTopic(topic);
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  // Get student submissions to evaluate Solved / Attempted status
  const studentSubmissions = await CodingSubmission.find({ student: req.user._id }).select('problem status');
  const solvedProblemIds = new Set();
  const attemptedProblemIds = new Set();

  studentSubmissions.forEach(sub => {
    const pid = sub.problem.toString();
    attemptedProblemIds.add(pid);
    if (sub.status === 'Accepted') solvedProblemIds.add(pid);
  });

  // Get bookmarked problem IDs
  const bookmarkedDocs = await Bookmark.find({ userId, itemType: 'CodingProblem' }).select('itemId');
  const bookmarkedIds = new Set(bookmarkedDocs.map(b => b.itemId.toString()));

  // Apply Status Filter if requested
  if (status === 'Solved') {
    query._id = { $in: Array.from(solvedProblemIds) };
  } else if (status === 'Attempted') {
    const attemptedOnly = Array.from(attemptedProblemIds).filter(id => !solvedProblemIds.has(id));
    query._id = { $in: attemptedOnly };
  } else if (status === 'Unsolved') {
    query._id = { $nin: Array.from(solvedProblemIds) };
  }

  // Apply Bookmarked Filter if requested
  if (bookmarked === 'true' || bookmarked === true) {
    if (query._id) {
      // Intersection
      const existingIn = query._id.$in || [];
      query._id = { $in: existingIn.filter(id => bookmarkedIds.has(id.toString())) };
    } else {
      query._id = { $in: Array.from(bookmarkedIds) };
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [problems, total] = await Promise.all([
    CodingProblem.find(query)
      .select('-hiddenTestCases -solution.code')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('createdAt'),
    CodingProblem.countDocuments(query)
  ]);

  const formatted = problems.map(p => {
    const pid = p._id.toString();
    const isSolved = solvedProblemIds.has(pid);
    const isAttempted = attemptedProblemIds.has(pid);
    const probStatus = isSolved ? 'Solved' : (isAttempted ? 'Attempted' : 'Unsolved');

    return {
      _id: p._id,
      id: p._id,
      title: p.title,
      slug: p.slug,
      topic: p.topic,
      difficulty: p.difficulty,
      description: p.description,
      timeComplexity: p.timeComplexity,
      spaceComplexity: p.spaceComplexity,
      tags: p.tags,
      companyTags: p.companyTags,
      status: probStatus,
      isBookmarked: bookmarkedIds.has(pid),
      totalSubmissions: p.totalSubmissions || 0,
      acceptanceRate: p.totalSubmissions > 0 ? Math.round(((p.acceptedSubmissions || 0) / p.totalSubmissions) * 100) : 0
    };
  });

  res.status(200).json({
    success: true,
    count: formatted.length,
    total,
    page: parseInt(page),
    data: formatted
  });
});

// @desc    Get Specific Coding Problem Detail
// @route   GET /api/coding/problems/:id
// @access  Protected
exports.getCodingProblem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Search by MongoDB _id or slug
  const problem = await CodingProblem.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }]
  }).select('-hiddenTestCases'); // SECURITY: never leak hidden test cases!

  if (!problem) {
    return next(new AppError('Coding problem not found', 404));
  }

  // Check if bookmarked
  const bookmark = await Bookmark.findOne({ userId, itemId: problem._id, itemType: 'CodingProblem' });

  // Check last submission by this student
  const lastSubmission = await CodingSubmission.findOne({ student: req.user._id, problem: problem._id }).sort('-submittedAt');

  // Check if ever solved
  const solvedRecord = await CodingSubmission.findOne({ student: req.user._id, problem: problem._id, status: 'Accepted' });

  res.status(200).json({
    success: true,
    data: {
      ...problem.toObject(),
      isBookmarked: !!bookmark,
      status: solvedRecord ? 'Solved' : (lastSubmission ? 'Attempted' : 'Unsolved'),
      lastCode: lastSubmission ? lastSubmission.code : null,
      lastLanguage: lastSubmission ? lastSubmission.language : 'javascript'
    }
  });
});

// @desc    Get Hints for a Problem
// @route   GET /api/coding/problems/:id/hints
// @access  Protected
exports.getProblemHints = catchAsync(async (req, res, next) => {
  const problem = await CodingProblem.findById(req.params.id).select('hints title');
  if (!problem) return next(new AppError('Problem not found', 404));

  res.status(200).json({
    success: true,
    data: {
      problemId: problem._id,
      title: problem.title,
      hints: problem.hints || []
    }
  });
});

// @desc    Run Code against Sample Test Cases
// @route   POST /api/coding/problems/:id/run
// @access  Protected
exports.runCode = catchAsync(async (req, res, next) => {
  const { code, language = 'javascript' } = req.body;
  const problem = await CodingProblem.findById(req.params.id);

  if (!problem) return next(new AppError('Problem not found', 404));
  if (!code || typeof code !== 'string') return next(new AppError('Code is required', 400));

  const sampleCases = problem.sampleTestCases && problem.sampleTestCases.length > 0 
    ? problem.sampleTestCases 
    : (problem.examples || []).map(e => ({ input: e.input, output: e.output }));

  // Execute in isolated sandbox
  const executionResult = await runCodeOnTestCases(code, language, sampleCases, true);

  res.status(200).json({
    success: true,
    message: 'Sample test cases executed',
    data: executionResult
  });
});

// @desc    Submit Code against All Hidden Test Cases & Record Result
// @route   POST /api/coding/problems/:id/submit
// @access  Protected
exports.submitCode = catchAsync(async (req, res, next) => {
  const { code, language = 'javascript' } = req.body;
  const userId = req.user.id;
  const problem = await CodingProblem.findById(req.params.id);

  if (!problem) return next(new AppError('Problem not found', 404));
  if (!code || typeof code !== 'string') return next(new AppError('Code is required', 400));

  // Combine sample + hidden test cases for full evaluation
  const sampleCases = (problem.sampleTestCases || []).map(s => ({ input: s.input, output: s.output, isHidden: false }));
  const hiddenCases = (problem.hiddenTestCases || []).map(h => ({ input: h.input, output: h.output, isHidden: true }));
  const allCases = sampleCases.length > 0 || hiddenCases.length > 0 
    ? [...sampleCases, ...hiddenCases]
    : (problem.examples || []).map(e => ({ input: e.input, output: e.output, isHidden: false }));

  // Execute in isolated sandbox
  const evalResult = await runCodeOnTestCases(code, language, allCases, false);

  // Filter out raw inputs of hidden test cases from the client response for security
  const sanitizedTestResults = evalResult.testResults.map(t => ({
    testIndex: t.testIndex,
    passed: t.passed,
    isHidden: t.isHidden,
    input: t.isHidden ? '[Hidden Test Case]' : t.input,
    expectedOutput: t.isHidden ? '[Hidden Output]' : t.expectedOutput,
    actualOutput: t.isHidden ? (t.passed ? '[Correct Output]' : 'Failed') : t.actualOutput,
    executionTime: t.executionTime,
    memory: t.memory,
    error: t.error
  }));

  // Save Submission to MongoDB
  const submission = await CodingSubmission.create({
    student: req.user._id,
    problem: problem._id,
    topic: problem.topic,
    language,
    code,
    status: evalResult.status,
    passedTests: evalResult.passedTests,
    totalTests: evalResult.totalTests,
    executionTime: evalResult.executionTime,
    memory: evalResult.memory,
    errorMessage: evalResult.errorMessage,
    testResults: sanitizedTestResults
  });

  // Update Problem total submissions
  await CodingProblem.findByIdAndUpdate(problem._id, {
    $inc: {
      totalSubmissions: 1,
      acceptedSubmissions: evalResult.status === 'Accepted' ? 1 : 0
    }
  });

  // If Accepted, update student Progress & Activity
  if (evalResult.status === 'Accepted') {
    await Progress.findOneAndUpdate(
      { userId, moduleName: 'Coding', topic: problem.topic },
      {
        $set: { completed: true, lastActivityAt: new Date() },
        $inc: { mcqsCorrect: 1, attempts: 1 }
      },
      { upsert: true, new: true }
    );

    // Update streak
    await User.findByIdAndUpdate(userId, { $inc: { streak: 1 } }).catch(() => {});

    // Log Activity
    await Activity.create({
      userId,
      title: `Solved ${problem.title} (${problem.difficulty}) in ${language.toUpperCase()}`,
      type: 'practice',
      module: 'Coding',
      metadata: { problemId: problem._id, problemTitle: problem.title, language }
    }).catch(() => {});
  } else {
    await Progress.findOneAndUpdate(
      { userId, moduleName: 'Coding', topic: problem.topic },
      {
        $set: { lastActivityAt: new Date() },
        $inc: { attempts: 1 }
      },
      { upsert: true }
    );
  }

  res.status(200).json({
    success: true,
    message: evalResult.status === 'Accepted' ? 'Solution Accepted! 🎉' : `Submission status: ${evalResult.status}`,
    data: {
      submissionId: submission._id,
      status: evalResult.status,
      passedTests: evalResult.passedTests,
      totalTests: evalResult.totalTests,
      executionTime: evalResult.executionTime,
      memory: evalResult.memory,
      errorMessage: evalResult.errorMessage,
      testResults: sanitizedTestResults
    }
  });
});

// @desc    Bookmark / Unbookmark Coding Problem
// @route   POST /api/coding/problems/:id/bookmark
// @access  Protected
exports.toggleBookmark = catchAsync(async (req, res, next) => {
  const problemId = req.params.id;
  const userId = req.user.id;

  const existing = await Bookmark.findOne({ userId, itemId: problemId, itemType: 'CodingProblem' });
  if (existing) {
    await existing.deleteOne();
    return res.status(200).json({
      success: true,
      bookmarked: false,
      message: 'Problem removed from bookmarks'
    });
  }

  await Bookmark.create({
    userId,
    itemId: problemId,
    itemType: 'CodingProblem'
  });

  res.status(200).json({
    success: true,
    bookmarked: true,
    message: 'Problem bookmarked'
  });
});

// @desc    Get Student Submission History
// @route   GET /api/coding/submissions
// @access  Protected
exports.getSubmissions = catchAsync(async (req, res, next) => {
  const { problemId, page = 1, limit = 50 } = req.query;
  const query = { student: req.user._id };
  if (problemId) query.problem = problemId;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [submissions, total] = await Promise.all([
    CodingSubmission.find(query)
      .populate('problem', 'title slug topic difficulty')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-submittedAt'),
    CodingSubmission.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: submissions.length,
    total,
    page: parseInt(page),
    data: submissions
  });
});

// @desc    Get Single Submission Detail
// @route   GET /api/coding/submissions/:id
// @access  Protected
exports.getSubmissionById = catchAsync(async (req, res, next) => {
  const submission = await CodingSubmission.findOne({
    _id: req.params.id,
    student: req.user._id
  }).populate('problem', 'title slug topic difficulty explanation solution');

  if (!submission) return next(new AppError('Submission not found', 404));

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Get Overall Student Coding Progress
// @route   GET /api/coding/progress
// @access  Protected
exports.getProgress = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const [totalProblems, solvedProblemIds, allSubmissions] = await Promise.all([
    CodingProblem.countDocuments(),
    CodingSubmission.distinct('problem', { student: userId, status: 'Accepted' }),
    CodingSubmission.find({ student: userId }).select('status')
  ]);

  const totalAttempts = allSubmissions.length;
  const acceptedCount = allSubmissions.filter(s => s.status === 'Accepted').length;
  const accuracy = totalAttempts > 0 ? Math.round((acceptedCount / totalAttempts) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      totalTopics: 11,
      totalProblems,
      solvedCount: solvedProblemIds.length,
      progressPercentage: totalProblems > 0 ? Math.round((solvedProblemIds.length / totalProblems) * 100) : 0,
      totalAttempts,
      accuracy,
      streak: req.user.streak || 0
    }
  });
});

// @desc    Get Dynamic Result Analysis & Weak Topic Intelligence
// @route   GET /api/coding/analytics
// @access  Protected
exports.getAnalytics = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // 1. All submissions by this student
  const submissions = await CodingSubmission.find({ student: userId })
    .populate('problem', 'title slug topic difficulty')
    .sort('-submittedAt');

  const totalAttempts = submissions.length;
  const acceptedCount = submissions.filter(s => s.status === 'Accepted').length;
  const rejectedCount = totalAttempts - acceptedCount;
  const accuracy = totalAttempts > 0 ? Math.round((acceptedCount / totalAttempts) * 100) : 0;

  // Solved distinct problems
  const solvedProblemMap = {};
  submissions.forEach(s => {
    if (s.status === 'Accepted' && s.problem) {
      solvedProblemMap[s.problem._id.toString()] = s.problem;
    }
  });
  const totalSolved = Object.keys(solvedProblemMap).length;

  // 2. Difficulty breakdown from MongoDB
  const difficultyAgg = await CodingProblem.aggregate([
    { $group: { _id: '$difficulty', total: { $sum: 1 } } }
  ]);
  const diffTotalMap = { Easy: 0, Medium: 0, Hard: 0 };
  difficultyAgg.forEach(d => { if (d._id) diffTotalMap[d._id] = d.total; });

  const diffSolvedMap = { Easy: 0, Medium: 0, Hard: 0 };
  Object.values(solvedProblemMap).forEach(p => {
    if (p && p.difficulty && diffSolvedMap[p.difficulty] !== undefined) {
      diffSolvedMap[p.difficulty]++;
    }
  });

  const difficultyDistribution = [
    { difficulty: 'Easy', solved: diffSolvedMap.Easy, total: diffTotalMap.Easy, percentage: diffTotalMap.Easy > 0 ? Math.round((diffSolvedMap.Easy / diffTotalMap.Easy) * 100) : 0 },
    { difficulty: 'Medium', solved: diffSolvedMap.Medium, total: diffTotalMap.Medium, percentage: diffTotalMap.Medium > 0 ? Math.round((diffSolvedMap.Medium / diffTotalMap.Medium) * 100) : 0 },
    { difficulty: 'Hard', solved: diffSolvedMap.Hard, total: diffTotalMap.Hard, percentage: diffTotalMap.Hard > 0 ? Math.round((diffSolvedMap.Hard / diffTotalMap.Hard) * 100) : 0 }
  ];

  // 3. Topic performance breakdown
  const topicTotalAgg = await CodingProblem.aggregate([
    { $group: { _id: '$topic', total: { $sum: 1 } } }
  ]);
  const topicTotalMap = {};
  topicTotalAgg.forEach(t => { if (t._id) topicTotalMap[t._id] = t.total; });

  const topicSubStats = {};
  CODING_TOPICS.forEach(t => {
    topicSubStats[t.name] = { totalAttempts: 0, accepted: 0, distinctSolved: new Set() };
  });

  submissions.forEach(s => {
    const t = s.topic;
    if (topicSubStats[t]) {
      topicSubStats[t].totalAttempts++;
      if (s.status === 'Accepted') {
        topicSubStats[t].accepted++;
        if (s.problem) topicSubStats[t].distinctSolved.add(s.problem._id.toString());
      }
    }
  });

  const topicPerformance = CODING_TOPICS.map(t => {
    const stats = topicSubStats[t.name] || { totalAttempts: 0, accepted: 0, distinctSolved: new Set() };
    const totalProb = topicTotalMap[t.name] || 0;
    const solved = stats.distinctSolved.size;
    const topicAcc = stats.totalAttempts > 0 ? Math.round((stats.accepted / stats.totalAttempts) * 100) : 0;
    const progress = totalProb > 0 ? Math.round((solved / totalProb) * 100) : 0;

    return {
      topic: t.name,
      slug: t.slug,
      solved,
      total: totalProb,
      progress,
      accuracy: topicAcc,
      totalAttempts: stats.totalAttempts
    };
  });

  // 4. Calculate Weak and Strong Topics based on real submission history
  const attemptedTopics = topicPerformance.filter(tp => tp.totalAttempts > 0);
  const weakTopics = attemptedTopics
    .filter(tp => tp.accuracy < 50 || tp.progress < 30)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  const strongTopics = attemptedTopics
    .filter(tp => tp.accuracy >= 65 && tp.solved > 0)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3);

  // 5. Recommended Problems
  let recommendedProblems = [];
  if (weakTopics.length > 0) {
    const weakTopicNames = weakTopics.map(w => w.topic);
    const solvedIds = Object.keys(solvedProblemMap);
    recommendedProblems = await CodingProblem.find({
      topic: { $in: weakTopicNames },
      _id: { $nin: solvedIds }
    })
    .select('title slug topic difficulty timeComplexity tags')
    .limit(6);
  }

  if (recommendedProblems.length < 4) {
    const solvedIds = Object.keys(solvedProblemMap);
    const additional = await CodingProblem.find({
      _id: { $nin: solvedIds },
      difficulty: 'Easy'
    })
    .select('title slug topic difficulty timeComplexity tags')
    .limit(6 - recommendedProblems.length);

    recommendedProblems = [...recommendedProblems, ...additional];
  }

  // Avg execution time
  const avgExecutionTime = totalAttempts > 0 
    ? Math.round(submissions.reduce((a, b) => a + (b.executionTime || 0), 0) / totalAttempts) 
    : 0;

  res.status(200).json({
    success: true,
    data: {
      totalSolved,
      totalAttempts,
      acceptedCount,
      rejectedCount,
      accuracy,
      avgExecutionTime,
      streak: req.user.streak || 0,
      difficultyDistribution,
      topicPerformance,
      weakTopics,
      strongTopics,
      recommendedProblems,
      recentSubmissions: submissions.slice(0, 10)
    }
  });
});

// Admin Controllers with validation
exports.createCodingProblem = catchAsync(async (req, res, next) => {
  const { title, topic, difficulty, description, examples, sampleTestCases, solution } = req.body;

  if (!title || !topic || !difficulty || !description) {
    return next(new AppError('Title, topic, difficulty, and description are required', 400));
  }

  const slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const existing = await CodingProblem.findOne({ slug });
  if (existing) return next(new AppError('A coding problem with this title or slug already exists', 409));

  req.body.slug = slug;
  req.body.createdBy = req.user.id;
  const problem = await CodingProblem.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Coding problem created successfully',
    data: problem
  });
});

exports.updateCodingProblem = catchAsync(async (req, res, next) => {
  const problem = await CodingProblem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!problem) return next(new AppError('Coding problem not found', 404));

  res.status(200).json({
    success: true,
    message: 'Coding problem updated successfully',
    data: problem
  });
});

exports.deleteCodingProblem = catchAsync(async (req, res, next) => {
  const problem = await CodingProblem.findByIdAndDelete(req.params.id);
  if (!problem) return next(new AppError('Coding problem not found', 404));

  // Clean up submissions for this problem
  await CodingSubmission.deleteMany({ problem: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Coding problem deleted successfully'
  });
});
