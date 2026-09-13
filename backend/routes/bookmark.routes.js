const express = require('express');
const bookmarkController = require('../controllers/bookmark.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(bookmarkController.getUserBookmarks)
  .post(bookmarkController.addBookmark);

router
  .route('/:id')
  .delete(bookmarkController.removeBookmark);

module.exports = router;
