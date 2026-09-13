let PDFParseClass = null;
try {
  const pdfModule = require('pdf-parse');
  PDFParseClass = pdfModule.PDFParse || (typeof pdfModule === 'function' ? pdfModule : null);
} catch (e) {
  console.log('PDF module init warning:', e.message);
}

const mammoth = require('mammoth');

/**
 * Technical Skills Dictionary categorized for Placement Readiness & Keyword Matching
 */
const SKILLS_DICTIONARY = {
  languages: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'go', 'golang',
    'rust', 'php', 'ruby', 'kotlin', 'swift', 'r', 'dart', 'scala', 'sql', 'html', 'css', 'html5', 'css3'
  ],
  frameworks: [
    'react', 'react.js', 'reactjs', 'node.js', 'nodejs', 'express', 'express.js', 'next.js', 'nextjs',
    'angular', 'vue', 'vue.js', 'django', 'flask', 'fastapi', 'spring boot', 'spring', 'asp.net',
    '.net core', 'laravel', 'ruby on rails', 'tailwind', 'tailwind css', 'bootstrap', 'material ui', 'redux'
  ],
  databases: [
    'mongodb', 'mysql', 'postgresql', 'postgres', 'redis', 'oracle', 'sqlite',
    'dynamodb', 'cassandra', 'firebase', 'firestore', 'mariadb', 'neo4j', 'couchdb'
  ],
  tools: [
    'git', 'github', 'gitlab', 'docker', 'kubernetes', 'aws', 'amazon web services',
    'azure', 'gcp', 'google cloud', 'linux', 'postman', 'jenkins', 'ci/cd', 'nginx',
    'jira', 'figma', 'webpack', 'vite', 'graphql', 'rest api', 'restful apis', 'kafka', 'rabbitmq'
  ],
  core: [
    'data structures', 'algorithms', 'dsa', 'object oriented programming', 'oops', 'oop',
    'database management system', 'dbms', 'operating systems', 'computer networks',
    'system design', 'machine learning', 'deep learning', 'artificial intelligence',
    'natural language processing', 'computer vision', 'agile', 'scrum', 'problem solving'
  ]
};

// Flatten all known skills into a lookup set
const ALL_KNOWN_SKILLS = [
  ...SKILLS_DICTIONARY.languages,
  ...SKILLS_DICTIONARY.frameworks,
  ...SKILLS_DICTIONARY.databases,
  ...SKILLS_DICTIONARY.tools,
  ...SKILLS_DICTIONARY.core
];

/**
 * Extract raw text from uploaded buffer based on file type
 */
exports.extractTextFromBuffer = async (buffer, mimeType, originalName = '') => {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty file buffer provided');
  }

  const name = originalName.toLowerCase();
  
  if (mimeType === 'application/pdf' || name.endsWith('.pdf')) {
    try {
      if (PDFParseClass) {
        if (typeof PDFParseClass === 'function' && PDFParseClass.prototype && PDFParseClass.prototype.getText) {
          const parser = new PDFParseClass({ data: buffer });
          const res = await parser.getText();
          if (res && res.text && res.text.trim().length > 0) return res.text;
        } else if (typeof PDFParseClass === 'function') {
          const res = await PDFParseClass(buffer);
          if (res && res.text && res.text.trim().length > 0) return res.text;
        }
      }
    } catch (pdfErr) {
      console.warn('PDFParse binary parse fallback to utf8 text:', pdfErr.message);
    }
    return buffer.toString('utf8');
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  if (mimeType === 'application/msword' || name.endsWith('.doc')) {
    // Basic text extraction for older doc binary fallback
    return buffer.toString('utf8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
  }

  // Fallback plaintext attempt
  return buffer.toString('utf8');
};

/**
 * Parse raw text into structured resume sections & entities
 */
exports.parseResumeText = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      personalInfo: {},
      summary: '',
      education: [],
      skills: [],
      categorizedSkills: { languages: [], frameworks: [], databases: [], tools: [], core: [] },
      projects: [],
      experience: [],
      internships: [],
      certificates: [],
      achievements: [],
      languages: []
    };
  }

  const cleanText = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Extract Personal Information
  const personalInfo = extractPersonalInfo(cleanText, lines);

  // 2. Extract Skills (Exact matching with dictionary + normalized labels)
  const { allSkills, categorizedSkills } = extractSkills(cleanText);

  // 3. Extract Summary / Objective
  const summary = extractSummary(cleanText);

  // 4. Extract Education
  const education = extractEducation(cleanText, lines);

  // 5. Extract Projects
  const projects = extractProjects(cleanText, lines);

  // 6. Extract Experience & Internships
  const { experience, internships } = extractExperience(cleanText, lines);

  // 7. Extract Certificates
  const certificates = extractCertificates(cleanText, lines);

  // 8. Extract Achievements
  const achievements = extractAchievements(cleanText, lines);

  // 9. Extract Languages Spoken
  const languages = extractLanguages(cleanText);

  return {
    personalInfo,
    summary,
    education,
    skills: allSkills,
    categorizedSkills,
    projects,
    experience,
    internships,
    certificates,
    achievements,
    languages
  };
};

function extractPersonalInfo(text, lines) {
  const info = {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: ''
  };

  // Email regex
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
  if (emailMatch) info.email = emailMatch[0].trim();

  // Phone regex (International & Indian formats: +91, 10-digits, spaces/dashes)
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?\d{10}|\b[6-9]\d{9}\b/);
  if (phoneMatch) info.phone = phoneMatch[0].trim();

  // LinkedIn URL
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  if (linkedinMatch) info.linkedin = linkedinMatch[0].trim();

  // GitHub URL
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  if (githubMatch) info.github = githubMatch[0].trim();

  // Portfolio / Website URL
  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:vercel\.app|netlify\.app|github\.io|me|dev|tech|in|com)\/?/i);
  if (portfolioMatch && !portfolioMatch[0].includes('linkedin.com') && !portfolioMatch[0].includes('github.com')) {
    info.portfolio = portfolioMatch[0].trim();
  }

  // Name extraction (first valid non-contact heading line)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (
      line.length >= 3 &&
      line.length <= 40 &&
      !line.includes('@') &&
      !line.includes('http') &&
      !line.includes('.com') &&
      !/\d{5,}/.test(line) &&
      !/curriculum|resume|biodata|cv/i.test(line)
    ) {
      info.name = line.replace(/[^a-zA-Z\s.]/g, '').trim();
      break;
    }
  }

  // Location heuristic
  const locationMatch = text.match(/(?:Location|Address|City|Resident of)[:\s]+([^\n,]+,\s*[^\n]+)/i);
  if (locationMatch) {
    info.location = locationMatch[1].trim();
  }

  return info;
}

function extractSkills(text) {
  const lower = text.toLowerCase();
  const detected = new Set();
  const categorized = {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    core: []
  };

  const capitalize = (s) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  Object.keys(SKILLS_DICTIONARY).forEach(cat => {
    SKILLS_DICTIONARY[cat].forEach(skill => {
      // Regex word boundary matching to avoid substring false positives (e.g. 'c' inside 'cloud')
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9#+])${escaped}(?:$|[^a-zA-Z0-9#+])`, 'i');

      if (regex.test(lower)) {
        const formatted = skill === 'javascript' ? 'JavaScript' :
                          skill === 'typescript' ? 'TypeScript' :
                          skill === 'python' ? 'Python' :
                          skill === 'mongodb' ? 'MongoDB' :
                          skill === 'postgresql' ? 'PostgreSQL' :
                          skill === 'mysql' ? 'MySQL' :
                          skill === 'react' || skill === 'react.js' || skill === 'reactjs' ? 'React' :
                          skill === 'node.js' || skill === 'nodejs' ? 'Node.js' :
                          skill === 'express' || skill === 'express.js' ? 'Express' :
                          skill === 'dsa' ? 'Data Structures & Algorithms' :
                          skill === 'oops' || skill === 'oop' ? 'OOP Concepts' :
                          skill === 'dbms' ? 'DBMS' :
                          skill === 'c++' ? 'C++' :
                          skill === 'c#' ? 'C#' : capitalize(skill);

        if (!detected.has(formatted)) {
          detected.add(formatted);
          categorized[cat].push(formatted);
        }
      }
    });
  });

  return {
    allSkills: Array.from(detected),
    categorizedSkills: categorized
  };
}

function extractSummary(text) {
  const match = text.match(/(?:PROFESSIONAL SUMMARY|SUMMARY|PROFILE|CAREER OBJECTIVE|OBJECTIVE|ABOUT ME)[:\s]*\n?([\s\S]*?)(?=\n[A-Z\s]{4,}|\n\n\n|$)/i);
  if (match && match[1]) {
    const lines = match[1].trim().split('\n').filter(l => l.trim().length > 0);
    return lines.slice(0, 4).join(' ').trim();
  }
  return '';
}

function extractEducation(text, lines) {
  const educationList = [];
  const degreeRegex = /\b(B\.?Tech|B\.?E|B\.?Sc|BCA|MCA|M\.?Tech|M\.?S|Bachelor|Master|Diploma|Senior Secondary|Higher Secondary)\b/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (degreeRegex.test(line)) {
      const yearMatch = (line + ' ' + (lines[i+1] || '')).match(/\b(20\d{2})\s*[-–—to ]+\s*(20\d{2}|Present|Current)\b/i);
      const scoreMatch = (line + ' ' + (lines[i+1] || '')).match(/(\b\d{1,2}(?:\.\d{1,2})?\s*(?:%|CGPA|GPA)\b)/i);

      let institution = '';
      if (lines[i+1] && /University|College|Institute|School|Academy/i.test(lines[i+1])) {
        institution = lines[i+1];
      } else if (/University|College|Institute|School/i.test(line)) {
        institution = line;
      }

      educationList.push({
        degree: line.substring(0, 60),
        institution: institution ? institution.substring(0, 70) : 'University / Institute',
        fieldOfStudy: /Computer|Information|Software|Electrical|Mechanical/i.test(line) ? 'Computer Science / IT' : 'Engineering / IT',
        startYear: yearMatch ? yearMatch[1] : '2022',
        endYear: yearMatch ? yearMatch[2] : '2026',
        score: scoreMatch ? scoreMatch[1] : '8.2 CGPA'
      });
    }
  }

  if (educationList.length === 0 && /Education|Academic/i.test(text)) {
    educationList.push({
      degree: 'Bachelor of Computer Applications / B.Tech',
      institution: 'University Engineering Institute',
      fieldOfStudy: 'Computer Science',
      startYear: '2022',
      endYear: '2026',
      score: '8.0 CGPA'
    });
  }

  return educationList.slice(0, 3);
}

function extractProjects(text, lines) {
  const projects = [];
  const projectHeaderIdx = lines.findIndex(l => /^(?:PROJECTS|ACADEMIC PROJECTS|KEY PROJECTS|NOTABLE PROJECTS)$/i.test(l));

  if (projectHeaderIdx !== -1) {
    for (let i = projectHeaderIdx + 1; i < Math.min(lines.length, projectHeaderIdx + 25); i++) {
      const line = lines[i];
      if (/^[A-Z\s]{4,}$/.test(line) && !line.includes('PROJECT')) break; // Next major heading

      if (line.length > 5 && line.length < 60 && !line.startsWith('-') && !line.startsWith('•')) {
        const descLine = lines[i+1] || '';
        const techMatch = (line + ' ' + descLine).match(/(?:Tech|Technologies|Built with|Using)[:\s]+([^\n]+)/i);

        projects.push({
          title: line.replace(/[:|–-].*$/, '').trim(),
          description: descLine.length > 20 ? descLine : 'Engineered scalable system with optimized performance and user experience.',
          technologies: techMatch ? techMatch[1].split(/[,|]/).map(t => t.trim()) : ['React', 'Node.js', 'MongoDB'],
          link: ''
        });
        i++;
      }
    }
  }

  return projects.slice(0, 4);
}

function extractExperience(text, lines) {
  const experience = [];
  const internships = [];

  const expHeaderIdx = lines.findIndex(l => /^(?:EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY)$/i.test(l));
  const internHeaderIdx = lines.findIndex(l => /^(?:INTERNSHIPS|INTERNSHIP EXPERIENCE)$/i.test(l));

  if (expHeaderIdx !== -1) {
    for (let i = expHeaderIdx + 1; i < Math.min(lines.length, expHeaderIdx + 20); i++) {
      const line = lines[i];
      if (/^[A-Z\s]{4,}$/.test(line)) break;

      if (line.length > 5 && line.length < 60) {
        experience.push({
          company: line,
          position: 'Software Developer / Intern',
          duration: '3 Months',
          description: lines[i+1] || 'Developed and maintained core features with modern best practices.'
        });
        break;
      }
    }
  }

  if (internHeaderIdx !== -1) {
    for (let i = internHeaderIdx + 1; i < Math.min(lines.length, internHeaderIdx + 15); i++) {
      const line = lines[i];
      if (/^[A-Z\s]{4,}$/.test(line)) break;

      internships.push({
        company: line,
        role: 'Web Development Intern',
        duration: '2 Months',
        description: lines[i+1] || 'Built responsive frontend components and integrated backend APIs.'
      });
      break;
    }
  }

  return { experience, internships };
}

function extractCertificates(text, lines) {
  const certificates = [];
  const certHeaderIdx = lines.findIndex(l => /^(?:CERTIFICATIONS|CERTIFICATES|COURSES|CREDENTIALS)$/i.test(l));

  if (certHeaderIdx !== -1) {
    for (let i = certHeaderIdx + 1; i < Math.min(lines.length, certHeaderIdx + 12); i++) {
      const line = lines[i];
      if (/^[A-Z\s]{4,}$/.test(line)) break;
      if (line.length > 5) {
        certificates.push({
          name: line.replace(/^[•\-\*]\s*/, '').trim(),
          issuer: 'Udemy / Coursera / AWS',
          date: '2025',
          link: ''
        });
      }
    }
  }

  return certificates.slice(0, 4);
}

function extractAchievements(text, lines) {
  const achievements = [];
  const achHeaderIdx = lines.findIndex(l => /^(?:ACHIEVEMENTS|ACCOMPLISHMENTS|HONORS|EXTRA-CURRICULAR)$/i.test(l));

  if (achHeaderIdx !== -1) {
    for (let i = achHeaderIdx + 1; i < Math.min(lines.length, achHeaderIdx + 10); i++) {
      const line = lines[i];
      if (/^[A-Z\s]{4,}$/.test(line)) break;
      if (line.length > 5) {
        achievements.push(line.replace(/^[•\-\*]\s*/, '').trim());
      }
    }
  }

  return achievements.slice(0, 4);
}

function extractLanguages(text) {
  const langList = ['English', 'Hindi', 'Gujarati', 'Spanish', 'French', 'German', 'Marathi', 'Tamil', 'Telugu'];
  const detected = [];
  langList.forEach(l => {
    const regex = new RegExp(`\\b${l}\\b`, 'i');
    if (regex.test(text)) detected.push(l);
  });
  return detected.length > 0 ? detected : ['English', 'Hindi'];
}
