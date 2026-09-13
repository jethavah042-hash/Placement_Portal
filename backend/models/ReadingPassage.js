const mongoose = require('mongoose');

const readingPassageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  topic: { type: String, default: 'Reading Comprehension', index: true },
  passageText: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium', index: true },
  wordCount: { type: Number, default: 0 },
  estimatedReadTime: { type: String, default: '4 mins' },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    marks: { type: Number, default: 1 }
  }],
  status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
  attemptsCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Pre-save calculate word count
readingPassageSchema.pre('save', function () {
  if (this.passageText) {
    const words = this.passageText.trim().split(/\s+/).length;
    this.wordCount = words;
    const mins = Math.max(1, Math.ceil(words / 150));
    this.estimatedReadTime = `${mins} min${mins > 1 ? 's' : ''}`;
  }
});

module.exports = mongoose.model('ReadingPassage', readingPassageSchema);
