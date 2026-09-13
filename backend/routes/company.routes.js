const express = require('express');
const companyController = require('../controllers/company.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router
  .route('/')
  .get(companyController.getAllCompanies)
  .post(protect, authorize('admin'), companyController.createCompany);

router
  .route('/:id')
  .get(companyController.getCompany)
  .put(protect, authorize('admin'), companyController.updateCompany)
  .delete(protect, authorize('admin'), companyController.deleteCompany);

module.exports = router;
