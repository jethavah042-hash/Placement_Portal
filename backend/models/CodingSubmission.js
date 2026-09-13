const mongoose = require('mongoose');

const codingSubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true, index: true },
  topic: { type: String, required: true, index: true },
  language: { type: String, required: true, default: 'javascript' },
  code: { type: String, required: true },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
    required: true,
    index: true
  },
  passedTests: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 },
  executionTime: { type: Number, default: 0 }, // in milliseconds
  memory: { type: Number, default: 0 }, // in MB
  errorMessage: { type: String, default: '' },
  testResults: [{
    testIndex: Number,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    isHidden: { type: Boolean, default: false },
    error: String
  }],
  submittedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Compound index for student problem queries
codingSubmissionSchema.index({ student: 1, problem: 1, status: 1 });
codingSubmissionSchema.index({ student: 1, submittedAt: -1 });

module.exports = mongoose.model('CodingSubmission', codingSubmissionSchema);
