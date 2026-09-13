const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', default: null },
  testType: { type: String, default: 'mock_test', index: true },
  moduleType: { type: String, default: 'Reasoning', index: true },
  title: { type: String, default: 'Assessment' },
  topic: { type: String, default: 'General' },
  difficulty: { type: String, default: 'Medium' },
  totalQuestions: { type: Number, required: true },
  attemptedCount: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  unattemptedCount: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 30 },
  obtainedMarks: { type: Number, required: true },
  percentage: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  timeTaken: { type: Number, required: true }, // in seconds
  status: { type: String, default: 'Needs Improvement' },
  topicAnalysis: [{
    topic: String,
    total: Number,
    correct: Number,
    wrong: Number,
    percentage: Number
  }],
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    questionText: String,
    options: [String],
    selectedOption: String,
    correctAnswer: String,
    isCorrect: Boolean,
    explanation: String,
    topic: String
  }],
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
