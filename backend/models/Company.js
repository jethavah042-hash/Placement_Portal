const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  logo: { type: String, default: '' },
  industry: { type: String, default: 'Information Technology' },
  website: { type: String, default: '' },
  avgPackage: { type: String, default: '6-9 LPA' },
  eligibility: { type: String, default: '60% throughout Academics' },
  description: { type: String, default: '' },
  about: { type: String, default: '' },
  jobRoles: [{ type: String }],
  requiredSkills: [{ type: String }],
  selectionProcess: [{ type: String }],
  aptitudeTopics: [{ type: String }],
  codingTopics: [{ type: String }],
  preparationTips: { type: String, default: '' },
  interviewExperiences: [{
    studentName: String,
    role: String,
    year: String,
    experience: String
  }],
  resources: [{
    title: String,
    link: String
  }],
  isPublished: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

companySchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Company', companySchema);

