const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    targetUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    title: {
      type: String,
      default: 'Notification',
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    type: {
      type: String,
      default: 'general'
    },
    category: {
      type: String,
      default: 'general'
    },
    link: {
      type: String,
      default: ''
    },
    targetRoles: [{
      type: String
    }],
    read: {
      type: Boolean,
      default: false
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
