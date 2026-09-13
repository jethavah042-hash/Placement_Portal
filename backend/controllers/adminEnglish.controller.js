const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const TopicNote = require('../models/TopicNote');
const Vocabulary = require('../models/Vocabulary');
const ReadingPassage = require('../models/ReadingPassage');
const QuestionReport = require('../models/QuestionReport');
const Result = require('../models/Result');
const Progress = require('../models/Progress');
const AdminActivity = require('../models/AdminActivity');

// @desc    Get Admin English Dashboard & Telemetry
// @route   GET /api/admin/english/dashboard
// @access  Admin
exports.getAdminDashboard = asyncHandler(async (req, res) => {
  const totalTopics = await Topic.countDocuments({ moduleType: 'English' });
  const activeTopics = await Topic.countDocuments({ moduleType: 'English', status: 'active' });
  const totalNotes = await TopicNote.countDocuments({ moduleType: 'English' });
  const totalQuestions = await Question.countDocuments({ moduleType: 'English' });
  const publishedQuestions = await Question.countDocuments({ moduleType: 'English', status: 'published' });
  const draftQuestions = await Question.countDocuments({ moduleType: 'English', status: 'draft' });
  const totalVocab = await Vocabulary.countDocuments();
  const totalPassages = await ReadingPassage.countDocuments();
  const pendingReports = await QuestionReport.countDocuments({ status: 'pending' });

  const englishResults = await Result.find({ moduleType: 'English' });
  const totalAttempts = englishResults.length;
  const avgAccuracy = totalAttempts > 0
    ? Math.round(englishResults.reduce((acc, r) => acc + (r.accuracy || 0), 0) / totalAttempts)
    : 0;

  // Topic popularity & difficulty
  const topics = await Topic.find({ moduleType: 'English' }).sort({ displayOrder: 1 });
  const topicStats = await Promise.all(
    topics.map(async (t) => {
      const qCount = await Question.countDocuments({ moduleType: 'English', category: t.name });
      const note = await TopicNote.findOne({ moduleType: 'English', topic: t.name });
      return {
        _id: t._id,
        name: t.name,
        slug: t.slug,
        difficulty: t.difficulty,
        status: t.status,
        displayOrder: t.displayOrder,
        questionCount: qCount,
        hasNotes: !!note
      };
    })
  );

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
        totalVocab,
        totalPassages,
        totalAttempts,
        averageAccuracy: avgAccuracy,
        pendingReports
      },
      topics: topicStats
    }
  });
});

// ==========================================
// TOPICS CRUD
// ==========================================
exports.getTopics = asyncHandler(async (req, res) => {
  const topics = await Topic.find({ moduleType: 'English' }).sort({ displayOrder: 1 });
  res.status(200).json({ success: true, data: topics });
});

exports.createTopic = asyncHandler(async (req, res) => {
  const { name, description, difficulty, estimatedStudyTime, status, displayOrder } = req.body;
  if (!name) throw new ApiError(400, 'Topic name is required');

  const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existing = await Topic.findOne({ moduleType: 'English', slug });
  if (existing) throw new ApiError(409, 'An English topic with this slug already exists');

  const topic = await Topic.create({
    moduleType: 'English',
    name,
    slug,
    description: description || '',
    difficulty: difficulty || 'Medium',
    estimatedStudyTime: estimatedStudyTime || '45 mins',
    status: status || 'active',
    displayOrder: Number(displayOrder) || 0,
    createdBy: req.user._id
  });

  await AdminActivity.create({
    adminId: req.user._id,
    adminName: req.user.name || 'Administrator',
    action: 'CREATE_ENGLISH_TOPIC',
    entity: 'Topic',
    entityId: topic._id.toString(),
    details: `Created English Topic: ${name}`
  });

  res.status(201).json({ success: true, data: topic });
});

exports.updateTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const topic = await Topic.findOneAndUpdate(
    { _id: id, moduleType: 'English' },
    req.body,
    { new: true, runValidators: true }
  );
  if (!topic) throw new ApiError(404, 'English topic not found');

  res.status(200).json({ success: true, data: topic });
});

exports.deleteTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const topic = await Topic.findOneAndDelete({ _id: id, moduleType: 'English' });
  if (!topic) throw new ApiError(404, 'English topic not found');

  res.status(200).json({ success: true, message: 'English topic deleted successfully' });
});

// ==========================================
// QUESTION BANK CRUD
// ==========================================
exports.getQuestions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, topic, difficulty, search, status, questionType } = req.query;

  const query = { moduleType: 'English' };
  if (topic && topic !== 'All') query.category = topic;
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (status && status !== 'All') query.status = status;
  if (questionType && questionType !== 'All') query.questionType = questionType;
  if (search) {
    query.$or = [
      { questionText: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { explanation: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Question.countDocuments(query);
  const questions = await Question.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    data: questions
  });
});

exports.createQuestion = asyncHandler(async (req, res) => {
  const {
    category,
    questionText,
    options,
    correctAnswer,
    difficulty,
    marks,
    negativeMarks,
    explanation,
    rule,
    questionType,
    status
  } = req.body;

  if (!category || !questionText || !options || !correctAnswer) {
    throw new ApiError(400, 'category, questionText, options, and correctAnswer are required');
  }

  const question = await Question.create({
    moduleType: 'English',
    category,
    topic: category,
    questionText,
    options,
    correctAnswer,
    difficulty: difficulty || 'Medium',
    questionType: questionType || 'mcq',
    marks: !isNaN(Number(marks)) && marks !== undefined && marks !== null ? Number(marks) : 1,
    negativeMarks: !isNaN(Number(negativeMarks)) && negativeMarks !== undefined && negativeMarks !== null ? Number(negativeMarks) : 0.25,
    explanation: explanation || '',
    rule: rule || '',
    status: status || 'published',
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, data: question });
});

exports.updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const question = await Question.findOneAndUpdate(
    { _id: id, moduleType: 'English' },
    req.body,
    { new: true, runValidators: true }
  );
  if (!question) throw new ApiError(404, 'English question not found');

  res.status(200).json({ success: true, data: question });
});

exports.deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const question = await Question.findOneAndDelete({ _id: id, moduleType: 'English' });
  if (!question) throw new ApiError(404, 'English question not found');

  res.status(200).json({ success: true, message: 'English question deleted' });
});

exports.duplicateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const original = await Question.findById(id);
  if (!original) throw new ApiError(404, 'Question not found');

  const copy = original.toObject();
  delete copy._id;
  delete copy.createdAt;
  delete copy.updatedAt;
  copy.questionText = `[Draft Copy] ${copy.questionText}`;
  copy.status = 'draft';

  const duplicated = await Question.create(copy);
  res.status(201).json({ success: true, data: duplicated });
});

// ==========================================
// STUDY GUIDES & NOTES CRUD
// ==========================================
exports.getNotes = asyncHandler(async (req, res) => {
  const notes = await TopicNote.find({ moduleType: 'English' }).sort({ topic: 1 });
  res.status(200).json({ success: true, data: notes });
});

exports.createNote = asyncHandler(async (req, res) => {
  const { topic, title, introduction, concepts, rules, shortcuts, solvedExamples, commonMistakes, placementTips, status } = req.body;
  if (!topic || !title) throw new ApiError(400, 'topic and title are required');

  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const note = await TopicNote.create({
    moduleType: 'English',
    topic,
    title,
    slug,
    introduction: introduction || '',
    concepts: concepts || [],
    rules: rules || [],
    shortcuts: shortcuts || [],
    solvedExamples: solvedExamples || [],
    commonMistakes: commonMistakes || [],
    placementTips: placementTips || [],
    status: status || 'published',
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, data: note });
});

exports.updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = await TopicNote.findOneAndUpdate(
    { _id: id, moduleType: 'English' },
    req.body,
    { new: true, runValidators: true }
  );
  if (!note) throw new ApiError(404, 'English study guide not found');

  res.status(200).json({ success: true, data: note });
});

exports.deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = await TopicNote.findOneAndDelete({ _id: id, moduleType: 'English' });
  if (!note) throw new ApiError(404, 'English note not found');

  res.status(200).json({ success: true, message: 'English study guide deleted' });
});

// ==========================================
// VOCABULARY CRUD
// ==========================================
exports.getVocabulary = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, difficulty, partOfSpeech } = req.query;

  const query = {};
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (partOfSpeech && partOfSpeech !== 'All') query.partOfSpeech = partOfSpeech;
  if (search) {
    query.$or = [
      { word: { $regex: search, $options: 'i' } },
      { meaning: { $regex: search, $options: 'i' } },
      { synonyms: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Vocabulary.countDocuments(query);
  const words = await Vocabulary.find(query).sort({ word: 1 }).skip(skip).limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    data: words
  });
});

exports.createVocabulary = asyncHandler(async (req, res) => {
  const { word, meaning, partOfSpeech, synonyms, antonyms, exampleSentence, usage, difficulty, tags, status } = req.body;
  if (!word || !meaning) throw new ApiError(400, 'word and meaning are required');

  const existing = await Vocabulary.findOne({ word: word.trim().toLowerCase() });
  if (existing) throw new ApiError(409, `Word "${word}" already exists in vocabulary`);

  const vocab = await Vocabulary.create({
    word: word.trim().toLowerCase(),
    meaning,
    partOfSpeech: partOfSpeech || 'noun',
    synonyms: Array.isArray(synonyms) ? synonyms : (synonyms ? synonyms.split(',').map(s => s.trim()) : []),
    antonyms: Array.isArray(antonyms) ? antonyms : (antonyms ? antonyms.split(',').map(a => a.trim()) : []),
    exampleSentence: exampleSentence || '',
    usage: usage || '',
    difficulty: difficulty || 'Medium',
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    status: status || 'published',
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, data: vocab });
});

exports.updateVocabulary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vocab = await Vocabulary.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!vocab) throw new ApiError(404, 'Vocabulary word not found');

  res.status(200).json({ success: true, data: vocab });
});

exports.deleteVocabulary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vocab = await Vocabulary.findByIdAndDelete(id);
  if (!vocab) throw new ApiError(404, 'Vocabulary word not found');

  res.status(200).json({ success: true, message: 'Vocabulary word deleted' });
});

// ==========================================
// READING COMPREHENSION PASSAGES CRUD
// ==========================================
exports.getPassages = asyncHandler(async (req, res) => {
  const passages = await ReadingPassage.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: passages });
});

exports.createPassage = asyncHandler(async (req, res) => {
  const { title, passageText, difficulty, questions, status } = req.body;
  if (!title || !passageText) throw new ApiError(400, 'title and passageText are required');

  const passage = await ReadingPassage.create({
    title,
    topic: 'Reading Comprehension',
    passageText,
    difficulty: difficulty || 'Medium',
    questions: questions || [],
    status: status || 'published',
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, data: passage });
});

exports.updatePassage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const passage = await ReadingPassage.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!passage) throw new ApiError(404, 'Reading comprehension passage not found');

  res.status(200).json({ success: true, data: passage });
});

exports.deletePassage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const passage = await ReadingPassage.findByIdAndDelete(id);
  if (!passage) throw new ApiError(404, 'Reading passage not found');

  res.status(200).json({ success: true, message: 'Reading passage deleted' });
});

// ==========================================
// QUESTION ISSUE REPORTS
// ==========================================
exports.getReports = asyncHandler(async (req, res) => {
  const reports = await QuestionReport.find()
    .populate('userId', 'name email')
    .populate('questionId', 'questionText category difficulty correctAnswer')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, total: reports.length, data: reports });
});

exports.resolveReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const report = await QuestionReport.findByIdAndUpdate(
    id,
    { status: status || 'resolved', adminNotes: adminNotes || '', resolvedAt: new Date() },
    { new: true }
  );
  if (!report) throw new ApiError(404, 'Report not found');

  res.status(200).json({ success: true, data: report });
});

exports.deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await QuestionReport.findByIdAndDelete(id);
  if (!report) throw new ApiError(404, 'Report not found');

  res.status(200).json({ success: true, message: 'Report deleted' });
});
