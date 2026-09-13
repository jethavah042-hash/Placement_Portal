const express = require('express');
const resultController = require('../controllers/result.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect); // Protect all result routes

router
  .route('/')
  .post(resultController.submitResult)
  .get(authorize('admin'), resultController.getAllResults);

router
  .route('/my')
  .get(resultController.getMyResults);

router
  .route('/:id')
  .get(resultController.getResult);

module.exports = router;
