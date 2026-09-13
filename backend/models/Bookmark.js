const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  itemType: { type: String, enum: ['Question', 'TopicNote', 'CodingProblem'], required: true },
  moduleType: { type: String, default: 'Reasoning', index: true }
}, { timestamps: true });

bookmarkSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
