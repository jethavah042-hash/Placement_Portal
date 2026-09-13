const express = require('express');
const router = express.Router();
const englishController = require('../controllers/english.controller');
const { protect } = require('../middlewares/auth.middleware');

// All student routes require authentication
router.use(protect);

// Dashboard & Progress
router.get('/dashboard', englishController.getStudentDashboard);

// Topics
router.get('/topics', englishController.getTopics);
router.get('/topics/:slug', englishController.getTopicBySlug);

// Study Guides / Notes
router.get('/notes/:topicSlug', englishController.getTopicNotes);
router.post('/notes/:topicSlug/complete', englishController.markNotesCompleted);

// Practice Questions & Instant Attempt Check
router.get('/questions', englishController.getPracticeQuestions);
router.post('/attempt', englishController.submitPracticeAnswer);

// Vocabulary Trainer
router.get('/vocabulary', englishController.getVocabulary);
router.post('/vocabulary/:id/toggle-learned', englishController.toggleVocabularyLearned);

// Reading Comprehension Passages
router.get('/passages', englishController.getReadingPassages);
router.get('/passages/:id', englishController.getReadingPassageById);
router.post('/passages/:id/submit', englishController.submitReadingPassage);

// Timed Assessment Quiz
router.post('/quiz/generate', englishController.generateQuiz);
router.post('/quiz/submit', englishController.submitQuiz);

// Bookmarks
router.get('/bookmarks', englishController.getBookmarks);
router.post('/bookmark', englishController.toggleBookmark);
router.delete('/bookmark/:id', englishController.deleteBookmark);

// Issue Reporting
router.post('/report', englishController.reportQuestion);

module.exports = router;
