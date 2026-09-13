const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  moduleName: { type: String, required: true, index: true }, // e.g. Aptitude, Coding
  topic: { type: String, required: true, index: true },
  completed: { type: Boolean, default: false },
  notesRead: { type: Boolean, default: false },
  mcqsAttempted: { type: Number, default: 0 },
  mcqsCorrect: { type: Number, default: 0 },
  questionsAttempted: { type: Number, default: 0 },
  questionsSolved: { type: Number, default: 0 },
  quizScore: { type: Number, default: 0 },
  quizCompleted: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  lastStudiedAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique progress record per user per module per topic
progressSchema.index({ userId: 1, moduleName: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
