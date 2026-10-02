const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// All user routes are protected
router.use(protect);

// Logged-in student / user profile management
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

// Admin user management routes
router
  .route('/')
  .get(authorize('admin'), userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .delete(authorize('admin'), userController.deleteUser);
  
router
  .route('/:id/block')
  .put(authorize('admin'), userController.toggleBlockUser);

module.exports = router;
