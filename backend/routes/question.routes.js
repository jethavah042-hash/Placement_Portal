const express = require('express');
const { getAllQuestions, createQuestion } = require('../controllers/question.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.route('/')
  .get(protect, getAllQuestions)
  .post(protect, authorize('admin'), createQuestion);

module.exports = router;
