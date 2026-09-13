const mongoose = require('mongoose');

const topicNoteSchema = new mongoose.Schema({
  moduleType: { type: String, default: 'Reasoning', index: true },
  topic: { type: String, required: true, index: true },
  slug: { type: String, required: true, index: true },
  title: { type: String, default: '' },
  introduction: { type: String, required: true },
  concepts: [{
    title: { type: String, required: true },
    content: { type: String, required: true }
  }],
  rules: [{ type: String }],
  shortcuts: [{
    name: { type: String, required: true },
    tip: { type: String, required: true },
    example: { type: String }
  }],
  tricks: [{ type: String }],
  solvedExamples: [{
    question: { type: String, required: true },
    solution: { type: String, required: true },
    explanation: { type: String },
    shortcut: { type: String }
  }],
  commonMistakes: [{ type: String }],
  placementTips: [{ type: String }],
  interviewTips: [{ type: String }],
  quickRevision: [{ type: String }],
  practiceGuidance: { type: String },
  status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

topicNoteSchema.index({ moduleType: 1, slug: 1 }, { unique: true });

topicNoteSchema.pre('save', function () {
  if (this.isModified('topic') && !this.slug) {
    this.slug = this.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (!this.title && this.topic) {
    this.title = `${this.topic} Master Guide & Concepts`;
  }
});

module.exports = mongoose.model('TopicNote', topicNoteSchema);
