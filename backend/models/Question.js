const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  moduleType: { type: String, required: true, default: 'Reasoning', index: true }, // Aptitude, Reasoning, English
  category: { type: String, required: true, index: true }, // Topic name
  topic: { type: String, index: true }, // Alias for category
  subtopic: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium', index: true },
  questionType: {
    type: String,
    enum: ['mcq', 'para_jumble', 'error_detection', 'reading_comprehension', 'fill_blank', 'sentence_correction'],
    default: 'mcq',
    index: true
  },
  questionText: { type: String, required: true },
  passageId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReadingPassage', index: true, default: null },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  rule: { type: String, default: '' }, // For Grammar / Error detection rules
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0.25 },
  tags: [{ type: String }],
  companyTags: [{ type: String }],
  status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
  attemptsCount: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Pre-save to synchronize topic with category
questionSchema.pre('save', function () {
  if (!this.topic && this.category) this.topic = this.category;
  if (!this.category && this.topic) this.category = this.topic;
});

module.exports = mongoose.model('Question', questionSchema);
