const express = require('express');
const testController = require('../controllers/test.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// Public / Student Test Discovery
router.get('/', protect, testController.getAllTests);
router.get('/my/attempts', protect, testController.getMyAttempts);
router.get('/:id', protect, testController.getTest);
router.post('/:id/submit', protect, testController.submitTest);
router.get('/:id/leaderboard', protect, testController.getTestLeaderboard);

// Admin Management
router.post('/', protect, authorize('admin'), testController.createTest);
router.put('/:id', protect, authorize('admin'), testController.updateTest);
router.delete('/:id', protect, authorize('admin'), testController.deleteTest);

module.exports = router;
