const mongoose = require('mongoose');

const resumeScanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
  fileName: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'docx', 'doc', 'manual'], default: 'pdf' },
  fileSize: { type: Number, default: 0 },
  extractedText: { type: String, default: '' },
  
  extractedData: {
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
      technologies: [String],
      link: String
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
    certificates: [{
      name: String,
      issuer: String,
      date: String,
      link: String
    }],
    achievements: [{ type: String }],
    languages: [{ type: String }]
  },

  atsScore: { type: Number, required: true, min: 0, max: 100 },
  atsGrade: { type: String, enum: ['Excellent', 'Good', 'Needs Improvement', 'Poor'], default: 'Needs Improvement' },
  
  categoryScores: {
    contact: { score: Number, max: Number },
    summary: { score: Number, max: Number },
    skills: { score: Number, max: Number },
    education: { score: Number, max: Number },
    projects: { score: Number, max: Number },
    experience: { score: Number, max: Number },
    certificates: { score: Number, max: Number },
    achievements: { score: Number, max: Number },
    keywords: { score: Number, max: Number },
    formatting: { score: Number, max: Number }
  },

  sectionStatus: {
    contact: { type: String, enum: ['Present', 'Weak', 'Missing'], default: 'Missing' },
    summary: { type: String, enum: ['Present', 'Weak', 'Missing'], default: 'Missing' },
    skills: { type: String, enum: ['Present', 'Weak', 'Missing'], default: 'Missing' },
    education: { type: String, enum: ['Present', 'Weak', 'Missing'], default: 'Missing' },
    projects: { type: String, enum: ['Present', 'Weak', 'Missing'], default: 'Missing' },
    experience: { type: String, enum: ['Present', 'Weak', 'Missing'], default: 'Missing' },
    internships: { type: String, enum: ['Present', 'Weak', 'Missing'], default: 'Missing' },
    certificates: { type: String, enum: ['Present', 'Weak', 'Missing'], default: 'Missing' },
    achievements: { type: String, enum: ['Present', 'Weak', 'Missing'], default: 'Missing' },
    languages: { type: String, enum: ['Present', 'Weak', 'Missing'], default: 'Missing' },
    links: { type: String, enum: ['Present', 'Weak', 'Missing'], default: 'Missing' }
  },

  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  missingSections: [{ type: String }],
  detectedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  
  suggestions: [{
    category: String,
    problem: String,
    suggestion: String
  }],

  formattingAnalysis: {
    score: { type: Number, default: 5 },
    status: { type: String, enum: ['Good', 'Warning', 'Needs Improvement'], default: 'Good' },
    checks: [{
      name: String,
      status: String,
      feedback: String
    }]
  },

  placementReadiness: { type: Number, min: 0, max: 100, default: 50 },

  companyMatch: {
    companyName: { type: String, default: null },
    role: { type: String, default: null },
    matchPercentage: { type: Number, default: 0 },
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    keywordMatchPercentage: { type: Number, default: 0 },
    recommendations: [{ type: String }]
  }
}, { timestamps: true });

module.exports = mongoose.model('ResumeScan', resumeScanSchema);
