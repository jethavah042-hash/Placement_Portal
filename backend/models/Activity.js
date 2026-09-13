const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    default: 'general',
    index: true
  },
  module: { type: String, default: 'General' },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
