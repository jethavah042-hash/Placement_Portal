const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(authorize('admin'), notificationController.createNotification);

router
  .route('/my')
  .get(notificationController.getMyNotifications);

router
  .route('/:id/read')
  .put(notificationController.markAsRead);

router
  .route('/:id')
  .delete(authorize('admin'), notificationController.deleteNotification);

module.exports = router;
