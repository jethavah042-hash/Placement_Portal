const express = require('express');
const router = express.Router();
const adminEnglishController = require('../controllers/adminEnglish.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

// All Admin English routes require Admin Authorization
router.use(protect);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminEnglishController.getAdminDashboard);

// Topics CRUD
router.get('/topics', adminEnglishController.getTopics);
router.post('/topics', adminEnglishController.createTopic);
router.put('/topics/:id', adminEnglishController.updateTopic);
router.delete('/topics/:id', adminEnglishController.deleteTopic);

// Question Bank CRUD
router.get('/questions', adminEnglishController.getQuestions);
router.post('/questions', adminEnglishController.createQuestion);
router.put('/questions/:id', adminEnglishController.updateQuestion);
router.delete('/questions/:id', adminEnglishController.deleteQuestion);
router.post('/questions/:id/duplicate', adminEnglishController.duplicateQuestion);

// Study Guides & Notes CRUD
router.get('/notes', adminEnglishController.getNotes);
router.post('/notes', adminEnglishController.createNote);
router.put('/notes/:id', adminEnglishController.updateNote);
router.delete('/notes/:id', adminEnglishController.deleteNote);

// Vocabulary Bank CRUD
router.get('/vocabulary', adminEnglishController.getVocabulary);
router.post('/vocabulary', adminEnglishController.createVocabulary);
router.put('/vocabulary/:id', adminEnglishController.updateVocabulary);
router.delete('/vocabulary/:id', adminEnglishController.deleteVocabulary);

// Reading Comprehension Passages CRUD
router.get('/passages', adminEnglishController.getPassages);
router.post('/passages', adminEnglishController.createPassage);
router.put('/passages/:id', adminEnglishController.updatePassage);
router.delete('/passages/:id', adminEnglishController.deletePassage);

// Reports Audit
router.get('/reports', adminEnglishController.getReports);
router.put('/reports/:id/resolve', adminEnglishController.resolveReport);
router.delete('/reports/:id', adminEnglishController.deleteReport);

module.exports = router;
