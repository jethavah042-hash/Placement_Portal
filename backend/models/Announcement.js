const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: 200
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 100
    },
    companyLogo: {
      type: String,
      default: ''
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    package: {
      type: String,
      default: 'Best in Industry',
      trim: true
    },
    eligibility: {
      type: String,
      default: 'All Eligible Batches',
      trim: true
    },
    requiredSkills: [{
      type: String,
      trim: true
    }],
    location: {
      type: String,
      default: 'Pan India / Flexible',
      trim: true
    },
    driveDate: {
      type: Date
    },
    applicationDeadline: {
      type: Date
    },
    interviewDate: {
      type: Date
    },
    instructions: {
      type: String,
      default: ''
    },
    applicationLink: {
      type: String,
      default: ''
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Expired'],
      default: 'Published'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Index for fast query of published announcements sorted by priority and date
announcementSchema.index({ status: 1, priority: 1, applicationDeadline: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
