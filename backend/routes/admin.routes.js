const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

// Apply authentication & admin role check to all admin routes
router.use(protect);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Student Management
router.get('/students', adminController.getStudents);
router.get('/students/:id', adminController.getStudentById);
router.post('/students/:id/toggle-block', adminController.toggleBlockStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Coding Practice Management
router.get('/coding/problems', adminController.getCodingProblems);
router.post('/coding/problems', adminController.createCodingProblem);
router.put('/coding/problems/:id', adminController.updateCodingProblem);
router.delete('/coding/problems/:id', adminController.deleteCodingProblem);

router.get('/coding/notes', adminController.getCodingNotes);
router.post('/coding/notes', adminController.createCodingNote);
router.put('/coding/notes/:id', adminController.updateCodingNote);
router.delete('/coding/notes/:id', adminController.deleteCodingNote);

router.get('/coding/interview-questions', adminController.getInterviewQuestions);
router.post('/coding/interview-questions', adminController.createInterviewQuestion);
router.put('/coding/interview-questions/:id', adminController.updateInterviewQuestion);
router.delete('/coding/interview-questions/:id', adminController.deleteInterviewQuestion);

// Questions (Aptitude / Reasoning / English)
router.get('/questions', adminController.getQuestions);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

router.get('/topic-notes', adminController.getTopicNotes);
router.post('/topic-notes', adminController.createTopicNote);
router.put('/topic-notes/:id', adminController.updateTopicNote);
router.delete('/topic-notes/:id', adminController.deleteTopicNote);

// Companies
router.get('/companies', adminController.getCompanies);
router.get('/companies/:id', adminController.getCompanyById);
router.post('/companies', adminController.createCompany);
router.put('/companies/:id', adminController.updateCompany);
router.delete('/companies/:id', adminController.deleteCompany);

// Mock Tests
router.get('/mock-tests', adminController.getMockTests);
router.post('/mock-tests', adminController.createMockTest);
router.put('/mock-tests/:id', adminController.updateMockTest);
router.delete('/mock-tests/:id', adminController.deleteMockTest);

// Results & Submissions
router.get('/results', adminController.getTestResults);
router.get('/coding/submissions', adminController.getCodingSubmissions);

// Resume Scanner Management
router.get('/resumes/stats', adminController.getResumeStats);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.createNotification);
router.delete('/notifications/:id', adminController.deleteNotification);

// Reports & Audit Logs
router.get('/reports', adminController.getReportData);
router.get('/activity-logs', adminController.getAdminActivityLogs);

// Settings
router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);
router.post('/change-password', adminController.changeAdminPassword);

module.exports = router;
