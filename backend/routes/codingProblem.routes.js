const express = require('express');
const codingProblemController = require('../controllers/codingProblem.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// Require authentication for all coding routes
router.use(protect);

// Topics & Overview
router.get('/topics', codingProblemController.getTopics);
router.get('/topics/:topicSlug', codingProblemController.getTopicDetails);
router.get('/topics/:topicSlug/notes', codingProblemController.getTopicNotes);
router.get('/topics/:topicSlug/interview', codingProblemController.getInterviewQuestions);

// Global Interview Questions
router.get('/interview', codingProblemController.getInterviewQuestions);

// Coding Problems Catalog
router.get('/problems', codingProblemController.getAllCodingProblems);
router.get('/problems/:id', codingProblemController.getCodingProblem);
router.get('/problems/:id/hints', codingProblemController.getProblemHints);

// Code Execution & Submissions
router.post('/problems/:id/run', codingProblemController.runCode);
router.post('/problems/:id/submit', codingProblemController.submitCode);
router.post('/problems/:id/bookmark', codingProblemController.toggleBookmark);

// Student Submissions & Analytics
router.get('/submissions', codingProblemController.getSubmissions);
router.get('/submissions/:id', codingProblemController.getSubmissionById);
router.get('/progress', codingProblemController.getProgress);
router.get('/analytics', codingProblemController.getAnalytics);

// Admin Problem Management
router.post('/', authorize('admin'), codingProblemController.createCodingProblem);
router.put('/:id', authorize('admin'), codingProblemController.updateCodingProblem);
router.delete('/:id', authorize('admin'), codingProblemController.deleteCodingProblem);

module.exports = router;
