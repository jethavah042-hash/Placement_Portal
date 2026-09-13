const express = require('express');
const multer = require('multer');
const resumeController = require('../controllers/resume.controller');
const { protect } = require('../middlewares/auth.middleware');
const ApiError = require('../utils/ApiError');

const router = express.Router();

// Multer memory storage configuration with 10MB limit and format filter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB maximum
  },
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/octet-stream'
    ];
    const allowedExt = /\.(pdf|docx|doc)$/i;

    if (allowedMime.includes(file.mimetype) || allowedExt.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Please upload a PDF, DOC, or DOCX resume.'));
    }
  }
});

// All resume scanner routes require authentication
router.use(protect);

// Upload & Scan
router.post('/scan', upload.single('resume'), resumeController.scanResume);

// Scan History & Comparisons
router.get('/scans', resumeController.getScanHistory);
router.get('/scans/:scanId', resumeController.getScanById);
router.delete('/scans/:scanId', resumeController.deleteScan);
router.post('/scans/compare', resumeController.compareScans);
router.post('/scans/:scanId/company-match', resumeController.matchCompany);
router.post('/scans/:scanId/ai-review', resumeController.getAIReview);

// Resumes CRUD
router.get('/latest', resumeController.getLatestResume);
router.get('/my', resumeController.getMyResumes);
router.post('/', resumeController.createResume);
router.put('/:id', resumeController.updateResume);

module.exports = router;
