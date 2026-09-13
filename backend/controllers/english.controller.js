const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const TopicNote = require('../models/TopicNote');
const Vocabulary = require('../models/Vocabulary');
const ReadingPassage = require('../models/ReadingPassage');
const Progress = require('../models/Progress');
const Result = require('../models/Result');
const Bookmark = require('../models/Bookmark');
const QuestionReport = require('../models/QuestionReport');
const Activity = require('../models/Activity');
const User = require('../models/User');

// Helper to calculate student streak
async function updateStudentStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = await Activity.findOne({ userId }).sort({ createdAt: -1 });
  if (!lastActivity) {
    user.streak = 1;
  } else {
    const lastDate = new Date(lastActivity.createdAt);
    lastDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      user.streak = (user.streak || 0) + 1;
    } else if (diffDays > 1) {
      user.streak = 1;
    }
  }
  await user.save();
}

// @desc    Get English Student Dashboard Data
// @route   GET /api/english/dashboard
// @access  Student
exports.getStudentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Get all active English topics
  const topics = await Topic.find({ moduleType: 'English', status: 'active' }).sort({ displayOrder: 1 });

  // 2. Get student progress for all English topics
  const progressDocs = await Progress.find({ userId, moduleName: 'English' });
  const progressMap = {};
  progressDocs.forEach(p => {
    progressMap[p.topic] = p;
  });

  // 3. Question statistics
  let totalAttempted = 0;
  let totalSolved = 0;
  let completedTopicsCount = 0;
  const weakTopics = [];
  const strongTopics = [];

  const topicMatrix = await Promise.all(
    topics.map(async (t) => {
      const qCount = await Question.countDocuments({
        moduleType: 'English',
        category: t.name,
        status: 'published'
      });
      const noteExists = await TopicNote.exists({
        moduleType: 'English',
        topic: t.name,
        status: 'published'
      });

      const p = progressMap[t.name];
      const attempted = p ? p.questionsAttempted : 0;
      const solved = p ? p.questionsSolved : 0;
      const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
      const isCompleted = p ? (p.notesRead && (qCount === 0 || attempted >= Math.min(5, qCount))) : false;

      totalAttempted += attempted;
      totalSolved += solved;
      if (isCompleted) completedTopicsCount++;

      if (attempted >= 3) {
        if (accuracy < 50) {
          weakTopics.push({ topic: t.name, slug: t.slug, accuracy, attempted });
        } else if (accuracy >= 70) {
          strongTopics.push({ topic: t.name, slug: t.slug, accuracy, attempted });
        }
      }

      return {
        _id: t._id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        difficulty: t.difficulty,
        estimatedStudyTime: t.estimatedStudyTime,
        questionCount: qCount,
        hasNotes: !!noteExists,
        progress: {
          attempted,
          solved,
          accuracy,
          notesRead: p ? p.notesRead : false,
          isCompleted
        }
      };
    })
  );

  const overallAccuracy = totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0;
  const progressPercentage = topics.length > 0 ? Math.round((completedTopicsCount / topics.length) * 100) : 0;

  // 4. Vocabulary Stats
  const totalVocabCount = await Vocabulary.countDocuments({ status: 'published' });
  const learnedVocabCount = await Vocabulary.countDocuments({ status: 'published', learnedBy: userId });

  // 5. Reading Comprehension Stats
  const totalPassagesCount = await ReadingPassage.countDocuments({ status: 'published' });
  const passageResults = await Result.find({ userId, moduleType: 'English', testType: 'reading_comprehension' });

  // 6. Recent results & assessments
  const recentResults = await Result.find({ userId, moduleType: 'English' })
    .sort({ createdAt: -1 })
    .limit(5);

  // 7. Recent activities
  const recentActivities = await Activity.find({
    userId,
    module: 'English'
  }).sort({ createdAt: -1 }).limit(6);

  // 8. Bookmarks count
  const bookmarksCount = await Bookmark.countDocuments({ userId, moduleType: 'English' });

  // 9. Recommended Practice
  let recommendedTopic = weakTopics.length > 0 ? weakTopics[0].topic : null;
  if (!recommendedTopic) {
    const uncompleted = topicMatrix.find(t => !t.progress.isCompleted);
    recommendedTopic = uncompleted ? uncompleted.name : (topics[0]?.name || 'Grammar');
  }

  // 10. User streak
  const user = await User.findById(userId);

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        progressPercentage,
        totalAttempted,
        totalSolved,
        overallAccuracy,
        studyStreak: user?.streak || 0,
        completedTopics: completedTopicsCount,
        remainingTopics: Math.max(0, topics.length - completedTopicsCount),
        totalTopics: topics.length,
        totalVocabCount,
        learnedVocabCount,
        totalPassagesCount,
        completedPassagesCount: passageResults.length,
        bookmarksCount
      },
      weakTopics,
      strongTopics,
      recommendedPractice: {
        topic: recommendedTopic,
        message: weakTopics.length > 0
          ? `Improve your ${weakTopics[0].topic} accuracy (currently ${weakTopics[0].accuracy}%).`
          : `Continue mastering ${recommendedTopic} to complete all English topics.`
      },
      topics: topicMatrix,
      recentResults,
      recentActivities
    }
  });
});

// @desc    Get English Topics List
// @route   GET /api/english/topics
// @access  Student
exports.getTopics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const topics = await Topic.find({ moduleType: 'English', status: 'active' }).sort({ displayOrder: 1 });
  const progressDocs = await Progress.find({ userId, moduleName: 'English' });
  const progressMap = {};
  progressDocs.forEach(p => { progressMap[p.topic] = p; });

  const data = await Promise.all(
    topics.map(async (t) => {
      const qCount = await Question.countDocuments({
        moduleType: 'English',
        category: t.name,
        status: 'published'
      });
      const noteExists = await TopicNote.exists({
        moduleType: 'English',
        topic: t.name,
        status: 'published'
      });
      const p = progressMap[t.name];

      return {
        _id: t._id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        difficulty: t.difficulty,
        estimatedStudyTime: t.estimatedStudyTime,
        displayOrder: t.displayOrder,
        questionCount: qCount,
        hasNotes: !!noteExists,
        progress: {
          attempted: p ? p.questionsAttempted : 0,
          solved: p ? p.questionsSolved : 0,
          accuracy: p && p.questionsAttempted > 0 ? Math.round((p.questionsSolved / p.questionsAttempted) * 100) : 0,
          notesRead: p ? p.notesRead : false
        }
      };
    })
  );

  res.status(200).json({ success: true, data });
});

// @desc    Get Single Topic by Slug
// @route   GET /api/english/topics/:slug
// @access  Student
exports.getTopicBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const userId = req.user._id;

  const topic = await Topic.findOne({ moduleType: 'English', slug, status: 'active' });
  if (!topic) {
    throw new ApiError(404, 'English topic not found');
  }

  const questionCount = await Question.countDocuments({
    moduleType: 'English',
    category: topic.name,
    status: 'published'
  });

  const note = await TopicNote.findOne({
    moduleType: 'English',
    topic: topic.name,
    status: 'published'
  });

  const progress = await Progress.findOne({ userId, moduleName: 'English', topic: topic.name });

  res.status(200).json({
    success: true,
    data: {
      topic,
      questionCount,
      hasNotes: !!note,
      notePreview: note ? { title: note.title, introduction: note.introduction } : null,
      progress: progress || { questionsAttempted: 0, questionsSolved: 0, notesRead: false, accuracy: 0 }
    }
  });
});

// @desc    Get Topic Study Guide / Notes
// @route   GET /api/english/notes/:topicSlug
// @access  Student
exports.getTopicNotes = asyncHandler(async (req, res) => {
  const { topicSlug } = req.params;
  const userId = req.user._id;

  const topic = await Topic.findOne({ moduleType: 'English', slug: topicSlug });
  if (!topic) throw new ApiError(404, 'Topic not found');

  let note = await TopicNote.findOne({
    moduleType: 'English',
    topic: topic.name,
    status: 'published'
  });

  if (!note) {
    note = {
      topic: topic.name,
      title: `${topic.name} Complete Study Guide`,
      introduction: `Master the rules, concepts, grammar structures, and solved placement examples for ${topic.name}.`,
      concepts: [],
      rules: [],
      shortcuts: [],
      solvedExamples: [],
      commonMistakes: [],
      placementTips: []
    };
  }

  const progress = await Progress.findOne({ userId, moduleName: 'English', topic: topic.name });
  const isBookmarked = note._id ? await Bookmark.exists({ userId, itemId: note._id, moduleType: 'English' }) : false;

  res.status(200).json({
    success: true,
    data: {
      topic,
      note,
      isNotesRead: progress ? progress.notesRead : false,
      isBookmarked: !!isBookmarked
    }
  });
});

// @desc    Mark Topic Notes as Read / Complete
// @route   POST /api/english/notes/:topicSlug/complete
// @access  Student
exports.markNotesCompleted = asyncHandler(async (req, res) => {
  const { topicSlug } = req.params;
  const userId = req.user._id;

  const topic = await Topic.findOne({ moduleType: 'English', slug: topicSlug });
  if (!topic) throw new ApiError(404, 'Topic not found');

  const progress = await Progress.findOneAndUpdate(
    { userId, moduleName: 'English', topic: topic.name },
    { $set: { notesRead: true, lastStudiedAt: new Date() } },
    { upsert: true, new: true }
  );

  await Activity.create({
    userId,
    title: `Completed Study Guide: ${topic.name}`,
    type: 'english_note',
    module: 'English',
    metadata: { topic: topic.name, slug: topicSlug }
  });

  await updateStudentStreak(userId);

  res.status(200).json({
    success: true,
    message: `Marked ${topic.name} notes as completed`,
    data: progress
  });
});

// @desc    Get English Practice Questions (Paginated & Filterable)
// @route   GET /api/english/questions
// @access  Student
exports.getPracticeQuestions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { topic, difficulty, search, questionType, page = 1, limit = 10 } = req.query;

  const query = { moduleType: 'English', status: 'published' };
  if (topic && topic !== 'All') query.category = topic;
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
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
    .select('-correctAnswer -explanation -rule')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Attach bookmark status
  const userBookmarks = await Bookmark.find({
    userId,
    moduleType: 'English',
    itemType: 'Question',
    itemId: { $in: questions.map(q => q._id) }
  });
  const bookmarkedSet = new Set(userBookmarks.map(b => b.itemId.toString()));

  const questionsWithMeta = questions.map(q => ({
    ...q.toObject(),
    isBookmarked: bookmarkedSet.has(q._id.toString())
  }));

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    data: questionsWithMeta
  });
});

// @desc    Submit Single Practice Attempt & Evaluate
// @route   POST /api/english/attempt
// @access  Student
exports.submitPracticeAnswer = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { questionId, selectedOption } = req.body;

  if (!questionId || !selectedOption) {
    throw new ApiError(400, 'questionId and selectedOption are required');
  }

  const question = await Question.findOne({ _id: questionId, moduleType: 'English' });
  if (!question) throw new ApiError(404, 'English question not found');

  const isCorrect = question.correctAnswer.trim().toLowerCase() === selectedOption.trim().toLowerCase();

  // Update question counters
  question.attemptsCount = (question.attemptsCount || 0) + 1;
  if (isCorrect) {
    question.correctCount = (question.correctCount || 0) + 1;
  } else {
    question.wrongCount = (question.wrongCount || 0) + 1;
  }
  await question.save();

  // Upsert progress
  const progress = await Progress.findOne({ userId, moduleName: 'English', topic: question.category });
  if (progress) {
    progress.questionsAttempted = (progress.questionsAttempted || 0) + 1;
    if (isCorrect) progress.questionsSolved = (progress.questionsSolved || 0) + 1;
    progress.accuracy = progress.questionsAttempted > 0
      ? Math.round(((progress.questionsSolved || 0) / progress.questionsAttempted) * 100)
      : 0;
    progress.lastStudiedAt = new Date();
    await progress.save();
  } else {
    await Progress.create({
      userId,
      moduleName: 'English',
      topic: question.category,
      questionsAttempted: 1,
      questionsSolved: isCorrect ? 1 : 0,
      accuracy: isCorrect ? 100 : 0,
      notesRead: false,
      lastStudiedAt: new Date()
    });
  }

  await Activity.create({
    userId,
    title: `Practiced ${question.category} Question`,
    type: 'english_practice',
    module: 'English',
    metadata: { isCorrect, topic: question.category }
  });

  await updateStudentStreak(userId);

  res.status(200).json({
    success: true,
    data: {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      rule: question.rule || '',
      topic: question.category
    }
  });
});

// @desc    Get Vocabulary Trainer List (Search, Filter, Learned)
// @route   GET /api/english/vocabulary
// @access  Student
exports.getVocabulary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { search, difficulty, partOfSpeech, learnedFilter = 'all', page = 1, limit = 12 } = req.query;

  const query = { status: 'published' };
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
  if (partOfSpeech && partOfSpeech !== 'All') query.partOfSpeech = partOfSpeech;
  if (search) {
    query.$or = [
      { word: { $regex: search, $options: 'i' } },
      { meaning: { $regex: search, $options: 'i' } },
      { synonyms: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }

  if (learnedFilter === 'learned') {
    query.learnedBy = userId;
  } else if (learnedFilter === 'unlearned') {
    query.learnedBy = { $ne: userId };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Vocabulary.countDocuments(query);
  const words = await Vocabulary.find(query)
    .sort({ word: 1 })
    .skip(skip)
    .limit(Number(limit));

  // Attach bookmarks
  const userBookmarks = await Bookmark.find({
    userId,
    moduleType: 'English',
    itemType: 'Vocabulary',
    itemId: { $in: words.map(w => w._id) }
  });
  const bookmarkedSet = new Set(userBookmarks.map(b => b.itemId.toString()));

  const wordsWithMeta = words.map(w => {
    const isLearned = w.learnedBy && w.learnedBy.some(id => id.toString() === userId.toString());
    return {
      ...w.toObject(),
      isLearned,
      isBookmarked: bookmarkedSet.has(w._id.toString())
    };
  });

  const totalLearned = await Vocabulary.countDocuments({ status: 'published', learnedBy: userId });

  res.status(200).json({
    success: true,
    total,
    totalLearned,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    data: wordsWithMeta
  });
});

// @desc    Toggle Vocabulary Learned Status
// @route   POST /api/english/vocabulary/:id/toggle-learned
// @access  Student
exports.toggleVocabularyLearned = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const vocab = await Vocabulary.findById(id);
  if (!vocab) throw new ApiError(404, 'Vocabulary word not found');

  const idx = vocab.learnedBy.indexOf(userId);
  let isLearned = false;

  if (idx > -1) {
    vocab.learnedBy.splice(idx, 1);
    isLearned = false;
  } else {
    vocab.learnedBy.push(userId);
    isLearned = true;

    await Activity.create({
      userId,
      title: `Mastered Word: ${vocab.word.toUpperCase()}`,
      type: 'english_vocab',
      module: 'English',
      metadata: { word: vocab.word }
    });

    await updateStudentStreak(userId);
  }

  await vocab.save();

  res.status(200).json({
    success: true,
    isLearned,
    message: isLearned ? `Marked "${vocab.word}" as learned!` : `Marked "${vocab.word}" as unlearned.`
  });
});

// @desc    Get Reading Comprehension Passages
// @route   GET /api/english/passages
// @access  Student
exports.getReadingPassages = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { difficulty } = req.query;

  const query = { status: 'published' };
  if (difficulty && difficulty !== 'All') query.difficulty = difficulty;

  const passages = await ReadingPassage.find(query).select('title topic difficulty wordCount estimatedReadTime questions status attemptsCount createdAt');

  // Find user's past attempts
  const results = await Result.find({ userId, moduleType: 'English', testType: 'reading_comprehension' });
  const completedPassageIds = new Set(results.map(r => r.topic));

  const data = passages.map(p => ({
    ...p.toObject(),
    questionCount: p.questions?.length || 0,
    isCompleted: completedPassageIds.has(p.title)
  }));

  res.status(200).json({ success: true, data });
});

// @desc    Get Single Reading Comprehension Passage & Questions
// @route   GET /api/english/passages/:id
// @access  Student
exports.getReadingPassageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const passage = await ReadingPassage.findOne({ _id: id, status: 'published' });
  if (!passage) throw new ApiError(404, 'Reading comprehension passage not found');

  // Strip answers for active test
  const cleanPassage = passage.toObject();
  cleanPassage.questions = cleanPassage.questions.map(q => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options,
    marks: q.marks || 1
  }));

  res.status(200).json({ success: true, data: cleanPassage });
});

// @desc    Submit Reading Comprehension Passage Assessment
// @route   POST /api/english/passages/:id/submit
// @access  Student
exports.submitReadingPassage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { answers = [], timeTaken = 60 } = req.body;

  const passage = await ReadingPassage.findById(id);
  if (!passage) throw new ApiError(404, 'Reading comprehension passage not found');

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  let obtainedMarks = 0;
  let totalMarks = 0;

  const answerReview = passage.questions.map(q => {
    const markVal = q.marks || 1;
    totalMarks += markVal;

    const userAnsObj = answers.find(a => a.questionId?.toString() === q._id.toString());
    const selectedOption = userAnsObj ? userAnsObj.selectedOption : '';

    if (!selectedOption || selectedOption === 'Unattempted') {
      unattemptedCount++;
      return {
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        selectedOption: 'Unattempted',
        correctAnswer: q.correctAnswer,
        isCorrect: false,
        explanation: q.explanation || '',
        topic: 'Reading Comprehension'
      };
    }

    const isCorrect = selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    if (isCorrect) {
      correctCount++;
      obtainedMarks += markVal;
    } else {
      wrongCount++;
      obtainedMarks = Math.max(0, obtainedMarks - 0.25);
    }

    return {
      questionId: q._id,
      questionText: q.questionText,
      options: q.options,
      selectedOption,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation || '',
      topic: 'Reading Comprehension'
    };
  });

  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  const accuracy = (correctCount + wrongCount) > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0;

  const result = await Result.create({
    userId,
    moduleType: 'English',
    testType: 'reading_comprehension',
    title: `RC: ${passage.title}`,
    topic: passage.title,
    difficulty: passage.difficulty,
    totalQuestions: passage.questions.length,
    attemptedCount: correctCount + wrongCount,
    correctCount,
    wrongCount,
    unattemptedCount,
    totalMarks,
    obtainedMarks,
    percentage,
    accuracy,
    timeTaken,
    status: percentage >= 60 ? 'Passed' : 'Needs Improvement',
    answers: answerReview
  });

  passage.attemptsCount = (passage.attemptsCount || 0) + 1;
  await passage.save();

  // Update RC progress
  const progress = await Progress.findOne({ userId, moduleName: 'English', topic: 'Reading Comprehension' });
  if (progress) {
    progress.questionsAttempted += (correctCount + wrongCount);
    progress.questionsSolved += correctCount;
    progress.accuracy = Math.round((progress.questionsSolved / progress.questionsAttempted) * 100);
    progress.notesRead = true;
    await progress.save();
  }

  await Activity.create({
    userId,
    title: `Completed RC: ${passage.title}`,
    type: 'english_rc',
    module: 'English',
    metadata: { score: percentage, passageTitle: passage.title }
  });

  await updateStudentStreak(userId);

  res.status(201).json({ success: true, data: result });
});

// @desc    Generate Timed English Quiz
// @route   POST /api/english/quiz/generate
// @access  Student
exports.generateQuiz = asyncHandler(async (req, res) => {
  const { topic = 'All', difficulty = 'All', count = 10 } = req.body;

  const query = { moduleType: 'English', status: 'published' };
  if (topic !== 'All') query.category = topic;
  if (difficulty !== 'All') query.difficulty = difficulty;

  const questionCount = Number(count) || 10;
  const questions = await Question.aggregate([
    { $match: query },
    { $sample: { size: questionCount } },
    {
      $project: {
        questionText: 1,
        options: 1,
        category: 1,
        topic: 1,
        difficulty: 1,
        marks: 1,
        questionType: 1
      }
    }
  ]);

  if (!questions || questions.length === 0) {
    throw new ApiError(404, 'Not enough English questions found for the selected configuration');
  }

  const durationMinutes = Math.ceil(questions.length * 1.5);

  res.status(200).json({
    success: true,
    data: {
      title: `${topic === 'All' ? 'English Mixed' : topic} Assessment`,
      topic,
      difficulty,
      duration: durationMinutes,
      questions
    }
  });
});

// @desc    Submit Timed English Quiz & Record Result
// @route   POST /api/english/quiz/submit
// @access  Student
exports.submitQuiz = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { topic = 'English Assessment', difficulty = 'Medium', timeTaken = 0, answers = [] } = req.body;

  const questionIds = answers.map(a => a.questionId);
  const questions = await Question.find({ _id: { $in: questionIds } });
  const qMap = {};
  questions.forEach(q => { qMap[q._id.toString()] = q; });

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  let totalMarks = 0;
  let obtainedMarks = 0;

  const evaluatedAnswers = answers.map(ans => {
    const q = qMap[ans.questionId];
    if (!q) return null;

    const markVal = q.marks || 1;
    const negVal = q.negativeMarks !== undefined ? q.negativeMarks : 0.25;
    totalMarks += markVal;

    if (!ans.selectedOption || ans.selectedOption === 'Unattempted') {
      unattemptedCount += 1;
      return {
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        selectedOption: 'Unattempted',
        correctAnswer: q.correctAnswer,
        isCorrect: false,
        explanation: q.explanation || '',
        topic: q.category
      };
    }

    const isCorrect = ans.selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    if (isCorrect) {
      correctCount += 1;
      obtainedMarks += markVal;
    } else {
      wrongCount += 1;
      obtainedMarks = Math.max(0, obtainedMarks - negVal);
    }

    return {
      questionId: q._id,
      questionText: q.questionText,
      options: q.options,
      selectedOption: ans.selectedOption,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation || '',
      topic: q.category
    };
  }).filter(Boolean);

  const attemptedCount = correctCount + wrongCount;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  const status = percentage >= 60 ? 'Passed' : 'Needs Improvement';

  const result = await Result.create({
    userId,
    moduleType: 'English',
    testType: 'topic_quiz',
    title: `${topic === 'All' ? 'English Mixed' : topic} Quiz`,
    topic,
    difficulty,
    totalQuestions: evaluatedAnswers.length,
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
    answers: evaluatedAnswers
  });

  // Update progress for attempted topics
  const topicCounts = {};
  evaluatedAnswers.forEach(a => {
    if (a.selectedOption !== 'Unattempted') {
      if (!topicCounts[a.topic]) topicCounts[a.topic] = { attempted: 0, solved: 0 };
      topicCounts[a.topic].attempted += 1;
      if (a.isCorrect) topicCounts[a.topic].solved += 1;
    }
  });

  for (const [topName, counts] of Object.entries(topicCounts)) {
    const p = await Progress.findOne({ userId, moduleName: 'English', topic: topName });
    if (p) {
      p.questionsAttempted = (p.questionsAttempted || 0) + counts.attempted;
      p.questionsSolved = (p.questionsSolved || 0) + counts.solved;
      p.accuracy = p.questionsAttempted > 0 ? Math.round((p.questionsSolved / p.questionsAttempted) * 100) : 0;
      p.lastStudiedAt = new Date();
      await p.save();
    } else {
      await Progress.create({
        userId,
        moduleName: 'English',
        topic: topName,
        questionsAttempted: counts.attempted || 0,
        questionsSolved: counts.solved || 0,
        accuracy: counts.attempted > 0 ? Math.round((counts.solved / counts.attempted) * 100) : 0,
        notesRead: false,
        lastStudiedAt: new Date()
      });
    }
  }

  await Activity.create({
    userId,
    title: `Completed ${topic} English Quiz`,
    type: 'english_quiz',
    module: 'English',
    metadata: { score: percentage, accuracy, resultId: result._id }
  });

  await updateStudentStreak(userId);

  res.status(201).json({
    success: true,
    message: 'Quiz submitted and evaluated successfully',
    data: result
  });
});

// @desc    Get Student Saved Bookmarks
// @route   GET /api/english/bookmarks
// @access  Student
exports.getBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const bookmarks = await Bookmark.find({ userId, moduleType: 'English' }).sort({ createdAt: -1 });

  const populated = await Promise.all(
    bookmarks.map(async (b) => {
      let item = null;
      if (b.itemType === 'Question') {
        item = await Question.findById(b.itemId);
      } else if (b.itemType === 'TopicNote') {
        item = await TopicNote.findById(b.itemId);
      } else if (b.itemType === 'Vocabulary') {
        item = await Vocabulary.findById(b.itemId);
      } else if (b.itemType === 'ReadingPassage') {
        item = await ReadingPassage.findById(b.itemId);
      }
      return {
        _id: b._id,
        itemType: b.itemType,
        itemId: b.itemId,
        createdAt: b.createdAt,
        item
      };
    })
  );

  const cleanData = populated.filter(b => b.item !== null);

  res.status(200).json({
    success: true,
    count: cleanData.length,
    data: cleanData
  });
});

// @desc    Toggle Bookmark for Question, Note, or Vocabulary
// @route   POST /api/english/bookmark
// @access  Student
exports.toggleBookmark = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId, itemType = 'Question' } = req.body;

  if (!itemId) throw new ApiError(400, 'itemId is required');

  const existing = await Bookmark.findOne({ userId, itemId, moduleType: 'English' });
  if (existing) {
    await existing.deleteOne();
    return res.status(200).json({ success: true, isBookmarked: false, message: 'Bookmark removed' });
  }

  await Bookmark.create({
    userId,
    itemId,
    itemType,
    moduleType: 'English'
  });

  res.status(201).json({ success: true, isBookmarked: true, message: 'Item bookmarked' });
});

// @desc    Delete Bookmark
// @route   DELETE /api/english/bookmark/:id
// @access  Student
exports.deleteBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const bookmark = await Bookmark.findOneAndDelete({ _id: id, userId });
  if (!bookmark) throw new ApiError(404, 'Bookmark not found');

  res.status(200).json({ success: true, message: 'Bookmark removed successfully' });
});

// @desc    Report Question Issue
// @route   POST /api/english/report
// @access  Student
exports.reportQuestion = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { questionId, reason, description } = req.body;

  if (!questionId || !reason) {
    throw new ApiError(400, 'questionId and reason are required');
  }

  const report = await QuestionReport.create({
    userId,
    questionId,
    reason,
    description: description || '',
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Issue report submitted to portal administrators',
    data: report
  });
});
