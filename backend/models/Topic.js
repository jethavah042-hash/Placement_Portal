const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, index: true },
  moduleType: {
    type: String,
    enum: ['Reasoning', 'Aptitude', 'English', 'Coding'],
    default: 'Reasoning',
    required: true,
    index: true
  },
  description: { type: String, default: '' },
  icon: { type: String, default: 'FiLayers' },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  estimatedStudyTime: { type: String, default: '45 mins' },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  },
  displayOrder: { type: Number, default: 0, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Compound index to prevent duplicate topics within the same module
topicSchema.index({ moduleType: 1, slug: 1 }, { unique: true });
topicSchema.index({ moduleType: 1, name: 1 }, { unique: true });

topicSchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Topic', topicSchema);
