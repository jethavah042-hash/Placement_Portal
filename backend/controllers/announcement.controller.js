const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const AdminActivity = require('../models/AdminActivity');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Priority ordering map for sorting
const priorityOrder = {
  Urgent: 1,
  High: 2,
  Medium: 3,
  Low: 4
};

// @desc    Get Published Announcements for Students
// @route   GET /api/announcements/published
// @access  Protected (Students & Admins)
exports.getPublishedAnnouncements = asyncHandler(async (req, res) => {
  const now = new Date();

  // Find all published announcements
  const announcements = await Announcement.find({
    status: 'Published'
  })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email');

  // Filter and sort by priority weight in memory
  // Also optionally auto-mark expired ones
  const activeAnnouncements = [];

  for (const ann of announcements) {
    if (ann.applicationDeadline && new Date(ann.applicationDeadline) < now) {
      // Deadline has passed - auto mark as expired in DB
      ann.status = 'Expired';
      await ann.save();
    } else {
      activeAnnouncements.push(ann);
    }
  }

  // Sort by priority (Urgent -> High -> Medium -> Low) then newest
  activeAnnouncements.sort((a, b) => {
    const pA = priorityOrder[a.priority] || 3;
    const pB = priorityOrder[b.priority] || 3;
    if (pA !== pB) return pA - pB;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.status(200).json({
    success: true,
    count: activeAnnouncements.length,
    data: activeAnnouncements
  });
});

// @desc    Get All Announcements (Admin with filtering & pagination)
// @route   GET /api/announcements
// @access  Admin
exports.getAllAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, priority } = req.query;

  const query = {};

  if (status && status !== 'All') {
    query.status = status;
  }

  if (priority && priority !== 'All') {
    query.priority = priority;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { jobRole: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { requiredSkills: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Announcement.countDocuments(query);
  const announcements = await Announcement.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    data: announcements
  });
});

// @desc    Get Single Announcement by ID
// @route   GET /api/announcements/:id
// @access  Protected
exports.getAnnouncementById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const announcement = await Announcement.findById(id).populate('createdBy', 'name email');
  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Create Announcement
// @route   POST /api/announcements
// @access  Admin
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const {
    title,
    companyName,
    companyLogo,
    jobRole,
    description,
    package: ctcPackage,
    eligibility,
    requiredSkills,
    location,
    driveDate,
    applicationDeadline,
    interviewDate,
    instructions,
    applicationLink,
    priority = 'Medium',
    status = 'Published'
  } = req.body;

  if (!title || !companyName || !jobRole || !description) {
    throw new ApiError(400, 'Title, company name, job role, and description are required');
  }

  // Format skills as array
  let skillsArray = [];
  if (Array.isArray(requiredSkills)) {
    skillsArray = requiredSkills.map(s => s.trim()).filter(Boolean);
  } else if (typeof requiredSkills === 'string' && requiredSkills.trim()) {
    skillsArray = requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    companyName: companyName.trim(),
    companyLogo: companyLogo || '',
    jobRole: jobRole.trim(),
    description: description.trim(),
    package: ctcPackage || 'Best in Industry',
    eligibility: eligibility || 'All Batches Eligible',
    requiredSkills: skillsArray,
    location: location || 'Pan India / Flexible',
    driveDate: driveDate ? new Date(driveDate) : undefined,
    applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
    interviewDate: interviewDate ? new Date(interviewDate) : undefined,
    instructions: instructions || '',
    applicationLink: applicationLink ? applicationLink.trim() : '',
    priority,
    status,
    createdBy: req.user._id
  });

  // If announcement is Published, send notification to students
  if (status === 'Published') {
    try {
      await Notification.create({
        title: `🏢 ${companyName}: ${jobRole}`,
        message: `${companyName} has published a new placement requirement for "${jobRole}" (${ctcPackage || 'Competitive CTC'}). Check dashboard for eligibility and details.`,
        type: 'global',
        targetRoles: ['student']
      });
    } catch (notifErr) {
      console.error('Error creating announcement notification:', notifErr);
    }
  }

  // Log admin activity
  try {
    await AdminActivity.create({
      adminId: req.user._id,
      adminName: req.user.name || 'Administrator',
      action: 'CREATE_ANNOUNCEMENT',
      entity: 'Announcement',
      entityId: announcement._id.toString(),
      details: `Created announcement: ${title} (${companyName})`
    });
  } catch (actErr) {
    console.error('Error logging admin activity:', actErr);
  }

  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: announcement
  });
});

// @desc    Update Announcement
// @route   PUT /api/announcements/:id
// @access  Admin
exports.updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let updateData = { ...req.body };

  // Parse requiredSkills if provided
  if (updateData.requiredSkills !== undefined) {
    if (Array.isArray(updateData.requiredSkills)) {
      updateData.requiredSkills = updateData.requiredSkills.map(s => s.trim()).filter(Boolean);
    } else if (typeof updateData.requiredSkills === 'string') {
      updateData.requiredSkills = updateData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  if (updateData.driveDate) updateData.driveDate = new Date(updateData.driveDate);
  if (updateData.applicationDeadline) updateData.applicationDeadline = new Date(updateData.applicationDeadline);
  if (updateData.interviewDate) updateData.interviewDate = new Date(updateData.interviewDate);

  const announcement = await Announcement.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    data: announcement
  });
});

// @desc    Delete Announcement
// @route   DELETE /api/announcements/:id
// @access  Admin
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});

// @desc    Update Announcement Status (Draft / Published / Expired)
// @route   PATCH /api/announcements/:id/status
// @access  Admin
exports.updateAnnouncementStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Draft', 'Published', 'Expired'].includes(status)) {
    throw new ApiError(400, 'Invalid status. Must be Draft, Published, or Expired');
  }

  const announcement = await Announcement.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!announcement) {
    throw new ApiError(404, 'Announcement not found');
  }

  res.status(200).json({
    success: true,
    message: `Announcement marked as ${status}`,
    data: announcement
  });
});
