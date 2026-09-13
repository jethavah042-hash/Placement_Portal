const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

// Public/Student accessible route (needs auth to know user context)
router.get('/published', protect, announcementController.getPublishedAnnouncements);

// Specific announcement details (authenticated student/admin)
router.get('/:id', protect, announcementController.getAnnouncementById);

// Admin-only management endpoints
router.get('/', protect, requireAdmin, announcementController.getAllAnnouncements);
router.post('/', protect, requireAdmin, announcementController.createAnnouncement);
router.put('/:id', protect, requireAdmin, announcementController.updateAnnouncement);
router.delete('/:id', protect, requireAdmin, announcementController.deleteAnnouncement);
router.patch('/:id/status', protect, requireAdmin, announcementController.updateAnnouncementStatus);

module.exports = router;
