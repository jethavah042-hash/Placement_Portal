import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  scanResumeRequest,
  getScanHistoryRequest,
  getScanDetailRequest,
  deleteScanRequest,
  compareScansRequest,
  getAIReviewRequest,
  getLatestResumeRequest,
  saveResumeRequest,
  updateResumeRequest
} from '../../api/resume';
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiTrendingUp,
  FiAward,
  FiBarChart2,
  FiLayers,
  FiDownload,
  FiSave,
  FiEye,
  FiEdit,
  FiTrash2,
  FiCpu,
  FiRefreshCw,
  FiShield,
  FiCheck,
  FiBriefcase,
  FiInfo,
  FiClock,
  FiColumns,
  FiExternalLink
} from 'react-icons/fi';

const ResumeScanner = () => {
  const { scanId: paramScanId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Main Tabs: 'scanner', 'history', 'editor', 'preview'
  const [activeTab, setActiveTab] = useState('scanner');
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanError, setScanError] = useState('');
  
  // Active Scan Analysis State
  const [currentScan, setCurrentScan] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [aiReviewData, setAiReviewData] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // History State
  const [scanHistory, setScanHistory] = useState([]);
  const [scoreImprovement, setScoreImprovement] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Compare State
  const [compareScan1, setCompareScan1] = useState('');
  const [compareScan2, setCompareScan2] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // Resume Editor State
  const [resumeId, setResumeId] = useState(null);
  const [resumeTemplate, setResumeTemplate] = useState('modern');
  const [savingResume, setSavingResume] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Hardik Jethava',
    email: 'hardik@example.com',
    phone: '+91 9876543210',
    location: 'Rajkot, Gujarat',
    linkedin: 'linkedin.com/in/hardik',
    github: 'github.com/hardik',
    portfolio: 'hardik.dev',
    summary: 'Aspiring Software Engineer with expertise in Full-Stack Development and scalable architectures.',
    education: [
      { institution: 'Marwadi University', degree: 'Master of Computer Applications (MCA)', fieldOfStudy: 'Computer Applications', startYear: '2024', endYear: '2026', score: '8.8 CGPA' },
      { institution: 'Gujarat University', degree: 'Bachelor of Computer Applications (BCA)', fieldOfStudy: 'Computer Science', startYear: '2021', endYear: '2024', score: '8.4 CGPA' }
    ],
    skills: 'JavaScript, TypeScript, React, Node.js, Express, MongoDB, Python, Docker, Git, REST API',
    projects: [
      { title: 'Placement Preparation Portal', description: 'Engineered complete full-stack portal with isolated code execution engine, MCQ assessment arena, and ATS resume scanner.', technologies: 'React, Node.js, MongoDB, Tailwind CSS', link: '' },
      { title: 'Cloud File Analyzer', description: 'Built automated document parser processing PDF and DOCX files with metadata extraction and scoring.', technologies: 'Node.js, Express, Docker', link: '' }
    ],
    experience: [
      { company: 'Tech Solutions Inc', position: 'Software Engineering Intern', duration: 'May 2025 - Aug 2025', description: 'Developed RESTful microservices, reduced API latency by 25%, and built responsive frontend dashboards.' }
    ],
    certificates: [
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2025' },
      { name: 'Full-Stack Web Development Bootcamp', issuer: 'Udemy', date: '2024' }
    ],
    achievements: [
      'Ranked in top 5% in National Coding Contest',
      'Solved 250+ algorithmic challenges on LeetCode'
    ],
    languages: 'English, Hindi, Gujarati'
  });

  // Fetch initial latest resume and scan
  useEffect(() => {
    const fetchLatest = async () => {
      setLoadingScan(true);
      try {
        if (paramScanId) {
          const { data } = await getScanDetailRequest(paramScanId);
          if (data.success && data.data) {
            setCurrentScan(data.data);
            populateEditorFromExtracted(data.data.extractedData);
          }
        } else {
          const { data } = await getLatestResumeRequest();
          if (data.success) {
            if (data.data.lastScan) {
              setCurrentScan(data.data.lastScan);
            }
            if (data.data.resume) {
              setResumeId(data.data.resume._id);
              if (data.data.resume.template) setResumeTemplate(data.data.resume.template);
              populateEditorFromResume(data.data.resume);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching latest resume/scan:', err);
      } finally {
        setLoadingScan(false);
      }
    };

    fetchLatest();
  }, [paramScanId]);

  // Load Scan History
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await getScanHistoryRequest();
      if (data.success) {
        setScanHistory(data.data || []);
        setScoreImprovement(data.scoreImprovement || 0);
        if (data.data && data.data.length >= 2) {
          setCompareScan1(data.data[data.data.length - 1]._id);
          setCompareScan2(data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading scan history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const populateEditorFromExtracted = (extracted) => {
    if (!extracted) return;
    setFormData(prev => ({
      ...prev,
      name: extracted.personalInfo?.name || prev.name,
      email: extracted.personalInfo?.email || prev.email,
      phone: extracted.personalInfo?.phone || prev.phone,
      location: extracted.personalInfo?.location || prev.location,
      linkedin: extracted.personalInfo?.linkedin || prev.linkedin,
      github: extracted.personalInfo?.github || prev.github,
      portfolio: extracted.personalInfo?.portfolio || prev.portfolio,
      summary: extracted.summary || prev.summary,
      skills: (extracted.skills && extracted.skills.length > 0) ? extracted.skills.join(', ') : prev.skills,
      education: extracted.education?.length > 0 ? extracted.education : prev.education,
      projects: extracted.projects?.length > 0 ? extracted.projects.map(p => ({
        ...p,
        technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies
      })) : prev.projects,
      experience: extracted.experience?.length > 0 ? extracted.experience : prev.experience,
      certificates: extracted.certificates?.length > 0 ? extracted.certificates : prev.certificates,
      achievements: extracted.achievements?.length > 0 ? extracted.achievements : prev.achievements,
      languages: extracted.languages?.length > 0 ? extracted.languages.join(', ') : prev.languages
    }));
  };

  const populateEditorFromResume = (resDoc) => {
    if (!resDoc) return;
    setFormData({
      name: resDoc.personalInfo?.name || '',
      email: resDoc.personalInfo?.email || '',
      phone: resDoc.personalInfo?.phone || '',
      location: resDoc.personalInfo?.location || '',
      linkedin: resDoc.personalInfo?.linkedin || '',
      github: resDoc.personalInfo?.github || '',
      portfolio: resDoc.personalInfo?.portfolio || '',
      summary: resDoc.summary || '',
      skills: (resDoc.skills || []).join(', '),
      education: resDoc.education || [],
      projects: (resDoc.projects || []).map(p => ({
        ...p,
        technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies
      })),
      experience: resDoc.experience || [],
      certificates: resDoc.certificates || [],
      achievements: resDoc.achievements || [],
      languages: (resDoc.languages || []).join(', ')
    });
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const isDoc = file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc');

    if (!allowed.includes(file.type) && !isDoc) {
      setScanError('Please upload a valid PDF, DOC, or DOCX resume.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setScanError('File size exceeds the 10 MB limit. Please upload a smaller resume file.');
      setSelectedFile(null);
      return;
    }

    setScanError('');
    setSelectedFile(file);
  };

  // Perform Resume Scan
  const handleScanSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedFile) {
      setScanError('Please choose a PDF or DOCX resume file to scan.');
      return;
    }

    setUploading(true);
    setScanError('');
    setUploadProgress(20);

    const uploadData = new FormData();
    uploadData.append('resume', selectedFile);

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => (prev < 85 ? prev + 15 : prev));
      }, 300);

      const { data } = await scanResumeRequest(uploadData);
      clearInterval(progressTimer);
      setUploadProgress(100);

      if (data.success && data.data) {
        setCurrentScan(data.data);
        if (data.resume) {
          setResumeId(data.resume._id);
        }
        populateEditorFromExtracted(data.data.extractedData);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload scan error:', err);
      setScanError(err.response?.data?.message || 'Error scanning resume. Please ensure the document is not password-protected.');
    } finally {
      setUploading(false);
    }
  };

  // Request AI Review
  const handleRequestAiReview = async () => {
    if (!currentScan) return;
    setLoadingAi(true);
    try {
      const { data } = await getAIReviewRequest(currentScan._id);
      if (data.success) {
        setAiReviewData(data.data);
      }
    } catch (err) {
      console.error('AI Review Error:', err);
      alert('Unable to generate AI review at this moment.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Compare Scans
  const handleCompareSubmit = async (e) => {
    e?.preventDefault();
    if (!compareScan1 || !compareScan2) {
      alert('Please select two distinct scans to compare.');
      return;
    }
    setLoadingCompare(true);
    try {
      const { data } = await compareScansRequest(compareScan1, compareScan2);
      if (data.success) {
        setCompareResult(data.data);
      }
    } catch (err) {
      console.error('Comparison error:', err);
      alert('Unable to compare the selected scans.');
    } finally {
      setLoadingCompare(false);
    }
  };

  // Delete Scan
  const handleDeleteScan = async (scanId) => {
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;
    try {
      await deleteScanRequest(scanId);
      loadHistory();
      if (currentScan?._id === scanId) setCurrentScan(null);
    } catch (err) {
      console.error('Error deleting scan:', err);
    }
  };

  // Save Resume in Editor
  const handleSaveResume = async () => {
    setSavingResume(true);
    setSaveSuccess(false);

    const payload = {
      personalInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio
      },
      summary: formData.summary,
      education: formData.education,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      projects: formData.projects.map(p => ({
        ...p,
        technologies: typeof p.technologies === 'string' ? p.technologies.split(',').map(t => t.trim()).filter(Boolean) : p.technologies
      })),
      experience: formData.experience,
      certificates: formData.certificates,
      achievements: formData.achievements,
      languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
      template: resumeTemplate
    };

    try {
      let res;
      if (resumeId) {
        res = await updateResumeRequest(resumeId, payload);
      } else {
        res = await saveResumeRequest(payload);
      }

      if (res.data?.success) {
        setSaveSuccess(true);
        if (res.data.data?._id) setResumeId(res.data.data._id);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving resume:', err);
      alert('Error saving resume to MongoDB profile.');
    } finally {
      setSavingResume(false);
    }
  };

  // Download Resume as PDF via native print engine
  const handleDownloadPDF = () => {
    window.print();
  };

  // Download Analysis Report Text File
  const handleDownloadReport = () => {
    if (!currentScan) return;
    const reportText = `=====================================================
PLACEMENT PREPARATION PORTAL - RESUME ATS SCAN REPORT
=====================================================
Document: ${currentScan.fileName}
Date: ${new Date(currentScan.createdAt).toLocaleDateString()}
ATS Score: ${currentScan.atsScore} / 100 (${currentScan.atsGrade})
Placement Readiness: ${currentScan.placementReadiness} / 100

-----------------------------------------------------
CATEGORY SCORES:
-----------------------------------------------------
- Contact Information: ${currentScan.categoryScores?.contact?.score || 0} / 10
- Professional Summary: ${currentScan.categoryScores?.summary?.score || 0} / 10
- Technical Skills: ${currentScan.categoryScores?.skills?.score || 0} / 20
- Education Background: ${currentScan.categoryScores?.education?.score || 0} / 10
- Practical Projects: ${currentScan.categoryScores?.projects?.score || 0} / 15
- Experience / Internships: ${currentScan.categoryScores?.experience?.score || 0} / 10
- Technical Certifications: ${currentScan.categoryScores?.certificates?.score || 0} / 5
- Achievements & Coding: ${currentScan.categoryScores?.achievements?.score || 0} / 5
- Placement Keywords: ${currentScan.categoryScores?.keywords?.score || 0} / 10
- Formatting & Readability: ${currentScan.categoryScores?.formatting?.score || 0} / 5

-----------------------------------------------------
STRENGTHS:
-----------------------------------------------------
${(currentScan.strengths || []).map(s => `✓ ${s}`).join('\n')}

-----------------------------------------------------
AREAS FOR IMPROVEMENT:
-----------------------------------------------------
${(currentScan.weaknesses || []).map(w => `✗ ${w}`).join('\n')}

-----------------------------------------------------
ACTIONABLE SUGGESTIONS:
-----------------------------------------------------
${(currentScan.suggestions || []).map(s => `• [${s.category}] ${s.problem} -> ${s.suggestion}`).join('\n')}
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ATS_Report_${currentScan.fileName.replace(/\.[^/.]+$/, '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Resume Scanner
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
              AI Powered ATS
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            Upload your resume to analyze your ATS score, skills, content, formatting, and placement readiness.
          </p>
        </div>

        {/* Module Navigation Tabs */}
        <div className="flex flex-wrap bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 flex items-center gap-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scanner'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiUploadCloud /> AI Scanner & Score
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 flex items-center gap-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiClock /> Scan History
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 flex items-center gap-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiEdit /> Resume Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 flex items-center gap-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FiEye /> Preview & Download
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: SCANNER & ATS ANALYSIS DASHBOARD */}
      {/* ===================================================================== */}
      {activeTab === 'scanner' && (
        <div className="space-y-8 print:hidden">
          {/* Upload Dropzone */}
          <div className="bg-white dark:bg-gray-900 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-8 text-center transition-all hover:border-indigo-500 shadow-sm relative overflow-hidden">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload-input"
            />

            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-inner">
                <FiUploadCloud />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Upload Resume for ATS Parsing
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Supports <strong>PDF, DOCX, DOC</strong> up to 10 MB. Encrypted and evaluated against campus recruitment algorithms.
                </p>
              </div>

              {selectedFile && (
                <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                  <div className="flex items-center gap-2 truncate">
                    <FiFileText className="text-indigo-600 shrink-0" />
                    <span className="truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-gray-500 shrink-0">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                  </div>
                  <button
                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-rose-500 hover:text-rose-700 ml-2 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {scanError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <FiAlertTriangle className="shrink-0" /> {scanError}
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    <span>Extracting text & computing ATS weights...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                {!selectedFile ? (
                  <label
                    htmlFor="resume-upload-input"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
                  >
                    <FiUploadCloud /> Choose Resume File
                  </label>
                ) : (
                  <button
                    onClick={handleScanSubmit}
                    disabled={uploading}
                    className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? <FiRefreshCw className="animate-spin" /> : <FiShield />} Scan Resume Now
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Scan Results Presentation */}
          {currentScan ? (
            <div className="space-y-8">
              {/* Score & Readiness Top Ribbon */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ATS Score Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-6">
                  <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center border shadow-inner ${
                    currentScan.atsScore >= 75
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-600'
                      : currentScan.atsScore >= 50
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-600'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-600'
                  }`}>
                    <span className="text-3xl font-black">{currentScan.atsScore}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">/ 100</span>
                  </div>

                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      currentScan.atsScore >= 75
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : currentScan.atsScore >= 50
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                    }`}>
                      {currentScan.atsGrade || 'Good'}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">ATS Match Score</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Calculated across 10 placement evaluation parameters</p>
                  </div>
                </div>

                {/* Placement Readiness Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">Placement Readiness</span>
                    <FiTrendingUp className="text-indigo-600 w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">{currentScan.placementReadiness}%</span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Campus Ready</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${currentScan.placementReadiness}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Scan Action Controls Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Scanned Document</span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentScan.fileName}</h4>
                    <span className="text-[10px] text-gray-500">{new Date(currentScan.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadReport}
                      className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <FiDownload /> Report
                    </button>
                    <button
                      onClick={() => setActiveTab('editor')}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <FiEdit /> Edit Resume
                    </button>
                  </div>
                </div>
              </div>

              {/* 10 Category Breakdown & Section Detection */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Category Breakdown Bars (2 Cols) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <FiBarChart2 className="text-indigo-600" /> ATS Category Score Breakdown (100 Pts)
                    </h3>
                    <span className="text-xs text-gray-400">Rule-Based Evaluation</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentScan.categoryScores && Object.keys(currentScan.categoryScores).map(catKey => {
                      const cat = currentScan.categoryScores[catKey];
                      const percentage = cat.max ? Math.round((cat.score / cat.max) * 100) : 0;
                      const catName = catKey.charAt(0).toUpperCase() + catKey.slice(1);

                      return (
                        <div key={catKey} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-800 dark:text-gray-200">{catName}</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono">{cat.score} / {cat.max}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                percentage >= 75 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Section Presence Status (1 Col) */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                    <FiLayers className="text-indigo-600" /> Section Detection
                  </h3>

                  <div className="space-y-2">
                    {currentScan.sectionStatus && Object.keys(currentScan.sectionStatus).map(sec => {
                      const status = currentScan.sectionStatus[sec];
                      const label = sec.charAt(0).toUpperCase() + sec.slice(1);

                      return (
                        <div key={sec} className="flex items-center justify-between text-xs py-1 px-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                            status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : status === 'Weak'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}>
                            {status === 'Present' ? '✓ Present' : status === 'Weak' ? '⚠ Weak' : '✗ Missing'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-950/60 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                    <FiCheckCircle /> Identified Resume Strengths
                  </h3>
                  <ul className="space-y-2.5">
                    {(currentScan.strengths || []).map((s, idx) => (
                      <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses / Gaps */}
                <div className="bg-white dark:bg-gray-900 border border-rose-100 dark:border-rose-950/60 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    <FiXCircle /> Areas for Improvement
                  </h3>
                  <ul className="space-y-2.5">
                    {(currentScan.weaknesses || []).map((w, idx) => (
                      <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-500 font-bold mt-0.5">✗</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Improvement Suggestions */}
              {currentScan.suggestions && currentScan.suggestions.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <FiShield className="text-indigo-600" /> Actionable Recommendations
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentScan.suggestions.map((sug, idx) => (
                      <div key={idx} className="p-4 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl space-y-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase">
                          {sug.category}
                        </span>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{sug.problem}</p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed font-medium">
                          💡 <strong>Fix:</strong> {sug.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Analysis & Technical Skills */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <FiCpu className="text-indigo-600" /> Keyword & Technical Skill Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Detected Skills */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detected Technical Skills ({currentScan.extractedData?.skills?.length || 0}):</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(currentScan.extractedData?.skills || []).map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing High-Value Placement Keywords */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recommended High-Demand Keywords:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(currentScan.missingKeywords || []).map((kw, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium">
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Deep Review Section */}
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-8 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <FiCpu className="text-amber-300 w-5 h-5" />
                      <h3 className="text-lg font-bold">AI Recruiter Deep Review</h3>
                    </div>
                    <p className="text-xs text-indigo-200 mt-1">
                      Generate recruiter insights and architectural interview questions tailored to your skills.
                    </p>
                  </div>

                  <button
                    onClick={handleRequestAiReview}
                    disabled={loadingAi}
                    className="px-6 py-2.5 bg-white text-indigo-900 hover:bg-amber-300 rounded-xl text-xs font-bold transition-all shadow-md self-start sm:self-auto disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingAi ? <FiRefreshCw className="animate-spin" /> : <FiCpu />}
                    {aiReviewData ? 'Refresh AI Insights' : 'Generate AI Review'}
                  </button>
                </div>

                {aiReviewData && (
                  <div className="pt-4 border-t border-white/10 space-y-4 text-xs text-indigo-100">
                    {aiReviewData.executiveSummary && (
                      <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                        <strong className="text-white block mb-1">Executive Summary:</strong>
                        <p className="leading-relaxed">{aiReviewData.executiveSummary}</p>
                      </div>
                    )}

                    {aiReviewData.recommendedActionPoints && (
                      <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md space-y-2">
                        <strong className="text-white block">Key Action Points:</strong>
                        <ul className="list-disc list-inside space-y-1 text-indigo-200">
                          {aiReviewData.recommendedActionPoints.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 space-y-3">
              <FiFileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Upload your resume to start your analysis</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Our parser will extract your projects, skills, education, and generate a transparent ATS score.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: SCAN HISTORY & SCORE IMPROVEMENT */}
      {/* ===================================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-8 print:hidden">
          {/* Top Score Improvement Banner */}
          <div className="p-6 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black">
                📈
              </div>
              <div>
                <h3 className="text-lg font-bold">Resume ATS Improvement</h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Track your score growth across subsequent resume iterations.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-emerald-100 block uppercase font-bold">Net Growth</span>
              <strong className="text-2xl font-black">{scoreImprovement >= 0 ? `+${scoreImprovement}` : scoreImprovement} Pts</strong>
            </div>
          </div>

          {/* History List Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <FiClock className="text-indigo-600" /> Previous Resume Scans ({scanHistory.length})
              </h3>
            </div>

            {loadingHistory ? (
              <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading scan history from MongoDB...</div>
            ) : scanHistory.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">No previous resume scans recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-bold border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="py-3.5 px-6">File Name</th>
                      <th className="py-3.5 px-6">Scan Date</th>
                      <th className="py-3.5 px-6">ATS Score</th>
                      <th className="py-3.5 px-6">Grade</th>
                      <th className="py-3.5 px-6">Readiness</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                    {scanHistory.map((scan) => (
                      <tr key={scan._id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <FiFileText className="text-indigo-500" /> {scan.fileName}
                        </td>
                        <td className="py-4 px-6 text-gray-500">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {scan.atsScore} / 100
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            scan.atsScore >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {scan.atsGrade}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono">{scan.placementReadiness}%</td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => { setCurrentScan(scan); setActiveTab('scanner'); }}
                            className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteScan(scan._id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Side by Side Version Comparison Tool */}
          {scanHistory.length >= 2 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <FiColumns className="text-indigo-600" /> Compare Two Resume Versions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Baseline Version (Older)</label>
                  <select
                    value={compareScan1}
                    onChange={(e) => setCompareScan1(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                  >
                    {scanHistory.map(s => (
                      <option key={s._id} value={s._id}>{s.fileName} ({new Date(s.createdAt).toLocaleDateString()} - {s.atsScore} pts)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Updated Version (Newer)</label>
                  <select
                    value={compareScan2}
                    onChange={(e) => setCompareScan2(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                  >
                    {scanHistory.map(s => (
                      <option key={s._id} value={s._id}>{s.fileName} ({new Date(s.createdAt).toLocaleDateString()} - {s.atsScore} pts)</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleCompareSubmit}
                disabled={loadingCompare}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                {loadingCompare ? <FiRefreshCw className="animate-spin" /> : <FiColumns />} Compare Versions
              </button>

              {compareResult && (
                <div className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Score Differential</span>
                      <strong className={`text-2xl font-black block mt-1 ${compareResult.comparison.scoreDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {compareResult.comparison.scoreDiff >= 0 ? `+${compareResult.comparison.scoreDiff}` : compareResult.comparison.scoreDiff} Pts
                      </strong>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">New Skills Added</span>
                      <strong className="text-2xl font-black text-indigo-600 block mt-1">
                        +{compareResult.comparison.addedSkills.length} Skills
                      </strong>
                    </div>
                  </div>

                  {compareResult.comparison.addedSkills.length > 0 && (
                    <div className="text-xs">
                      <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">New Skills Detected in Version 2:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {compareResult.comparison.addedSkills.map((sk, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            +{sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: RESUME EDITOR */}
      {/* ===================================================================== */}
      {activeTab === 'editor' && (
        <div className="space-y-6 print:hidden">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <FiEdit className="text-indigo-600" /> Edit Extracted Resume Data
              </h3>

              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <FiCheck /> Saved to MongoDB!
                  </span>
                )}
                <button
                  onClick={handleSaveResume}
                  disabled={savingResume}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                >
                  <FiSave /> {savingResume ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Personal Info Fields */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Personal Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Professional Summary</label>
              <textarea
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
              ></textarea>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Technical Skills (Comma separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: PREVIEW & ATS TEMPLATES */}
      {/* ===================================================================== */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Template Bar */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500">Select ATS Template:</span>
              {['modern', 'classic', 'technical', 'minimal'].map(t => (
                <button
                  key={t}
                  onClick={() => setResumeTemplate(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    resumeTemplate === t
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <FiDownload /> Download PDF
            </button>
          </div>

          {/* Printable Document Sheet */}
          <div className="max-w-4xl mx-auto bg-white text-gray-900 p-10 sm:p-14 shadow-2xl rounded-2xl border border-gray-200 print:border-0 print:shadow-none print:p-0 print:max-w-full font-serif">
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-4 mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-gray-950 uppercase">{formData.name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 font-sans mt-2">
                {formData.email && <span>📧 {formData.email}</span>}
                {formData.phone && <span>📱 {formData.phone}</span>}
                {formData.location && <span>📍 {formData.location}</span>}
                {formData.linkedin && <span>🔗 {formData.linkedin}</span>}
                {formData.github && <span>💻 {formData.github}</span>}
              </div>
            </div>

            {/* Summary */}
            {formData.summary && (
              <div className="mb-6">
                <h2 className="text-xs font-bold tracking-widest text-gray-900 uppercase font-sans border-b border-gray-300 pb-1 mb-2">
                  Professional Summary
                </h2>
                <p className="text-xs text-gray-700 leading-relaxed font-sans">{formData.summary}</p>
              </div>
            )}

            {/* Education */}
            {formData.education?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold tracking-widest text-gray-900 uppercase font-sans border-b border-gray-300 pb-1 mb-2">
                  Education
                </h2>
                <div className="space-y-3 font-sans">
                  {formData.education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <div>
                        <strong className="text-gray-900 block">{edu.degree}</strong>
                        <span className="text-gray-600">{edu.institution}</span>
                      </div>
                      <div className="text-right text-gray-600">
                        <span>{edu.startYear} – {edu.endYear}</span>
                        {edu.score && <span className="block font-bold text-gray-900">{edu.score}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {formData.skills && (
              <div className="mb-6">
                <h2 className="text-xs font-bold tracking-widest text-gray-900 uppercase font-sans border-b border-gray-300 pb-1 mb-2">
                  Technical Skills
                </h2>
                <p className="text-xs text-gray-800 font-sans leading-relaxed">{formData.skills}</p>
              </div>
            )}

            {/* Projects */}
            {formData.projects?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold tracking-widest text-gray-900 uppercase font-sans border-b border-gray-300 pb-1 mb-2">
                  Projects
                </h2>
                <div className="space-y-3 font-sans">
                  {formData.projects.map((proj, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>{proj.title}</span>
                        {proj.technologies && <span className="text-gray-600 font-normal">({typeof proj.technologies === 'string' ? proj.technologies : proj.technologies.join(', ')})</span>}
                      </div>
                      <p className="text-gray-700 mt-0.5 leading-relaxed">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {formData.experience?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold tracking-widest text-gray-900 uppercase font-sans border-b border-gray-300 pb-1 mb-2">
                  Experience
                </h2>
                <div className="space-y-3 font-sans">
                  {formData.experience.map((exp, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>{exp.position} – {exp.company}</span>
                        <span className="text-gray-600 font-normal">{exp.duration}</span>
                      </div>
                      <p className="text-gray-700 mt-0.5 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ResumeScanner;
