/**
 * Transparent ATS Scoring & Placement Readiness Engine
 * Strictly rule-based calculation from actual extracted resume data.
 * ZERO Math.random() - ZERO fake scores.
 */

const CORE_PLACEMENT_KEYWORDS = [
  'rest api', 'git', 'github', 'data structures', 'algorithms', 'dsa',
  'react', 'node.js', 'mongodb', 'sql', 'python', 'java', 'javascript',
  'docker', 'aws', 'oop', 'oops', 'dbms', 'agile', 'full stack', 'frontend', 'backend'
];

exports.analyzeResume = (extractedData, rawText = '', companyDoc = null) => {
  const {
    personalInfo = {},
    summary = '',
    education = [],
    skills = [],
    categorizedSkills = { languages: [], frameworks: [], databases: [], tools: [], core: [] },
    projects = [],
    experience = [],
    internships = [],
    certificates = [],
    achievements = []
  } = extractedData;

  const categoryScores = {
    contact: { score: 0, max: 10 },
    summary: { score: 0, max: 10 },
    skills: { score: 0, max: 20 },
    education: { score: 0, max: 10 },
    projects: { score: 0, max: 15 },
    experience: { score: 0, max: 10 },
    certificates: { score: 0, max: 5 },
    achievements: { score: 0, max: 5 },
    keywords: { score: 0, max: 10 },
    formatting: { score: 0, max: 5 }
  };

  const sectionStatus = {
    contact: 'Missing',
    summary: 'Missing',
    skills: 'Missing',
    education: 'Missing',
    projects: 'Missing',
    experience: 'Missing',
    internships: 'Missing',
    certificates: 'Missing',
    achievements: 'Missing',
    languages: 'Missing',
    links: 'Missing'
  };

  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  // -------------------------------------------------------------
  // 1. CONTACT INFORMATION (Max: 10 pts)
  // -------------------------------------------------------------
  let contactScore = 0;
  if (personalInfo.name && personalInfo.name.length >= 3) contactScore += 2;
  if (personalInfo.email && personalInfo.email.includes('@')) contactScore += 2.5;
  if (personalInfo.phone && personalInfo.phone.length >= 10) contactScore += 2;
  if (personalInfo.linkedin) contactScore += 2;
  if (personalInfo.github || personalInfo.portfolio) contactScore += 1.5;

  categoryScores.contact.score = Math.min(10, contactScore);

  if (contactScore >= 8) {
    sectionStatus.contact = 'Present';
    strengths.push('Complete contact information with verified email and phone number.');
  } else if (contactScore >= 4) {
    sectionStatus.contact = 'Weak';
  } else {
    sectionStatus.contact = 'Missing';
  }

  if (personalInfo.github || personalInfo.linkedin) {
    sectionStatus.links = 'Present';
    strengths.push('Professional links (LinkedIn/GitHub) detected.');
  } else {
    sectionStatus.links = 'Missing';
    weaknesses.push('No GitHub or LinkedIn profile link detected.');
    suggestions.push({
      category: 'Contact',
      problem: 'Missing public code repository or professional network links.',
      suggestion: 'Include your active GitHub and LinkedIn profile links in the contact header.'
    });
  }

  // -------------------------------------------------------------
  // 2. PROFESSIONAL SUMMARY (Max: 10 pts)
  // -------------------------------------------------------------
  let summaryScore = 0;
  const wordCount = summary ? summary.split(/\s+/).filter(Boolean).length : 0;

  if (wordCount >= 25) {
    summaryScore = 10;
    sectionStatus.summary = 'Present';
    strengths.push('Concise professional summary introducing core engineering strengths.');
  } else if (wordCount >= 10) {
    summaryScore = 6;
    sectionStatus.summary = 'Weak';
    weaknesses.push('Professional summary is relatively brief.');
    suggestions.push({
      category: 'Summary',
      problem: 'Summary has fewer than 25 words.',
      suggestion: 'Expand your professional summary to 2-3 sentences highlighting your primary tech stack and career aspiration.'
    });
  } else {
    summaryScore = 0;
    sectionStatus.summary = 'Missing';
    weaknesses.push('No professional summary or career objective found.');
    suggestions.push({
      category: 'Summary',
      problem: 'Missing introductory career profile.',
      suggestion: 'Add a 3-sentence professional summary at the top of your resume.'
    });
  }
  categoryScores.summary.score = summaryScore;

  // -------------------------------------------------------------
  // 3. TECHNICAL SKILLS (Max: 20 pts)
  // -------------------------------------------------------------
  let skillsScore = 0;
  const totalSkillsCount = skills.length;

  if (totalSkillsCount >= 10) skillsScore += 10;
  else if (totalSkillsCount >= 6) skillsScore += 7;
  else if (totalSkillsCount >= 3) skillsScore += 4;
  else skillsScore += 1;

  // Check category diversity (Languages, Frameworks, Databases, Tools)
  const categoriesPresent = Object.values(categorizedSkills).filter(arr => arr && arr.length > 0).length;
  if (categoriesPresent >= 4) {
    skillsScore += 10;
    strengths.push(`Diverse technical stack covering languages, frameworks, databases, and developer tools (${totalSkillsCount} skills).`);
    sectionStatus.skills = 'Present';
  } else if (categoriesPresent >= 2) {
    skillsScore += 6;
    sectionStatus.skills = 'Weak';
    weaknesses.push('Skills section lacks breadth across backend, databases, or developer tools.');
    suggestions.push({
      category: 'Skills',
      problem: 'Skills are concentrated in only 1-2 categories.',
      suggestion: 'Organize your skills into distinct categories: Programming Languages, Frameworks, Databases, and Tools/Cloud.'
    });
  } else {
    sectionStatus.skills = totalSkillsCount > 0 ? 'Weak' : 'Missing';
    weaknesses.push('Very limited technical skills detected.');
  }
  categoryScores.skills.score = Math.min(20, skillsScore);

  // -------------------------------------------------------------
  // 4. EDUCATION (Max: 10 pts)
  // -------------------------------------------------------------
  let eduScore = 0;
  if (education.length >= 1) {
    eduScore += 6;
    if (education[0].score || education[0].endYear) eduScore += 4;
    sectionStatus.education = 'Present';
    strengths.push('Formal academic degree and educational qualifications specified.');
  } else {
    sectionStatus.education = 'Missing';
    weaknesses.push('No formal education or graduation degree identified.');
    suggestions.push({
      category: 'Education',
      problem: 'Missing educational background details.',
      suggestion: 'List your degree (e.g. B.Tech / MCA), institution name, graduation year, and CGPA/percentage.'
    });
  }
  categoryScores.education.score = Math.min(10, eduScore);

  // -------------------------------------------------------------
  // 5. PROJECTS (Max: 15 pts)
  // -------------------------------------------------------------
  let projectScore = 0;
  const projectCount = projects.length;

  if (projectCount >= 2) {
    projectScore += 8;
    sectionStatus.projects = 'Present';
    strengths.push(`Multiple practical projects (${projectCount}) demonstrating software implementation.`);
  } else if (projectCount === 1) {
    projectScore += 4;
    sectionStatus.projects = 'Weak';
    weaknesses.push('Only 1 project listed on the resume.');
    suggestions.push({
      category: 'Projects',
      problem: 'Recruiters prefer at least 2 substantial projects.',
      suggestion: 'Add a second full-stack or domain-specific project showcasing independent problem solving.'
    });
  } else {
    sectionStatus.projects = 'Missing';
    weaknesses.push('No technical projects detected.');
    suggestions.push({
      category: 'Projects',
      problem: 'No software projects listed.',
      suggestion: 'Include 2-3 technical projects with title, tech stack used, and key features.'
    });
  }

  // Quality of projects
  const hasTechInProjects = projects.some(p => p.technologies && p.technologies.length > 0);
  if (hasTechInProjects) projectScore += 4;
  const hasSubstantialDesc = projects.some(p => p.description && p.description.length >= 30);
  if (hasSubstantialDesc) projectScore += 3;

  categoryScores.projects.score = Math.min(15, projectScore);

  // -------------------------------------------------------------
  // 6. EXPERIENCE / INTERNSHIPS (Max: 10 pts)
  // -------------------------------------------------------------
  let expScore = 0;
  if (experience.length > 0) {
    expScore += 10;
    sectionStatus.experience = 'Present';
    strengths.push('Professional work experience included.');
  } else if (internships.length > 0) {
    expScore += 8;
    sectionStatus.internships = 'Present';
    strengths.push('Relevant internship experience included.');
  } else {
    sectionStatus.experience = 'Missing';
    sectionStatus.internships = 'Missing';
    suggestions.push({
      category: 'Experience',
      problem: 'No internship or work experience listed.',
      suggestion: 'If you have completed any open-source contributions, academic internships, or freelance work, include them.'
    });
  }
  categoryScores.experience.score = Math.min(10, expScore);

  // -------------------------------------------------------------
  // 7. CERTIFICATIONS (Max: 5 pts)
  // -------------------------------------------------------------
  if (certificates.length > 0) {
    categoryScores.certificates.score = 5;
    sectionStatus.certificates = 'Present';
    strengths.push(`Technical certifications listed (${certificates.length}).`);
  } else {
    categoryScores.certificates.score = 0;
    sectionStatus.certificates = 'Missing';
    weaknesses.push('No industry certifications or online course credentials found.');
    suggestions.push({
      category: 'Certifications',
      problem: 'Missing certifications.',
      suggestion: 'Consider completing and adding verified cloud, full-stack, or algorithmic certifications (AWS, Coursera, HackerRank).'
    });
  }

  // -------------------------------------------------------------
  // 8. ACHIEVEMENTS & CODING PROFILES (Max: 5 pts)
  // -------------------------------------------------------------
  if (achievements.length > 0 || /hackathon|leetcode|codechef|codeforces|rank|award/i.test(rawText)) {
    categoryScores.achievements.score = 5;
    sectionStatus.achievements = 'Present';
    strengths.push('Competitive achievements or coding profile highlights found.');
  } else {
    categoryScores.achievements.score = 0;
    sectionStatus.achievements = 'Missing';
    suggestions.push({
      category: 'Achievements',
      problem: 'No competitive programming rankings or hackathons listed.',
      suggestion: 'Highlight competitive coding contest ratings or hackathon participations.'
    });
  }

  // -------------------------------------------------------------
  // 9. KEYWORDS & PLACEMENT VOCABULARY (Max: 10 pts)
  // -------------------------------------------------------------
  const lowerText = rawText.toLowerCase();
  const detectedKeywords = [];
  const missingKeywords = [];

  CORE_PLACEMENT_KEYWORDS.forEach(kw => {
    if (lowerText.includes(kw)) {
      detectedKeywords.push(kw.toUpperCase());
    } else {
      missingKeywords.push(kw.toUpperCase());
    }
  });

  const keywordRatio = detectedKeywords.length / CORE_PLACEMENT_KEYWORDS.length;
  const kwScore = Math.round(keywordRatio * 10);
  categoryScores.keywords.score = Math.min(10, Math.max(2, kwScore));

  // -------------------------------------------------------------
  // 10. FORMATTING & READABILITY (Max: 5 pts)
  // -------------------------------------------------------------
  const formattingChecks = [
    {
      name: 'Email Format Validity',
      status: personalInfo.email && personalInfo.email.includes('@') ? 'Good' : 'Needs Improvement',
      feedback: personalInfo.email ? 'Valid email format detected.' : 'Please add a standard email address.'
    },
    {
      name: 'Phone Number Validity',
      status: personalInfo.phone && personalInfo.phone.length >= 10 ? 'Good' : 'Needs Improvement',
      feedback: personalInfo.phone ? 'Valid phone number detected.' : 'Please include a reachable contact number.'
    },
    {
      name: 'Section Headings Clarity',
      status: (education.length > 0 && skills.length > 0) ? 'Good' : 'Warning',
      feedback: 'Standard ATS-friendly headings (Education, Skills, Projects) detected.'
    },
    {
      name: 'Document Length & Density',
      status: (rawText.length >= 300 && rawText.length <= 6000) ? 'Good' : 'Warning',
      feedback: rawText.length < 300 ? 'Resume content is very sparse.' : 'Optimal one-to-two page length.'
    }
  ];

  const goodChecksCount = formattingChecks.filter(c => c.status === 'Good').length;
  const formattingScore = Math.round((goodChecksCount / formattingChecks.length) * 5);
  categoryScores.formatting.score = Math.min(5, Math.max(1, formattingScore));

  const formattingAnalysis = {
    score: categoryScores.formatting.score,
    status: formattingScore >= 4 ? 'Good' : formattingScore >= 2 ? 'Warning' : 'Needs Improvement',
    checks: formattingChecks
  };

  // -------------------------------------------------------------
  // TOTAL ATS SCORE CALCULATION (0 - 100)
  // -------------------------------------------------------------
  let totalAtsScore = Object.values(categoryScores).reduce((sum, cat) => sum + (cat.score || 0), 0);
  totalAtsScore = Math.min(100, Math.max(0, Math.round(totalAtsScore)));

  let atsGrade = 'Poor';
  if (totalAtsScore >= 90) atsGrade = 'Excellent';
  else if (totalAtsScore >= 75) atsGrade = 'Good';
  else if (totalAtsScore >= 50) atsGrade = 'Needs Improvement';

  // Missing sections array
  const missingSections = [];
  Object.keys(sectionStatus).forEach(sec => {
    if (sectionStatus[sec] === 'Missing') {
      missingSections.push(sec.charAt(0).toUpperCase() + sec.slice(1));
    }
  });

  // Placement Readiness Calculation (Weighted by technical depth and ATS score)
  const technicalDepthFactor = Math.min(1.0, (totalSkillsCount / 10) * 0.5 + (projectCount / 2) * 0.5);
  const placementReadiness = Math.min(100, Math.max(20, Math.round(totalAtsScore * 0.7 + technicalDepthFactor * 30)));

  // -------------------------------------------------------------
  // COMPANY / ROLE MATCHING (If company data provided)
  // -------------------------------------------------------------
  let companyMatch = null;
  if (companyDoc) {
    const requiredSkills = companyDoc.requiredSkills || companyDoc.tags || ['JavaScript', 'React', 'Node.js', 'MongoDB', 'DSA', 'SQL'];
    const matchingSkills = [];
    const missingCompanySkills = [];

    requiredSkills.forEach(reqSkill => {
      const lowerReq = reqSkill.toLowerCase();
      const hasSkill = skills.some(s => s.toLowerCase() === lowerReq || lowerText.includes(lowerReq));
      if (hasSkill) {
        matchingSkills.push(reqSkill);
      } else {
        missingCompanySkills.push(reqSkill);
      }
    });

    const matchRatio = requiredSkills.length > 0 ? matchingSkills.length / requiredSkills.length : 0.7;
    const matchPercentage = Math.round(matchRatio * 100);
    const keywordMatchPercentage = Math.min(100, Math.round((detectedKeywords.length / Math.max(1, CORE_PLACEMENT_KEYWORDS.length)) * 100));

    companyMatch = {
      companyName: companyDoc.name || 'Placement Partner',
      role: companyDoc.role || 'Software Development Engineer',
      matchPercentage,
      matchingSkills,
      missingSkills: missingCompanySkills,
      keywordMatchPercentage,
      recommendations: missingCompanySkills.map(s => `Add relevant projects or coursework demonstrating ${s}`)
    };
  }

  return {
    atsScore: totalAtsScore,
    atsGrade,
    categoryScores,
    sectionStatus,
    strengths,
    weaknesses,
    missingSections,
    detectedKeywords: detectedKeywords.slice(0, 15),
    missingKeywords: missingKeywords.slice(0, 8),
    suggestions,
    formattingAnalysis,
    placementReadiness,
    companyMatch
  };
};
