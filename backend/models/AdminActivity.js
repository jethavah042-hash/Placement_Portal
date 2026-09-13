const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminName: { type: String, default: 'Administrator' },
  action: { type: String, required: true }, // e.g. BLOCK_STUDENT, CREATE_PROBLEM, UPDATE_QUESTION
  entity: { type: String, required: true }, // User, Question, CodingProblem, Test, Company, Notification
  entityId: { type: String },
  details: { type: String, default: '' },
  ip: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('AdminActivity', adminActivitySchema);
