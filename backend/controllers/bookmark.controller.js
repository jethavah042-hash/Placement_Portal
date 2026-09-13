const Bookmark = require('../models/Bookmark');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get user bookmarks
// @route   GET /api/bookmarks
// @access  Protected
exports.getUserBookmarks = catchAsync(async (req, res, next) => {
  const bookmarks = await Bookmark.find({ userId: req.user.id })
    .sort('-createdAt')
    .populate('itemId');

  res.status(200).json({
    success: true,
    results: bookmarks.length,
    data: bookmarks
  });
});

// @desc    Add a bookmark
// @route   POST /api/bookmarks
// @access  Protected
exports.addBookmark = catchAsync(async (req, res, next) => {
  const { itemId, itemType } = req.body;

  if (!itemId || !itemType) {
    return next(new AppError('itemId and itemType are required', 400));
  }

  const existing = await Bookmark.findOne({ userId: req.user.id, itemId });
  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'Already bookmarked',
      data: existing
    });
  }

  const bookmark = await Bookmark.create({
    userId: req.user.id,
    itemId,
    itemType
  });

  res.status(201).json({
    success: true,
    message: 'Bookmark added successfully',
    data: bookmark
  });
});

// @desc    Remove a bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Protected
exports.removeBookmark = catchAsync(async (req, res, next) => {
  const bookmark = await Bookmark.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!bookmark) {
    return next(new AppError('Bookmark not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Bookmark removed successfully'
  });
});
