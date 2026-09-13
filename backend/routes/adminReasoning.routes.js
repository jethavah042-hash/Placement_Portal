const express = require('express');
const router = express.Router();
const adminReasoningController = require('../controllers/adminReasoning.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

// All admin reasoning routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

// Dashboard & Analytics
router.get('/dashboard', adminReasoningController.getAdminDashboard);
router.get('/analytics', adminReasoningController.getAnalytics);

// Topics
router.get('/topics', adminReasoningController.getTopics);
router.post('/topics', adminReasoningController.createTopic);
router.put('/topics/:id', adminReasoningController.updateTopic);
router.delete('/topics/:id', adminReasoningController.deleteTopic);
router.post('/topics/reorder', adminReasoningController.reorderTopics);

// Questions Bank
router.get('/questions', adminReasoningController.getQuestions);
router.post('/questions', adminReasoningController.createQuestion);
router.put('/questions/:id', adminReasoningController.updateQuestion);
router.delete('/questions/:id', adminReasoningController.deleteQuestion);
router.post('/questions/:id/duplicate', adminReasoningController.duplicateQuestion);

// Study Notes
router.get('/notes', adminReasoningController.getNotes);
router.post('/notes', adminReasoningController.createNote);
router.put('/notes/:id', adminReasoningController.updateNote);
router.delete('/notes/:id', adminReasoningController.deleteNote);

// Question Issue Reports
router.get('/reports', adminReasoningController.getReports);
router.put('/reports/:id/resolve', adminReasoningController.resolveReport);
router.delete('/reports/:id', adminReasoningController.deleteReport);

module.exports = router;
