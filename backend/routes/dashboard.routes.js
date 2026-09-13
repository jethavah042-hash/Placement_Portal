const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/progress', dashboardController.getProgressHistory);
router.get('/subjects', dashboardController.getSubjectProgress);
router.get('/recent-activity', dashboardController.getRecentActivity);
router.get('/upcoming-tests', dashboardController.getUpcomingTests);
router.get('/recommendations', dashboardController.getRecommendations);
router.get('/streak', dashboardController.getStreak);
router.get('/time-spent', dashboardController.getTimeSpent);
router.get('/quick-stats', dashboardController.getQuickStats);
router.get('/calendar', dashboardController.getCalendarActivity);

module.exports = router;
