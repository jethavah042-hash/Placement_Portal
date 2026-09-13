const mongoose = require('mongoose');

const codingNoteSchema = new mongoose.Schema({
  topic: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  introduction: { type: String, required: true },
  definition: { type: String, required: true },
  concepts: [{
    title: { type: String, required: true },
    content: { type: String, required: true }
  }],
  algorithms: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    pseudocode: { type: String, required: true },
    timeComplexity: {
      best: { type: String, default: 'O(1)' },
      average: { type: String, default: 'O(N)' },
      worst: { type: String, default: 'O(N)' }
    },
    spaceComplexity: { type: String, default: 'O(1)' }
  }],
  complexityOverview: {
    timeSummary: [{ operation: String, best: String, average: String, worst: String }],
    spaceSummary: [{ operation: String, space: String }]
  },
  examples: [{
    title: { type: String, required: true },
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, required: true },
    walkthrough: { type: String }
  }],
  commonMistakes: [{ type: String }],
  interviewTips: [{ type: String }],
  placementTips: [{ type: String }],
  importantPatterns: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    whenToUse: { type: String }
  }],
  practiceGuidance: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('CodingNote', codingNoteSchema);
