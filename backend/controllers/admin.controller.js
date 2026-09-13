const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CodingProblem = require('../models/CodingProblem');
const CodingNote = require('../models/CodingNote');
const InterviewQuestion = require('../models/InterviewQuestion');
const CodingSubmission = require('../models/CodingSubmission');
const Question = require('../models/Question');
const TopicNote = require('../models/TopicNote');
const Company = require('../models/Company');
const Test = require('../models/Test');
const Result = require('../models/Result');
const ResumeScan = require('../models/ResumeScan');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const AdminActivity = require('../models/AdminActivity');
const Progress = require('../models/Progress');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Helper to log admin actions
const logAdminAction = async (adminUser, action, entity, entityId = '', details = '', req = null) => {
  try {
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || '';
    await AdminActivity.create({
      adminId: adminUser._id,
      adminName: adminUser.name || 'Administrator',
      action,
      entity,
      entityId: entityId ? entityId.toString() : '',
      details,
      ip
    });
  } catch (err) {
    console.error('Failed to log admin action:', err.message);
  }
};

// ============================================================================
// 1. DASHBOARD ANALYTICS & STATS
// ============================================================================
exports.getDashboardStats = asyncHandler(async (req, res) => {
  // Concurrent MongoDB counts
  const [
    totalStudents,
    activeStudents,
    blockedStudents,
    totalCodingProblems,
    totalAptitudeQuestions,
    totalReasoningQuestions,
    totalEnglishQuestions,
    totalCompanies,
    totalMockTests,
    totalResumesScanned,
    totalTestAttempts,
    totalCodingSubmissions,
    totalCodingNotes,
    totalTopicNotes
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'student', isBlocked: false }),
    User.countDocuments({ role: 'student', isBlocked: true }),
    CodingProblem.countDocuments(),
    Question.countDocuments({ moduleType: 'Aptitude' }),
    Question.countDocuments({ moduleType: 'Reasoning' }),
    Question.countDocuments({ moduleType: 'English' }),
    Company.countDocuments(),
    Test.countDocuments(),
    ResumeScan.countDocuments(),
    Result.countDocuments(),
    CodingSubmission.countDocuments(),
    CodingNote.countDocuments(),
    TopicNote.countDocuments()
  ]);

  // Registrations in last 7 days aggregation
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const registrationTrends = await User.aggregate([
    { $match: { role: 'student', createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Test Submissions Trend (Last 7 Days)
  const testTrends = await Result.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        avgScore: { $avg: '$percentage' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Placement Readiness distribution
  const readinessDistribution = await User.aggregate([
    { $match: { role: 'student' } },
    {
      $bucket: {
        groupBy: '$readinessScore',
        boundaries: [0, 50, 75, 90, 101],
        default: 'Other',
        output: { count: { $sum: 1 } }
      }
    }
  ]);

  // Recent 10 system activities
  const recentActivities = await Activity.find()
    .populate('userId', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(10);

  // Recent 10 admin actions
  const recentAdminActions = await AdminActivity.find()
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalStudents,
        activeStudents,
        blockedStudents,
        totalCodingProblems,
        totalAptitudeQuestions,
        totalReasoningQuestions,
        totalEnglishQuestions,
        totalCompanies,
        totalMockTests,
        totalResumesScanned,
        totalTestAttempts,
        totalCodingSubmissions,
        totalNotes: totalCodingNotes + totalTopicNotes
      },
      charts: {
        registrationTrends,
        testTrends,
        readinessDistribution
      },
      recentActivities,
      recentAdminActions
    }
  });
});

// ============================================================================
// 2. STUDENT MANAGEMENT
// ============================================================================
exports.getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', status = 'all', sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = { role: 'student' };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { college: { $regex: search, $options: 'i' } },
      { branch: { $regex: search, $options: 'i' } }
    ];
  }

  if (status === 'active') query.isBlocked = false;
  if (status === 'blocked') query.isBlocked = true;

  const sortOrder = order === 'asc' ? 1 : -1;
  const sortCriteria = { [sortBy]: sortOrder };

  const skip = (Number(page) - 1) * Number(limit);

  const [students, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort(sortCriteria)
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: students
  });
});

exports.getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await User.findById(id).select('-password');
  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  const [results, submissions, scans, progress, activities] = await Promise.all([
    Result.find({ userId: id }).sort({ createdAt: -1 }).limit(10),
    CodingSubmission.find({ $or: [{ student: id }, { userId: id }] }).populate('problem', 'title difficulty').sort({ createdAt: -1 }).limit(10),
    ResumeScan.find({ userId: id }).sort({ createdAt: -1 }).limit(5),
    Progress.findOne({ userId: id }),
    Activity.find({ userId: id }).sort({ createdAt: -1 }).limit(10)
  ]);

  res.status(200).json({
    success: true,
    data: {
      student,
      results,
      submissions,
      scans,
      progress,
      activities
    }
  });
});

exports.toggleBlockStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = '' } = req.body;

  const student = await User.findById(id);
  if (!student) throw new ApiError(404, 'Student not found');

  student.isBlocked = !student.isBlocked;
  student.accountStatus = student.isBlocked ? 'suspended' : 'active';
  await student.save();

  const action = student.isBlocked ? 'BLOCK_STUDENT' : 'UNBLOCK_STUDENT';
  await logAdminAction(req.user, action, 'User', student._id, `Reason: ${reason || 'Admin action'}`, req);

  res.status(200).json({
    success: true,
    message: `Student successfully ${student.isBlocked ? 'blocked' : 'unblocked'}`,
    data: { isBlocked: student.isBlocked, accountStatus: student.accountStatus }
  });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await User.findById(id);
  if (!student) throw new ApiError(404, 'Student not found');

  student.accountStatus = 'disabled';
  student.isBlocked = true;
  await student.save();

  await logAdminAction(req.user, 'DISABLE_STUDENT', 'User', id, 'Soft-deleted account', req);

  res.status(200).json({
    success: true,
    message: 'Student account deactivated successfully'
  });
});

// ============================================================================
// 3. CODING PRACTICE MANAGEMENT
// ============================================================================
exports.getCodingProblems = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, topic, difficulty, search } = req.query;

  const query = {};
  if (topic && topic !== 'All') query.topic = topic;
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (search) query.title = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);

  const [problems, total] = await Promise.all([
    CodingProblem.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    CodingProblem.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: problems
  });
});

exports.createCodingProblem = asyncHandler(async (req, res) => {
  if (!req.body.slug && req.body.title) {
    req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  if (!req.body.examples || req.body.examples.length === 0) {
    req.body.examples = [{ input: 'Input sample', output: 'Output sample', explanation: '' }];
  }
  if (!req.body.sampleTestCases || req.body.sampleTestCases.length === 0) {
    req.body.sampleTestCases = [{ input: 'Input sample', output: 'Output sample' }];
  }

  const problem = await CodingProblem.create(req.body);
  await logAdminAction(req.user, 'CREATE_CODING_PROBLEM', 'CodingProblem', problem._id, `Created ${problem.title}`, req);

  res.status(201).json({
    success: true,
    message: 'Coding problem created successfully',
    data: problem
  });
});

exports.updateCodingProblem = asyncHandler(async (req, res) => {
  const problem = await CodingProblem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    returnDocument: 'after'
  });

  if (!problem) throw new ApiError(404, 'Coding problem not found');

  await logAdminAction(req.user, 'UPDATE_CODING_PROBLEM', 'CodingProblem', problem._id, `Updated ${problem.title}`, req);

  res.status(200).json({
    success: true,
    message: 'Coding problem updated successfully',
    data: problem
  });
});

exports.deleteCodingProblem = asyncHandler(async (req, res) => {
  const problem = await CodingProblem.findByIdAndDelete(req.params.id);
  if (!problem) throw new ApiError(404, 'Coding problem not found');

  await logAdminAction(req.user, 'DELETE_CODING_PROBLEM', 'CodingProblem', req.params.id, `Deleted ${problem.title}`, req);

  res.status(200).json({
    success: true,
    message: 'Coding problem deleted successfully'
  });
});

// Coding Notes
exports.getCodingNotes = asyncHandler(async (req, res) => {
  const { topic } = req.query;
  const query = topic ? { topic } : {};
  const notes = await CodingNote.find(query).sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: notes.length, data: notes });
});

exports.createCodingNote = asyncHandler(async (req, res) => {
  const note = await CodingNote.create(req.body);
  await logAdminAction(req.user, 'CREATE_CODING_NOTE', 'CodingNote', note._id, `Created note for ${note.topic}`, req);
  res.status(201).json({ success: true, message: 'Coding note created', data: note });
});

exports.updateCodingNote = asyncHandler(async (req, res) => {
  const note = await CodingNote.findByIdAndUpdate(req.params.id, req.body, { new: true, returnDocument: 'after' });
  if (!note) throw new ApiError(404, 'Coding note not found');
  await logAdminAction(req.user, 'UPDATE_CODING_NOTE', 'CodingNote', note._id, `Updated note for ${note.topic}`, req);
  res.status(200).json({ success: true, message: 'Coding note updated', data: note });
});

exports.deleteCodingNote = asyncHandler(async (req, res) => {
  const note = await CodingNote.findByIdAndDelete(req.params.id);
  if (!note) throw new ApiError(404, 'Coding note not found');
  await logAdminAction(req.user, 'DELETE_CODING_NOTE', 'CodingNote', req.params.id, 'Deleted note', req);
  res.status(200).json({ success: true, message: 'Coding note deleted' });
});

// Interview Questions
exports.getInterviewQuestions = asyncHandler(async (req, res) => {
  const { topic, difficulty, search } = req.query;
  const query = {};
  if (topic && topic !== 'All') query.topic = topic;
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (search) query.question = { $regex: search, $options: 'i' };

  const questions = await InterviewQuestion.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: questions.length, data: questions });
});

exports.createInterviewQuestion = asyncHandler(async (req, res) => {
  const q = await InterviewQuestion.create(req.body);
  await logAdminAction(req.user, 'CREATE_INTERVIEW_Q', 'InterviewQuestion', q._id, `Created question for ${q.topic}`, req);
  res.status(201).json({ success: true, message: 'Interview question created', data: q });
});

exports.updateInterviewQuestion = asyncHandler(async (req, res) => {
  const q = await InterviewQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true, returnDocument: 'after' });
  if (!q) throw new ApiError(404, 'Interview question not found');
  await logAdminAction(req.user, 'UPDATE_INTERVIEW_Q', 'InterviewQuestion', q._id, `Updated question`, req);
  res.status(200).json({ success: true, message: 'Interview question updated', data: q });
});

exports.deleteInterviewQuestion = asyncHandler(async (req, res) => {
  const q = await InterviewQuestion.findByIdAndDelete(req.params.id);
  if (!q) throw new ApiError(404, 'Interview question not found');
  await logAdminAction(req.user, 'DELETE_INTERVIEW_Q', 'InterviewQuestion', req.params.id, 'Deleted question', req);
  res.status(200).json({ success: true, message: 'Interview question deleted' });
});

// ============================================================================
// 4. QUESTIONS MANAGEMENT (Aptitude, Reasoning, English)
// ============================================================================
exports.getQuestions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, moduleType, category, difficulty, search } = req.query;

  const query = {};
  if (moduleType && moduleType !== 'All') query.moduleType = moduleType;
  if (category && category !== 'All') query.$or = [{ category }, { topic: category }];
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (search) query.questionText = { $regex: search, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);

  const [questions, total] = await Promise.all([
    Question.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Question.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: questions
  });
});

exports.createQuestion = asyncHandler(async (req, res) => {
  const { questionText, options, correctAnswer, moduleType, category } = req.body;

  if (!questionText || !options || !correctAnswer || !moduleType || !category) {
    throw new ApiError(400, 'Please provide question text, options, correct answer, module type, and category');
  }

  if (!options.includes(correctAnswer)) {
    throw new ApiError(400, 'Correct answer must be one of the provided options');
  }

  const q = await Question.create(req.body);
  await logAdminAction(req.user, 'CREATE_QUESTION', 'Question', q._id, `Created ${moduleType} Q in ${category}`, req);

  res.status(201).json({
    success: true,
    message: 'Question created successfully',
    data: q
  });
});

exports.updateQuestion = asyncHandler(async (req, res) => {
  const { options, correctAnswer } = req.body;
  if (options && correctAnswer && !options.includes(correctAnswer)) {
    throw new ApiError(400, 'Correct answer must be one of the provided options');
  }

  const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, returnDocument: 'after' });
  if (!q) throw new ApiError(404, 'Question not found');

  await logAdminAction(req.user, 'UPDATE_QUESTION', 'Question', q._id, `Updated question`, req);

  res.status(200).json({
    success: true,
    message: 'Question updated successfully',
    data: q
  });
});

exports.deleteQuestion = asyncHandler(async (req, res) => {
  const q = await Question.findByIdAndDelete(req.params.id);
  if (!q) throw new ApiError(404, 'Question not found');

  await logAdminAction(req.user, 'DELETE_QUESTION', 'Question', req.params.id, 'Deleted question', req);

  res.status(200).json({
    success: true,
    message: 'Question deleted successfully'
  });
});

// Topic Notes (Aptitude / Reasoning / English)
exports.getTopicNotes = asyncHandler(async (req, res) => {
  const { moduleType, topic } = req.query;
  const query = {};
  if (moduleType) query.moduleType = moduleType;
  if (topic) query.topic = topic;

  const notes = await TopicNote.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: notes.length, data: notes });
});

exports.createTopicNote = asyncHandler(async (req, res) => {
  const note = await TopicNote.create(req.body);
  await logAdminAction(req.user, 'CREATE_TOPIC_NOTE', 'TopicNote', note._id, `Created ${note.moduleType} note for ${note.topic}`, req);
  res.status(201).json({ success: true, message: 'Topic note created', data: note });
});

exports.updateTopicNote = asyncHandler(async (req, res) => {
  const note = await TopicNote.findByIdAndUpdate(req.params.id, req.body, { new: true, returnDocument: 'after' });
  if (!note) throw new ApiError(404, 'Topic note not found');
  await logAdminAction(req.user, 'UPDATE_TOPIC_NOTE', 'TopicNote', note._id, `Updated topic note`, req);
  res.status(200).json({ success: true, message: 'Topic note updated', data: note });
});

exports.deleteTopicNote = asyncHandler(async (req, res) => {
  const note = await TopicNote.findByIdAndDelete(req.params.id);
  if (!note) throw new ApiError(404, 'Topic note not found');
  await logAdminAction(req.user, 'DELETE_TOPIC_NOTE', 'TopicNote', req.params.id, 'Deleted topic note', req);
  res.status(200).json({ success: true, message: 'Topic note deleted' });
});

// ============================================================================
// 5. COMPANY MANAGEMENT
// ============================================================================
exports.getCompanies = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};

  const companies = await Company.find(query).sort({ name: 1 });
  res.status(200).json({ success: true, count: companies.length, data: companies });
});

exports.getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');
  res.status(200).json({ success: true, data: company });
});

exports.createCompany = asyncHandler(async (req, res) => {
  if (!req.body.slug && req.body.name) {
    req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  const company = await Company.create(req.body);
  await logAdminAction(req.user, 'CREATE_COMPANY', 'Company', company._id, `Created ${company.name}`, req);
  res.status(201).json({ success: true, message: 'Company created successfully', data: company });
});

exports.updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, returnDocument: 'after' });
  if (!company) throw new ApiError(404, 'Company not found');
  await logAdminAction(req.user, 'UPDATE_COMPANY', 'Company', company._id, `Updated ${company.name}`, req);
  res.status(200).json({ success: true, message: 'Company updated successfully', data: company });
});

exports.deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');
  await logAdminAction(req.user, 'DELETE_COMPANY', 'Company', req.params.id, `Deleted ${company.name}`, req);
  res.status(200).json({ success: true, message: 'Company deleted successfully' });
});

// ============================================================================
// 6. MOCK TEST MANAGEMENT
// ============================================================================
exports.getMockTests = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const query = {};
  if (category && category !== 'all') query.category = category;
  if (search) query.title = { $regex: search, $options: 'i' };

  const tests = await Test.find(query).populate('questions', 'questionText difficulty category moduleType').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: tests.length, data: tests });
});

exports.createMockTest = asyncHandler(async (req, res) => {
  const { title, duration, category, questions, totalQuestions } = req.body;

  if (!title || !duration || !questions || questions.length === 0) {
    throw new ApiError(400, 'Please provide test title, duration, and select at least 1 question');
  }

  if (!req.body.slug && req.body.title) {
    req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }

  req.body.totalQuestions = questions.length;
  req.body.totalMarks = questions.length;

  const test = await Test.create(req.body);
  await logAdminAction(req.user, 'CREATE_MOCK_TEST', 'Test', test._id, `Created mock test ${test.title}`, req);

  res.status(201).json({
    success: true,
    message: 'Mock test created successfully',
    data: test
  });
});

exports.updateMockTest = asyncHandler(async (req, res) => {
  if (req.body.questions) {
    req.body.totalQuestions = req.body.questions.length;
    req.body.totalMarks = req.body.questions.length;
  }

  const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, returnDocument: 'after' });
  if (!test) throw new ApiError(404, 'Mock test not found');

  await logAdminAction(req.user, 'UPDATE_MOCK_TEST', 'Test', test._id, `Updated mock test ${test.title}`, req);

  res.status(200).json({
    success: true,
    message: 'Mock test updated successfully',
    data: test
  });
});

exports.deleteMockTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndDelete(req.params.id);
  if (!test) throw new ApiError(404, 'Mock test not found');

  await logAdminAction(req.user, 'DELETE_MOCK_TEST', 'Test', req.params.id, `Deleted ${test.title}`, req);

  res.status(200).json({
    success: true,
    message: 'Mock test deleted successfully'
  });
});

// ============================================================================
// 7. RESULTS & CODING SUBMISSIONS
// ============================================================================
exports.getTestResults = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', status } = req.query;

  const query = {};
  if (status && status !== 'all') query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [results, total] = await Promise.all([
    Result.find(query)
      .populate('userId', 'name email college branch')
      .populate('testId', 'title category duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Result.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: results
  });
});

exports.getCodingSubmissions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, language } = req.query;

  const query = {};
  if (status && status !== 'all') query.status = status;
  if (language && language !== 'all') query.language = language;

  const skip = (Number(page) - 1) * Number(limit);

  const [rawSubmissions, total] = await Promise.all([
    CodingSubmission.find(query)
      .populate('student', 'name email college')
      .populate('problem', 'title difficulty topic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    CodingSubmission.countDocuments(query)
  ]);

  const submissions = rawSubmissions.map(s => {
    const obj = s.toObject ? s.toObject() : s;
    obj.userId = obj.userId || obj.student;
    obj.problemId = obj.problemId || obj.problem;
    return obj;
  });

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: submissions
  });
});

// ============================================================================
// 8. RESUME SCANNER ANALYTICS
// ============================================================================
exports.getResumeStats = asyncHandler(async (req, res) => {
  const [totalScans, avgStats, gradeDistribution, recentScans] = await Promise.all([
    ResumeScan.countDocuments(),
    ResumeScan.aggregate([
      {
        $group: {
          _id: null,
          avgAtsScore: { $avg: '$atsScore' },
          avgReadiness: { $avg: '$placementReadiness' }
        }
      }
    ]),
    ResumeScan.aggregate([
      {
        $group: {
          _id: '$atsGrade',
          count: { $sum: 1 }
        }
      }
    ]),
    ResumeScan.find()
      .populate('userId', 'name email college')
      .select('fileName atsScore atsGrade placementReadiness createdAt')
      .sort({ createdAt: -1 })
      .limit(15)
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalScans,
      avgAtsScore: Math.round(avgStats[0]?.avgAtsScore || 0),
      avgReadiness: Math.round(avgStats[0]?.avgReadiness || 0),
      gradeDistribution,
      recentScans
    }
  });
});

// ============================================================================
// 9. NOTIFICATION MANAGEMENT
// ============================================================================
exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({ success: true, count: notifications.length, data: notifications });
});

exports.createNotification = asyncHandler(async (req, res) => {
  const { title, message, type = 'general', targetUserId, link = '' } = req.body;

  if (!title || !message) {
    throw new ApiError(400, 'Please provide notification title and message');
  }

  if (targetUserId) {
    // Specific student
    await Notification.create({ userId: targetUserId, title, message, type, link });
  } else {
    // Broadcast to all active students
    const students = await User.find({ role: 'student', isBlocked: false }).select('_id');
    if (students.length > 0) {
      const bulkNotifications = students.map(s => ({
        userId: s._id,
        title,
        message,
        type,
        link,
        createdAt: new Date()
      }));
      await Notification.insertMany(bulkNotifications);
    } else {
      // Create broadcast entry if no students in DB yet
      await Notification.create({
        title,
        message,
        type,
        link
      });
    }
  }

  await logAdminAction(req.user, 'SEND_NOTIFICATION', 'Notification', '', `Broadcast: ${title}`, req);

  res.status(201).json({
    success: true,
    message: 'Notification(s) broadcasted successfully'
  });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Notification deleted' });
});

// ============================================================================
// 10. REPORTS & EXPORTS
// ============================================================================
exports.getReportData = asyncHandler(async (req, res) => {
  const { module = 'all', days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  let report = {};

  if (module === 'all' || module === 'students') {
    report.students = await User.find({ role: 'student', createdAt: { $gte: startDate } })
      .select('name email college branch streak readinessScore accountStatus createdAt')
      .sort({ createdAt: -1 });
  }

  if (module === 'all' || module === 'tests') {
    report.tests = await Result.find({ createdAt: { $gte: startDate } })
      .populate('userId', 'name email college')
      .populate('testId', 'title category')
      .select('title topic totalQuestions correctCount wrongCount totalMarks obtainedMarks percentage accuracy timeTaken status createdAt')
      .sort({ createdAt: -1 });
  }

  if (module === 'all' || module === 'coding') {
    report.coding = await CodingSubmission.find({ createdAt: { $gte: startDate } })
      .populate('student', 'name email')
      .populate('problem', 'title difficulty topic')
      .select('language status executionTime passedTests totalTests createdAt')
      .sort({ createdAt: -1 });
  }

  if (module === 'all' || module === 'resumes') {
    report.resumes = await ResumeScan.find({ createdAt: { $gte: startDate } })
      .populate('userId', 'name email')
      .select('fileName atsScore atsGrade placementReadiness createdAt')
      .sort({ createdAt: -1 });
  }

  res.status(200).json({
    success: true,
    module,
    days: Number(days),
    data: report
  });
});

// ============================================================================
// 11. ADMIN ACTIVITY LOGS & AUDIT
// ============================================================================
exports.getAdminActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    AdminActivity.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    AdminActivity.countDocuments()
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: logs
  });
});

// ============================================================================
// 12. ADMIN PROFILE & SETTINGS
// ============================================================================
exports.getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user._id).select('-password');
  res.status(200).json({ success: true, data: admin });
});

exports.updateAdminProfile = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;

  const admin = await User.findById(req.user._id);
  if (name) admin.name = name;
  if (email) admin.email = email.toLowerCase();
  if (phone) admin.phone = phone;

  await admin.save();
  await logAdminAction(req.user, 'UPDATE_PROFILE', 'User', admin._id, 'Updated profile details', req);

  res.status(200).json({
    success: true,
    message: 'Admin profile updated successfully',
    data: admin.toSafeJSON()
  });
});

exports.changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Please provide current and new password');
  }

  const admin = await User.findById(req.user._id).select('+password');
  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  admin.password = await bcrypt.hash(newPassword, 12);
  await admin.save();
  await logAdminAction(req.user, 'CHANGE_PASSWORD', 'User', admin._id, 'Changed admin password', req);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});
