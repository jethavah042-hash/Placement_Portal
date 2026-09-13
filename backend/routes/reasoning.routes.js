const express = require('express');
const router = express.Router();
const reasoningController = require('../controllers/reasoning.controller');
const { protect } = require('../middlewares/auth.middleware');

// All student reasoning routes require authentication
router.use(protect);

// Dashboard
router.get('/dashboard', reasoningController.getStudentDashboard);

// Topics
router.get('/topics', reasoningController.getTopics);
router.get('/topics/:topicSlug', reasoningController.getTopicBySlug);

// Notes / Concepts
router.get('/notes/:topicSlug', reasoningController.getTopicNotes);
router.post('/notes/:topicSlug/complete', reasoningController.markNotesCompleted);

// Practice
router.get('/questions', reasoningController.getPracticeQuestions);
router.post('/attempt', reasoningController.submitPracticeAnswer);

// Quiz
router.post('/quiz/generate', reasoningController.generateQuiz);
router.post('/quiz/submit', reasoningController.submitQuiz);

// Bookmarks
router.get('/bookmarks', reasoningController.getBookmarks);
router.post('/bookmark', reasoningController.toggleBookmark);
router.delete('/bookmark/:id', reasoningController.deleteBookmark);

// Issue Reporting
router.post('/report', reasoningController.reportQuestion);

module.exports = router;
