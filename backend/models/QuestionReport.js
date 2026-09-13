const mongoose = require('mongoose');

const questionReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
  moduleType: { type: String, default: 'Reasoning', index: true },
  reason: {
    type: String,
    enum: ['Wrong Answer', 'Incorrect Explanation', 'Question Error', 'Duplicate Question', 'Other'],
    required: true
  },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
    index: true
  },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('QuestionReport', questionReportSchema);
