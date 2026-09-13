const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/admin')
  .get(authorize('admin'), analyticsController.getAdminAnalytics);

router
  .route('/my')
  .get(analyticsController.getStudentAnalytics);

module.exports = router;
