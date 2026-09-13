const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const TopicNote = require('../models/TopicNote');
const Progress = require('../models/Progress');
const Result = require('../models/Result');
const Bookmark = require('../models/Bookmark');
const QuestionReport = require('../models/QuestionReport');
const Activity = require('../models/Activity');
const User = require('../models/User');

// Helper to update student study streak
async function updateStudentStreak(userId) {
  try {
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
  } catch (err) {
    console.error('Streak update error:', err);
  }
}

// ============================================================================
// 1. STUDENT REASONING DASHBOARD METRICS
// ============================================================================
exports.getStudentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Get all active Reasoning Topics
  const allTopics = await Topic.find({ moduleType: 'Reasoning', status: 'active' }).sort({ displayOrder: 1 });
  const totalTopicsCount = allTopics.length;

  // 2. Get user's progress records for Reasoning
  const userProgress = await Progress.find({ userId, moduleName: 'Reasoning' });
  const progressMap = {};
  userProgress.forEach(p => { progressMap[p.topic] = p; });

  // 3. Calculate Completed & Remaining Topics
  let completedTopicsCount = 0;
  let totalMCQsAttempted = 0;
  let totalMCQsCorrect = 0;
  const topicPerformance = [];

  allTopics.forEach(topic => {
    const p = progressMap[topic.name] || progressMap[topic.slug];
    if (p && (p.completed || (p.mcqsAttempted >= 5 && p.accuracy >= 60))) {
      completedTopicsCount++;
    }
    if (p) {
      totalMCQsAttempted += (p.mcqsAttempted || 0);
      totalMCQsCorrect += (p.mcqsCorrect || 0);
      if (p.mcqsAttempted > 0) {
        topicPerformance.push({
          topic: topic.name,
          slug: topic.slug,
          attempted: p.mcqsAttempted,
          correct: p.mcqsCorrect,
          accuracy: p.accuracy || Math.round((p.mcqsCorrect / p.mcqsAttempted) * 100)
        });
      }
    }
  });

  const remainingTopicsCount = Math.max(0, totalTopicsCount - completedTopicsCount);
  const overallProgressPercentage = totalTopicsCount > 0
    ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
    : 0;

  const overallAccuracy = totalMCQsAttempted > 0
    ? Math.round((totalMCQsCorrect / totalMCQsAttempted) * 100)
    : 0;

  // 4. Identify Weak and Strong Topics
  const weakTopics = topicPerformance
    .filter(t => t.accuracy < 50)
    .sort((a, b) => a.accuracy - b.accuracy);

  const strongTopics = topicPerformance
    .filter(t => t.accuracy >= 70)
    .sort((a, b) => b.accuracy - a.accuracy);

  // 5. Recommended Practice Topic (Weakest topic or first incomplete topic)
  let recommendedTopic = null;
  if (weakTopics.length > 0) {
    recommendedTopic = {
      ...weakTopics[0],
      reason: `Accuracy is currently ${weakTopics[0].accuracy}%. Focus practice here.`
    };
  } else {
    const incompleteTopic = allTopics.find(t => !progressMap[t.name] || !progressMap[t.name].completed);
    if (incompleteTopic) {
      recommendedTopic = {
        topic: incompleteTopic.name,
        slug: incompleteTopic.slug,
        reason: 'You haven\'t completed this topic yet. Start learning now.'
      };
    } else if (allTopics.length > 0) {
      recommendedTopic = {
        topic: allTopics[0].name,
        slug: allTopics[0].slug,
        reason: 'Master revision session.'
      };
    }
  }

  // 6. Recent Activities & Results
  const recentResults = await Result.find({ userId, moduleType: 'Reasoning' })
    .sort({ createdAt: -1 })
    .limit(5);

  const recentActivities = await Activity.find({ userId, type: { $in: ['reasoning_practice', 'reasoning_quiz', 'reasoning_note'] } })
    .sort({ createdAt: -1 })
    .limit(6);

  // 7. Bookmarks count
  const bookmarkedCount = await Bookmark.countDocuments({ userId, moduleType: 'Reasoning' });

  // 8. Topic breakdown cards
  const topicsData = await Promise.all(allTopics.map(async (t) => {
    const qCount = await Question.countDocuments({ moduleType: 'Reasoning', category: t.name, status: 'published' });
    const p = progressMap[t.name] || progressMap[t.slug];
    return {
      _id: t._id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      difficulty: t.difficulty,
      estimatedStudyTime: t.estimatedStudyTime,
      icon: t.icon,
      questionCount: qCount,
      progress: p ? {
        completed: p.completed || false,
        notesRead: p.notesRead || false,
        mcqsAttempted: p.mcqsAttempted || 0,
        mcqsCorrect: p.mcqsCorrect || 0,
        accuracy: p.accuracy || 0,
        quizCompleted: p.quizCompleted || false,
        quizScore: p.quizScore || 0
      } : null
    };
  }));

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        progress: overallProgressPercentage,
        questionsAttempted: totalMCQsAttempted,
        questionsSolved: totalMCQsCorrect,
        accuracy: overallAccuracy,
        studyStreak: req.user.streak || 0,
        completedTopics: completedTopicsCount,
        remainingTopics: remainingTopicsCount,
        totalTopics: totalTopicsCount,
        bookmarkedCount
      },
      weakTopics,
      strongTopics,
      recommendedPractice: recommendedTopic,
      topics: topicsData,
      recentResults,
      recentActivities
    }
  });
});

// ============================================================================
// 2. TOPICS LIST & DETAILS
// ============================================================================
exports.getTopics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const topics = await Topic.find({ moduleType: 'Reasoning', status: 'active' }).sort({ displayOrder: 1 });
  const userProgress = await Progress.find({ userId, moduleName: 'Reasoning' });
  const progressMap = {};
  userProgress.forEach(p => { progressMap[p.topic] = p; });

  const topicsWithCounts = await Promise.all(topics.map(async (t) => {
    const [questionCount, note] = await Promise.all([
      Question.countDocuments({ moduleType: 'Reasoning', category: t.name, status: 'published' }),
      TopicNote.findOne({ moduleType: 'Reasoning', topic: t.name, status: 'published' }).select('_id slug')
    ]);

    const p = progressMap[t.name] || progressMap[t.slug];

    return {
      _id: t._id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      difficulty: t.difficulty,
      estimatedStudyTime: t.estimatedStudyTime,
      icon: t.icon,
      questionCount,
      hasNotes: !!note,
      notesSlug: note ? note.slug : t.slug,
      progress: p ? {
        completed: p.completed || false,
        notesRead: p.notesRead || false,
        mcqsAttempted: p.mcqsAttempted || 0,
        mcqsCorrect: p.mcqsCorrect || 0,
        accuracy: p.accuracy || 0,
        quizCompleted: p.quizCompleted || false,
        quizScore: p.quizScore || 0
      } : { completed: false, notesRead: false, mcqsAttempted: 0, accuracy: 0 }
    };
  }));

  res.status(200).json({ success: true, count: topicsWithCounts.length, data: topicsWithCounts });
});

exports.getTopicBySlug = asyncHandler(async (req, res) => {
  const { topicSlug } = req.params;
  const userId = req.user._id;

  const topic = await Topic.findOne({
    moduleType: 'Reasoning',
    $or: [{ slug: topicSlug }, { name: { $regex: new RegExp(`^${topicSlug.replace(/-/g, ' ')}$`, 'i') } }]
  });

  if (!topic) throw new ApiError(404, 'Reasoning topic not found');

  const [questionCount, note, progress, bookmarksCount] = await Promise.all([
    Question.countDocuments({ moduleType: 'Reasoning', category: topic.name, status: 'published' }),
    TopicNote.findOne({ moduleType: 'Reasoning', topic: topic.name, status: 'published' }),
    Progress.findOne({ userId, moduleName: 'Reasoning', topic: topic.name }),
    Bookmark.countDocuments({ userId, moduleType: 'Reasoning' })
  ]);

  res.status(200).json({
    success: true,
    data: {
      topic,
      questionCount,
      hasNotes: !!note,
      noteSummary: note ? note.introduction : '',
      progress: progress || { completed: false, notesRead: false, mcqsAttempted: 0, accuracy: 0 },
      bookmarksCount
    }
  });
});

// ============================================================================
// 3. TOPIC NOTES / STUDY MATERIAL
// ============================================================================
exports.getTopicNotes = asyncHandler(async (req, res) => {
  const { topicSlug } = req.params;
  const userId = req.user._id;

  const note = await TopicNote.findOne({
    moduleType: 'Reasoning',
    $or: [
      { slug: topicSlug },
      { topic: { $regex: new RegExp(`^${topicSlug.replace(/-/g, ' ')}$`, 'i') } }
    ],
    status: 'published'
  });

  if (!note) {
    // Return friendly placeholder if study guide is being drafted
    const topic = await Topic.findOne({
      moduleType: 'Reasoning',
      $or: [{ slug: topicSlug }, { name: { $regex: new RegExp(`^${topicSlug.replace(/-/g, ' ')}$`, 'i') } }]
    });

    if (!topic) throw new ApiError(404, 'Reasoning topic notes not found');

    return res.status(200).json({
      success: true,
      data: {
        note: {
          topic: topic.name,
          slug: topic.slug,
          title: `${topic.name} Conceptual Guide`,
          introduction: `Master the key strategies and fundamental patterns of ${topic.name} for technical and recruitment reasoning assessments.`,
          concepts: [{ title: 'Overview', content: topic.description || 'Core concepts and logical rules.' }],
          rules: ['Read the problem statement carefully.', 'Identify fixed relationships and variable clues.', 'Eliminate contradictory options.'],
          shortcuts: [{ name: 'Elimination Method', tip: 'Disprove extreme options first to narrow choices down to two.', example: '' }],
          solvedExamples: [],
          placementTips: ['Frequently asked in TCS NQT, Infosys, and Cognizant screening rounds.']
        },
        progress: { notesRead: false },
        isBookmarked: false
      }
    });
  }

  // Get previous and next topics for smooth sequence navigation
  const allTopics = await Topic.find({ moduleType: 'Reasoning', status: 'active' }).sort({ displayOrder: 1 });
  const currentIndex = allTopics.findIndex(t => t.name === note.topic || t.slug === note.slug);
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  const [progress, isBookmarked] = await Promise.all([
    Progress.findOne({ userId, moduleName: 'Reasoning', topic: note.topic }),
    Bookmark.exists({ userId, itemId: note._id, itemType: 'TopicNote' })
  ]);

  res.status(200).json({
    success: true,
    data: {
      note,
      prevTopic: prevTopic ? { name: prevTopic.name, slug: prevTopic.slug } : null,
      nextTopic: nextTopic ? { name: nextTopic.name, slug: nextTopic.slug } : null,
      progress: progress || { notesRead: false },
      isBookmarked: !!isBookmarked
    }
  });
});

exports.markNotesCompleted = asyncHandler(async (req, res) => {
  const { topicSlug } = req.params;
  const userId = req.user._id;

  const topic = await Topic.findOne({
    moduleType: 'Reasoning',
    $or: [{ slug: topicSlug }, { name: { $regex: new RegExp(`^${topicSlug.replace(/-/g, ' ')}$`, 'i') } }]
  });

  const topicName = topic ? topic.name : topicSlug;

  const progress = await Progress.findOneAndUpdate(
    { userId, moduleName: 'Reasoning', topic: topicName },
    { $set: { notesRead: true, lastActivityAt: new Date() } },
    { new: true, upsert: true, returnDocument: 'after' }
  );

  await Activity.create({
    userId,
    type: 'reasoning_note',
    title: `Completed Study Guide: ${topicName}`,
    description: `Read reasoning concepts and shortcuts for ${topicName}`,
    metadata: { topic: topicName, module: 'Reasoning' }
  });

  await updateStudentStreak(userId);

  res.status(200).json({
    success: true,
    message: 'Notes marked as completed',
    data: progress
  });
});

// ============================================================================
// 4. PRACTICE QUESTIONS ARENA
// ============================================================================
exports.getPracticeQuestions = asyncHandler(async (req, res) => {
  const { topic, difficulty, search, page = 1, limit = 20 } = req.query;
  const userId = req.user._id;

  const query = { moduleType: 'Reasoning', status: 'published' };
  if (topic && topic !== 'All') {
    query.$or = [{ category: topic }, { topic: topic }];
  }
  if (difficulty && difficulty !== 'All') {
    query.difficulty = difficulty;
  }
  if (search) {
    query.questionText = { $regex: search, $options: 'i' };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [questions, total, userBookmarks] = await Promise.all([
    Question.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Question.countDocuments(query),
    Bookmark.find({ userId, itemType: 'Question' }).select('itemId')
  ]);

  const bookmarkedSet = new Set(userBookmarks.map(b => b.itemId.toString()));

  const formattedQuestions = questions.map(q => ({
    _id: q._id,
    questionText: q.questionText,
    topic: q.topic || q.category,
    category: q.category,
    difficulty: q.difficulty,
    options: q.options,
    marks: q.marks,
    negativeMarks: q.negativeMarks,
    tags: q.tags,
    companyTags: q.companyTags,
    isBookmarked: bookmarkedSet.has(q._id.toString())
  }));

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: formattedQuestions
  });
});

exports.submitPracticeAnswer = asyncHandler(async (req, res) => {
  const { questionId, selectedOption } = req.body;
  const userId = req.user._id;

  if (!questionId || !selectedOption) {
    throw new ApiError(400, 'Question ID and selected option are required');
  }

  const question = await Question.findById(questionId);
  if (!question || question.moduleType !== 'Reasoning') {
    throw new ApiError(404, 'Reasoning question not found');
  }

  const isCorrect = question.correctAnswer.trim().toLowerCase() === selectedOption.trim().toLowerCase();

  // 1. Update Question telemetry
  question.attemptsCount = (question.attemptsCount || 0) + 1;
  if (isCorrect) {
    question.correctCount = (question.correctCount || 0) + 1;
  } else {
    question.wrongCount = (question.wrongCount || 0) + 1;
  }
  await question.save();

  // 2. Update Student Progress
  const topicName = question.category || question.topic;
  let progress = await Progress.findOne({ userId, moduleName: 'Reasoning', topic: topicName });

  if (!progress) {
    progress = new Progress({
      userId,
      moduleName: 'Reasoning',
      topic: topicName,
      mcqsAttempted: 1,
      mcqsCorrect: isCorrect ? 1 : 0,
      accuracy: isCorrect ? 100 : 0,
      lastActivityAt: new Date()
    });
  } else {
    progress.mcqsAttempted += 1;
    if (isCorrect) progress.mcqsCorrect += 1;
    progress.accuracy = Math.round((progress.mcqsCorrect / progress.mcqsAttempted) * 100);
    progress.lastActivityAt = new Date();
  }
  await progress.save();

  // 3. Log Activity & Streak
  await Activity.create({
    userId,
    type: 'reasoning_practice',
    title: `Practiced ${topicName}`,
    description: `Answered ${isCorrect ? 'correctly' : 'incorrectly'}: "${question.questionText.slice(0, 50)}..."`,
    metadata: { questionId, isCorrect, topic: topicName }
  });

  await updateStudentStreak(userId);

  res.status(200).json({
    success: true,
    data: {
      isCorrect,
      selectedOption,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      progress: {
        mcqsAttempted: progress.mcqsAttempted,
        mcqsCorrect: progress.mcqsCorrect,
        accuracy: progress.accuracy
      }
    }
  });
});

// ============================================================================
// 5. REASONING QUIZ ENGINE & AUTO-SUBMIT
// ============================================================================
exports.generateQuiz = asyncHandler(async (req, res) => {
  const { topic = 'All', difficulty = 'All', count = 10 } = req.body;

  const matchQuery = { moduleType: 'Reasoning', status: 'published' };
  if (topic && topic !== 'All') {
    matchQuery.$or = [{ category: topic }, { topic: topic }];
  }
  if (difficulty && difficulty !== 'All') {
    matchQuery.difficulty = difficulty;
  }

  const sampleSize = Math.min(Math.max(Number(count), 5), 30);

  const questions = await Question.aggregate([
    { $match: matchQuery },
    { $sample: { size: sampleSize } },
    {
      $project: {
        _id: 1,
        questionText: 1,
        options: 1,
        topic: 1,
        category: 1,
        difficulty: 1,
        marks: 1,
        negativeMarks: 1
      }
    }
  ]);

  if (questions.length === 0) {
    throw new ApiError(404, 'No reasoning questions available for the selected parameters.');
  }

  // Duration in minutes (1.5 minutes per question)
  const duration = Math.ceil(questions.length * 1.5);

  res.status(200).json({
    success: true,
    data: {
      title: `${topic === 'All' ? 'Comprehensive Reasoning' : topic} Assessment`,
      topic,
      difficulty,
      duration, // in minutes
      totalQuestions: questions.length,
      questions
    }
  });
});

exports.submitQuiz = asyncHandler(async (req, res) => {
  const { topic = 'Reasoning', difficulty = 'Medium', timeTaken = 0, answers = [] } = req.body;
  const userId = req.user._id;

  if (!answers || answers.length === 0) {
    throw new ApiError(400, 'Quiz answers are required for evaluation');
  }

  const questionIds = answers.map(a => a.questionId);
  const dbQuestions = await Question.find({ _id: { $in: questionIds } });
  const questionMap = {};
  dbQuestions.forEach(q => { questionMap[q._id.toString()] = q; });

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  let totalMarks = 0;
  let obtainedMarks = 0;
  const topicStats = {};
  const detailedAnswers = [];

  answers.forEach(ans => {
    const q = questionMap[ans.questionId];
    if (!q) return;

    const qMarks = q.marks || 1;
    const qNeg = q.negativeMarks || 0.25;
    totalMarks += qMarks;

    const qTopic = q.category || q.topic || 'General Reasoning';
    if (!topicStats[qTopic]) topicStats[qTopic] = { total: 0, correct: 0, wrong: 0 };
    topicStats[qTopic].total += 1;

    const selected = (ans.selectedOption || '').trim().toLowerCase();
    const correct = (q.correctAnswer || '').trim().toLowerCase();

    let isCorrect = false;
    if (!selected) {
      unattemptedCount++;
    } else if (selected === correct) {
      isCorrect = true;
      correctCount++;
      obtainedMarks += qMarks;
      topicStats[qTopic].correct += 1;
    } else {
      wrongCount++;
      obtainedMarks = Math.max(0, obtainedMarks - qNeg);
      topicStats[qTopic].wrong += 1;
    }

    // Update individual question telemetry
    q.attemptsCount = (q.attemptsCount || 0) + 1;
    if (isCorrect) q.correctCount = (q.correctCount || 0) + 1;
    else if (selected) q.wrongCount = (q.wrongCount || 0) + 1;
    q.save().catch(() => {});

    detailedAnswers.push({
      questionId: q._id,
      questionText: q.questionText,
      options: q.options,
      selectedOption: ans.selectedOption || 'Unattempted',
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      topic: qTopic
    });
  });

  const attemptedCount = correctCount + wrongCount;
  const percentage = totalMarks > 0 ? Math.round((Math.max(0, obtainedMarks) / totalMarks) * 100) : 0;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const status = percentage >= 60 ? 'Passed' : 'Needs Improvement';

  const topicAnalysis = Object.keys(topicStats).map(tName => ({
    topic: tName,
    total: topicStats[tName].total,
    correct: topicStats[tName].correct,
    wrong: topicStats[tName].wrong,
    percentage: Math.round((topicStats[tName].correct / Math.max(1, topicStats[tName].total)) * 100)
  }));

  // 1. Save Result
  const result = await Result.create({
    userId,
    testType: 'topic_quiz',
    moduleType: 'Reasoning',
    title: `${topic} Reasoning Quiz`,
    topic,
    totalQuestions: answers.length,
    attemptedCount,
    correctCount,
    wrongCount,
    unattemptedCount,
    totalMarks,
    obtainedMarks: Math.round(obtainedMarks * 100) / 100,
    percentage,
    accuracy,
    timeTaken: Number(timeTaken) || 1,
    status,
    topicAnalysis,
    answers: detailedAnswers
  });

  // 2. Update Student Topic Progress
  if (topic !== 'All') {
    await Progress.findOneAndUpdate(
      { userId, moduleName: 'Reasoning', topic },
      {
        $inc: { mcqsAttempted: attemptedCount, mcqsCorrect: correctCount, attempts: 1 },
        $set: {
          quizCompleted: true,
          quizScore: percentage,
          accuracy,
          completed: percentage >= 60,
          lastActivityAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  // 3. Log Activity & Update Streak
  await Activity.create({
    userId,
    type: 'reasoning_quiz',
    title: `Completed ${topic} Quiz`,
    description: `Scored ${percentage}% (${obtainedMarks}/${totalMarks} marks) with ${accuracy}% accuracy`,
    metadata: { resultId: result._id, percentage, accuracy, status }
  });

  await updateStudentStreak(userId);

  res.status(201).json({
    success: true,
    message: 'Quiz evaluated successfully',
    data: result
  });
});

// ============================================================================
// 6. BOOKMARKS SYSTEM (Questions & Notes)
// ============================================================================
exports.getBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bookmarks = await Bookmark.find({ userId, moduleType: 'Reasoning' }).sort({ createdAt: -1 });

  const questionIds = bookmarks.filter(b => b.itemType === 'Question').map(b => b.itemId);
  const noteIds = bookmarks.filter(b => b.itemType === 'TopicNote').map(b => b.itemId);

  const [questions, notes] = await Promise.all([
    Question.find({ _id: { $in: questionIds } }),
    TopicNote.find({ _id: { $in: noteIds } })
  ]);

  const qMap = {};
  questions.forEach(q => { qMap[q._id.toString()] = q; });

  const nMap = {};
  notes.forEach(n => { nMap[n._id.toString()] = n; });

  const populatedBookmarks = bookmarks.map(b => {
    const item = b.itemType === 'Question' ? qMap[b.itemId.toString()] : nMap[b.itemId.toString()];
    return {
      _id: b._id,
      itemType: b.itemType,
      itemId: b.itemId,
      item: item || null,
      createdAt: b.createdAt
    };
  }).filter(b => b.item !== null);

  res.status(200).json({
    success: true,
    count: populatedBookmarks.length,
    data: populatedBookmarks
  });
});

exports.toggleBookmark = asyncHandler(async (req, res) => {
  const { itemId, itemType = 'Question' } = req.body;
  const userId = req.user._id;

  if (!itemId) throw new ApiError(400, 'Item ID is required to bookmark');

  const existing = await Bookmark.findOne({ userId, itemId, itemType });
  if (existing) {
    await existing.deleteOne();
    return res.status(200).json({ success: true, isBookmarked: false, message: 'Bookmark removed' });
  }

  const bookmark = await Bookmark.create({
    userId,
    itemId,
    itemType,
    moduleType: 'Reasoning'
  });

  res.status(201).json({ success: true, isBookmarked: true, message: 'Bookmark added', data: bookmark });
});

exports.deleteBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  await Bookmark.findOneAndDelete({ _id: id, userId });
  res.status(200).json({ success: true, message: 'Bookmark deleted' });
});

// ============================================================================
// 7. QUESTION ISSUE REPORTING
// ============================================================================
exports.reportQuestion = asyncHandler(async (req, res) => {
  const { questionId, reason, description } = req.body;
  const userId = req.user._id;

  if (!questionId || !reason) {
    throw new ApiError(400, 'Question ID and reason are required');
  }

  const report = await QuestionReport.create({
    userId,
    questionId,
    moduleType: 'Reasoning',
    reason,
    description: description || ''
  });

  res.status(201).json({
    success: true,
    message: 'Report submitted for review. Thank you for helping improve the portal!',
    data: report
  });
});
