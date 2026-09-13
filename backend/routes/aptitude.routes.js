const express = require('express');
const aptitudeController = require('../controllers/aptitude.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// All Aptitude routes require student/user authentication
router.use(protect);

// Student Topics & Notes
router.get('/topics', aptitudeController.getTopics);
router.get('/topics/:topicSlug', aptitudeController.getTopicDetails);
router.get('/topics/:topicSlug/notes', aptitudeController.getTopicNotes);
router.get('/topics/:topicSlug/questions', aptitudeController.getTopicQuestions);
router.get('/topics/:topicSlug/quiz', aptitudeController.getTopicQuiz);
router.post('/quiz/submit', aptitudeController.submitQuiz);

// Full 30-Question Aptitude Mock Test
router.get('/mock-test', aptitudeController.getMockTest);
router.post('/mock-test/submit', aptitudeController.submitMockTest);

// Results & Progress
router.get('/results', aptitudeController.getResults);
router.get('/results/:resultId', aptitudeController.getResultById);
router.get('/progress', aptitudeController.getProgress);
router.post('/bookmark', aptitudeController.toggleBookmark);

// Admin Management
router.post('/admin/questions', authorize('admin'), aptitudeController.adminCreateQuestion);
router.put('/admin/questions/:id', authorize('admin'), aptitudeController.adminUpdateQuestion);
router.delete('/admin/questions/:id', authorize('admin'), aptitudeController.adminDeleteQuestion);

module.exports = router;
