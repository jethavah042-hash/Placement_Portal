const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// All user routes are protected, most restricted to admin
router.use(protect);

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
