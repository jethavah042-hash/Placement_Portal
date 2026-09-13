const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    default: 'mixed'
  },
  duration: { type: Number, required: true }, // in minutes
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, default: function() { return this.totalQuestions || 30; } },
  passingPercentage: { type: Number, default: 60 },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  negativeMarking: { type: Number, default: 0.25 }, // marks deducted per wrong answer
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  moduleTypes: [{ type: String }],
  companyTags: [{ type: String }],
  instructions: [{ type: String }],
  colorScheme: { type: String, default: 'indigo' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: true },
  attemptsCount: { type: Number, default: 0 }
}, { timestamps: true });

testSchema.pre('save', function () {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Test', testSchema);
