const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const TopicNote = require('../models/TopicNote');
const Progress = require('../models/Progress');
const Result = require('../models/Result');
const QuestionReport = require('../models/QuestionReport');
const AdminActivity = require('../models/AdminActivity');

// Helper to log admin actions
async function logAdminAction(admin, action, entity, entityId, details, req) {
  try {
    await AdminActivity.create({
      adminId: admin._id,
      adminName: admin.name || 'Admin',
      action,
      entity,
      entityId,
      details,
      ip: req?.ip || '127.0.0.1'
    });
  } catch (err) {
    console.error('Failed to log admin action:', err.message);
  }
}

// ============================================================================
// 1. ADMIN REASONING DASHBOARD & AGGREGATIONS
// ============================================================================
exports.getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalTopics,
    activeTopics,
    totalNotes,
    totalQuestions,
    publishedQuestions,
    draftQuestions,
    pendingReports,
    totalAttemptsCount,
    distinctStudents
  ] = await Promise.all([
    Topic.countDocuments({ moduleType: 'Reasoning' }),
    Topic.countDocuments({ moduleType: 'Reasoning', status: 'active' }),
    TopicNote.countDocuments({ moduleType: 'Reasoning' }),
    Question.countDocuments({ moduleType: 'Reasoning' }),
    Question.countDocuments({ moduleType: 'Reasoning', status: 'published' }),
    Question.countDocuments({ moduleType: 'Reasoning', status: 'draft' }),
    QuestionReport.countDocuments({ moduleType: 'Reasoning', status: 'pending' }),
    Result.countDocuments({ moduleType: 'Reasoning' }),
    Progress.distinct('userId', { moduleName: 'Reasoning' })
  ]);

  // Aggregate results for average accuracy & topic performance
  const [accuracyStats, topicAttempts] = await Promise.all([
    Result.aggregate([
      { $match: { moduleType: 'Reasoning' } },
      {
        $group: {
          _id: null,
          avgAccuracy: { $avg: '$accuracy' },
          avgPercentage: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 }
        }
      }
    ]),
    Result.aggregate([
      { $match: { moduleType: 'Reasoning' } },
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 },
          avgAccuracy: { $avg: '$accuracy' }
        }
      },
      { $sort: { count: -1 } }
    ])
  ]);

  const avgAccuracy = accuracyStats[0] ? Math.round(accuracyStats[0].avgAccuracy) : 0;
  const mostPopularTopic = topicAttempts[0] ? topicAttempts[0]._id : 'Logical Reasoning';

  const sortedByAccuracy = [...topicAttempts].sort((a, b) => a.avgAccuracy - b.avgAccuracy);
  const weakestTopic = sortedByAccuracy[0] ? sortedByAccuracy[0]._id : 'Seating Arrangement';

  // Topic-wise breakdown for Admin view
  const allTopics = await Topic.find({ moduleType: 'Reasoning' }).sort({ displayOrder: 1 });
  const topicBreakdown = await Promise.all(allTopics.map(async (t) => {
    const [qCount, noteExists] = await Promise.all([
      Question.countDocuments({ moduleType: 'Reasoning', category: t.name }),
      TopicNote.exists({ moduleType: 'Reasoning', topic: t.name })
    ]);
    return {
      _id: t._id,
      name: t.name,
      slug: t.slug,
      status: t.status,
      difficulty: t.difficulty,
      displayOrder: t.displayOrder,
      questionCount: qCount,
      hasNotes: !!noteExists
    };
  }));

  // Recent Question Reports
  const recentReports = await QuestionReport.find({ moduleType: 'Reasoning' })
    .populate('userId', 'name email')
    .populate('questionId', 'questionText category')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalTopics,
        activeTopics,
        totalNotes,
        totalQuestions,
        publishedQuestions,
        draftQuestions,
        totalStudentsPracticing: distinctStudents.length,
        totalAttempts: totalAttemptsCount,
        averageAccuracy: avgAccuracy,
        pendingReports,
        mostPopularTopic,
        weakestTopic
      },
      topics: topicBreakdown,
      recentReports
    }
  });
});

// ============================================================================
// 2. TOPIC CRUD MANAGEMENT
// ============================================================================
exports.getTopics = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const query = { moduleType: 'Reasoning' };

  if (search) query.name = { $regex: search, $options: 'i' };
  if (status && status !== 'all') query.status = status;

  const topics = await Topic.find(query).sort({ displayOrder: 1, createdAt: 1 });

  const topicsWithStats = await Promise.all(topics.map(async (t) => {
    const [qCount, noteExists] = await Promise.all([
      Question.countDocuments({ moduleType: 'Reasoning', category: t.name }),
      TopicNote.exists({ moduleType: 'Reasoning', topic: t.name })
    ]);
    return {
      ...t.toObject(),
      questionCount: qCount,
      hasNotes: !!noteExists
    };
  }));

  res.status(200).json({ success: true, count: topicsWithStats.length, data: topicsWithStats });
});

exports.createTopic = asyncHandler(async (req, res) => {
  const { name, description, difficulty, estimatedStudyTime, status, displayOrder } = req.body;

  if (!name || name.trim().length < 2) {
    throw new ApiError(400, 'Topic name is required');
  }

  const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existing = await Topic.findOne({ moduleType: 'Reasoning', $or: [{ name: name.trim() }, { slug }] });
  if (existing) {
    throw new ApiError(409, `A reasoning topic with the name "${name}" or slug "${slug}" already exists`);
  }

  const topic = await Topic.create({
    name: name.trim(),
    slug,
    moduleType: 'Reasoning',
    description: description || '',
    difficulty: difficulty || 'Medium',
    estimatedStudyTime: estimatedStudyTime || '45 mins',
    status: status || 'active',
    displayOrder: Number(displayOrder) || 0,
    createdBy: req.user._id
  });

  await logAdminAction(req.user, 'CREATE_REASONING_TOPIC', 'Topic', topic._id, `Created topic ${topic.name}`, req);

  res.status(201).json({
    success: true,
    message: 'Reasoning topic created successfully',
    data: topic
  });
});

exports.updateTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topic = await Topic.findOneAndUpdate(
    { _id: id, moduleType: 'Reasoning' },
    req.body,
    { new: true, runValidators: true, returnDocument: 'after' }
  );

  if (!topic) throw new ApiError(404, 'Reasoning topic not found');

  await logAdminAction(req.user, 'UPDATE_REASONING_TOPIC', 'Topic', topic._id, `Updated topic ${topic.name}`, req);

  res.status(200).json({
    success: true,
    message: 'Reasoning topic updated successfully',
    data: topic
  });
});

exports.deleteTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const topic = await Topic.findOneAndDelete({ _id: id, moduleType: 'Reasoning' });
  if (!topic) throw new ApiError(404, 'Reasoning topic not found');

  await logAdminAction(req.user, 'DELETE_REASONING_TOPIC', 'Topic', id, `Deleted topic ${topic.name}`, req);

  res.status(200).json({
    success: true,
    message: 'Reasoning topic deleted successfully'
  });
});

exports.reorderTopics = asyncHandler(async (req, res) => {
  const { orders } = req.body; // Array of { id, displayOrder }

  if (!Array.isArray(orders)) {
    throw new ApiError(400, 'Orders must be an array of { id, displayOrder }');
  }

  await Promise.all(orders.map(o => Topic.findByIdAndUpdate(o.id, { displayOrder: o.displayOrder })));
  await logAdminAction(req.user, 'REORDER_REASONING_TOPICS', 'Topic', null, 'Updated display orders', req);

  res.status(200).json({ success: true, message: 'Topics reordered successfully' });
});

// ============================================================================
// 3. REASONING QUESTION BANK MANAGEMENT
// ============================================================================
exports.getQuestions = asyncHandler(async (req, res) => {
  const { topic, difficulty, status, search, page = 1, limit = 20 } = req.query;

  const query = { moduleType: 'Reasoning' };
  if (topic && topic !== 'All') query.$or = [{ category: topic }, { topic: topic }];
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (status && status !== 'all') query.status = status;
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
  const { questionText, category, topic, options, correctAnswer, difficulty, marks, negativeMarks, explanation, tags, companyTags, status } = req.body;

  if (!questionText || !options || options.length < 2 || !correctAnswer) {
    throw new ApiError(400, 'Question text, at least 2 options, and correct answer are required');
  }

  if (!options.includes(correctAnswer)) {
    throw new ApiError(400, 'Correct answer must exactly match one of the provided options');
  }

  const questionTopic = category || topic;
  if (!questionTopic) {
    throw new ApiError(400, 'Topic is required');
  }

  const q = await Question.create({
    moduleType: 'Reasoning',
    category: questionTopic,
    topic: questionTopic,
    questionText,
    options,
    correctAnswer,
    difficulty: difficulty || 'Medium',
    marks: Number(marks) || 1,
    negativeMarks: negativeMarks !== undefined ? Number(negativeMarks) : 0.25,
    explanation: explanation || '',
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    companyTags: Array.isArray(companyTags) ? companyTags : (companyTags ? companyTags.split(',').map(t => t.trim()) : []),
    status: status || 'published',
    createdBy: req.user._id
  });

  await logAdminAction(req.user, 'CREATE_REASONING_QUESTION', 'Question', q._id, `Created question for ${questionTopic}`, req);

  res.status(201).json({
    success: true,
    message: 'Reasoning question created successfully',
    data: q
  });
});

exports.updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { options, correctAnswer } = req.body;

  if (options && correctAnswer && !options.includes(correctAnswer)) {
    throw new ApiError(400, 'Correct answer must match one of the options');
  }

  if (req.body.category && !req.body.topic) req.body.topic = req.body.category;
  if (req.body.topic && !req.body.category) req.body.category = req.body.topic;

  const q = await Question.findOneAndUpdate(
    { _id: id, moduleType: 'Reasoning' },
    req.body,
    { new: true, runValidators: true, returnDocument: 'after' }
  );

  if (!q) throw new ApiError(404, 'Reasoning question not found');

  await logAdminAction(req.user, 'UPDATE_REASONING_QUESTION', 'Question', q._id, 'Updated question content', req);

  res.status(200).json({
    success: true,
    message: 'Question updated successfully',
    data: q
  });
});

exports.deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const q = await Question.findOneAndDelete({ _id: id, moduleType: 'Reasoning' });
  if (!q) throw new ApiError(404, 'Reasoning question not found');

  await logAdminAction(req.user, 'DELETE_REASONING_QUESTION', 'Question', id, 'Deleted question', req);

  res.status(200).json({ success: true, message: 'Question deleted successfully' });
});

exports.duplicateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const original = await Question.findById(id);
  if (!original) throw new ApiError(404, 'Original question not found');

  const clonedData = original.toObject();
  delete clonedData._id;
  delete clonedData.createdAt;
  delete clonedData.updatedAt;
  clonedData.questionText = `${clonedData.questionText} (Copy)`;
  clonedData.status = 'draft';
  clonedData.attemptsCount = 0;
  clonedData.correctCount = 0;
  clonedData.wrongCount = 0;

  const duplicate = await Question.create(clonedData);
  await logAdminAction(req.user, 'DUPLICATE_REASONING_QUESTION', 'Question', duplicate._id, 'Duplicated question', req);

  res.status(201).json({
    success: true,
    message: 'Question duplicated successfully as draft',
    data: duplicate
  });
});

// ============================================================================
// 4. REASONING STUDY NOTES / GUIDES
// ============================================================================
exports.getNotes = asyncHandler(async (req, res) => {
  const { topic } = req.query;
  const query = { moduleType: 'Reasoning' };
  if (topic && topic !== 'All') query.topic = topic;

  const notes = await TopicNote.find(query).sort({ topic: 1 });
  res.status(200).json({ success: true, count: notes.length, data: notes });
});

exports.createNote = asyncHandler(async (req, res) => {
  const { topic, introduction, concepts, rules, shortcuts, solvedExamples, commonMistakes, placementTips, status } = req.body;

  if (!topic || !introduction) {
    throw new ApiError(400, 'Topic name and introduction are required');
  }

  const slug = req.body.slug || topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existing = await TopicNote.findOne({ moduleType: 'Reasoning', $or: [{ topic }, { slug }] });
  if (existing) {
    throw new ApiError(409, `Study guide for ${topic} already exists. Please edit the existing guide.`);
  }

  const note = await TopicNote.create({
    moduleType: 'Reasoning',
    topic,
    slug,
    title: req.body.title || `${topic} Master Study Guide`,
    introduction,
    concepts: concepts || [],
    rules: rules || [],
    shortcuts: shortcuts || [],
    solvedExamples: solvedExamples || [],
    commonMistakes: commonMistakes || [],
    placementTips: placementTips || [],
    status: status || 'published',
    createdBy: req.user._id
  });

  await logAdminAction(req.user, 'CREATE_REASONING_NOTE', 'TopicNote', note._id, `Created note for ${topic}`, req);

  res.status(201).json({
    success: true,
    message: 'Study guide created successfully',
    data: note
  });
});

exports.updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const note = await TopicNote.findOneAndUpdate(
    { _id: id, moduleType: 'Reasoning' },
    req.body,
    { new: true, runValidators: true, returnDocument: 'after' }
  );

  if (!note) throw new ApiError(404, 'Reasoning note not found');

  await logAdminAction(req.user, 'UPDATE_REASONING_NOTE', 'TopicNote', note._id, `Updated note for ${note.topic}`, req);

  res.status(200).json({
    success: true,
    message: 'Study guide updated successfully',
    data: note
  });
});

exports.deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const note = await TopicNote.findOneAndDelete({ _id: id, moduleType: 'Reasoning' });
  if (!note) throw new ApiError(404, 'Reasoning note not found');

  await logAdminAction(req.user, 'DELETE_REASONING_NOTE', 'TopicNote', id, `Deleted note for ${note.topic}`, req);

  res.status(200).json({ success: true, message: 'Study guide deleted successfully' });
});

// ============================================================================
// 5. QUESTION ISSUE REPORTS & AUDIT
// ============================================================================
exports.getReports = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = { moduleType: 'Reasoning' };
  if (status && status !== 'all') query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [reports, total] = await Promise.all([
    QuestionReport.find(query)
      .populate('userId', 'name email college')
      .populate('questionId', 'questionText category difficulty options correctAnswer')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    QuestionReport.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: reports
  });
});

exports.resolveReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNotes, status = 'resolved' } = req.body;

  const report = await QuestionReport.findByIdAndUpdate(
    id,
    { status, adminNotes: adminNotes || '' },
    { new: true, returnDocument: 'after' }
  );

  if (!report) throw new ApiError(404, 'Question report not found');

  await logAdminAction(req.user, 'RESOLVE_QUESTION_REPORT', 'QuestionReport', id, `Marked report as ${status}`, req);

  res.status(200).json({
    success: true,
    message: `Report marked as ${status}`,
    data: report
  });
});

exports.deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await QuestionReport.findByIdAndDelete(id);
  await logAdminAction(req.user, 'DELETE_QUESTION_REPORT', 'QuestionReport', id, 'Deleted report', req);

  res.status(200).json({ success: true, message: 'Report deleted' });
});

// ============================================================================
// 6. QUESTION & TOPIC ANALYTICS
// ============================================================================
exports.getAnalytics = asyncHandler(async (req, res) => {
  const [lowestAccuracyQuestions, mostAttemptedQuestions, difficultyDist] = await Promise.all([
    Question.find({ moduleType: 'Reasoning', attemptsCount: { $gt: 0 } })
      .sort({ correctCount: 1, attemptsCount: -1 })
      .limit(10)
      .select('questionText category difficulty attemptsCount correctCount wrongCount'),
    Question.find({ moduleType: 'Reasoning' })
      .sort({ attemptsCount: -1 })
      .limit(10)
      .select('questionText category difficulty attemptsCount correctCount wrongCount'),
    Question.aggregate([
      { $match: { moduleType: 'Reasoning' } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      lowestAccuracyQuestions,
      mostAttemptedQuestions,
      difficultyDist
    }
  });
});
