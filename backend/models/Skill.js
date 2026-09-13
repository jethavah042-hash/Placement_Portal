const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true } // e.g. Technical, Soft Skill, Tools
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
