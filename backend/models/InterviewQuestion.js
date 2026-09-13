const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  topic: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ['Basic', 'Intermediate', 'Advanced', 'Easy', 'Medium', 'Hard'], default: 'Intermediate', index: true },
  answer: { type: String, required: true },
  explanation: { type: String, default: '' },
  keyPoints: [{ type: String }],
  codeSnippet: { type: String, default: '' },
  companyTags: [{ type: String, index: true }],
  views: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema);
