const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
  meaning: { type: String, required: true },
  partOfSpeech: {
    type: String,
    enum: ['noun', 'verb', 'adjective', 'adverb', 'idiom', 'phrase', 'preposition', 'conjunction', 'other'],
    default: 'noun',
    index: true
  },
  synonyms: [{ type: String, trim: true }],
  antonyms: [{ type: String, trim: true }],
  exampleSentence: { type: String, default: '' },
  usage: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium', index: true },
  pronunciation: { type: String, default: '' },
  tags: [{ type: String, trim: true }],
  learnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  status: { type: String, enum: ['published', 'draft'], default: 'published', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Vocabulary', vocabularySchema);
