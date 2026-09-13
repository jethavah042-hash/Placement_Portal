const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const ResumeScan = require('../models/ResumeScan');
const Company = require('../models/Company');
const Activity = require('../models/Activity');
const Progress = require('../models/Progress');
const { extractTextFromBuffer, parseResumeText } = require('../services/resumeParser.service');
const { analyzeResume } = require('../services/atsAnalyzer.service');
const resumeAIProvider = require('../providers/resumeAI.provider');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Upload and Scan Resume (PDF / DOCX)
// @route   POST /api/resumes/scan
// @access  Private / Student
exports.scanResume = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!req.file) {
    throw new ApiError(400, 'Please upload a valid PDF, DOC, or DOCX resume file (up to 10MB).');
  }

  const { originalname, mimetype, size, buffer } = req.file;

  // 1. Extract raw text from file buffer
  let rawText = '';
  try {
    rawText = await extractTextFromBuffer(buffer, mimetype, originalname);
  } catch (err) {
    console.error('Error parsing resume buffer:', err);
    throw new ApiError(400, 'We could not extract text from this document. Please ensure it is a text-based PDF or DOCX.');
  }

  if (!rawText || rawText.trim().length < 50) {
    throw new ApiError(400, 'We could not extract enough information from this resume. Please upload a clearer PDF or DOCX file.');
  }

  // 2. Parse structured data from extracted text
  const extractedData = parseResumeText(rawText);

  // 3. Analyze ATS score, section completeness, weaknesses, and suggestions
  const analysis = analyzeResume(extractedData, rawText);

  const fileType = originalname.toLowerCase().endsWith('.pdf') ? 'pdf' :
                   originalname.toLowerCase().endsWith('.docx') ? 'docx' : 'doc';

  // 4. Save ResumeScan record to MongoDB
  const scanDoc = await ResumeScan.create({
    userId,
    fileName: originalname,
    fileType,
    fileSize: size,
    extractedText: rawText,
    extractedData,
    atsScore: analysis.atsScore,
    atsGrade: analysis.atsGrade,
    categoryScores: analysis.categoryScores,
    sectionStatus: analysis.sectionStatus,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    missingSections: analysis.missingSections,
    detectedKeywords: analysis.detectedKeywords,
    missingKeywords: analysis.missingKeywords,
    suggestions: analysis.suggestions,
    formattingAnalysis: analysis.formattingAnalysis,
    placementReadiness: analysis.placementReadiness
  });

  // 5. Update or Create student's primary Resume document
  let resumeDoc = await Resume.findOne({ userId });
  if (resumeDoc) {
    resumeDoc.personalInfo = { ...resumeDoc.personalInfo, ...extractedData.personalInfo };
    if (extractedData.summary) resumeDoc.summary = extractedData.summary;
    if (extractedData.education?.length > 0) resumeDoc.education = extractedData.education;
    if (extractedData.skills?.length > 0) resumeDoc.skills = extractedData.skills;
    if (extractedData.categorizedSkills) resumeDoc.categorizedSkills = extractedData.categorizedSkills;
    if (extractedData.projects?.length > 0) resumeDoc.projects = extractedData.projects;
    if (extractedData.experience?.length > 0) resumeDoc.experience = extractedData.experience;
    if (extractedData.internships?.length > 0) resumeDoc.internships = extractedData.internships;
    if (extractedData.certificates?.length > 0) resumeDoc.certificates = extractedData.certificates;
    if (extractedData.achievements?.length > 0) resumeDoc.achievements = extractedData.achievements;
    if (extractedData.languages?.length > 0) resumeDoc.languages = extractedData.languages;
    resumeDoc.atsScore = analysis.atsScore;
    resumeDoc.placementReadiness = analysis.placementReadiness;
    resumeDoc.lastScanId = scanDoc._id;
    await resumeDoc.save();
  } else {
    resumeDoc = await Resume.create({
      userId,
      resumeName: originalname.replace(/\.[^/.]+$/, ''),
      personalInfo: extractedData.personalInfo,
      summary: extractedData.summary,
      education: extractedData.education,
      skills: extractedData.skills,
      categorizedSkills: extractedData.categorizedSkills,
      projects: extractedData.projects,
      experience: extractedData.experience,
      internships: extractedData.internships,
      certificates: extractedData.certificates,
      achievements: extractedData.achievements,
      languages: extractedData.languages,
      atsScore: analysis.atsScore,
      placementReadiness: analysis.placementReadiness,
      lastScanId: scanDoc._id
    });
  }

  scanDoc.resumeId = resumeDoc._id;
  await scanDoc.save();

  // 6. Log Activity
  await Activity.create({
    userId,
    type: 'resume',
    module: 'Resume Scanner',
    title: `Scanned Resume: ${originalname}`,
    metadata: { scanId: scanDoc._id, atsScore: analysis.atsScore, placementReadiness: analysis.placementReadiness }
  });

  // 7. Update Student Progress
  await Progress.findOneAndUpdate(
    { userId },
    {
      $set: {
        'resume.atsScore': analysis.atsScore,
        'resume.placementReadiness': analysis.placementReadiness,
        'resume.lastScannedAt': new Date(),
        lastActive: new Date()
      }
    },
    { upsert: true }
  );

  res.status(201).json({
    success: true,
    message: 'Resume parsed and scanned successfully',
    data: scanDoc,
    resume: resumeDoc
  });
});

// @desc    Get Scan History & Score Improvement
// @route   GET /api/resumes/scans
// @access  Private / Student
exports.getScanHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const scans = await ResumeScan.find({ userId })
    .select('fileName fileType fileSize atsScore atsGrade placementReadiness createdAt sectionStatus')
    .sort({ createdAt: -1 });

  // Calculate score improvement over time
  let scoreImprovement = 0;
  if (scans.length >= 2) {
    const oldest = scans[scans.length - 1].atsScore || 0;
    const latest = scans[0].atsScore || 0;
    scoreImprovement = latest - oldest;
  }

  res.status(200).json({
    success: true,
    count: scans.length,
    scoreImprovement,
    data: scans
  });
});

// @desc    Get Specific Scan Analysis Report
// @route   GET /api/resumes/scans/:scanId
// @access  Private / Student
exports.getScanById = asyncHandler(async (req, res) => {
  const { scanId } = req.params;
  const userId = req.user._id;

  const scan = await ResumeScan.findOne({ _id: scanId, userId });
  if (!scan) {
    throw new ApiError(404, 'Resume scan record not found');
  }

  res.status(200).json({
    success: true,
    data: scan
  });
});

// @desc    Delete Scan Record
// @route   DELETE /api/resumes/scans/:scanId
// @access  Private / Student
exports.deleteScan = asyncHandler(async (req, res) => {
  const { scanId } = req.params;
  const userId = req.user._id;

  const scan = await ResumeScan.findOneAndDelete({ _id: scanId, userId });
  if (!scan) {
    throw new ApiError(404, 'Resume scan not found');
  }

  res.status(200).json({
    success: true,
    message: 'Resume scan record deleted successfully'
  });
});

// @desc    Compare Two Resume Scans
// @route   POST /api/resumes/scans/compare
// @access  Private / Student
exports.compareScans = asyncHandler(async (req, res) => {
  const { scanId1, scanId2 } = req.body;
  const userId = req.user._id;

  if (!scanId1 || !scanId2) {
    throw new ApiError(400, 'Please provide both scan IDs to compare');
  }

  const [scan1, scan2] = await Promise.all([
    ResumeScan.findOne({ _id: scanId1, userId }),
    ResumeScan.findOne({ _id: scanId2, userId })
  ]);

  if (!scan1 || !scan2) {
    throw new ApiError(404, 'One or both scan records not found');
  }

  const scoreDiff = (scan2.atsScore || 0) - (scan1.atsScore || 0);
  const readinessDiff = (scan2.placementReadiness || 0) - (scan1.placementReadiness || 0);

  const skills1 = new Set(scan1.extractedData?.skills || []);
  const skills2 = new Set(scan2.extractedData?.skills || []);
  const addedSkills = Array.from(skills2).filter(s => !skills1.has(s));
  const removedSkills = Array.from(skills1).filter(s => !skills2.has(s));

  res.status(200).json({
    success: true,
    data: {
      version1: {
        _id: scan1._id,
        fileName: scan1.fileName,
        createdAt: scan1.createdAt,
        atsScore: scan1.atsScore,
        placementReadiness: scan1.placementReadiness,
        categoryScores: scan1.categoryScores,
        skillsCount: skills1.size,
        projectsCount: scan1.extractedData?.projects?.length || 0,
        missingSections: scan1.missingSections
      },
      version2: {
        _id: scan2._id,
        fileName: scan2.fileName,
        createdAt: scan2.createdAt,
        atsScore: scan2.atsScore,
        placementReadiness: scan2.placementReadiness,
        categoryScores: scan2.categoryScores,
        skillsCount: skills2.size,
        projectsCount: scan2.extractedData?.projects?.length || 0,
        missingSections: scan2.missingSections
      },
      comparison: {
        scoreDiff,
        readinessDiff,
        addedSkills,
        removedSkills,
        improvedCategories: Object.keys(scan2.categoryScores || {}).filter(k => 
          (scan2.categoryScores[k]?.score || 0) > (scan1.categoryScores[k]?.score || 0)
        )
      }
    }
  });
});

// @desc    Match Resume against Company Requirements
// @route   POST /api/resumes/scans/:scanId/company-match
// @access  Private / Student
exports.matchCompany = asyncHandler(async (req, res) => {
  const { scanId } = req.params;
  const { companyId } = req.body;
  const userId = req.user._id;

  const scan = await ResumeScan.findOne({ _id: scanId, userId });
  if (!scan) {
    throw new ApiError(404, 'Scan record not found');
  }

  let companyDoc = null;
  if (companyId) {
    companyDoc = await Company.findById(companyId);
  }

  // Re-run matching logic with company doc
  const analysis = analyzeResume(scan.extractedData, scan.extractedText, companyDoc);
  scan.companyMatch = analysis.companyMatch;
  await scan.save();

  res.status(200).json({
    success: true,
    data: scan.companyMatch
  });
});

// @desc    Get AI Suggestions & Review
// @route   POST /api/resumes/scans/:scanId/ai-review
// @access  Private / Student
exports.getAIReview = asyncHandler(async (req, res) => {
  const { scanId } = req.params;
  const userId = req.user._id;

  const scan = await ResumeScan.findOne({ _id: scanId, userId });
  if (!scan) {
    throw new ApiError(404, 'Scan record not found');
  }

  const [aiReview, summarySuggestions] = await Promise.all([
    resumeAIProvider.reviewResume(scan.extractedData),
    resumeAIProvider.suggestSummary(scan.extractedData)
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...aiReview,
      summarySuggestions
    }
  });
});

// @desc    Get student's latest resume data
// @route   GET /api/resumes/latest
// @access  Private / Student
exports.getLatestResume = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const resume = await Resume.findOne({ userId }).populate('lastScanId');
  const lastScan = await ResumeScan.findOne({ userId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      resume,
      lastScan
    }
  });
});

// @desc    Get all student's resumes
// @route   GET /api/resumes/my
// @access  Private / Student
exports.getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    results: resumes.length,
    data: resumes
  });
});

// @desc    Save/Create Resume
// @route   POST /api/resumes
// @access  Private / Student
exports.createResume = asyncHandler(async (req, res) => {
  req.body.userId = req.user._id;

  // Re-calculate ATS score on manual save to reflect student edits
  const analysis = analyzeResume(req.body, JSON.stringify(req.body));
  req.body.atsScore = analysis.atsScore;
  req.body.placementReadiness = analysis.placementReadiness;

  const resume = await Resume.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Resume saved successfully',
    data: resume
  });
});

// @desc    Update Resume
// @route   PUT /api/resumes/:id
// @access  Private / Student
exports.updateResume = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const resumeId = req.params.id;

  const analysis = analyzeResume(req.body, JSON.stringify(req.body));
  req.body.atsScore = analysis.atsScore;
  req.body.placementReadiness = analysis.placementReadiness;

  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { ...req.body, updatedAt: new Date() },
    { new: true, upsert: true, returnDocument: 'after' }
  );

  res.status(200).json({
    success: true,
    message: 'Resume updated successfully',
    data: resume
  });
});
