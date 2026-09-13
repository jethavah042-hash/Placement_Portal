const mongoose = require('mongoose');

const codingProblemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  topic: { type: String, required: true, index: true }, // Canonical: Arrays, Strings, Linked List, Stack, Queue, Trees, Graphs, Recursion, Sorting, Searching, Dynamic Programming
  category: { type: String, index: true }, // Alias for topic
  subtopic: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true, index: true },
  description: { type: String, required: true },
  constraints: [{ type: String }],
  inputFormat: { type: String, default: '' },
  outputFormat: { type: String, default: '' },
  examples: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: '' }
  }],
  hints: [{ type: String }],
  explanation: { type: String, default: '' },
  expectedApproach: { type: String, default: '' },
  timeComplexity: { type: String, default: 'O(N)' },
  spaceComplexity: { type: String, default: 'O(1)' },
  tags: [{ type: String, index: true }],
  companyTags: [{ type: String }],
  supportedLanguages: [{ type: String, default: ['javascript', 'python', 'java', 'cpp', 'c'] }],
  starterCode: {
    javascript: { type: String, default: '' },
    python: { type: String, default: '' },
    java: { type: String, default: '' },
    cpp: { type: String, default: '' },
    c: { type: String, default: '' }
  },
  solution: {
    approach: { type: String, default: '' },
    code: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
    timeComplexity: { type: String, default: 'O(N)' },
    spaceComplexity: { type: String, default: 'O(1)' }
  },
  sampleTestCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true }
  }],
  hiddenTestCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true }
  }],
  totalSubmissions: { type: Number, default: 0 },
  acceptedSubmissions: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Pre-save hook to synchronize topic and category
codingProblemSchema.pre('save', function () {
  if (!this.topic && this.category) this.topic = this.category;
  if (!this.category && this.topic) this.category = this.topic;
});

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
