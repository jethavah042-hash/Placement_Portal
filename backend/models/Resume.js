const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resumeName: { type: String, default: 'My Placement Resume' },
  personalInfo: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  summary: { type: String, default: '' },
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: String,
    endYear: String,
    score: String
  }],
  skills: [{ type: String }],
  categorizedSkills: {
    languages: [{ type: String }],
    frameworks: [{ type: String }],
    databases: [{ type: String }],
    tools: [{ type: String }],
    core: [{ type: String }]
  },
  projects: [{
    title: String,
    description: String,
    link: String,
    technologies: [String]
  }],
  experience: [{
    company: String,
    position: String,
    duration: String,
    description: String
  }],
  internships: [{
    company: String,
    role: String,
    duration: String,
    description: String
  }],
  achievements: [{ type: String }],
  certificates: [{
    name: String,
    issuer: String,
    date: String,
    link: String
  }],
  languages: [{ type: String }],
  template: { type: String, default: 'modern' },
  version: { type: Number, default: 1 },
  atsScore: { type: Number, default: 0 },
  placementReadiness: { type: Number, default: 0 },
  lastScanId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResumeScan', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
