const express = require('express');
const { reviewResume, analyzeSkillGap } = require('../controllers/ai.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/resume-review', protect, reviewResume);
router.post('/skill-gap', protect, analyzeSkillGap);

module.exports = router;
